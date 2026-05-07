# 安装PHP7.4

:::tip 约定
- 源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 php74 或 php7.4
- 团队目前使用的主要版本是 PHP7.3.*，新的项目计划安装 PHP7.4 的最新版本（如 PHP7.4.33）
- PHP 版本：>= 7.4.* （*表示最新的补丁版本）
:::

## 安装必要的库

```bash
yum -y update
yum -y install libcurl-devel libxslt-devel libxml2-devel openssl-devel \
    libjpeg-devel libpng-devel freetype-devel \
    bzip2-devel gmp-devel readline-devel \
    sqlite-devel oniguruma-devel \
    libzip libzip-devel
```

## 升级libzip

<font color="red">Centos7.9 中源码编译安装 PHP7.3，需要升级libzip；openEuler22.03可以跳过</font>

1. 卸载原有低版本的 libzip-devel 包

```bash
yum remove libzip-devel
```

2. 安装libzip（ 最新稳定版：https://libzip.org/download/ ）
   
```bash
# 添加remi的清华yum源，不添加的话yum无法自动为libzip5-devel解决依赖
yum install https://mirrors.tuna.tsinghua.edu.cn/remi/enterprise/remi-release-7.rpm
# 使用rpm包在线安装libzip-devel
yum install https://mirrors.tuna.tsinghua.edu.cn/remi/enterprise/7/remi/x86_64/libzip5-devel-1.10.1-1.el7.remi.x86_64.rpm
```

## 编译安装PHP7.4

1. 下载 php7.4.*
```bash
cd /usr/local/src
wget https://www.php.net/distributions/php-7.4.33.tar.gz
tar -zxvf php-7.4.33.tar.gz
```

2. 添加用户和组
```bash
groupadd nginx
useradd -g nginx nginx
```

3. 开始编译

<font color="red">如果编译过程中发现有问题，可参照当前文档中的</font>[常见错误](/docs/devops/base/php7/install-php74.html#编译安装常见错误)

```bash
cd /usr/local/src/php-7.4.33

# 编译
./configure --prefix=/usr/local/php74 --enable-fpm \
    --with-fpm-user=nginx --with-fpm-group=nginx \
    --with-config-file-path=/usr/local/php74/etc \
    --disable-rpath \
    --enable-soap \
    --enable-mbstring \
    --enable-gd-jis-conv \
    --enable-ftp \
    --enable-shmop \
    --enable-sockets \
    --enable-sysvmsg --enable-sysvsem  --enable-sysvshm  \
    --enable-bcmath --enable-calendar --enable-exif \
    --enable-gd \
    --with-zlib --with-zip --with-bz2 --with-curl --with-pear --with-xsl \
    --with-pcre-jit --with-jpeg --with-zlib-dir --with-freetype \
    --with-xmlrpc \
    --with-openssl --with-openssl-dir \
    --with-mhash \
    --with-mysqli=mysqlnd --with-pdo-mysql=mysqlnd \
    --with-zlib-dir \
    --with-readline
    
# 安装
make && make install
```


4. 添加环境变量

```bash
# 添加搜索路径到配置文件
echo 'PATH=$PATH:/usr/local/php74/bin
export PATH' >> /etc/profile

# 刷新环境变量
source /etc/profile
```

验证是否生效
```bash
php -v

# 输出内容如下
PHP 7.4.33 (cli) (built: May 25 2023 17:50:54) ( NTS )
Copyright (c) The PHP Group
Zend Engine v3.4.0, Copyright (c) Zend Technologies
```

5. 配置php.ini
```bash
cp /usr/local/src/php-7.4.33/php.ini-production /usr/local/php74/etc/php.ini
```

详细配置参照：<a href="/docs/devops/base/php7/php-ini.html" target="_blank">php.ini 配置说明</a>

6. 配置php-fpm.conf（需重新启动 php-fpm）
```bash
cp /usr/local/php74/etc/php-fpm.conf.default /usr/local/php74/etc/php-fpm.conf
```

详细配置参照：<a href="/docs/devops/base/php7/php-fpm.html" target="_blank">php-fpm 配置说明</a>

7. 配置www.conf（需重新启动 php-fpm）
```bash
cp /usr/local/php74/etc/php-fpm.d/www.conf.default /usr/local/php74/etc/php-fpm.d/www.conf
```

详细配置参照：<a href="/docs/devops/base/php7/php-fpm.html" target="_blank">php-fpm 配置说明</a>

8. 新建日志文件目录

创建日志存放路径（如果是 root 用户创建，需修改其所属的用户及组都为 nginx），团队约定路径如下：`/var/log/php`，实际路径及文件名需参考如下配置项：
- <a href="/docs/devops/base/php7/php-ini.html#错误处理和日志记录" target="_blank">php.ini中的日志配置项</a>
- <a href="/docs/devops/base/php7/php-fpm.html#进程池配置说明" target="_blank">php-fpm中的日志配置项</a>

```bash
# 创建日志文件目录
mkdir -pv /var/log/php
# 修改日志文件目录所属用户及组
chown -R nginx:nginx /var/log/php
```

## 使用Systemd管理进程

:::warning
- php-fpm74.service 执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

1. 生成php-fpm.pid
```bash
vim /usr/local/php74/etc/php-fpm.conf
```

```vim
[global]
; Pid file
; Note: the default prefix is /usr/local/php74/var
; Default Value: none
; pid = run/php-fpm.pid  //[!code --]
pid = run/php-fpm.pid  //[!code ++]
```

2. 创建 php-fpm74.service

从源码中复制 php-fpm.service 文件并重命名
```bash
cp /usr/local/src/php-7.4.33/sapi/fpm/php-fpm.service /etc/systemd/system/php-fpm74.service
```

注释掉 ProtectSystem=full
```bash
vim /etc/systemd/system/php-fpm74.service
```

```vim
# Mounts the /usr, /boot, and /etc directories read-only for processes invoked by this unit.
# ProtectSystem=full
```

:::danger 注释掉 ProtectSystem=full 解决如下问题
```vim
systemd[1]: [/etc/systemd/system/php-fpm74.service:44] Unknown lvalue 'ProtectControlGroups' in section 'Service'
systemd[1]: [/etc/systemd/system/php-fpm74.service:47] Unknown lvalue 'RestrictRealtime' in section 'Service'
systemd[1]: [/etc/systemd/system/php-fpm74.service:54] Unknown lvalue 'RestrictNamespaces' in section 'Service'
systemd[1]: Started The PHP FastCGI Process Manager.
php-fpm[15168]: [15-Jun-2023 07:42:46] ERROR: failed to open error_log (/usr/local/php74/var/log/php-fpm.lo...tem (30))
php-fpm[15168]: [15-Jun-2023 07:42:46] ERROR: failed to post process the configuration
```
:::

3. 停止运行中的 php-fpm 进程

查看 php-fpm 的 PID
```bash
ps -ef | grep php-fpm | grep master

## 输出内容
root      52924      1  0 15:17 ?        00:00:00 php-fpm: master process (/usr/local/php74/etc/php-fpm.conf)
```

终止进程
```bash
# kill -INT $PID
kill -INT 52924
```

4. 修改并重新加载 systemctl 配置

```bash
systemctl daemon-reload
```

5. 设置开机自启并启动 php-fpm
```bash
systemctl enable php-fpm74
systemctl start php-fpm74
```

:::tip Systemctl指令
```bash
systemctl start php-fpm74    #启动服务
systemctl status php-fpm74   #查看状态
systemctl stop php-fpm74     #停止服务
systemctl restart php-fpm74  #重启服务
systemctl reload php-fpm74   #修改配置文件后重载
systemctl enable php-fpm74   #开启开机自启服务
systemctl disable php-fpm74  #关闭开机自启服务
```
:::

## 使用SHELL脚本管理进程

1. 从源码中复制 php-fpm 脚本文件
```bash
cp /usr/local/src/php-7.4.33/sapi/fpm/init.d.php-fpm /etc/init.d/php-fpm74
```

2. 修改 php-fpm 脚本文件
```bash
vim /etc/init.d/php-fpm74
```

3. 设置 php-fpm 脚本文件为可执行权限
```bash
chmod +x /etc/init.d/php-fpm74
```

管理 php-fpm
```bash
/etc/init.d/php-fpm74          #查看脚本使用说明
/etc/init.d/php-fpm74 status   #查看状态
/etc/init.d/php-fpm74 start    #开启服务
/etc/init.d/php-fpm74 stop     #停止服务
/etc/init.d/php-fpm74 restart  #重启服务
/etc/init.d/php-fpm74 reload   #修改配置文件后重载
```

:::tip 使用`service`命令管理 php-fpm

> 前提：已实现 /etc/init.d/php-fpm73 脚本

```
service php-fpm74
service php-fpm74 status
service php-fpm74 start
service php-fpm74 stop
service php-fpm74 restart
service php-fpm74 reload
```
:::

:::tip 使用chkconfig方式实现开机自启

> 前提：已实现 /etc/init.d/php-fpm74 脚本

```bash
chkconfig --add php-fpm74  #加入服务
chkconfig php-fpm74 on     #设置自启
chkconfig --list php-fpm74 #查看配置
```
:::

:::tip 使用rc.local方式实现开机自启

> 前提：启用 <a href="/docs/devops/base/server-os/index.html#启用-rc-local-服务">rc.local</a> 服务

修改 rc.local 文件
```bash
vim /etc/rc.d/rc.local
```

在文件末尾添加如下内容
```vim
# 方式一
/usr/local/php74/sbin/php-fpm
# 方式二（前提：已实现 /etc/init.d/php-fpm74 脚本）
/etc/init.d/php-fpm74 start
```
:::

## 使用信号控制管理进程

php 5.3.3 以后的 php-fpm 不再支持 /usr/local/php74/sbin/php-fpm (start|stop|reload) 等命令，需要使用信号控制的方式进行控制。

启动 php-fpm
```bash
/usr/local/php74/sbin/php-fpm
```

按指定配置文件启动 php-fpm
```bash
/usr/local/php74/sbin/php-fpm -y /usr/local/php74/etc/php-fpm.conf -c /usr/local/php74/etc/php.ini
```

查看 php-fpm
```bash
ps -ef | grep php-fpm | grep master

## 输出内容
root      52924      1  0 15:17 ?        00:00:00 php-fpm: master process (/usr/local/php74/etc/php-fpm.conf)
```

关闭 php-fpm
```bash
# kill -INT $PID 
kill -INT 52924
```

重启 php-fpm
```bash
# kill -USR2 $PID 
kill -USR2 2278
```

## PHP常用命令

- 查看版本号
```bash
/usr/local/php74/bin/php -v

# 输出如下内容
PHP 7.4.33 (cli) (built: May 25 2023 17:50:54) ( NTS )
Copyright (c) The PHP Group
Zend Engine v3.4.0, Copyright (c) Zend Technologies
```

- 显示加载的配置文件路径
```bash
/usr/local/php74/bin/php --ini

# 输出如下内容
Configuration File (php.ini) Path: /usr/local/php74/etc
Loaded Configuration File:         /usr/local/php74/etc/php.ini
Scan for additional .ini files in: (none)
Additional .ini files parsed:      (none)
```

- 查看命令行模式下已支持的扩展
```bash
/usr/local/php74/bin/php --m

# 输出如下内容
[PHP Modules]
......
```

- 查看扩展的配置信息
```bash
/usr/local/php74/bin/php --ri redis

# 输出如下内容
redis

Redis Support => enabled
Redis Version => 5.3.7
Redis Sentinel Version => 0.1
Available serializers => php, json
。。。。。。
```

- 查看帮助文档
```bash
/usr/local/php74/bin/php -h

# 输出如下内容
Usage: php [options] [-f] <file> [--] [args...]
   php [options] -r <code> [--] [args...]
   php [options] [-B <begin_code>] -R <code> [-E <end_code>] [--] [args...]
   php [options] [-B <begin_code>] -F <file> [-E <end_code>] [--] [args...]
   php [options] -S <addr>:<port> [-t docroot] [router]
   php [options] -- [args...]
   php [options] -a
```