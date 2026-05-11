# 单节点RabbitMQ3.11安装

- [RabbitMQ Support Timeline（Release Series）](https://rabbitmq.com/versions.html)
- [RabbitMQ Latest Release On Github](https://github.com/rabbitmq/rabbitmq-server/releases)
- [Zero-dependency Erlang RPM for RabbitMQ](https://github.com/rabbitmq/erlang-rpm)（[Releases On Github](https://github.com/rabbitmq/erlang-rpm/releases)）

:::danger
- 当 **hostname** 被设置为 IP 地址（如 `10.1.0.102`）后，RabbitMQ启动失败，并报错 *"unable to perform an operation on node 'rabbit@10'"*。请参考 TTD 中关于服务器标识命名的规范，正确设置 **hostname**，以避免类似问题。
- 在生产环境中修改主机名会导致严重问题：RabbitMQ依赖节点名称进行身份识别，主机名变更将导致原有节点失效，进而引发服务启动失败。同时，与之关联的CLI工具也将因节点信息不匹配而无法正常使用。为确保系统稳定性，**生产环境严禁执行主机名变更操作**。
:::

:::warning
[截止2024年9月6日，rabbitmq-server 3.11.* 系列的稳定版为 3.11.28，官方已终止社区支援。](https://rabbitmq.com/versions.html)
:::

:::tip
若因修改主机名导致 RabbitMQ 命令行工具无法正常使用，可通过以下步骤修复：将服务端的认证文件 /var/lib/rabbitmq/.erlang.cookie 复制并覆盖客户端使用的 ~/.erlang.cookie 文件即可。
:::

## 一、安装必要的库（yum）

```bash
yum -y install socat ncurses-compat-libs
```

## 二、在openEuler上安装Erlang

:::tip 版本说明
根据[RabbitMQ官网的版本要求](https://www.rabbitmq.com/docs/which-erlang)，RabbitMQ 3.11 最高支持的 Erlang/OTP 版本为 25.3.x。截止 2025 年 2 月 3 日，该版本的最新稳定版本为 **erlang-25.3.2.16-1**。

虽然在安装过程中使用了 **erlang-27.2.1-1**，且未发现任何问题，但仍应遵循官方要求，按照推荐版本进行安装。

更详细的说明，请查看<a target="_blank" href="/docs/middleware/rabbitmq/introduction.html#_2-erlang">RabbitMQ介绍</a>
:::

### 0x01.安装 RPM 包

```bash
cd /usr/local/src
wget https://github.com/rabbitmq/erlang-rpm/releases/download/v25.3.2.16/erlang-25.3.2.16-1.el8.x86_64.rpm
rpm -ivh erlang-25.3.2.16-1.el8.x86_64.rpm
```

### 0x02.验证是否安装成功

```bash
erl
```

:::tip 输出如下内容
Erlang/OTP 25 [erts-13.2.2.12] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit:ns]

Eshell V13.2.2.12  (abort with ^G)

1> 
:::

### 0x03.查看版本号

<a href="https://stackoverflow.com/questions/9560815/how-to-get-erlangs-release-version-number-from-a-shell" target="_blank">How to get Erlang's release version number from a shell?</a>

```bash
erl -eval '{ok, Version} = file:read_file(filename:join([code:root_dir(), "releases", erlang:system_info(otp_release), "OTP_VERSION"])), io:fwrite(Version), halt().' -noshell
```

:::tip 输出如下内容
25.3.2.16
:::

## 三、通用二进制构建

[Generic Binary Build("Generic UNIX Build")](https://rabbitmq.com/install-generic-unix.html)

:::tip
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 rabbitmq_server3.11
:::

### 0x01.添加用户

```bash
groupadd rabbitmq
useradd -g rabbitmq rabbitmq -s /sbin/nologin
```

### 0x02.创建目录

```bash
mkdir -p /var/lib/rabbitmq
chown -R rabbitmq:rabbitmq /var/lib/rabbitmq
```

### 0x02.安装rabbitmq-server

```bash
cd /usr/local/src
wget https://github.com/rabbitmq/rabbitmq-server/releases/download/v3.11.28/rabbitmq-server-generic-unix-3.11.28.tar.xz
tar xvf rabbitmq-server-generic-unix-3.11.28.tar.xz
mv /usr/local/src/rabbitmq_server-3.11.28 /usr/local/rabbitmq_server3.11
```

修改目录权限
```bash
chown -R rabbitmq:rabbitmq /usr/local/rabbitmq_server3.11
```

### 0x03.配置环境变量

```bash
# 添加搜索路径到配置文件
echo 'PATH=$PATH:/usr/local/rabbitmq_server3.11/sbin
export PATH' >> /etc/profile

# 刷新环境变量
source /etc/profile
```

### 0x04.查看版本号

```bash
rabbitmqctl version
```

:::tip 输出如下内容
3.11.28
:::

## 四、使用Systemd管理进程

:::tip
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.编辑service文件

```bash
vim  /etc/systemd/system/rabbitmq-server.service
```

添加如下内容

> 以下内容是参考 rpm 方式安装 rabbitmq 时自动生成的 rabbitmq-server.service

```vim
[Unit]
Description=RabbitMQ Messaging Server
After=syslog.target network.target

[Service]
Type=simple
User=rabbitmq
Group=rabbitmq
Environment="HOME=/var/lib/rabbitmq"
WorkingDirectory=/usr/local/rabbitmq_server3.11
ExecStart=/usr/local/rabbitmq_server3.11/sbin/rabbitmq-server
ExecStop=/usr/local/rabbitmq_server3.11/sbin/rabbitmqctl stop

[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable rabbitmq-server --now
```

:::tip Systemctl指令
```
systemctl status rabbitmq-server  #查看服务
systemctl start rabbitmq-server   #启动服务
systemctl stop rabbitmq-server    #停止服务
systemctl restart rabbitmq-server #重启服务
systemctl enable rabbitmq-server  #开启开机自启服务
systemctl disable rabbitmq-server #关闭开机自启服务
```
:::

## 五、User Management

https://www.rabbitmq.com/rabbitmqctl.8.html#User_Management

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`!`。
:::

创建管理员

```bash
rabbitmqctl add_user admin <password>
```

设置管理员角色
```bash
rabbitmqctl set_user_tags admin administrator
```

为管理员用户进行添加 /（vhost）中所有资源的配置、写、读权限
```bash
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

查看管理员
```bash
rabbitmqctl list_users
```

## 六、rabbitmqctl常用命令

### 0x01.查看服务状态
```bash
rabbitmqctl status
```

### 0x02.查看管理员用户列表
```bash
rabbitmqctl list_users
```

### 0x03.修改管理员用户密码
```bash
rabbitmqctl change_password $user_name $user_passwd
```

## 七、Management UI Plugin

https://rabbitmq.com/management.html

```bash
rabbitmq-plugins enable rabbitmq_management
```

默认的访问地址：http://{ip}:15672，账号及口令参照《创建管理用户》

:::warning
- 如果无法访问，可以尝试关闭防火墙。
- 使用默认的账号（guest）、口令（guest）登录会提示 *“User can only log in via localhost”*，<font color="red">不允许将该账号修改成可以非本机访问</font>。

https://www.rabbitmq.com/docs/access-control#loopback-users
:::

## 八、安装延迟队列插件

具体安装方法可参考<a href="/docs/middleware/rabbitmq/delayed-message-plugin.html" target="_blank">RabbitMQ延迟队列插件安装</a>。

## 九、常见错误

- error: Failed dependencies
  
在 Centos7 系统上执行`rpm -ivh erlang-25.3.2-1.el7.x86_64.rpm`失败，错误信息如下：*libtinfo.so.5()(64bit) is needed by erlang-25.3.2-1.el7.x86_64*

:::tip 解决方法
```bash
yum -y install ncurses-compat-libs
```
:::

<KbDivider />

## 附录一、在Centos7上安装Erlang

:::warning
Starting with Erlang 24, the minimum required version is an equivalent of OpenSSL is 1.1. <a href="https://github.com/rabbitmq/erlang-rpm/tree/v24.3.4.11#what-about-centos-7-and-derivatives" target="_blank">What about CentOS 7 and derivatives?</a> 

如需升级OpenSSL，可参考<a href="/docs/devops/base/server-os/upgrade-openssl.html#一、升级openssl到1-1-1" target="_blank">升级OpenSSL到1.1.1*</a>
:::

### 0x01.安装 RPM 包

```bash
cd /usr/local/src
wget https://github.com/rabbitmq/erlang-rpm/releases/download/v25.3.2/erlang-25.3.2-1.el7.x86_64.rpm
rpm -ivh erlang-25.3.2-1.el7.x86_64.rpm
```

### 0x02.验证是否安装成功

```bash
erl
```

:::tip 输出如下内容
Erlang/OTP 25 [erts-13.2.2] [source] [64-bit] [smp:1:1] [ds:1:1:10] [async-threads:1]

Eshell V13.2.2  (abort with ^G)

1>
:::

### 0x03.查看版本号

<a href="https://stackoverflow.com/questions/9560815/how-to-get-erlangs-release-version-number-from-a-shell" target="_blank">How to get Erlang's release version number from a shell?</a>

```bash
erl -eval '{ok, Version} = file:read_file(filename:join([code:root_dir(), "releases", erlang:system_info(otp_release), "OTP_VERSION"])), io:fwrite(Version), halt().' -noshell
```

:::tip 输出如下内容
25.3.2
:::

## 附录二、参考资料

- [RabbitMQ Changelog](https://rabbitmq.com/changelog.html)
- [Generic Binary Build ("Generic UNIX Build")](https://rabbitmq.com/install-generic-unix.html)
- [RabbitMQ Erlang Version Requirements](https://rabbitmq.com/which-erlang.html)
- [Installing on RPM-based Linux](https://rabbitmq.com/install-rpm.html)
- [Team RabbitMQ stopped supporting CentOS 7 in May 2022.](https://blog.rabbitmq.com/posts/2022/04/centos-7-support-discontinued/)
- [Package repositories owned by rabbitmq](https://packagecloud.io/rabbitmq)
- [RabbitMQ Configuration](https://rabbitmq.com/configure.html)
- [Server Operator Documentation](https://rabbitmq.com/admin-guide.html)
