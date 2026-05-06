# 安装 Sonarqube

- [LTS Changelog](https://www.sonarsource.com/products/sonarqube/whats-new/)

:::warning 约定

- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 sonarqube10.5
- 数据目录默认放置在/data/sonarqube下。
  :::

## 安装

:::tip

- 可通过官方[LTS Changelog](https://www.sonarsource.com/products/sonarqube/downloads/historical-downloads/)确认最新版本。
  :::

**下载zip包**

可通过[官方下载地址](https://www.sonarsource.com/products/sonarqube/downloads/historical-downloads/)选择最新稳定版本

**解压安装包**

```bash
cd /usr/local/src
unzip sonarqube-10.5.0.89998.zip
mv sonarqube-10.5.0.89998 /usr/local/sonarqube10.5
```

**修改文件属组**
```bash
cd /usr/local/
chown -R sonar:sonar sonarqube10.5
```

**修改配置文件**
```bash
vim  /usr/local/sonarqube10.5/conf/sonar.properties
sonar.jdbc.username=sonar
sonar.jdbc.password=<DB_PASSWORD>
sonar.jdbc.url=jdbc:postgresql://localhost/sonar
# 配置内置elasticsearch存储路径
sonar.path.data=/data/sonarqube/data
sonar.path.temp=/data/sonarqube/temp
```

**安装postgrepSQL**
```bash
mkdir -p /data/postgresql/data    
mkdir -p /data/postgresql/install/

docker run -d \
 	--name postgresql \
	-e POSTGRES_USER='sonar' \
	-e POSTGRES_PASSWORD='<DB_PASSWORD>' \
	-v /data/postgresql/install:/var/lib/postgresql \
	-v /data/postgresql/data:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres:12
```
## 配置

**调整启动配置**
```bash
echo 'export SONAR_JAVA_PATH=/usr/local/jdk17/bin/java' >> /etc/profile
source /etc/profile 

# 配置sonarqube内置elasticsearch内核参数
echo 'vm.max_map_count=262144' >>/etc/sysctl.conf
sysctl -p
```

:::tip
前提：
    目前最新版Sonarqube需要使用JDK17,请提前JDK17，可参考[安装JDK11](https://ttd.chinacici.com/devops/java/install-jdk.html#%E5%9F%BA%E4%BA%8Etar-gz%E5%8C%85%E5%AE%89%E8%A3%85jdk11)
:::

编辑/etc/systemd/system/sonarqube.service文件，并根据以下配置进行修改：

```bash
[Unit]
Description=sonarqube Server
Documentation=https://docs.sonarsource.com/sonarqube/latest
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
User=sonar
Group=sonar
LimitNOFILE=131072
LimitNPROC=8192
Environment="SONAR_JAVA_PATH=/usr/local/jdk17/bin/java"
ExecStart=/usr/local/sonarqube10.5/bin/linux-x86-64/sonar.sh start
ExecStop=/usr/local/sonarqube10.5/bin/linux-x86-64/sonar.sh stop

[Install]
WantedBy=multi-user.target
```

重新加载sonarqube.service配置

```bash
systemctl daemon-reload
```

## 目录配置

**创建数据目录**

```bash
mkdir -p /data/sonarqube/{data,temp}
chown -R sonar:sonar /data/sonarqube
```

## 启动

**启动sonarqube**

```bash
systemctl start sonarqube.service
```

## 安装插件

推荐安装以下插件：

中文显示插件：Traditional Chinese Language PackLOCALIZATION；

**分支插件**

## Q&A

1. 输入初始的用户名密码是多少?

   - 初始用户密码： admin/admin
