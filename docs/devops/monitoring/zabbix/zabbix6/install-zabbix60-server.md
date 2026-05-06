# Zabbix6.0 Server 安装

当前部署zabbix版本为zabbix6.0.21

下载地址参照 [Zabbix 快速入门中的下载](/devops/monitoring/zabbix/quickstart.html#下载)

:::tip 需要安装的软件

- Mysql8.0.* （*表示最新的补丁版本）
- Nginx1.24（最新稳定版）
- PHP 版本：>= 7.3.33
- Java：启用 Zabbix-JavaGateway 需安装
:::

## 创建用户

```bash
groupadd zabbix
useradd -g zabbix -M -s /sbin/nologin zabbix
```

## 安装依赖

```bash
yum -y install mysql-devel pcre-devel openssl-devel zlib-devel libxml2-devel \
  libssh2-devel OpenIPMI-devel libevent-devel openldap-devel  libcurl-devel \
  net-snmp-devel net-snmp
```

## 下载zabbix-server6.0.21并解压

```bash
cd /usr/local/src
wget https://cdn.zabbix.com/zabbix/sources/stable/6.0/zabbix-6.0.21.tar.gz
tar -xf zabbix-6.0.21.tar.gz
```

## 编译安装

```bash
cd /usr/local/src/zabbix-6.0.21

./configure --prefix=/usr/local/zabbix6.0 --enable-server --enable-agent --enable-java \
  --with-mysql --with-net-snmp \
  --with-libxml2 --with-ssh2 \
  --with-openipmi --with-zlib --with-libpthread \
  --with-libevent --with-openssl --with-ldap \
  --with-libcurl --with-libpcre\
  --enable-ipv6

make install
```

## 修改配置文件

```bash
# vim /usr/local/zabbix6.0/etc/zabbix_server.conf

ListenPort=10051
LogFile=/tmp/zabbix_server.log

# 数据库设置
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=<PASSWORD> // 创建 zabbix 库时根据自己需要调整

Timeout=4
LogSlowQueries=3000
StatsAllowedIP=127.0.0.1
```

## 数据库创建用户

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

## 导入zabbix的库表及数据

<font color="red">注意导入的顺序</font>

```bash
mysql -uzabbix -pzabbix zabbix < /usr/local/src/zabbix-6.0.21/database/mysql/schema.sql
mysql -uzabbix -pzabbix zabbix < /usr/local/src/zabbix-6.0.21/database/mysql/images.sql
mysql -uzabbix -pzabbix zabbix < /usr/local/src/zabbix-6.0.21/database/mysql/data.sql
```

## 移动前端目录

将zabbix前端页面移动到zabbix.conf中配置的目录中

```bash
cd /usr/local/zabbix6.0

mkdir web

cp -rp /usr/local/src/zabbix-6.0.21/ui/* /usr/local/zabbix6.0/web/
```

## 配置 Nginx 服务

```bash
vim /usr/local/nginx/conf/conf.d/zabbix.conf
```

```nginx configuration
server {
  listen 9080; #端口根据情况修改
  server_name zabbix.example.com; # 域名根据情况修改
  location / {
       root /usr/local/zabbix6.0/web/;
       index index.php index.html index.htm;
  }
  location ~ \.php$ {
       root /usr/local/zabbix6.0/web/;
       fastcgi_pass 127.0.0.1:9073;
       fastcgi_index index.php;
       fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
       include fastcgi_params;
    }
}
```

## 使用 Systemctl 管理进程

1. 新增 zabbix-server.service 文件

    ```bash
    vim /etc/systemd/system/zabbix-server.service
    ```

    ```toml
    [Unit]
    Description=Zabbix Server with MySQL DB
    After=syslog.target network.target mysqld.service
    [Service]
    Type=simple
    ExecStart=/usr/local/zabbix6.0/sbin/zabbix_server -f
    User=zabbix
    [Install]
    WantedBy=multi-user.target
    ```

2. 重新加载system文件

    ```bash
    systemctl daemon-reload
   ```

3. 启动 zabbix server

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

## 参考资料

- https://blog.csdn.net/weixin_52906737/article/details/128331225
- https://blog.csdn.net/weixin_47268883/article/details/122979389
- https://www.zabbix.com/documentation/current/zh/manual/installation/install
