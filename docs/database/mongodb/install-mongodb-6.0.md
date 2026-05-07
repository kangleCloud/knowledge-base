# 安装MongoDB6.0

[MongoDB Community Server Download](https://www.mongodb.com/try/download/community)

[截止2025年8月23日，MongoDB 6.0 最新稳定版为 6.0.25。](https://www.mongodb.com/zh-cn/docs/upcoming/release-notes/6.0)

<font color="red"><b>每次安装需到官网查看 MongoDB 6.0 系列的最新版。</b></font>

:::tip
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 mongodb6.0
:::

## 一、先决条件

### 0x01.查看CPU指令集

查看服务器的 CPU 是否支持 AVX 指令集，如果没有输出，说明服务器的 CPU 不支持 AVX，降级到 MongoDB 4.4。 
```bash
cat /proc/cpuinfo | grep avx
```

[MongoDB 5.0 requires use of the AVX instruction set, available on select Intel and AMD processors.](https://www.mongodb.com/docs/manual/administration/production-notes/#x86_64)

### 0x02.安装必要的库

```
yum -y install libcurl xz-libs
```

### 0x03.配置ulimit文件句柄

ulimit 设置：<a href="/docs/devops/base/server-os/optimization.html#_0x03-systemd管理的进程设置" target="_blank">TTD · 基础运维 · 服务器操作系统 · 系统优化 · systemd管理的进程设置</a>

:::warning
[如果打开文件数的 ulimit 值低于 64000，MongoDB 会生成初创企业警告。](https://www.mongodb.com/zh-cn/docs/v6.0/tutorial/install-mongodb-on-red-hat-tarball/#ulimit)
:::

### 0x04.配置vm.max_map_count

编辑 /etc/sysctl.d/99-sysctl.conf，追加以下内容

```bash
vim /etc/sysctl.d/99-sysctl.conf
```

在文件末尾新起一行添加以下内容
```vim
vm.max_map_count=262144
```

重新加载新配置
```bash
sysctl -p
```

### 0x04.禁用透明大页

https://www.mongodb.com/zh-cn/docs/v6.0/tutorial/transparent-huge-pages

::: el-tabs
--- el-tab-item OpenEuler22.03
```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```
---
:::

:::warning
某些版本的 Red Hat Enterprise Linux（可能还包括基于 Red Hat 的其他衍生产品）对 THP enabled 文件使用不同的路径：/sys/kernel/mm/<font color="red">redhat</font>_transparent_hugepage/enabled
:::

### 0x05.创建mongodb用户

```bash
groupadd mongod
useradd -g mongod mongod -s /sbin/nologin
```

## 二、基于tgz包安装社区版

:::tip Download
➤ [MongoDB Download Center](https://www.mongodb.com/try/download/community)

1. In the **Version** dropdown, select the version of MongoDB to download. => **6.0.***

2. In the **Platform** dropdown, select your operating system version and architecture. => **RedHat / CentOS 7.0 x64** 或者 **RedHat / CentOS 8.0 x64**

3. In the **Package** dropdown, select **tgz**.

4. Click **Download** or **Copy Link**.
:::

### 0x01.下载并解压.tgz安装包

::: el-tabs

--- el-tab-item OpenEuler22.03
```bash
cd /usr/local/src
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel8-6.0.25.tgz
tar xvf mongodb-linux-x86_64-rhel8-6.0.25.tgz -C /usr/local/
mv /usr/local/mongodb-linux-x86_64-rhel80-6.0.25  /usr/local/mongodb6.0
```
---

--- el-tab-item Centos7.9
```bash
cd /usr/local/src
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-6.0.7.tgz
tar xvf mongodb-linux-x86_64-rhel70-6.0.7.tgz -C /usr/local/
mv /usr/local/mongodb-linux-x86_64-rhel70-6.0.7  /usr/local/mongodb6.0
```
---
:::

### 0x02.添加环境变量

```bash
echo 'export PATH=/usr/local/mongodb6.0/bin:$PATH' >> /etc/profile
source /etc/profile
```

### 0x03.创建数据和日志目录

数据目录
```bash
mkdir -p /data/mongodb/mongo
chown -R mongod:mongod /data/mongodb/mongo
```

日志目录
```bash
mkdir -p /var/log/mongodb
chown -R mongod:mongod /var/log/mongodb
```

### 0x04.创建配置文件

https://www.mongodb.com/zh-cn/docs/v6.0/reference/configuration-options/#configuration-file-options

:::tip
- [如果通过 TGZ 或 ZIP 文件安装 MongoDB，则需要创建自己的配置文件。](https://www.mongodb.com/zh-cn/docs/v6.0/administration/configuration/#std-label-base-config)
:::

1. 创建配置文件目录

```bash
mkdir -pv /usr/local/mongodb6.0/conf
```

2. 创建并编辑配置文件
   
```bash
vim /usr/local/mongodb6.0/conf/mongod.conf
```

配置文件示例
```vim
processManagement:
   fork: true
net:
   bindIp: 0.0.0.0
   port: 27017
storage:
   dbPath: /data/mongodb/mongo
systemLog:
   destination: file
   path: "/var/log/mongodb/mongod.log"
   logAppend: true
storage:
   journal:
      enabled: true
security:
   authorization: enabled
```
   
## 三、使用systemd管理进程

:::warning
- mongod.service执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.创建单元文件

```bash
vim  /etc/systemd/system/mongod.service
```

添加如下内容
> 配置文件中不支持在每行命令的后面添加注释
```vim
[Unit]
Description=MongoDB Database Server
Documentation=https://docs.mongodb.org/manual
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
User=mongod
Group=mongod
Environment="OPTIONS=-f /usr/local/mongodb6.0/conf/mongod.conf"
ExecStart=/usr/local/mongodb6.0/bin/mongod $OPTIONS
ExecStop=/usr/local/mongodb6.0/bin/mongod $OPTIONS --shutdown
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```
配置项参考文档：
- https://github.com/mongodb/mongo/blob/master/rpm/mongod.service
- https://www.mongodb.com/zh-cn/docs/v6.0/tutorial/manage-mongodb-processes

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable mongod --now
```

:::tip Systemctl指令
```bash
systemctl status mongod  #查看服务
systemctl start mongod   #启动服务
systemctl stop mongod    #停止服务
systemctl restart mongod #重启服务
systemctl enable mongod  #开启开机自启服务
systemctl disable mongod #关闭开机自启服务
```
:::
    
## 四、安装MongoDB Shell

官网下载地址：https://www.mongodb.com/try/download/shell

[截止2025年8月23日，mongosh 最新稳定版为 2.5.6。](https://github.com/mongodb-js/mongosh/releases)

### 0x01.安装依赖

```shell
yum -y install openssl-libs
```

### 0x02.下载并解压安装包

::: el-tabs
--- el-tab-item OpenSSL1.1
```bash
cd /usr/local/src
wget https://downloads.mongodb.com/compass/mongosh-2.5.6-linux-x64-openssl11.tgz
tar xvf mongosh-2.5.6-linux-x64-openssl11.tgz -C /usr/local
cd /usr/local && mv mongosh-2.5.6-linux-x64-openssl11 mongosh2.5
```
[Github下载地址](https://github.com/mongodb-js/mongosh/releases/download/v2.5.6/mongosh-2.5.6-linux-x64-openssl11.tgz)
---
:::

### 0x03.配置环境变量

```bash
echo 'export PATH=/usr/local/mongosh2.5/bin:$PATH' >> /etc/profile
source /etc/profile
```
   
### 0x04.安装验证

连接数据库
```bash
mongosh   mongodb://127.0.0.1:27017
```

## 五、管理员

:::danger 密码说明
密码长度需不少于8位，且必须包含大小写字母、数字及特殊符号。为避免与 MongoDB URI 格式冲突，特殊符号中不应包含`@`和`:`。
:::

### 0x01.连接数据库

```shell
mongosh   mongodb://127.0.0.1:27017
```

### 0x02.切换数据库
```shell
use admin
```

### 0x03.创建管理员

```shell
db.createUser({user: "admin", pwd: "$PASSWORD", roles: [{role: "root", db: "admin"}]})
```
:::warning 注意
创建用户后需要重新登陆数据库才能正常使用，否则会出现认证报错：MongoServerError: not authorized on admin to execute command
:::

### 0x04.修改管理员密码

```shell
use admin
```
```shell
db.updateUser('admin', {pwd: '$PASSWORD'})
```
```shell
db.auth('admin', '$PASSWORD')
```

## 六、数据库验证

### 0x01.连接数据库

```bash
mongosh  -u admin -p '$PASSWORD' mongodb://127.0.0.1:27017
```

### 0x02.创建数据库并写入数据

选择数据库（如果没有会自动创建）
```shell
use goods
```

插入数据
```shell
db.goods.insertOne({name:'Huawei',price:1000,weight:135,number:35})
```

### 0x03.查看数据

```shell
db.goods.find({name:'Huawei'})
```

## 七、mongodb实践

### 0x01.mongod命令

查看版本号
```bash
mongod --version
```

### 0x02.集合操作

```shell
use news  #选择数据库（如果没有会自动创建）
show collections #查看所有集合
db.news_article.insertOne({title: '稿件标题1'})  #写入数据
db.news_article.find({title:'稿件'}) #查看数据
```

### 0x03.其他

查看当前库下的用户
```shell
show users
```

查看当前数据库的名称
```shell
db.getName()
```

查看MongoDB的版本
```shell
db.version()
```

清空记录
```shell
cls
```

## 八、参考资料

- [在 Red Hat 或 CentOS 上安装 MongoDB Community Edition](https://www.mongodb.com/zh-cn/docs/v6.0/tutorial/install-mongodb-on-red-hat/)
- [使用 .tgz 在 Red Hat 或 CentOS 上安装 MongoDB Community Edition](https://www.mongodb.com/zh-cn/docs/v6.0/tutorial/install-mongodb-on-red-hat-tarball/)