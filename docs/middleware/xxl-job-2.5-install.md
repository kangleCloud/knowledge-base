# XXL-JOB2.5安装

当前文档基于 XXL-JOB 2.5.0 稳定版本编写。XXL-JOB 2.5.0 是基于 JDK 1.8 开发的最后一个大版本，官方将对其提供长期持续维护支持。截至 2026 年 1 月 24 日，XXL-JOB 2.5.* 系列的最新稳定版为 2.5.0。

- 官网地址：https://www.xuxueli.com/xxl-job
- Github Tag: https://github.com/xuxueli/xxl-job/tags

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 xxl-job-2.5
:::

## 1.前置条件

### 0x01.运行环境

如未安装 Java 运行环境，可参照<a href="/docs/devops/base/java/install-jdk.html" target="_blank">安装JDK8</a>

如未安装 Maven，可参照<a href="/docs/devops/base/java/maven.html" target="_blank">安装Maven</a>

如需安装 Mysql，可参照<a href="/docs/database/mysql/install-mysql8.0.html" target="_blank">安装Mysql8.0</a>

### 0x02.创建xxljob用户

```bash
groupadd xxljob
useradd -g xxljob xxljob -s /sbin/nologin
```

### 0x03.创建日志目录

```bash
mkdir -p /var/log/xxl-job-admin
chown -R xxljob:xxljob /var/log/xxl-job-admin
```

## 2.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/xuxueli/xxl-job/archive/refs/tags/2.5.0.tar.gz \
  -O xxl-job-2.5.0.tar.gz
tar zxvf xxl-job-2.5.0.tar.gz
mv xxl-job-2.5.0 /usr/local/xxl-job-2.5
```

## 3.初始化数据库

<font color="red">如果前期规划数据库不安装在当前服务器中，不允许为了数据初始化而在本机安装数据库软件。</font>

### 0x01.登录MySQL
   
```bash
mysql -P3306 -u<username> -p
```

### 0x02.创建XXL-JOB数据库

```sql
CREATE DATABASE if NOT EXISTS `xxl_job` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 0x03.创建XXL-JOB用户

```sql
CREATE USER 'xxl_job'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON xxl_job.* TO 'xxl_job'@'%';
FLUSH PRIVILEGES;
```

## 4.配置文件修改

### 0x01.调度中心

:::tip xxl-job-admin默认端口及URI
```properties
server.port=8080
server.servlet.context-path=/xxl-job-admin
```
:::

```bash
vim /usr/local/xxl-job-2.5/xxl-job-admin/src/main/resources/application.properties
```

```properties
### xxl-job, datasource
spring.datasource.url=jdbc:mysql://<IP>:3306/xxl_job?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
spring.datasource.username=xxl_job
spring.datasource.password=<PASSWORD>
```

### 0x02.调度中心日志

编辑配置文件
```bash
vim /usr/local/xxl-job-2.5/xxl-job-admin/src/main/resources/logback.xml
```

修改如下配置
```md
<property name="log.path" value="/data/applogs/xxl-job/xxl-job-admin.log"/> //[!code --]
<property name="log.path" value="/var/log/xxl-job-admin/xxl-job-admin.log"/>  //[!code ++]
```

## 5.打包项目

确定 mvn 使用的是 jdk1.8
```bash
mvn -v
```

:::tip 输出如下内容
```md
Apache Maven 3.9.12 (848fbb4bf2d427b72bdb2471c22fced7ebd9a7a1)
Maven home: /usr/local/apache-maven-3.9
Java version: 1.8.0_461, vendor: Oracle Corporation, runtime: /usr/local/jdk8/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "linux", version: "5.10.0-136.95.0.176.oe2203sp1.x86_64", arch: "amd64", family: "unix"
```
:::

打包项目并跳过测试
```bash
cd /usr/local/xxl-job-2.5
mvn clean package -DskipTests
```

## 6.使用Systemd管理进程

### 0x01.创建service单元文件

```bash
vim /etc/systemd/system/xxl-job-admin.service
```

添加如下内容
```md
[Unit]
Description=XXL-Job Admin Service
After=network.target

[Service]
Type=simple
User=xxljob
Group=xxljob

# 工作目录和启动命令
WorkingDirectory=/usr/local/xxl-job-2.5/xxl-job-admin
ExecStart=/usr/local/jdk8/bin/java \
  -Xmx512m -Xms512m \
  -Xss256k \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Dfile.encoding=UTF-8 \
  -Duser.timezone=Asia/Shanghai \
  -Dlogging.file.path=/var/log/xxl-job-admin \
  -Dlogging.file.name=/var/log/xxl-job-admin/xxl-job-admin.log \
  -jar /usr/local/xxl-job-2.5/xxl-job-admin/target/xxl-job-admin-2.5.0.jar
ExecStop=/bin/kill -s TERM $MAINPID

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/xxl-job-admin
ReadOnlyPaths=$APP_HOME/target

# 进程管理
Restart=on-failure
RestartSec=10s
StartLimitInterval=60s
StartLimitBurst=3
TimeoutStopSec=30
LimitNOFILE=65535
LimitNPROC=4096

# 日志配置
StandardOutput=append:/var/log/xxl-job-admin/stdout.log
StandardError=append:/var/log/xxl-job-admin/stderr.log
SyslogIdentifier=xxl-job-admin
LogLevelMax=info

[Install]
WantedBy=multi-user.target
```

### 0x02.重载单元文件
```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable xxl-job-admin --now
```

:::tip Systemd指令
```
systemctl status xxl-job-admin  #查看服务
systemctl start xxl-job-admin   #启动服务
systemctl stop xxl-job-admin    #停止服务
systemctl restart xxl-job-admin #重启服务
systemctl enable xxl-job-admin  #开启开机自启服务
systemctl disable xxl-job-admin #关闭开机自启服务
```
:::

## 7.访问调度中心

### 0x01.浏览器

打开任意浏览器，在地址栏输入 `http://<IP>:8080/xxl-job-admin`，即可访问 XXL-JOB 控制台页面。默认账号和密码为 `admin/<PASSWORD>`。<font color="red">首次登录后，需修改默认密码，新密码长度不少于12位，且需包含大写字母、小写字母、数字和特殊符号。</font>

![](/images/middleware/xxljob/xxl-job-admin.png)

## 附录1.最佳实践

### 0x01.邮件报警配置

待完善

## 附录2.参考资料

https://www.xuxueli.com/xxl-job/
