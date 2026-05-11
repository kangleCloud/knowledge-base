# 安装PHP7.3

:::tip
- 源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 php73 或 php7.3
- 团队目前使用的主要版本是 PHP7.3.*，新的项目计划安装 PHP7.4 的最新版本（如 PHP7.4.33）
- PHP 版本：>= 7.3.* （*表示最新的补丁版本）
:::

## 一、安装必要的库

```bash
yum -y install gcc gcc-c++ \
    libxml2 libxml2-devel \
    libxslt-devel \
    libcurl libcurl-devel \
    libjpeg libjpeg-devel \
    libpng libpng-devel \
    freetype freetype-devel \
    libwebp libwebp-devel \
    openssl-devel \
    bzip2 bzip2-devel \
    gmp gmp-devel \
    readline-devel \
    libicu-devel
```

## 二、安装或升级libzip

::: tabs

=== openEuler22.03/KylinOS.v10
```bash
yum -y install libzip-devel
```
---

=== Centos7
1. 卸载原有低版本的 libzip-devel 包

```bash
yum remove libzip-devel
```

2. 安装libzip（ 最新稳定版：https://libzip.org/download/ ）

添加remi的清华yum源，不添加的话yum无法自动为libzip5-devel解决依赖
```bash
yum install https://mirrors.tuna.tsinghua.edu.cn/remi/enterprise/remi-release-7.rpm
```

使用rpm包在线安装libzip-devel
```bash
yum install https://mirrors.tuna.tsinghua.edu.cn/remi/enterprise/7/remi/x86_64/libzip5-devel-1.10.1-1.el7.remi.x86_64.rpm
```
---

:::

## 三、编译安装PHP7.3

查看配置文件是否已添加路径
```bash
cat /etc/ld.so.conf
```

如果没有则添加（多次添加会重复）
```bash
echo '/usr/local/lib
/usr/local/lib64
/usr/lib
/usr/lib64 '>> /etc/ld.so.conf
```

更新配置
```bash
ldconfig -v
```

### 0x01.下载软件包

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

```bash
cd /usr/local/src
wget https://www.php.net/distributions/php-7.3.33.tar.gz
tar -zxvf php-7.3.33.tar.gz
```

### 0x02.添加用户和组
```bash
groupadd nginx
useradd -g nginx nginx -s /sbin/nologin
```

### 0x03.编译并安装

<font color="red">如果编译过程中发现有问题，可参照当前文档中的</font>[常见错误](/docs/devops/base/php7/install-php73.html#六、常见问题)

```bash
cd /usr/local/src/php-7.3.33
```

编译
::: tabs

=== openEuler22.03/KylinOS.v10
```bash
./configure --prefix=/usr/local/php73 --with-config-file-path=/usr/local/php73/etc \
    --with-fpm-user=nginx --with-fpm-group=nginx \
    --disable-rpath \
    --with-curl --with-zlib --with-openssl \
    --with-gd --with-jpeg-dir --with-png-dir --with-zlib-dir --with-freetype-dir --with-webp-dir \
    --with-mysqli=mysqlnd --with-pdo-mysql=mysqlnd \
    --with-xmlrpc --with-mhash --with-readline --with-xsl \
    --with-pcre-regex --with-bz2 --with-gettext --with-gmp --with-onig --with-pear \
    --enable-fpm \
    --enable-mbstring --enable-zip --enable-xml --enable-fileinfo \
    --enable-gd-jis-conv \
    --enable-ftp --enable-exif --enable-bcmath --enable-sockets --enable-soap \
    --enable-shmop --enable-calendar --enable-sysvmsg --enable-sysvsem --enable-sysvshm  --enable-wddx
```
---

=== Centos7

**由于服务器系统初始化过程中会升级 OpenSSL，现约定将 --with-openssl 参数配置为 /usr/local/openssl1.1。**

```bash
./configure --prefix=/usr/local/php73 --with-config-file-path=/usr/local/php73/etc \
    --with-fpm-user=nginx --with-fpm-group=nginx \
    --disable-rpath \
    --with-curl --with-zlib \
    --with-openssl=/usr/local/openssl1.1 \
    --with-gd --with-jpeg-dir --with-png-dir --with-zlib-dir --with-freetype-dir --with-webp-dir \
    --with-mysqli=mysqlnd --with-pdo-mysql=mysqlnd \
    --with-xmlrpc --with-mhash --with-readline --with-xsl \
    --with-pcre-regex --with-bz2 --with-gettext --with-gmp --with-onig --with-pear \
    --enable-fpm \
    --enable-mbstring --enable-zip --enable-xml --enable-fileinfo \
    --enable-gd-jis-conv \
    --enable-ftp --enable-exif --enable-bcmath --enable-sockets --enable-soap \
    --enable-shmop --enable-calendar --enable-sysvmsg --enable-sysvsem --enable-sysvshm  --enable-wddx
```
---
:::


安装（安装耗时有点长，耐心等待）
```bash
make && make install 
```

### 0x04.添加环境变量

```bash
echo 'export PATH=$PATH:/usr/local/php73/bin' >> /etc/profile
source /etc/profile
```

验证是否生效
```bash
php -v
```

:::tip 输出内容如下
PHP 7.3.33 (cli) (built: Jun  1 2023 01:39:09) ( NTS )
Copyright (c) 1997-2018 The PHP Group
Zend Engine v3.3.33, Copyright (c) 1998-2018 Zend Technologies
:::

### 0x05.配置php.ini
```bash
cp /usr/local/src/php-7.3.33/php.ini-production /usr/local/php73/etc/php.ini
```

详细配置参照：<a href="/docs/devops/base/php7/php-ini.html" target="_blank">php.ini 配置说明</a>

### 0x06.配置php-fpm.conf

```bash
cp /usr/local/php73/etc/php-fpm.conf.default /usr/local/php73/etc/php-fpm.conf
```

详细配置参照：<a href="/docs/devops/base/php7/php-fpm.html" target="_blank">php-fpm 配置说明</a>

### 0x07.配置www.conf

```bash
cp /usr/local/php73/etc/php-fpm.d/www.conf.default \
    /usr/local/php73/etc/php-fpm.d/www.conf
```

详细配置参照：<a href="/docs/devops/base/php7/php-fpm.html" target="_blank">php-fpm 配置说明</a>

### 0x08.新建日志文件目录

创建日志存放路径（如果是 root 用户创建，需修改其所属的用户及组都为 nginx），团队约定路径如下：`/var/log/php`，实际路径及文件名需参考如下配置项：
- <a href="/docs/devops/base/php7/php-ini.html#错误处理和日志记录" target="_blank">php.ini中的日志配置项</a>
- <a href="/docs/devops/base/php7/php-fpm.html#进程池配置说明" target="_blank">php-fpm中的日志配置项</a>

创建日志文件目录
```bash
mkdir -pv /var/log/php
```

修改日志文件目录所属用户及组
```bash
chown -R nginx:nginx /var/log/php
```

## 四、使用Systemd管理

:::warning
- 团队规定：`php-fpm73.service` 放置在 /etc/systemd/system 目录下
- 只适用于虚拟机或物理机环境，不推荐在容器内使用systemd管理
:::

### 0x01.从源码中复制service文件

```bash
cp /usr/local/src/php-7.3.33/sapi/fpm/php-fpm.service \
    /etc/systemd/system/php-fpm73.service
```

### 0x02.重新加载 systemctl 配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable php-fpm73 --now
```

### 0x03.验证服务是否可用

::: tabs

=== systemctl
```bash
systemctl status php-fpm73
```
---

=== netstat
```bash
netstat -nlp | grep php-fpm
```
---

:::

:::tip Systemctl指令
```bash
systemctl start php-fpm73    #启动服务
systemctl status php-fpm73   #查看状态
systemctl stop php-fpm73     #停止服务
systemctl restart php-fpm73  #重启服务
systemctl reload php-fpm73   #修改配置文件后重载
systemctl enable php-fpm73   #开启开机自启服务
systemctl disable php-fpm73  #关闭开机自启服务
```
:::

## 五、PHP常用命令

- 查看版本号
```bash
/usr/local/php73/bin/php -v
```

:::tip 输出如下内容
PHP 7.3.33 (cli) (built: Jun  1 2023 01:39:09) ( NTS )
Copyright (c) 1997-2018 The PHP Group
Zend Engine v3.3.33, Copyright (c) 1998-2018 Zend Technologies
:::

- 显示加载的配置文件路径
```bash
/usr/local/php73/bin/php --ini
```

:::tip 输出如下内容
Configuration File (php.ini) Path: /usr/local/php73/etc
Loaded Configuration File:         (none)
Scan for additional .ini files in: (none)
Additional .ini files parsed:      (none)
:::

- 查看命令行模式下已支持的扩展
```bash
/usr/local/php73/bin/php -m
```

:::tip 输出如下内容
```
[PHP Modules]
。。。。。。
```
:::

- 查看扩展的配置信息（以Redis为例）
```bash
/usr/local/php73/bin/php --ri redis
```

:::tip 输出如下内容
redis

Redis Support => enabled
Redis Version => 5.3.7
Redis Sentinel Version => 0.1
Available serializers => php, json

。。。。。。
:::

- 查看帮助文档
```bash
/usr/local/php73/bin/php -h
```

:::tip 输出如下内容
```vim
Usage: php [options] [-f] <file> [--] [args...]
   php [options] -r <code> [--] [args...]
   php [options] [-B <begin_code>] -R <code> [-E <end_code>] [--] [args...]
   php [options] [-B <begin_code>] -F <file> [-E <end_code>] [--] [args...]
   php [options] -S <addr>:<port> [-t docroot] [router]
   php [options] -- [args...]
   php [options] -a
```
:::

## 六、常见问题

### 0x01.libzip

错误提示1：configure: error: system libzip must be upgraded to version >= 0.11 <br>
错误提示2：configure: error: please reinstall the libzip distribution

:::tip 解决方法
<a href="/docs/devops/base/php7/install-php73.html#附录三、升级zlib" target="_blank">升级zlib</a>
:::

### 0x01.library configuration

错误提示：configure: error: off_t undefined; check your library configuration

:::tip 解决方法
```bash
# 添加搜索路径到配置文件
echo '/usr/local/lib64
/usr/local/lib
/usr/lib
/usr/lib64 '>> /etc/ld.so.conf

# 更新配置
ldconfig -v
```
:::

## 附件一、其他管理PHP-FPM的方式

### 0x01.SysVinit管理PHP-FPM

> 公司大部分老项目都采用的此方式，约定新安装的php都使用systemd管理。

1. 从源码中复制 php-fpm 脚本文件
```bash
cp /usr/local/src/php-7.3.33/sapi/fpm/init.d.php-fpm /etc/init.d/php-fpm73
```

2. 修改 php-fpm 脚本文件
```bash
vim /etc/init.d/php-fpm73
```

3. 设置 php-fpm 脚本文件为可执行权限
```bash
chmod +x /etc/init.d/php-fpm73
```

管理 php-fpm
```bash
/etc/init.d/php-fpm73          #查看脚本使用说明
/etc/init.d/php-fpm73 status   #查看状态
/etc/init.d/php-fpm73 start    #开启服务
/etc/init.d/php-fpm73 stop     #停止服务
/etc/init.d/php-fpm73 restart  #重启服务
/etc/init.d/php-fpm73 reload   #修改配置文件后重载
```

:::tip 使用`service`命令管理 php-fpm

> 前提：已实现 /etc/init.d/php-fpm73 脚本

```bash
service php-fpm73
service php-fpm73 status
service php-fpm73 start
service php-fpm73 stop
service php-fpm73 restart
service php-fpm73 reload
```
:::

:::tip 使用chkconfig方式实现开机自启

> 前提：已实现 /etc/init.d/php-fpm73 脚本

```bash
chkconfig --add php-fpm73  #加入服务
chkconfig php-fpm73 on     #设置自启
chkconfig --list php-fpm73 #查看配置
```
:::

:::tip 使用rc.local方式实现开机自启

> 前提：启用 <a href="/docs/devops/base/server-os/initialization.html#九、启用-rc-local-服务" target="_blank">rc.local</a> 服务

修改 rc.local 文件
```bash
vim /etc/rc.d/rc.local
```

在文件末尾添加如下内容
```vim
# 方式一
/usr/local/php73/sbin/php-fpm
# 方式二（前提：已实现 /etc/init.d/php-fpm73 脚本）
/etc/init.d/php-fpm73 start
```
:::

### 0x02.信号控制管理PHP-FPM

php 5.3.3 以后的 php-fpm 不再支持 /usr/local/php73/sbin/php-fpm (start|stop|reload) 等命令，需要使用信号控制的方式进行控制。

启动 php-fpm
```bash
/usr/local/php73/sbin/php-fpm
```

按指定配置文件启动 php-fpm
```bash
/usr/local/php73/sbin/php-fpm \
    -y /usr/local/php73/etc/php-fpm.conf \
    -c /usr/local/php73/etc/php.ini
```

查看 php-fpm
```bash
ps -ef | grep php-fpm | grep master
```

:::tip 输出内容
root    2278    1  0 09:11 ?    00:00:00 php-fpm: master process (/usr/local/php73/etc/php-fpm.conf)
:::

关闭 php-fpm
```bash
kill -INT 2278
```

重启 php-fpm
```bash
kill -USR2 2278
```

## 附录二、安装或升级CMake

<font color="red">约定安装版本为 v3.27.* （*表示最新的补丁版本）</font>

截止2023年7月19日，最新稳定版为：v3.27.0

下载地址：https://github.com/Kitware/CMake/releases

### 0x01.卸载已有版本的cmake

```bash
yum remove cmake
```

### 0x02.编译安装

```bash
cd /usr/local/src
wget https://github.com/Kitware/CMake/archive/refs/tags/v3.27.0.tar.gz \
    -O cmake-3.27.0.tar.gz
mkdir cmake-3.27.0 && tar -zxvf cmake-3.27.0.tar.gz \
    -C cmake-3.27.0 --strip-components 1
```

```bash
cd /usr/local/src/cmake-3.27.0
./bootstrap --system-curl --no-system-libs
make && make install
```

<font color="red"><b>安装过程较慢</b></font>

### 0x03.验证是否安装成功

查看 cmake 版本：

```bash
cmake --version
```

:::tip 输出如下内容表示安装成功
cmake version 3.27.0

CMake suite maintained and supported by Kitware (kitware.com/cmake).
:::

## 附录三、升级zlib

### 0x01.卸载低版本libzip

```bash
yum remove libzip libzip-devel
```

### 0x02.核验cmake

<font color="red">因 cmake 的安装比较耗时，需要先检测当前环境是否已安装</font>，如需安装可参照<a href="/docs/devops/base/php7/install-php73.html#附录二、安装或升级cmake" target="_blank">安装或升级cmake</a>

```bash
cmake --version
```

:::tip 输出如下内容
cmake version 3.26.1

CMake suite maintained and supported by Kitware (kitware.com/cmake).
:::

### 0x03.安装libzip

最新稳定版：https://libzip.org/download/
   
```bash
cd /usr/local/src
# 当前最新稳定版为：v1.9.2
wget https://libzip.org/download/libzip-1.9.2.tar.gz --no-check-certificate
tar -zxvf libzip-1.9.2.tar.gz
cd libzip-1.9.2
mkdir -p build && cd build && cmake .. && make && make install
```
