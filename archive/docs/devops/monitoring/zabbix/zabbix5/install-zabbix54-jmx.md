# Zabbix5.4 JMX 安装配置

当前部署zabbix版本为zabbix5.4.12

下载地址参照 [Zabbix 快速入门中的下载](/devops/monitoring/zabbix/quickstart.html#下载)

:::tip 需要安装的软件

- Java：启用 Zabbix-JavaGateway 需安装

:::

## 编译安装

对于已经存在的 zabbix 服务，需要重新编译安装 Zabbix JavaGateway 以启用 JMX 监控。

```bash
./configure --prefix=/usr/local/zabbix5.4 --enable-java \
  --with-mysql --with-net-snmp \
  --with-libxml2 --with-ssh2 \
  --with-openipmi --with-zlib --with-libpthread \
  --with-libevent --with-openssl --with-ldap \
  --with-libcurl --with-libpcre
```

## 修改配置文件

```bash
vim /usr/local/zabbix5.4/sbin/zabbix_java/setting.sh
```

修改内容如下：

```shell
LISTEN_IP="0.0.0.0"
LISTEN_PORT=10052
PID_FILE="/tmp/zabbix_java.pid"
START_POLLERS=5   # 在 zabbix server 和 zabbix proxy 配置文件中的值小于等于这里所填写的
TIMEOUT=5
```

## 运行 zabbix JavaGateway

```bash
# 启动
/usr/local/zabbix5.4/sbin/zabbix_java/startup.sh

# 关闭
/usr/local/zabbix5.4/sbin/zabbix_java/shutdown.sh
```

## supervisor 配置

在启动完成 Zabbix JavaGateway 之后，要为 Java 项目启动 JMX(Java Management Extensions)，需要对配置文件进行修改。

```bash
cd /etc/supervisor/conf.d/
# 修改里面有关 Java 的配置文件
```

```bash
vim /etc/supervisor/conf.d/java-example.ini
```

添加下面内容：

```vim
-Dspring.profiles.active=prod                       # 项目指定配置环境，prod 在不同项目中需要修改
-Dcom.sun.management.jmxremote 
-Djava.rmi.server.hostname=192.168.19.201           # 设置为本机 IP
-Dcom.sun.management.jmxremote.port=19910           # 一般设置为 1+java服务端口
-Dcom.sun.management.jmxremote.rmi.port=19910       # 同上
-Dcom.sun.management.jmxremote.ssl=false            
-Dcom.sun.management.jmxremote.authenticate=false
```

示例如下：

```toml
[program:szd-java-alipay-miniprogram-sjfy-app]
command=/usr/local/jdk1.8.0_361/bin/java -jar -Xms512m -Xmx512m -XX:MaxMetaspaceSize=256M -Dspring.profiles.active=prod -Dserver.port=9910 -Dcom.sun.management.jmxremote -Djava.rmi.server.hostname=192.168.19.201 -Dcom.sun.management.jmxremote.port=19910 -Dcom.sun.management.jmxremote.rmi.port=19910 -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=false /data/content/szd-java-alipay-miniprogram/sjfy-app.jar
directory=/data/content/szd-java-alipay-miniprogram/
autostart=true
startsecs=10
autorestart=true
startretries=3
user=nginx
priority=999
redirect_stderr=true
stdout_logfile_maxbytes=20MB
stdout_logfile_backups = 20
stopasgroup=false
killasgroup=false
stdout_logfile_maxbytes=1024MB
stdout_logfile=/data/logs/szd-java-alipay-miniprogram-sjfy-app.log
```

修改完成后需要重启 Supervisor 服务

## 参考资料

- https://www.zabbix.com/documentation/5.4/zh/manual/concepts/java/from_sources
- https://blog.csdn.net/abcdu1/article/details/90075001