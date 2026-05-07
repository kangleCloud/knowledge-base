# 单节点 Elasticsearch8.19 部署

[Past Releases of Elasticsearch](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)

截止2026年01月04日，Elasticsearch 8.19.* 系列最新稳定版为 8.19.9。

<font color="red"><b>每次安装需到官网查看 Elasticsearch 8.19 系列的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 Elasticsearch8.19
:::

<font color="red"><b>当前文档仅适用于将 Elasticsearch 作为业务中间件。</b></font>

## 一、先决条件

### 0x01.max_map_count设置

```bash
vim /etc/sysctl.conf
```

修改配置（如果没有就在文件末尾添加）
```vim
# Elasticsearch8.19
vm.max_map_count = 1048576
```

<font color="red">重启服务器后执行如下命令验证是否已生效</font>
```bash
sysctl vm.max_map_count
```

https://www.elastic.co/guide/en/elasticsearch/reference/8.19/vm-max-map-count.html

## 二、通用二进制包构建

### 0x01.添加用户

```bash
groupadd es
useradd -g es es -s /sbin/nologin
```

### 0x02.下载并解压安装包

```bash
cd /usr/local/src
wget https://mirrors.2500city.com/devops/Elasticsearch/elasticsearch-8.19.9-linux-x86_64.tar.gz
tar zxvf elasticsearch-8.19.9-linux-x86_64.tar.gz
mv /usr/local/src/elasticsearch-8.19.9 /usr/local/elasticsearch8.19
```

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。  
命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

### 0x03.创建数据及日志目录

```bash
mkdir -p /data/elasticsearch
chown -R es:es /data/elasticsearch

mkdir -p /var/log/elasticsearch
chown -R es:es /var/log/elasticsearch

mkdir -p /var/run/elasticsearch
chown -R es:es /var/run/elasticsearch

chown -R es:es /usr/local/elasticsearch8.19
```

### 0x04.修改配置文件

```bash
vim  /usr/local/elasticsearch8.19/config/elasticsearch.yml
```

如下配置参数修改（<font color="red">参数需逐个修改</font>）
```md
node.name: node-1
path.data: /data/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
cluster.initial_master_nodes: ["node-1"]
```

在配置文件末尾追加如下配置（<font color="red">暂将此项设为 false 以确保 Elasticsearch 正常启动</font>）
```vim
# --------------------------- 启用 X-Pack 安全功能 -----------------------------
xpack.security.enabled: false
```

## 三、使用Systemd管理进程

### 0x01.创建单元文件

:::warning
默认情况下，Elasticsearch 的 PID 文件存储在 /var/run/elasticsearch 目录中。然而，由于系统重启后该目录会被删除，导致 Elasticsearch 服务无法自动启动。为了解决这一问题，<font color="red">约定将 Elasticsearch 的 PID 文件路径修改至数据目录中，以确保服务在系统重启后能够正常启动</font>。
:::

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
# the elasticsearch process currently sends the notifications back to systemd
# and for some reason exec does not work (even though it is a child). We should change
# this notify access back to main (the default), see https://github.com/elastic/elasticsearch/issues/86475
NotifyAccess=all
PrivateTmp=true
Environment=ES_HOME=/usr/local/elasticsearch8.19
Environment=ES_PATH_CONF=/usr/local/elasticsearch8.19/config
Environment=PID_DIR=/data/elasticsearch
Environment=ES_SD_NOTIFY=true

WorkingDirectory=/usr/local/elasticsearch8.19

User=es
Group=es

ExecStart=/usr/local/elasticsearch8.19/bin/elasticsearch -p ${PID_DIR}/elasticsearch.pid --quiet

# StandardOutput is configured to redirect to journalctl since
# some error messages may be logged in standard output before
# elasticsearch logging system is initialized. Elasticsearch
# stores its logs in /var/log/elasticsearch and does not use
# journalctl by default. If you also want to enable journalctl
# logging, you can simply remove the "quiet" option from ExecStart.
StandardOutput=journal
StandardError=inherit

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

# Built for @project.name@-@project.version@ (@project.name@)
```
:::

https://github.com/elastic/elasticsearch/blob/v8.19.9/distribution/packages/src/common/systemd/elasticsearch.service

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable elasticsearch --now
```

查看启动过程（如有需要）
```bash
tail -f /var/log/elasticsearch/elasticsearch.log
```

查看启动状态
```bash
systemctl status elasticsearch
```

### 0x04. 验证服务是否可用

::: el-tabs
--- el-tab-item netstat
```bash
netstat -nltp | grep 9200
```
输出如下内容

`tcp6       0      0 :::9200                 :::*                    LISTEN      663545/java`
---

--- el-tab-item _cat/health
```bash
curl 127.0.0.1:9200/_cat/health?pretty
```
输出如下内容（输出green即为可用）

1768014462 03:07:42 elasticsearch green 1 1 0 0 0 0 0 0 0 - 100.0%
---
:::

## 四、配置密码认证

### 0x01.生成证书

生成CA证书（一直回车）
```bash
/usr/local/elasticsearch8.19/bin/elasticsearch-certutil ca
```

基于CA证书来签发具体用途的证书（一直回车）
```bash
/usr/local/elasticsearch8.19/bin/elasticsearch-certutil cert \
  --ca elastic-stack-ca.p12
```

移动证书文件并修改所属组及用户
```bash
mv /usr/local/elasticsearch8.19/elastic-stack-ca.p12 /usr/local/elasticsearch8.19/config/
mv /usr/local/elasticsearch8.19/elastic-certificates.p12 /usr/local/elasticsearch8.19/config/
chown -R es:es /usr/local/elasticsearch8.19/config/elastic-stack-ca.p12
chown -R es:es /usr/local/elasticsearch8.19/config/elastic-certificates.p12
```
https://www.elastic.co/guide/en/elasticsearch/reference/8.19/security-basic-setup.htmlmmunication

### 0x02.修改配置文件

在 elasticsearch.yml 中修改`xpack.security`

```bash
vim  /usr/local/elasticsearch8.19/config/elasticsearch.yml
```

配置如下
```vim
# --------------------------- 启用 X-Pack 安全功能 -----------------------------
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

查看启动状态
```bash
systemctl status elasticsearch
```

查看启动过程（如有需要）
```bash
tail -f /var/log/elasticsearch/elasticsearch.log
```

### 0x03.设置密码

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
特殊符号不可以包含`'`、`"`、 `@`、`#`、`:`
:::

:::warning
[The elasticsearch-setup-passwords tool is deprecated and will be removed in a future release.](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/setup-passwords.html)
:::

设置 elastic 用户的密码
```bash
/usr/local/elasticsearch8.19/bin/elasticsearch-reset-password -u elastic
```

:::tip 输出如下内容
```md
This tool will reset the password of the [elastic] user to an autogenerated value.
The password will be printed in the console.
Please confirm that you would like to continue [y/N]y

Password for the [elastic] user successfully reset.
New value: O6g1M4_ZKmJreLlCXJXA
```
:::

### 0x04.验证密码登录

```bash
curl -u elastic:'<PASSWORD>' 127.0.0.1:9200/_cat/health
```
:::tip
1768017640 04:00:40 elasticsearch green 1 1 3 3 0 0 0 0 0 - 100.0%
:::

## 五、安装Analysis-IK分词插件

详见：<a href="/docs/middleware/elastic/install-es-analysis-ik.md" target="_blank">Analysis-IK 分词插件</a>

## 附录一、常用命令

### 0x01.查看版本号

```bash
/usr/local/elasticsearch8.19/bin/elasticsearch -V
```
:::tip 输出以下内容
Version: 8.19.9, Build: tar/f60dd5fdef48c4b6cf97721154cd49b3b4794fb0/2025-12-16T22:07:42.115850075Z, JVM: 25.0.11
:::

## 附录二、常见场景

### 0x01.修改密码

::: el-tabs
--- el-tab-item Kibana控制台
Management > Stack Management > 安全 > 用户
---
--- el-tab-item CURL请求方式

修改 elastic 用户的密码
```bash
curl -XPOST 'http://127.0.0.1:9200/_security/user/elastic/_password' \
  -H 'Content-Type:application/json' \
  -u elatic:<Old Password> \
  -d '{ "password" : "<New Password>" }'
```

验证新密码是否已生效
```bash
curl -u elastic:'<New Password>' 127.0.0.1:9200/_cat/health
```

https://www.elastic.co/guide/en/elasticsearch/reference/8.19/security-api-change-password.html
---
:::

:::warning
修改elasticsearch相关用户的密码后，如果这个用户及其密码是被配置在kiabana配置文件中，此时需要更新kibana配置文件中的相关密码并重启kibana服务，否则kibana服务将不可用。
:::

### 0x02.重置密码

重置 elastic 用户的密码
```bash
/usr/local/elasticsearch8.19/bin/elasticsearch-reset-password -u elastic
```

## 附录三、参考资料

- https://www.elastic.co/guide/en/elasticsearch/reference/8.19/targz.html
- https://www.elastic.co/guide/en/elasticsearch/reference/8.19/settings.html
