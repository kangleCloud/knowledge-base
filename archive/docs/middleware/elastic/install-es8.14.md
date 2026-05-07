# 单节点 Elasticsearch8.14 部署

[Past Releases of Elasticsearch](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)

截止2024年08月05日，Elasticsearch 8.14.* 系列最新稳定版为 8.13.8

<font color="red"><b>每次安装需到官网查看 Elasticsearch 8.14 系列的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 Elasticsearch8.14.3
:::

<font color="red"><b>当前文档仅适用于将 Elasticsearch 作为业务中间件。</b></font>

## 一、先决条件

### 0x01.max_map_count设置

```shell
sysctl -w vm.max_map_count=262144
```
https://www.elastic.co/guide/en/elasticsearch/reference/8.14/vm-max-map-count.html

## 二、通用二进制包构建

### 0x01.添加用户

```bash
groupadd es
useradd -g es es -s /sbin/nologin
```

### 0x02.下载并解压安装包

```bash
cd /usr/local/src
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.14.3-linux-x86_64.tar.gz
tar xvf elasticsearch-8.14.3-linux-x86_64.tar.gz
mv /usr/local/src/elasticsearch-8.14.3 /usr/local/elasticsearch8.14.3
```

### 0x03. 创建数据及日志目录

```bash
mkdir -p /data/es
chown -R es:es /data/es

mkdir -p /var/log/es
chown -R es:es /var/log/es

mkdir -p /var/run/elasticsearch
chown -R es:es /var/run/elasticsearch

chown -R es:es /usr/local/elasticsearch8.14.3
```

:::tip
`chown -R es:es /usr/local/elasticsearch8.14.3`可以解决 elasticsearch: could not find java in bundled JDK at /usr/local/elasticsearch8.14.3/jdk/bin/java。
:::

### 0x04.修改配置文件

```bash
vim  /usr/local/elasticsearch8.14.3/config/elasticsearch.yml
```

如下配置参数修改（<font color="red">参数需逐个修改</font>）
```vim
node.name: node-1
path.data: /data/es
path.logs: /var/log/es
network.host: 0.0.0.0
http.port: 9200
cluster.initial_master_nodes: ["$IP"]
xpack.security.enabled: false
```
> 如果http.port默认的端口值9200被修改，则cluster.initial_master_nodes中的nodes需要显式的配置修改后的端口

## 三、使用Systemd管理进程

### 0x01.创建service文件

在 /etc/systemd/system 目录下面新建一个 elasticsearch.service 文件

```bash
touch /etc/systemd/system/elasticsearch.service
```

### 0x02.配置service文件

```bash
vim /etc/systemd/system/elasticsearch.service
```

:::tip service文件内容如下
```vim
[Unit]
Description=Elasticsearch
Documentation=https://www.elastic.co
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
PrivateTmp=true
Environment=ES_HOME=/usr/local/elasticsearch8.14.3
Environment=ES_PATH_CONF=/usr/local/elasticsearch8.14.3/config
Environment=PID_DIR=/var/run/elasticsearch
Environment=ES_SD_NOTIFY=true
WorkingDirectory=/usr/local/elasticsearch8.14.3

User=es
Group=es

ExecStart=/usr/local/elasticsearch8.14.3/bin/elasticsearch -p ${PID_DIR}/elasticsearch.pid --quiet

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65535
# Specifies the maximum number of processes
LimitNPROC=4096
# Specifies the maximum size of virtual memory
LimitAS=infinity
# Specifies the maximum file size
LimitFSIZE=infinity
# Disable timeout logic and wait until process is stopped
TimeoutStopSec=0
# SIGTERM signal is used to stop the Java process
KillSignal=SIGTERM
# Send the signal only to the JVM rather than its control group
KillMode=process
# Java process is never killed
SendSIGKILL=no
# When a JVM receives a SIGTERM signal it exits with code 143
SuccessExitStatus=143
# Allow a slow startup before the systemd notifier module kicks in to extend the timeout
TimeoutStartSec=900

[Install]
WantedBy=multi-user.target
```
:::

参照地址：  
https://github.com/elastic/elasticsearch/blob/v8.14.3/distribution/packages/src/common/systemd/elasticsearch.service

### 0x03.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x04.启动并设置开机自启

```
systemctl enable elasticsearch --now
```

<font color="red">elasticsearch 启动完成需要一定的时间，具体原因待研究 ...</font>

使用`systemctl status elasticsearch`查看启动是否成功

### 0x05. 验证服务是否可用

服务启动

```bash
netstat -nltp | grep 9200
```
:::tip 输出以下内容
tcp6    0    0 :::9200    `:::*`    LISTEN    3314/java
:::

```bash
curl 127.0.0.1:9200/_cat/health
```
:::tip 输出以下内容（输出green即为可用）
1697336602 02:23:22 elasticsearch green 1 1 3 3 0 0 0 0 - 100.0%
:::


## 四、配置密码认证

### 0x01.修改配置文件

```bash
/usr/local/elasticsearch8.14.3/bin/elasticsearch-certutil ca  
/usr/local/elasticsearch8.14.3/bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12

mv /usr/local/elasticsearch8.14.3/elastic-stack-ca.p12 /usr/local/elasticsearch8.14.3/config/
mv /usr/local/elasticsearch8.14.3/elastic-certificates.p12 /usr/local/elasticsearch8.14.3/config/

chown -R es:es /usr/local/elasticsearch8.14.3/config/elastic-stack-ca.p12
chown -R es:es /usr/local/elasticsearch8.14.3/config/elastic-certificates.p12

```
参照地址：https://www.elastic.co/guide/en/elasticsearch/reference/8.14/security-basic-setup.html#encrypt-internode-communication

在elasticsearch.yml中追加如下配置

```vim
# 开启认证
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: Authorization
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.client_authentication: required
xpack.security.transport.ssl.keystore.path: elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: elastic-certificates.p12
```

重启 Elasticsearch 服务
```bash
systemctl restart elasticsearch
```

### 0x02.设置密码

```bash
/usr/local/elasticsearch8.14.3/bin/elasticsearch-reset-password -u elastic
```
:::warning
elasticsearch-setup-passwords 官方说明该命令在8.0废除  
https://www.elastic.co/guide/en/elasticsearch/reference/8.14/setup-passwords.html
:::

### 0x03.验证密码登录

```bash
curl -u elastic:<password> 127.0.0.1:9200/_cat/health
```
:::tip
1697357308 08:08:28 elasticsearch green 1 1 4 4 0 0 0 0 - 100.0%
:::

### 0x04.修改密码

1. 可视化界面方式修改密码

进入kibana界面，选择：Management>Stack Management>安全>用户，选择对应用户进行密码修改

2. curl方式修改密码

```bash
# 这里以修改elastic用户的密码为例，生产中根据自己需求而定。注意：回车后提示输入当前密码
curl -H "Content-Type:application/json" -XPOST -u ${用户名}:${用户密码} 'http://{elastic_ip}:9200/_security/user/elastic/_password' -d '{ "password" : "123456" }'
```

::: warning
修改elasticsearch相关用户的密码后，如果这个用户及其密码是被配置在kiabana配置文件中，此时需要更新kibana配置文件中的相关密码并重启kibana服务，否则kibana服务将不可用。
:::

## 五、常用命令

### 0x01.查看版本号

```bash
/usr/local/elasticsearch8.14.3/bin/elasticsearch -V
```
:::tip 输出以下内容
Version: 8.14.3, Build: tar/d55f984299e0e88dee72ebd8255f7ff130859ad0/2024-07-07T22:04:49.882652950Z, JVM: 22.0.1
:::

## 六、常见错误

## 七、参考资料

- https://www.elastic.co/guide/en/elasticsearch/reference/8.14/targz.html
- https://www.elastic.co/guide/en/elasticsearch/reference/8.14/settings.html
- https://www.elastic.co/guide/en/elasticsearch/reference/8.14/security-api-change-password.html
