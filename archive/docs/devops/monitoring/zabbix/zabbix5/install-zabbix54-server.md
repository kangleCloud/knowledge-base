# Zabbix5.4 Server 安装

下载地址参照 [Zabbix 快速入门中的下载](/devops/monitoring/zabbix/quickstart.html#下载)

**截止2024年3月，zabbix5.4（已被归档到 oldstable） 版本中最新稳定版为 5.4.12。**

:::tip 需要安装的软件
- Mysql 8.0.* （*表示最新的补丁版本）
- Nginx 1.24.* （*表示最新的补丁版本）
- PHP >= 7.3.33
- Java 1.8+ (启用 Zabbix-JavaGateway 需安装)
:::

## 一、安装依赖

```bash
yum -y install mysql-devel pcre-devel openssl-devel zlib-devel libxml2-devel \
  libssh2-devel OpenIPMI-devel libevent-devel openldap-devel  libcurl-devel \
  net-snmp-devel net-snmp
```

## 二、安装必要的软件

### 0x01.Nginx1.24

详见：<a href="/devops/baseops/nginx/install" target="_blank">基础运维 · Nginx · 安装Nginx</a>

### 0x02.PHP7

:::tip 
在 openEurler22.03 中安装 Zabbix5.4，尽管更新了中文字体，依旧无法解决图形面板中的中文乱码问题。经运维小组多次尝试，可通过在 PHP7 的编译命令中删除`--enable-gd-jis-conv`参数后再编译解决该问题。
:::

详见：<a href="/devops/baseops/php7/install-php73" target="_blank">基础运维 · PHP7 · 安装PHP7.3</a>

### 0x03.Mysql8.0

:::warning 
如果 Zabbix 的数据库借用业务数据库，一旦业务数据库服务异常，整个监控报警就异常了，所以非特殊情况，<font color="red">不允许借用业务数据库</font>。
:::

详见：<a href="/database/mysql/install-mysql8.0.html" target="_blank">数据库 · Mysql安装及配置 · 安装 Mysql8.0</a>

### 0x01.Java1.8

详见：<a href="/devops/baseops/java/install-jdk.html" target="_blank">基础运维 · Java · 安装JDK · 基于tar.gz包安装JDK8</a>

## 三、创建用户

```bash
groupadd zabbix
useradd -g zabbix -M -s /sbin/nologin zabbix
```

## 四、下载源码包并解压

```bash
cd /usr/local/src
wget https://cdn.zabbix.com/zabbix/sources/stable/5.4/zabbix-5.4.12.tar.gz
tar -xf zabbix-5.4.12.tar.gz
```

## 五、编译安装

```bash
cd /usr/local/src/zabbix-5.4.12

./configure --prefix=/usr/local/zabbix5.4 --enable-server --enable-agent --enable-java \
  --with-mysql --with-net-snmp \
  --with-libxml2 --with-ssh2 \
  --with-openipmi --with-zlib --with-libpthread \
  --with-libevent --with-openssl --with-ldap \
  --with-libcurl --with-libpcre\
  --enable-ipv6

make install
```

## 六、修改配置文件

```bash
# vim /usr/local/zabbix5.4/etc/zabbix_server.conf

ListenPort=10051
LogFile=/tmp/zabbix_server.log

# 数据库设置
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=zabbix //创建zabbix库的时候根据自己需要更改

Timeout=4
LogSlowQueries=3000
StatsAllowedIP=127.0.0.1
```

## 七、数据库创建用户

```sql
# 创建zabbix库(这里zabbix对库的编码格式有需求)
mysql> create database zabbix character set utf8 collate utf8_bin;

# 创建用户（指定使用的身份验证插件）
mysql> create user 'zabbix'@'localhost' identified with mysql_native_password by 'zabbix';
mysql> grant all privileges on zabbix.* to 'zabbix'@'localhost';
mysql> flush privileges;
msyql> set global log_bin_trust_function_creators = 1;
mysql> quit;
```

## 八、导入zabbix的库表及数据

<font color="red">注意导入的顺序</font>

```bash
mysql -uzabbix -pzabbix zabbix < /usr/local/src/zabbix-5.4.12/database/mysql/schema.sql
mysql -uzabbix -pzabbix zabbix < /usr/local/src/zabbix-5.4.12/database/mysql/images.sql
mysql -uzabbix -pzabbix zabbix < /usr/local/src/zabbix-5.4.12/database/mysql/data.sql
```

## 九、移动前端目录

将 zabbix 前端页面移动到 zabbix.conf 中配置的目录中

```bash
cd /usr/local/zabbix5.4
mkdir web
cp -rp /usr/local/src/zabbix-5.4.12/ui/* /usr/local/zabbix5.4/web/
```

## 十、配置Nginx服务

```bash
vim /usr/local/nginx/conf/conf.d/zabbix.conf
```

```toml
server {
    listen 9080; #端口根据情况修改
    server_name zabbix.example.com; # 域名根据情况修改
    location / {
        root /usr/local/zabbix5.4/web/;
        index index.php index.html index.htm;
    }
    location ~ \.php$ {
        root /usr/local/zabbix5.4/web/;
        fastcgi_pass 127.0.0.1:9073;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 十一、使用Systemd管理进程

### 0x01.创建service文件

```bash
vim /etc/systemd/system/zabbix-server.service
```

```toml
[Unit]
Description=Zabbix Server with MySQL DB
After=syslog.target network.target mysqld.service
[Service]
Type=simple
ExecStart=/usr/local/zabbix5.4/sbin/zabbix_server -f
User=zabbix
[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable zabbix-server
systemctl start zabbix-server
```

:::tip Systemctl 指令

```bash
systemctl status zabbix-server   #查看状态
systemctl start zabbix-server    #启动服务
systemctl stop zabbix-server     #停止服务
systemctl enable zabbix-server   #开启开机自启服务
systemctl disable zabbix-server  #关闭开机自启服务
```
:::

## 十二、参考资料

- https://blog.csdn.net/weixin_52906737/article/details/128331225
- https://blog.csdn.net/weixin_47268883/article/details/122979389
- https://www.zabbix.com/documentation/current/zh/manual/installation/install