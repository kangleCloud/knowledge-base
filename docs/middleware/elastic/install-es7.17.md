# 单节点 Elasticsearch7.17 部署

[Past Releases of Elasticsearch](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)

截止2024年10月16日，Elasticsearch 7.17.* 系列最新稳定版为 7.17.24

<font color="red"><b>每次安装需到官网查看 Elasticsearch 7.17 系列的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 Elasticsearch7.17
:::

<font color="red"><b>当前文档仅适用于将 Elasticsearch 作为业务中间件。</b></font>

## 一、先决条件

### 0x01.max_map_count设置

```bash
vim /etc/sysctl.conf
```

在文件末尾添加内容
```vim
# Elasticsearch7.17
vm.max_map_count=262144
```

强制Linux重新加载`/etc/sysctl.conf`的新配置
```bash
sysctl -p
```

https://www.elastic.co/guide/en/elasticsearch/reference/7.17/vm-max-map-count.html

## 二、通用二进制包构建

### 0x01.添加用户

```bash
groupadd es
useradd -g es es -s /sbin/nologin
```

### 0x02.下载并解压安装包

```bash
cd /usr/local/src
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.17.24-linux-x86_64.tar.gz
tar xvf elasticsearch-7.17.24-linux-x86_64.tar.gz
mv /usr/local/src/elasticsearch-7.17.24 /usr/local/elasticsearch7.17
```

### 0x03. 创建数据及日志目录

```bash
mkdir -p /data/elasticsearch7.17
chown -R es:es /data/elasticsearch7.17

mkdir -p /var/log/elasticsearch7.17
chown -R es:es /var/log/elasticsearch7.17

chown -R es:es /usr/local/elasticsearch7.17
```

:::tip
`chown -R es:es /usr/local/elasticsearch7.17`可以解决 elasticsearch: could not find java in bundled JDK at /usr/local/elasticsearch7.17/jdk/bin/java。
:::

### 0x04.修改配置文件

```bash
vim  /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

修改如下配置参数

```vim
#node.name: node-1 //[!code --]
node.name: node-1 //[!code ++]

#path.data: /path/to/data //[!code --]
path.data: /data/elasticsearch7.17 //[!code ++]

#path.logs: /path/to/logs //[!code --]
path.logs: /var/log/elasticsearch7.17 //[!code ++]

#network.host: 192.168.0.1 //[!code --]
network.host: 0.0.0.0 //[!code ++]

#http.port: 9200 //[!code --]
http.port: 9200 //[!code ++]

#cluster.initial_master_nodes: ["node-1", "node-2"] //[!code --]
cluster.initial_master_nodes: ["<ip>"] //[!code ++]

```

:::warning
- 若`http.port`的默认端口号9200被更改，则在配置`cluster.initial_master_nodes`时，必须明确指定节点所使用的新端口（示例：`cluster.initial_master_nodes: ["192.168.0.1:9210"]`）。若`http.port`使用的是默认端口号，`cluster.initial_master_nodes`的值只能是不带端口号的 IP 地址。
:::

## 三、使用Systemd管理进程

### 0x01.编辑service文件

:::warning
默认情况下，Elasticsearch 的 PID 文件存储在 /var/run/elasticsearch 目录中。然而，由于系统重启后该目录会被删除，导致 Elasticsearch 服务无法自动启动。为了解决这一问题，<font color="red">约定将 Elasticsearch 的 PID 文件路径修改至数据目录中，以确保服务在系统重启后能够正常启动</font>。
:::

```bash
vim /etc/systemd/system/elasticsearch7.17.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Elasticsearch7.17
Documentation=https://www.elastic.co
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
PrivateTmp=true
Environment=ES_HOME=/usr/local/elasticsearch7.17
Environment=ES_PATH_CONF=/usr/local/elasticsearch7.17/config
Environment=PID_DIR=/data/elasticsearch7.17
Environment=ES_SD_NOTIFY=true
WorkingDirectory=/usr/local/elasticsearch7.17

User=es
Group=es

ExecStart=/usr/local/elasticsearch7.17/bin/elasticsearch -p ${PID_DIR}/elasticsearch.pid --quiet

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

https://github.com/elastic/elasticsearch/blob/v7.17.12/distribution/packages/src/common/systemd/elasticsearch.service

### 0x02.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```
systemctl enable elasticsearch7.17 --now
```

:::tip
当使用`systemctl status elasticsearch7.17`命令检查服务状态时，显示 Elasticsearch 服务已经启动，但通过`netstat -nltp | grep 9200`命令却无法检测到9200端口的监听状态。这种情况通常是因为 Elasticsearch 服务仍处于初始化阶段，尚未完全准备好处理请求，或者存在其他启动过程中的延迟。
:::

:::tip Systemctl指令
```bash
systemctl status elasticsearch7.17  #查看服务
systemctl start elasticsearch7.17   #启动服务
systemctl stop elasticsearch7.17    #停止服务
systemctl restart elasticsearch7.17 #重启服务
systemctl enable elasticsearch7.17  #开启开机自启服务
systemctl disable elasticsearch7.17 #关闭开机自启服务
```
:::

### 0x04. 验证服务是否可用

```bash
netstat -nltp | grep 9200
```

:::tip 输出如下内容
tcp6    0    0 :::9200    `:::*`    LISTEN    3314/java
:::

```bash
curl 127.0.0.1:9200/_cat/health
```

:::tip 输出如下内容（输出green即为可用）
1697336602 02:23:22 elasticsearch green 1 1 3 3 0 0 0 0 - 100.0%
:::

## 四、配置密码认证

### 0x01.修改配置文件

```bash
vim  /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

在 elasticsearch.yml 中追加如下配置

```vim
# 启用 X-Pack 安全功能
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

重启 Elasticsearch 服务
```bash
systemctl restart elasticsearch7.17
```

### 0x02.设置密码

```bash
/usr/local/elasticsearch7.17/bin/elasticsearch-setup-passwords interactive
```

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
特殊符号不可以包含`'`、`"`、 `@`、`#`、`:`
:::

因为设置的密码较多，请耐心输入。

:::tip 输入密码
```vim
Initiating the setup of passwords for reserved users elastic,apm_system,kibana,kibana_system,logstash_system,beats_system,remote_monitoring_user.
You will be prompted to enter passwords as the process progresses.
Please confirm that you would like to continue [y/N]

Enter password for [elastic]:
Reenter password for [elastic]:
Enter password for [apm_system]:
Reenter password for [apm_system]:
Enter password for [kibana_system]:
Reenter password for [kibana_system]:
Enter password for [logstash_system]:
Reenter password for [logstash_system]:
Enter password for [beats_system]:
Reenter password for [beats_system]:
Enter password for [remote_monitoring_user]:
Reenter password for [remote_monitoring_user]:
Changed password for user [apm_system]
Changed password for user [kibana_system]
Changed password for user [kibana]
Changed password for user [logstash_system]
Changed password for user [beats_system]
Changed password for user [remote_monitoring_user]
Changed password for user [elastic]
```
:::

### 0x03.验证密码登录

用户名为elastic

```bash
curl -u elastic:'<password>' 127.0.0.1:9200/_cat/health
```

:::tip 输出如下内容
1697357308 08:08:28 elasticsearch green 1 1 4 4 0 0 0 0 - 100.0%
:::

## 五、安装Analysis-IK分词插件

详见：<a href="/docs/middleware/elastic/install-es-analysis-ik.md" target="_blank">Analysis-IK 分词插件</a>

## 附件一、常用命令

### 0x01.查看版本号

```bash
/usr/local/elasticsearch7.17/bin/elasticsearch -V
```
:::tip 输出以下内容
Version: 7.17.24, Build: default/tar/774e3bfa4d52e2834e4d9d8d669d77e4e5c1017f/2023-10-05T22:17:33.780167078Z, JVM: 21
:::

### 0x02.查看插件列表

```bash
/usr/local/elasticsearch7.17/bin/elasticsearch-plugin list
```

## 附件二、修改或重置密码

### 0x01.修改密码

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
特殊符号不可以包含`'`、`"`、 `@`、`#`、`:`
:::

1. 可视化界面方式修改密码

进入kibana界面，选择：Management > Stack Management > 安全>用户，选择对应用户进行密码修改。

2. curl方式修改密码

```bash
# 这里以修改 elastic 用户的密码为例。注意：回车后提示输入当前密码
curl -u elastic:<password> \
    -XPOST 'http://127.0.0.1:9200/_xpack/security/user/elastic/_password' \
    -H "Content-Type:application/json" \ 
    -d '{"password": "<password>"}'
```

::: warning
修改 elasticsearch 相关用户的密码后，如果这个用户及其密码是被配置在 kiabana 配置文件中，此时需要更新kibana配置文件中的相关密码并重启 kibana 服务，否则 kibana 服务将不可用。
:::

### 0x02.重置密码

因  ES7.17 不支持`elasticsearch-reset-password`命令，只能通过修改配置文件及删除索引的方式重置密码。

1. 修改配置文件并重启

注释配置文件 elasticsearch.yml 中的 `xpack.security.enabled`，并执行`systemctl restart elasticsearch`重启服务。

2. 查看当前 ES 的索引

```bash
curl -XGET http://127.0.0.1:9200/_cat/indices
```
:::tip 输出以下内容（部分）
green open .security-7      oiUAQGvITfyWLcLaU8BqRQ 1 0  7 0 25.7kb 25.7kb
:::

3. 删除.security-7的索引

```bash
curl -XDELETE -u elastic:changeme http://127.0.0.1:9200/.security-7
```
:::tip 输出以下内容
`{"acknowledged":true}`
:::

4. 恢复配置并重启

恢复配置文件 elasticsearch.yml 中的 `xpack.security.enabled`，并执行`systemctl restart elasticsearch7.17`重启服务。

5. 重新设置密码

## 附件三、参考资料

- https://www.elastic.co/guide/en/elasticsearch/reference/7.17/targz.html
- https://www.elastic.co/guide/en/elasticsearch/reference/7.17/settings.html
- https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-minimal-setup.html
- https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-api-change-password.html
