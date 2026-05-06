# Supervisor 安装

> 稳定版下载地址：https://pypi.org/project/supervisor/

:::warning 注意
- 所有源码包下载到 /usr/local/src 中，每次安装都使用最新稳定版
- 一些 Linux 发行版（如 CentOS、Ubuntu）提供了包管理器安装的 Supervisor 版本，但这些包是由第三方而不是官方人员制作的，且版本一般低于官方最新稳定版，不应使用
:::

## 一、在OpenEuler上安装

### 0x01.下载源码包并解压

截止 2023 年 8 月，最新稳定版为 v4.2.5。

```bash
cd /usr/local/src
wget https://files.pythonhosted.org/packages/ce/37/517989b05849dd6eaa76c148f24517544704895830a50289cbbf53c7efb9/supervisor-4.2.5.tar.gz
tar -zxvf supervisor-4.2.5.tar.gz
```

### 0x02.安装

```
cd /usr/local/src/supervisor-4.2.5
python3 setup.py install
```

### 0x03.配置全局命令

```
ln -sf /usr/local/bin/supervisor* /usr/bin/
ln -sf /usr/local/bin/echo_supervisord_conf /usr/bin/
```

### 0x04.验证

```bash
supervisord --version
```

若正常输出 Supervisor 版本说明安装成功。

## 二、配置

### 0x01. 创建相关目录

```bash
mkdir -p /etc/supervisord.d
mkdir -p /var/log/supervisor
mkdir -p /var/run/supervisor
```

### 0x02.创建tmpfiles配置

使用`tmpfiles.d`创建持久化目录，以解决系统重启后`/var/run/supervisor`目录被删除的问题。通过配置`tmpfiles.d`，可以确保该目录在系统启动时被自动创建，并在系统重启后保持持久性，从而避免了目录丢失的问题。

```bash
echo 'D /var/run/supervisor 0775 root root -' > /etc/tmpfiles.d/supervisor.conf
```

### 0x03.生成默认配置

```bash
echo_supervisord_conf > /etc/supervisord.conf
```

### 0x04.修改配置文件

```bash
vim /etc/supervisord.conf
```

1. **修改 socket 文件路径**

```bash
[unix_http_server]
file=/var/run/supervisor/supervisor.sock   ; (the path to the socket file)
[supervisorctl]
serverurl=unix:///var/run/supervisor/supervisor.sock ; use a unix:// URL  for a unix socket
```

2. **开启管理界面**

```bash
[inet_http_server]         ; inet (TCP) server disabled by default
port=*:9001                ; ip_address:port specifier, *:port for all iface
username=admin             ; default is no username (open server)
password=<password>        ; default is no password (open server)
```
:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
:::

配置后可通过使用浏览器访问`http://IP:PORT`打开管理页面。

:::warning
若服务器未关闭 firewalld 服务，需执行以下命令开放管理界面端口：

```bash
firewall-cmd --zone=public --add-port=9001/tcp --permanent
firewall-cmd --reload
```
:::

3. **修改日志位置**

```bash
[supervisord]
logfile=/var/log/supervisor/supervisord.log
```

4. **开启 include 功能**

为了便于后期维护，启用 [include] 块, 通过`files`指令加载应用程序配置（支持模糊匹配）。

```bash
[include]
files = supervisord.d/*/*.ini supervisord.d/*.ini
```

## 三、使用systemd管理进程

### 0x01.编辑service文件

```bash
vim /etc/systemd/system/supervisord.service
```

写入内容：

```bash
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
Type=forking
ExecStart=/usr/bin/supervisord
ExecStop=/usr/bin/supervisorctl $OPTIONS shutdown
ExecReload=/usr/bin/supervisorctl $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```

:::tip
官方 Github 示例：https://github.com/Supervisor/initscripts/blob/main/centos-systemd-etcs
:::

### 0x02.重新加载systemd配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable supervisord --now
```

## 四、Supervisorctl 常用命令

查看所有程序状态
```bash
supervisorctl status
```

重新加载所有配置并<font color="red">重启所有程序</font>
```bash
supervisorctl reload
```

读取所有配置文件的变化（包括新增进程配置）
```bash
supervisorctl update
```

停止指定的程序
```bash
supervisorctl stop {$programe_name}
```

启动指定的程序
```bash
supervisorctl start {$programe_name}
```

重启指定的程序
```bash
supervisorctl restart {programe_name}
```

## 附录一.在CentOS7上安装

### 0x01.安装依赖

```bash
yum -y install python-setuptools
```

### 0x02.下载源码包并解压

截止 2023 年 8 月，最新稳定版为 v4.2.5。

```bash
cd /usr/local/src
wget https://files.pythonhosted.org/packages/ce/37/517989b05849dd6eaa76c148f24517544704895830a50289cbbf53c7efb9/supervisor-4.2.5.tar.gz
tar -zxvf supervisor-4.2.5.tar.gz
```

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

### 0x03.安装

```
cd /usr/local/src/supervisor-4.2.5
python setup.py install
```

### 0x04.验证

```bash
supervisord --version
```

若正常输出 Supervisor 版本说明安装成功。

## 附录二、参考资料

- http://supervisord.org/installing.html#installing
- https://zhuanlan.zhihu.com/p/136966142
- https://blog.csdn.net/weixin_42156097/article/details/107470533