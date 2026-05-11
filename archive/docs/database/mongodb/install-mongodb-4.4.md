# 安装MongoDB4.4

:::warning <font color="red">因安全问题，不允许在新环境中安装 MongoDB4.4，除非服务器 CPU 不支持 AVX 指令集。</font>
tlsClusterCAFile is not being used to validate client certificates on macOS

This issue affect all MongoDB Server v6.3 versions, MongoDB Server v5.0 versions v5.0.0 to v5.0.14, <b>all MongoDB Server v4.4 versions</b>.

https://jira.mongodb.org/browse/SERVER-77028
:::

[MongoDB Community Downloads](https://www.mongodb.com/try/download/community-edition/releases/archive)

[截止2023年6月24日，MongoDB 4.4.* 系列最新稳定版为 4.4.22。](https://www.mongodb.com/zh-cn/docs/v4.4/release-notes/4.4/)

<font color="red"><b>每次安装需到官网查看 MongoDB 4.4 的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 mongodb4.4
- 如果服务器 CPU 不支持 AVX 指令集，需安装 mongodb4.4
:::

## 一、先决条件

### 0x01.安装必要的库

使用以下命令来安装 MongoDB Community .tgz tarball 所需的依赖项

```
yum -y install libcurl xz-libs
```

### 0x02.配置ulimit文件句柄

ulimit 设置：<a href="/devops/baseops/server-os/optimization.html#_0x03-systemd管理的进程设置" target="_blank">TTD · 基础运维 · 服务器操作系统 · 系统优化 · systemd管理的进程设置</a>

:::warning
[Starting in MongoDB 4.4, a startup error is generated if the ulimit value for number of open files is under 64000.](https://www.mongodb.com/docs/v4.4/tutorial/install-mongodb-on-red-hat-tarball/#ulimit)
:::

### 0x03.禁用透明大页

https://www.mongodb.com/zh-cn/docs/v4.4/tutorial/transparent-huge-pages

```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```

:::warning
If on Red Hat or similar, the path to the defrag file might be different. See the note above for more details, and and update the disable-transparent-huge-pages.service file accordingly.
:::

### 0x04.创建mongodb用户

```bash
groupadd mongod
useradd -g mongod mongod -s /sbin/nologin
```


## 二、基于tgz包安装社区版

### 0x01.下载并解压.tgz安装包

::: tabs

=== OpenEuler22.03
```bash
cd /usr/local/src
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel80-4.4.22.tgz
tar -zxvf mongodb-linux-x86_64-rhel80-4.4.22.tgz
cp -r mongodb-linux-x86_64-rhel80-4.4.22 /usr/local/mongodb4.4
```
---

=== Centos7.9
```bash
cd /usr/local/src
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-4.4.22.tgz
tar -zxvf mongodb-linux-x86_64-rhel70-4.4.22.tgz
cp -r mongodb-linux-x86_64-rhel70-4.4.22 /usr/local/mongodb4.4
```
---

:::

### 0x02.添加环境变量

```bash
echo 'export PATH=/usr/local/mongodb4.4/bin:$PATH' >> /etc/profile
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

https://www.mongodb.com/zh-cn/docs/v4.4/reference/configuration-options/#configuration-file-options

:::tip
- If you installed MongoDB via a downloaded TGZ or ZIP file, you will need to create your own configuration file. The <a href="https://www.mongodb.com/docs/v4.4/administration/configuration/#std-label-base-config" target="_blank">basic example configuration</a> is a good place to start.
:::

创建配置文件目录
```bash
mkdir -pv /usr/local/mongodb4.4/conf
```

创建并编辑配置文件
```bash
vim /usr/local/mongodb4.4/conf/mongod.conf
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

## 三、使用Systemd管理进程

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
Environment="OPTIONS=-f /usr/local/mongodb4.4/conf/mongod.conf"
ExecStart=/usr/local/mongodb4.4/bin/mongod $OPTIONS
ExecStop=/usr/local/mongodb4.4/bin/mongod $OPTIONS --shutdown

[Install]
WantedBy=multi-user.target
```

配置项参考文档：
- https://github.com/mongodb/mongo/blob/master/rpm/mongod.service
- https://www.mongodb.com/zh-cn/docs/v4.4/tutorial/manage-mongodb-processes

### 0x02.重载systemd单元文件
```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```shell
systemctl enable mongod --now
```

:::tip Systemd指令
```
systemctl status mongod  #查看服务
systemctl start mongod   #启动服务
systemctl stop mongod    #停止服务
systemctl restart mongod #重启服务
systemctl enable mongod  #开启开机自启服务
systemctl disable mongod #关闭开机自启服务
```
:::

## 四、创建超级管理员

### 0x01.连接数据库（本机）
   
> 未创建管理员也可以连接mongodb服务，但是不能进行后续操作

```bash
mongo

# 输出如下内容
MongoDB shell version v4.4.22
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("0179b6e5-5995-4787-829e-a823d362360f") }
MongoDB server version: 4.4.22
>
```

### 0x02.切换至admin库
```shell
use admin
```

### 0x03.创建管理员

:::danger 密码说明
密码长度需不少于8位，且必须包含大小写字母、数字及特殊符号。为避免与 MongoDB URI 格式冲突，特殊符号中不应包含`@`和`:`。
:::

```bash
db.createUser({user: "admin", pwd: "$PASSWORD", roles: [{role: "root",db: "admin"}]})
```

## 五、MongoDB常用命令

### 0x01.mongo命令

```bash
mongo --version #查看版本号
mongo           #连接数据库（本机）
```

### 0x02.修改管理员密码

```bash
# 连接数据库
mongo -u admin -p '$PASSWORD'
```

```shell
> use admin #选择数据库（如果没有会自动创建）
> show users  #查看当前库下的用户
> db.updateUser('admin', {pwd: '$PASSWORD'}) #修改密码
> db.auth('admin', '$PASSWORD')  #密码认证
```

```shell
> cls  #清空记录
```

### 0x03.集合操作

```bash
# 连接数据库
mongo -u admin -p '$PASSWORD'
```

```shell
> use news  #选择数据库（如果没有会自动创建）
> show collections #查看所有集合
> db.news_article.insert({title: '稿件标题'})  #写入数据

> db.getName() #查看当前数据库的名称
```

### 0x04.其他

```bash
# 连接数据库
mongo -u admin -p '$PASSWORD'
```

```shell
> db.version() #查看MongoDB的版本
```

## 六、参考资料

- [Install MongoDB Community Edition on Red Hat or CentOS](https://www.mongodb.com/docs/v4.4/tutorial/install-mongodb-on-red-hat/)
- [Install MongoDB Community on Red Hat or CentOS using .tgz Tarball](https://www.mongodb.com/docs/v4.4/tutorial/install-mongodb-on-red-hat-tarball/)
- [管理 mongod 进程](https://www.mongodb.com/docs/manual/tutorial/manage-mongodb-processes/)