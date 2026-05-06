# Zabbix5.4 Proxy 安装

Proxy 与 Server 需使用同一个主次版本号，下载地址参照<a href="/devops/monitoring/zabbix/quickstart.html#下载" target="_blank">
Zabbix 快速入门中的下载</a>

:::tip 约定

- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 zabbix5.4

:::

## 一、安装必要的库

```bash
yum install -y curl curl-devel \
    libcurl-devel \
    libxml2-devel \
    libevent-devel \
    net-snmp-devel \
    pcre-devel \
    mysql-devel
```

## 二、创建 zabbix 用户

```bash
groupadd zabbix
useradd -g zabbix -M -s /sbin/nologin zabbix
```

## 三、下载并解压源码包

```bash
cd /usr/local/src
wget https://cdn.zabbix.com/zabbix/sources/stable/5.4/zabbix-5.4.12.tar.gz
tar -zxvf zabbix-5.4.12.tar.gz
```

## 四、编译安装

:::tip
- 编译安装 zabbix-java-gateway 之前请确保服务器上已安装 java 环境
:::

```bash
cd /usr/local/src/zabbix-5.4.12

./configure --prefix=/usr/local/zabbix5.4 \
    --enable-proxy --enable-agent --enable-java \
    --with-mysql --with-net-snmp \
    --with-libxml2 --with-ssh2 \
    --with-openipmi --with-zlib --with-libpthread \
    --with-libevent --with-openssl --with-ldap \
    --with-libcurl --with-libpcre\
    --enable-ipv6

make install
```

## 五、初始化数据库

<font color="red">如果规划数据库并不会安装在当前服务器中，不允许为了数据初始化而在本机安装数据库软件。</font>

:::tip
- 数据库密码需要同时包含大小写字母、数字和特殊符号。
- 约定 Zabbix server 和 Zabbix proxy 使用不同的数据库名，其中 Zabbix proxy 的数据库名为 zabbix_proxy。
- 本节提供的有关创建 Zabbix 数据库的说明仅适用于在 Mysql 服务器主机中执行。
:::

### 0x01.创建数据库及用户

```bash
mysql -uroot -p<password>
```

```sql
mysql> CREATE DATABASE `zabbix_proxy` CHARACTER SET 'utf8' COLLATE 'utf8_bin';
mysql> CREATE USER 'zabbix'@'<ip>' IDENTIFIED BY '<password>';
mysql> GRANT ALL privileges ON zabbix_proxy.* TO 'zabbix'@'<ip>' IDENTIFIED BY '<password>';
mysql> SET GLOBAL log_bin_trust_function_creators = 1;
mysql> quit;
```

### 0x02.导入schema.sql

```bash
mysql -uzabbix -p<password> zabbix_proxy < /usr/local/src/zabbix-5.4.12/database/mysql/schema.sql
```

## 六、修改配置文件

编辑配置文件

```bash
vim /usr/local/zabbix5.4/etc/zabbix_proxy.conf
```

```vim
# 设置为 Zabbix Server 的 IP 地址
Server=<Zabbix Server IP>

# 设置 Zabbix Proxy 的 Hostname，请保证唯一性
Hostname=<Zabbix Proxy Hostname> #示例：proxy-{projectname}

DBHost=<Database Server IP>
DBName=zabbix_proxy
DBUser=zabbix
DBPassword=<DB Password> #密码规则：16位随机字符串（包括大小写字母、数字、特殊字符）
DBPort=3306

Timeout=10 #考虑到网络延迟，将超时时间设置为10s（默认值为3s

# 设置 Zabbix-JavaGateway 的 IP 地址
JavaGateway=127.0.0.1

# 设置 Zabbix-JavaGateway 的端口
JavaGatewayPort=10052

# 设置 Java 线程数，这里要求小于等于 JavaGateway 配置文件中所填写的数值
StartJavaPollers=5
```

:::tip
- 日志文件（包括错误日志）默认路径：/tmp/zabbix_proxy.log
:::

## 七、使用 Systemd 管理进程

:::tip
主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.新建 zabbix-proxy.service

```bash
vim /etc/systemd/system/zabbix-proxy.service
```

> 为了便于后期维护，约定在 zabbix-proxy.service 中明确加载的配置文件路径

写入如下内容：

```vim
[Unit]
Description=Zabbix Proxy
After=network.target

[Service]
Environment="CONFFILE=/usr/local/zabbix5.4/etc/zabbix_proxy.conf"
Type=forking
PIDFile=/tmp/zabbix_proxy.pid
Restart=on-failure
KillMode=control-group
ExecStart=/usr/local/zabbix5.4/sbin/zabbix_proxy -c $CONFFILE
ExecStop=/bin/kill -SIGTERM $MAINPID
RestartSec=10s
TimeoutSec=0

[Install]
WantedBy=multi-user.target
```

> 配置文件中不支持在每行命令的后面添加注释

### 0x02.重新加载 systemctl 配置

```bash
systemctl daemon-reload
```

### 0x03.启动 zabbix proxy 并配置自启

:::tip 前置条件
- 数据库可连接并已初始化成功
- 配置文件已完成修改
- 在Web控制台中已创建了 agent 代理程序（agent 代理程序名称需与 zabbix_proxy.conf 文件中的 Hostname 一致）
:::

```bash
systemctl start zabbix-proxy
systemctl enable zabbix-proxy
```

------------------------------ >>>>>> 此处为分割线 <<<<<< ------------------------------

:::tip Systemctl 指令
```bash
systemctl status zabbix-proxy   #查看状态
systemctl start zabbix-proxy    #启动服务
systemctl stop zabbix-proxy     #停止服务
systemctl enable zabbix-proxy   #开启开机自启服务
systemctl disable zabbix-proxy  #关闭开机自启服务
```
:::

## 八、参考资料

- https://www.zabbix.com/documentation/5.4/zh/manual/installation/install
- https://www.zabbix.com/documentation/5.4/zh/manual/appendix/install/db_scripts