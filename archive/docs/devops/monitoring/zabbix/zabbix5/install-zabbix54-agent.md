# Zabbix5.4 Agent 安装及配置

Agent 与 Server 需使用同一个主次版本号，下载地址参照<a href="/devops/monitoring/zabbix/quickstart.html#下载" target="_blank">
Zabbix 快速入门中的下载</a>

:::tip 约定
- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 zabbix5.4
:::

## 一、安装必要的库

```bash
yum install -y curl curl-devel \
    libxml2-devel \
    libevent-devel \
    net-snmp-devel \
    mysql-devel \
    openldap openldap-devel
```

## 二、创建Zabbix用户

```bash
groupadd zabbix
useradd -g zabbix -M -s /sbin/nologin zabbix
```

## 三、下载并解压源码包

```bash
cd /usr/local/src
wget https://cdn.zabbix.com/zabbix/sources/oldstable/5.4/zabbix-5.4.12.tar.gz
tar -zxvf zabbix-5.4.12.tar.gz
```

## 四、编译安装

```bash
cd /usr/local/src/zabbix-5.4.12
```

::: el-tabs
--- el-tab-item 自定义openssl路径
```bash
./configure --prefix=/usr/local/zabbix5.4 \
    --enable-agent \
    --with-openssl=/usr/local/openssl1.1 \
    --with-mysql --with-net-snmp \
    --with-libxml2 --with-ssh2 \
    --with-openipmi --with-zlib --with-libpthread \
    --with-libevent --with-openssl --with-ldap \
    --with-libcurl --with-libpcre\
    --enable-ipv6
```
---
--- el-tab-item 系统默认openssl路径
```bash
./configure --prefix=/usr/local/zabbix5.4 \
    --enable-agent \
    --with-openssl \
    --with-mysql --with-net-snmp \
    --with-libxml2 --with-ssh2 \
    --with-openipmi --with-zlib --with-libpthread \
    --with-libevent  --with-ldap \
    --with-libcurl --with-libpcre \
    --enable-ipv6
```
---
:::


```bash
make install
```

## 五、修改配置文件

```bash
vim /usr/local/zabbix5.4/etc/zabbix_agentd.conf
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
Include=/usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/*.conf
```

## 六、使用Systemd管理进程

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
Environment="CONFFILE=/usr/local/zabbix5.4/etc/zabbix_agentd.conf"
ExecStart=/usr/local/zabbix5.4/sbin/zabbix_agentd -c $CONFFILE
ExecStop=/bin/kill -SIGTERM $MAINPID
RestartSec=5

Restart=on-failure
KillMode=control-group
TimeoutSec=0

[Install]
WantedBy=multi-user.target
```

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable zabbix-agentd --now
```

:::tip Systemctl 指令
```bash
systemctl start zabbix-agentd    #启动服务
systemctl status zabbix-agentd   #查看状态
systemctl stop zabbix-agentd     #停止服务
systemctl enable zabbix-agentd   #开启开机自启服务
systemctl disable zabbix-agentd  #关闭开机自启服务
```
:::

## 附录一、编译安装常见问题

- **configure: error: newly created file is older than distributed files!**
    
:::tip 解决方法
执行如下命令（结尾的`;`是必须的）将所有文件设置为当前时间
```bash
find . -name "*" -exec touch '{}' \;
```
:::

- **error: ‘for’ loop initial declarations are only allowed in C99 mode**

:::tip 解决方法
在./configure之前设置一个环境变量即可编译通过

```bash
export CFLAGS="-std=gnu99"
```
:::

## 附录二、参考资料

- https://www.zabbix.com/documentation/5.4/zh/manual/installation/install