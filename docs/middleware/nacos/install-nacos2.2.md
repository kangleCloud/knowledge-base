# Nacos2单机模式部署

稳定版下载地址：https://github.com/alibaba/nacos/releases

Nacos Server 发布历史：https://nacos.io/download/release-history

截止2024年12月27日，Nacos 2.2.* 系列最新稳定版为2.2.3（*表示最新的补丁版本）。

:::tip 2.2.4 (June 20th, 2023) (Client Only)
[This release only include client part, the server part is same as 2.2.3, please directly use 2.2.3 version server.](https://github.com/alibaba/nacos/releases/tag/2.2.4)
:::

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 nacos2.2
:::

## 一、环境准备

- 服务器至少2C4G

- 如未安装 Java 运行环境，可参照<a href="/docs/devops/java/install-jdk.html#基于tar-gz包安装jdk8" target="_blank">安装JDK8</a>

- 如需安装 Mysql，可参照<a href="/docs/database/mysql/install-mysql8.0.html" target="_blank">安装Mysql8.0</a>

## 二、使用二进制包安装

```bash
cd /usr/local/src
wget https://github.com/alibaba/nacos/releases/download/2.2.3/nacos-server-2.2.3.tar.gz
tar -zxvf nacos-server-2.2.3.tar.gz
mv /usr/local/src/nacos /usr/local/nacos2.2
```

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
GRANT ALL PRIVILEGES ON nacos.* TO 'nacos'@'%';
FLUSH PRIVILEGES;
```

### 0x04.初始化数据库

:::tip
也可以通过可视化工具（如：Navicat）导入软件包中 conf 目录下的 sql 文件
:::

```bash
mysql -h<host> -P3306 -unacos -p<password> nacos < /usr/local/nacos2.2/conf/mysql-schema.sql
```

## 四、修改配置文件

编辑配置文件

```bash
vim /usr/local/nacos2.2/conf/application.properties
```

:::tip 修改如下配置
```vim
# 配置 MySQL 连接信息：
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://<ip:port>/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=<username>
db.password.0=<password>
# 开启鉴权
nacos.core.auth.enabled=true
nacos.core.auth.server.identity.key=<32位随机字符串>
nacos.core.auth.server.identity.value=<32位随机字符串>
nacos.core.auth.plugin.nacos.token.secret.key=<32位随机字符串>
```
:::

## 五、调整Nacos内存配置

:::tip
nacos默认内存用量大小配置的是512M，对于一般项目而言足够了，但是对于微服务项目而言肯定是不够的，如果没有资源搭建nacos集群模式，建议将内存增加到2g，否则会导致nacos偶发性oom。
:::

编辑配置文件

```bash
vim /usr/local/nacos2.2/bin/startup.sh
```

:::tip 修改如下配置
```vim
# 转到第87行，或搜索-Xms：
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

在 /etc/systemd/system 目录下面新建一个 service 文件

```bash
touch /etc/systemd/system/nacos.service
```

### 0x02.配置service文件

```bash
vim /etc/systemd/system/nacos.service
```

:::tip service文件内容如下
```vim
[Unit]
Description=Nacos
After=network.target

[Service]
Type=forking
Environment="JAVA_HOME=/usr/local/jdk8"
WorkingDirectory=/usr/local/nacos2.2/bin/
ExecStart=/usr/local/nacos2.2/bin/startup.sh -m standalone
ExecStop=/usr/local/nacos2.2/bin/shutdown.sh
Restart=always

[Install]
WantedBy=multi-user.target
```
:::

### 0x03.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x04.启动并设置开机自启

```bash
systemctl enable nacos --now
```

### 0x05.验证服务是否可用

通过浏览器访问`http://<ip>:8848/nacos`打开登录页面，输入账号和密码（账号：nacos，密码：nacos）。

<font color="red"><b>登录系统后，必须修改默认密码。</b></font>（密码规则：8位以上包含大小写字母、数字、特殊符号的随机字符串）
