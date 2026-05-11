# Canal Admin 部署

稳定版下载地址：https://github.com/alibaba/canal/releases

截止2025年6月2日，canal admin v1.1.* 系列最新稳定版为 v1.1.8（*表示最新的补丁版本）。

<font color="red"><b>每次安装需下载 canal admin 1.1 系列的最新版。</b></font>

:::tip
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 canal-admin1.1
:::

## 1.环境准备

### 0x01.JDK环境

[考虑到 canal 版本对 JDK 的兼容性](https://github.com/alibaba/canal/issues/4358)，<a href="/docs/devops/base/java/install-jdk.html#%E4%BA%8C%E3%80%81%E5%9F%BA%E4%BA%8Etar-gz%E5%8C%85%E5%AE%89%E8%A3%85jdk11" target="_blank">统一使用 JDK11</a>。

### 0x02.创建Mysql账号

约定新建一个专用于Canal Admin数据库的账号，该账号将与Canal Server使用相同的数据库实例。

```bash
mysql -uroot -p
```

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`'`、`"`、`\`。
:::
```sql
CREATE USER canal_manager IDENTIFIED BY '$PASSWORD';
```
```sql
GRANT ALL PRIVILEGES ON canal_manager.* TO 'canal_manager'@'%';
FLUSH PRIVILEGES;
```

## 2.下载安装并启动

### 0x01.下载并解压缩

下载 canal, 选择需要的包下载, 如以 1.1.7 版本为例

```bash
cd /usr/local/src
wget https://github.com/alibaba/canal/releases/download/canal-1.1.8/canal.admin-1.1.8.tar.gz
```
:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

```bash
mkdir /usr/local/canal-admin1.1
tar zxvf canal.admin-1.1.8.tar.gz  -C /usr/local/canal-admin1.1
```

### 0x02.修改配置文件

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`'`、`"`、`\`。
:::

```bash
vim /usr/local/canal-admin1.1/conf/application.yml
```

修改如下配置项
```yml
spring.datasource:
  address: $IP:3306
  database: canal_manager
  username: canal_manager
  password: $PASSWORD
  url: jdbc:mysql://${spring.datasource.address}/${spring.datasource.database}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true
canal:
  adminUser: admin
  adminPasswd: $ADMIN_PASSWORD
```

:::warning spring.datasource.url
MySQL8.0 驱动默认不允许公钥检索，如果 Canal 连接的是 MySQL8.0 需要在数据库连接 URL 中添加参数`allowPublicKeyRetrieval =true`。
:::

:::warning canal.adminPasswd
根据[面向user/passwd的安全ACL机制](https://github.com/alibaba/canal/wiki/Canal-Admin-ServerGuide#%E9%9D%A2%E5%90%91userpasswd%E7%9A%84%E5%AE%89%E5%85%A8acl%E6%9C%BA%E5%88%B6)，此处的密码为明文。<font color="red">考虑到安全性，禁止使用默认密码。</font>
:::

### 0x03.初始化元数据库

```bash
mysql -uroot -p
```

导入sql文件
```sql
source /usr/local/canal-admin1.1/conf/canal_manager.sql
```

## 3.使用Systemd管理进程

:::warning
- canal-admin.service 执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.编辑service文件

```bash
vim  /etc/systemd/system/canal-admin.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```ini
[Unit]
Description=Canal Admin
After=network.target

[Service]
Type=forking
User=root
Group=root
Environment="JAVA_HOME=/usr/local/jdk11"
Environment="PATH=/usr/local/jdk11/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
ExecStart=/usr/local/canal-admin1.1/bin/startup.sh
ExecStop=/usr/local/canal-admin1.1/bin/stop.sh
ExecReload=/usr/local/canal-admin1.1/bin/restart.sh
Restart=on-failure
RestartSec=10
SyslogIdentifier=canal-admin

[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载Systemd配置

```bash
systemctl daemon-reload
```

### 0x03.启动服务并开机自启

```bash
systemctl enable canal-admin --now
```

:::tip systemctl
```bash
systemctl status canal-admin  #查询服务状态
systemctl start canal-admin   #启动服务
systemctl stop canal-admin    #停止服务
systemctl reload canal-admin  #重新加载配置
systemctl enable canal-admin  #开启开机自启服务
systemctl disable canal-admin #关闭开机自启服务
```
:::

### 0x04.查看admin日志

```vim
cat /usr/local/canal-admin1.1/logs/admin.log
```

### 0x05.打开Web控制台

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
:::

默认的访问地址为`http://$IP:8089`，默认账号及口令为 `admin/<PASSWORD>`。<font color="red">登录控制台后，需立即修改默认密码</font>。

![](/images/middleware/canal/node-servers.png)

## 4.CanalServer配置

### 0x01.配置最小化

重建配置文件，启动为对接 canal-admin 模式。

```bash
mv /usr/local/canal-server1.1/conf/canal.properties \
    /usr/local/canal-server1.1/conf/canal.properties.default
cp /usr/local/canal-server1.1/conf/canal_local.properties \
    /usr/local/canal-server1.1/conf/canal.properties
```

https://github.com/alibaba/canal/wiki/Canal-Admin-ServerGuide#%E8%AE%BE%E8%AE%A1%E7%90%86%E5%BF%B5

### 0x02.生成Passwd的密文

查看canal.adminPasswd的明文
```bash
cat /usr/local/canal-admin1.1/conf/application.yml | grep adminPasswd
```

使用SQL语句生成加密码加密后的字符串
::: tabs

=== MySQL8.0
```sql
SELECT UPPER(SHA1(UNHEX(SHA1('$adminPasswd'))));
```
---

=== MySQL5.6/5.7
```sql
SELECT PASSWORD('$adminPasswd');
```
<font color="red">如上语句生成的加密字符串中，`canal.adminPasswd`字段的实际密文需要去除首位的星号。</font>
---

:::

### 0x03.修改CanalServer配置

编辑canal.properties
```bash
vim /usr/local/canal-server1.1/conf/canal.properties
```

```yml
# canal admin config
canal.admin.manager = $IP:8089
canal.admin.passwd = $ADMIN_PASSWORD加密后的密文
```

:::warning
- Canal Admin管理后台新建 Server 时填写的 Server IP 需确保与 canal.admin.manager 中指定的 IP 地址与保持一致。
:::

### 0x03.重启CanalServer

重启 Canal Server
```bash
systemctl restart canal-server
```

可以通过 Canal Admin 管理的 Server。
![](/images/middleware/canal/node-servers-active.png)

## 4.常用命令

### 0x01.启动与关闭服务

启动服务
```bash
sh /usr/local/canal-admin1.1/bin/startup.sh
```

关闭服务
```bash
sh /usr/local/canal-admin1.1/bin/stop.sh
```

## 5.参考资料

- https://github.com/alibaba/canal/wiki/Canal-Admin-QuickStart
- https://github.com/alibaba/canal/wiki/Canal-Admin-ServerGuide
- https://github.com/alibaba/canal/wiki/Canal-Admin-Guide
