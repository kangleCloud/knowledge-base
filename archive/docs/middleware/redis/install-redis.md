# Redis单节点部署

- http://download.redis.io/releases/
- https://redis.io/download/#redis-downloads

截止25年2月6日，Redis 7.0.* （*表示最新的补丁版本）系列最新稳定版为 7.0.15

<font color="red"><b>每次安装需到官网查看 Redis 7.0 系列的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 redis7.0
:::

## 一、先决条件

### 0x01.创建 redis 用户

```bash
groupadd redis
useradd -g redis redis -s /sbin/nologin
```

### 0x02.设置vm.overcommit_memory

:::warning 启动时告警
WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition. Being disabled, it can can also cause failures without low memory condition, see https://github.com/jemalloc/jemalloc/issues/1328. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
:::

```bash
vim /etc/sysctl.conf
```

在文件末尾添加内容
```vim
# Redis
vm.overcommit_memory = 1
```

强制Linux重新加载/etc/sysctl.conf的新配置
```bash
sysctl -p
```

## 二、使用源码包安装

### 0x01.下载源码包并解压

```bash
cd /usr/local/src
wget http://download.redis.io/releases/redis-7.0.15.tar.gz
tar -zxvf redis-7.0.15.tar.gz
```

### 0x02.编译并安装

```bash
cd /usr/local/src/redis-7.0.15
make PREFIX=/usr/local/redis7.0 install
```

### 0x03.创建配置文件

```bash
mkdir -p /usr/local/redis7.0/conf
cp /usr/local/src/redis-7.0.15/redis.conf /usr/local/redis7.0/conf
```

### 0x04.修改配置文件

```bash
vim /usr/local/redis7.0/conf/redis.conf
```

修改以下配置并保存：

```vim
bind 127.0.0.1 -::1 //[!code --]
# 修改监听的主机地址，允许所有服务器访问 //[!code ++]
bind 0.0.0.0 //[!code ++]

protected-mode yes //[!code --]
# 关闭保护模式，允许其他服务器访问 //[!code ++]
protected-mode no //[!code ++]

logfile "" //[!code --]
# 设置日志文件路径及名称 //[!code ++]
logfile  /var/log/redis/redis-server.log //[!code ++]

dir ./ //[!code --]
# 设置工作目录 //[!code ++]
dir /data/redis //[!code ++]

# requirepass foobared //[!code --]
# 设置密码 //[!code ++]
requirepass $PASSWORD //[!code ++]
```

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
:::

:::tip
Redis 默认是不作为守护进程来运行的。可以将参数`daemonize`设置为 "yes" 让它作为守护进程来运行。当作为守护进程的时候，Redis 会把进程 ID 写到 /var/run/redis.pid。
:::

### 0x05.添加环境变量

添加环境变量
```bash
echo 'PATH=$PATH:/usr/local/redis7.0/bin
export PATH' >> /etc/profile
```

刷新环境变量
```bash
source /etc/profile
```

### 0x06.创建数据和日志目录

数据目录
```bash
mkdir -p /data/redis
chown -R redis:redis /data/redis
```

日志目录及文件
```bash
mkdir -p /var/log/redis
chown -R redis:redis /var/log/redis
```

## 三、使用Systemd管理进程

:::warning
- redis.service执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.编辑service文件

```bash
vim  /etc/systemd/system/redis.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Redis data structure server
Documentation=https://redis.io/documentation
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=redis
Group=redis
ExecStart=/usr/local/redis7.0/bin/redis-server /usr/local/redis7.0/conf/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```
参考文档：https://github.com/redis/redis/blob/7.0/utils/systemd-redis_server.service

### 0x02.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x02.启动并设置开机自启

```bash
systemctl enable redis --now
```

:::tip Systemctl指令
```bash
systemctl status redis  #查看服务
systemctl start redis   #启动服务
systemctl stop redis    #停止服务
systemctl restart redis #重启服务
systemctl enable redis  #开启开机自启服务
systemctl disable redis #关闭开机自启服务
```
:::

## 四、Redis常用命令

### 0x01.redis-cli相关命令

连接服务器
```bash
redis-cli
```

查看版本号
```bash
redis-cli -v
```

### 0x02.redis操作命令

密码登陆认证
```bash
auth $PASSWORD
```

显示所有的key（<font color="red">生产环境慎用</font>）
```bash
keys *
```

## 五、参考资料

- https://github.com/redis/redis#readme
- https://redis.io/docs/getting-started/installation/install-redis-from-source/