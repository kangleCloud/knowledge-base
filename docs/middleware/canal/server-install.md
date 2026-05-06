# Canal Server 单机部署

稳定版下载地址：https://github.com/alibaba/canal/releases

截止2025年6月2日，canal deployer v1.1.* 系列最新稳定版为 v1.1.8（*表示最新的补丁版本）。

<font color="red"><b>每次安装需下载 canal deployer 1.1 系列的最新版。</b></font>

**优先使用 Canal Admin 配置 Server 和 Instance。**

:::tip
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 canal-server1.1
:::

## 1.环境准备

:::warning
在 MySQL 5.7 至 8.0.33 版本中，binlog_format 参数的默认值为 ROW。[但从 MySQL 8.0.34 开始，该参数已被弃用](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_format)。对于 5.7 以下版本，需启用 Binlog 写入功能，同时将 binlog-format 配置为 ROW 模式。
```vim
[mysqld]
log-bin=mysql-bin #开启 binlog
binlog-format=ROW #选择 ROW 模式
server_id=1 #配置 MySQL replaction 需要定义，不要和 canal 的 slaveId 重复
```
:::

### 0x01.JDK环境

[考虑到 canal 版本对 JDK 的兼容性](https://github.com/alibaba/canal/issues/4358)，<a href="/docs/devops/base/java/install-jdk.html#%E4%BA%8C%E3%80%81%E5%9F%BA%E4%BA%8Etar-gz%E5%8C%85%E5%AE%89%E8%A3%85jdk11" target="_blank">统一使用 JDK11</a>。

### 0x02.创建Mysql账号

授权 canal 链接 MySQL 账号具有作为 MySQL slave 的权限, 如果已有账户可直接 grant

```bash
mysql -uroot -p
```

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`'`、`"`、`\`。
:::
```sql
CREATE USER canal IDENTIFIED BY '$PASSWORD';
```
```sql
GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%';
FLUSH PRIVILEGES;
```

## 2.下载安装

### 0x01.下载

下载 canal, 选择需要的包下载, 如以 1.1.7 版本为例

```bash
cd /usr/local/src
wget https://github.com/alibaba/canal/releases/download/canal-1.1.8/canal.deployer-1.1.8.tar.gz
```
:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

### 0x02.安装

```bash
mkdir /usr/local/canal-server1.1
tar zxvf canal.deployer-1.1.8.tar.gz  -C /usr/local/canal-server1.1
```

## 3.使用Systemd管理进程

:::warning
- canal-server.service 执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

[canal是否支持systemctl方式启动和停止](https://github.com/alibaba/canal/issues/1781)

### 0x01.编辑service文件

```bash
vim  /etc/systemd/system/canal-server.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```ini
[Unit]
Description=Canal Server
After=network.target

[Service]
Type=forking
User=root
Group=root
Environment="JAVA_HOME=/usr/local/jdk11"
Environment="PATH=/usr/local/jdk11/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
ExecStart=/usr/local/canal-server1.1/bin/startup.sh
ExecStop=/usr/local/canal-server1.1/bin/stop.sh
ExecReload=/usr/local/canal-server1.1/bin/restart.sh
Restart=on-failure
RestartSec=10
SyslogIdentifier=canal-server

[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载Systemd配置

```bash
systemctl daemon-reload
```

### 0x03.启动服务并开机自启

```bash
systemctl enable canal-server --now
```

:::tip Systemctl指令
```bash
systemctl status canal-server  #查询服务状态
systemctl start canal-server   #启动服务
systemctl stop canal-server    #停止服务
systemctl reload canal-server  #重新加载配置
systemctl enable canal-server  #开启开机自启服务
systemctl disable canal-server #关闭开机自启服务
```
:::

## 4.常用命令

### 0x01.启动与关闭服务

本地单机模式主要适用于开发和测试环境。在此模式下，元数据（如 binlog 位置）默认存储在本地文件 conf/example/meta.dat，日志默认输出到 logs/example/example.log。

启动服务
```bash
sh /usr/local/canal-server1.1/bin/startup.sh
```

关闭服务
```bash
sh /usr/local/canal-server1.1/bin/stop.sh
```

## 5.参考资料

- [QuickStart](https://github.com/alibaba/canal/wiki/QuickStart)