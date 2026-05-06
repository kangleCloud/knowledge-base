# Zabbix6.0 Agent 安装及配置

Agent 与 Server 需使用同一个主次版本号，下载地址参照<a href="/docs/devops/monitoring/zabbix/quickstart.html#下载" target="_blank">
Zabbix 快速入门中的下载</a>

:::tip 约定

- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 zabbix6.0
- 目前团队正在使用的版本是 v6.0.21，约定存量系统新安装的 Agent 版本为 v6.0.21。

:::

> 新版本的 Zabbix Server 是兼容旧版本的 Zabbix Agent 的。

## 1.安装必要的库

```bash
yum install -y curl curl-devel \
    libxml2-devel \
    libevent-devel \
    net-snmp-devel \
    mysql-devel
```

## 2.创建Zabbix用户

```bash
groupadd zabbix
useradd -g zabbix -M -s /sbin/nologin zabbix
```

## 3.下载并解压源码包

```bash
cd /usr/local/src
wget https://cdn.zabbix.com/zabbix/sources/stable/6.0/zabbix-6.0.21.tar.gz
tar -xf zabbix-6.0.21.tar.gz
```

## 4.编译安装

```bash
cd /usr/local/src/zabbix-6.0.21
```

::: el-tabs
--- el-tab-item 自定义openssl路径
```bash
./configure --prefix=/usr/local/zabbix6.0 \
    --enable-agent \
    --with-openssl=/usr/local/openssl1.1 \
    --with-mysql --with-net-snmp \
    --with-libxml2 --with-ssh2 \
    --with-openipmi --with-zlib --with-libpthread \
    --with-libevent --with-ldap \
    --with-libcurl --with-libpcre \
    --enable-ipv6
```
---
--- el-tab-item 系统默认openssl路径
```bash
./configure --prefix=/usr/local/zabbix6.0 \
    --enable-agent \
    --with-openssl \
    --with-mysql --with-net-snmp \
    --with-libxml2 --with-ssh2 \
    --with-openipmi --with-zlib --with-libpthread \
    --with-libevent --with-ldap \
    --with-libcurl --with-libpcre \
    --enable-ipv6
```
---
:::

```bash
make install
```

## 5.修改配置文件

```bash
vim /usr/local/zabbix6.0/etc/zabbix_agentd.conf
```

```vim
# 被动模式下的 Server 或 Proxy 地址
# 目前团队使用的都是主动模式，此处固定为：127.0.0.1
Server=127.0.0.1

# 主动模式下的 Server 或 Proxy 地址
ServerActive={Zabbix server IP}:10051

# 设置为本机的ip地址
Hostname={Zabbix Agentd Hostname}

# 超时时间（单位秒）
Timeout=5

# 开启 include
Include=/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/*.conf
```

## 6.使用Systemd管理进程

:::tip
- zabbix-agentd.service 执行文件需构建在 /etc/systemd/system 目录下
:::

### 0x01.创建单元文件

```bash
vim  /etc/systemd/system/zabbix-agentd.service
```

添加如下内容
> 配置文件中不支持在每行命令的后面添加注释

 ```vim
[Unit]
Description=Zabbix Agentd
After=network.target

[Service]
Type=forking
PIDFile=/tmp/zabbix_agentd.pid
Environment="CONFFILE=/usr/local/zabbix6.0/etc/zabbix_agentd.conf"
ExecStart=/usr/local/zabbix6.0/sbin/zabbix_agentd -c $CONFFILE
ExecStop=/bin/kill -SIGTERM $MAINPID
RestartSec=5

Restart=on-failure
KillMode=control-group
TimeoutSec=0

[Install]
WantedBy=multi-user.target
```

:::tip 参数说明
- PidFile - 在 zabbix_agentd.conf 的一般参数配置中，可找到 PidFile 的相关配置参考
:::

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable zabbix-agentd --now
```

:::tip Systemctl指令
```bash
systemctl start zabbix-agentd    #启动服务
systemctl status zabbix-agentd   #查看状态
systemctl stop zabbix-agentd     #停止服务
systemctl enable zabbix-agentd   #开启开机自启服务
systemctl disable zabbix-agentd  #关闭开机自启服务
```
:::

## 附录1.参考资料

- https://www.zabbix.com/documentation/6.0/zh/manual/installation/install