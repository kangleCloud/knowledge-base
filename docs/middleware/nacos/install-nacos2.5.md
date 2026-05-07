# Nacos2.5单机模式部署

稳定版下载地址：https://github.com/alibaba/nacos/releases

Nacos Server 发布历史：https://nacos.io/download/release-history

[截止2025年8月23日，Nacos2.x的最新稳定版为2.5.1](https://nacos.io/docs/v2.5/quickstart/quick-start/#0-%E7%89%88%E6%9C%AC%E9%80%89%E6%8B%A9)。

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 nacos2.5
  :::

## 一、环境准备

- 至少在2C4G 60G的机器配置下运行。
- 如未安装 Java 运行环境，可参照<a href="/docs/devops/base/java/install-jdk.html" target="_blank">安装JDK8</a>。
- 如需安装 Mysql，可参照<a href="/docs/database/mysql/install-mysql8.0.html" target="_blank">安装Mysql8.0</a>。

## 二、使用二进制包安装

https://github.com/alibaba/nacos/releases/tag/2.5.1

```bash
cd /usr/local/src
wget https://github.com/alibaba/nacos/releases/download/2.5.1/nacos-server-2.5.1.tar.gz
tar -zxvf nacos-server-2.5.1.tar.gz
mv /usr/local/src/nacos /usr/local/nacos2.5
```

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

## 三、初始化数据库

<font color="red">如果前期规划数据库不安装在当前服务器中，不允许为了数据初始化而在本机安装数据库软件。</font>

### 0x01.登录MySQL

```bash
mysql -h<host> -P3306 -u<username> -p<password>
```

### 0x02.创建Nacos数据库

```sql
CREATE DATABASE nacos CHARACTER SET utf8 COLLATE utf8_general_ci;
```

### 0x03.创建Nacos用户

```sql
CREATE USER 'nacos'@'%' IDENTIFIED BY '<password>';
```
```sql
GRANT ALL PRIVILEGES ON nacos.* TO 'nacos'@'%';
```
```sql
FLUSH PRIVILEGES;
```

### 0x04.初始化数据库

:::tip
也可以通过可视化工具（如：Navicat）导入软件包中 conf 目录下的 sql 文件
:::

```bash
mysql -h<host> -P3306 -unacos -p<password> nacos < /usr/local/nacos2.5/conf/mysql-schema.sql
```

## 四、修改配置文件

编辑配置文件

```bash
vim /usr/local/nacos2.5/conf/application.properties
```

:::tip 修改如下配置
```vim
#*************** Config Module Related Configurations ***************#
spring.datasource.platform=mysql

db.num=1

db.url.0=jdbc:mysql://<ip>:<port>/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai
db.user.0=<username>
db.password.0=<password>

#*************** Access Control Related Configurations ***************#
nacos.core.auth.enabled=true

nacos.core.auth.server.identity.key=<32位随机字符串>
nacos.core.auth.server.identity.value=<32位随机字符串>

nacos.core.auth.plugin.nacos.token.secret.key=<32位随机字符串Base64编码>
```
:::

:::warning db.url.0
MySQL8.0 驱动默认不允许公钥检索，如果 Nacos 连接的是 MySQL8.0 需要在数据库连接 URL 中添加参数allowPublicKeyRetrieval=true。
:::

## 五、调整Nacos内存配置

:::tip
nacos默认内存用量大小配置的是512M，对于一般项目而言足够了，但是对于微服务项目而言肯定是不够的，如果没有资源搭建nacos集群模式，建议将内存增加到2g，否则会导致nacos偶发性oom。
:::

编辑配置文件

```bash
vim /usr/local/nacos2.5/bin/startup.sh
```

:::tip 修改如下配置
```vim
# 转到第95行，或搜索-Xms：
 86 if [[ "${MODE}" == "standalone" ]]; then
 87     JAVA_OPT="${JAVA_OPT} -Xms512m -Xmx512m -Xmn256m"
 88     JAVA_OPT="${JAVA_OPT} -Dnacos.standalone=true"
 89 else
 90     if [[ "${EMBEDDED_STORAGE}" == "embedded" ]]; then
 91         JAVA_OPT="${JAVA_OPT} -DembeddedStorage=true"
 92     fi
 93     JAVA_OPT="${JAVA_OPT} -server -Xms2g -Xmx2g -Xmn1g -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
 94     JAVA_OPT="${JAVA_OPT} -XX:-OmitStackTraceInFastThrow -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=${BASE_DIR}/logs/java_heapdump.hprof"
 95     JAVA_OPT="${JAVA_OPT} -XX:-UseLargePages"
 96 
 97 fi

# 修改-Xms与-Xmx的值，并删除最后的-Xmn256m
```
:::

## 六、使用Systemd管理进程

### 0x01.创建service文件

```bash
vim /etc/systemd/system/nacos.service
```

添加如下内容

```vim
[Unit]
Description=Nacos
After=network.target

[Service]
Type=forking
Environment="JAVA_HOME=/usr/local/jdk8"
WorkingDirectory=/usr/local/nacos2.5/bin/
ExecStart=/usr/local/nacos2.5/bin/startup.sh -m standalone
ExecStop=/usr/local/nacos2.5/bin/shutdown.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载systemd配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable nacos --now
```

### 0x04.打开控制台页面

打开任意浏览器，在地址栏输入 `http://<ip>:8848/nacos`，即可访问 Nacos 控制台页面。默认账号和密码均为 nacos/nacos。<font color="red">首次登录后，需修改默认密码，新密码长度不少于8位，且需包含大写字母、小写字母、数字和特殊符号。</font>


## 附件一、修改日志级别

```bash
vim /usr/local/nacos2.5/conf/nacos-logback.xml
```

跳转到文件末尾，原始配置类似如下内容，将 level 的值从 "INFO" 改为 "ERROR"，重启 Nacos 服务以使配置生效。
```xml
<root>
    <level value="INFO"/> //[!code --]
    <level value="ERROR"/> //[!code ++]
    <appender-ref ref="rootFile"/>
</root>
```

## 附录二、参考资料

- https://nacos.io/docs/v2.5/quickstart/quick-start/
- https://nacos.io/docs/v2.5/manual/admin/deployment/deployment-standalone/
- https://nacos.io/docs/v2.5/manual/admin/auth
