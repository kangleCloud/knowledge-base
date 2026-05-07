# 安装PHP7扩展

- [用 phpize 编译共享 PECL 扩展库](https://www.php.net/manual/zh/install.pecl.phpize.php)

## Redis扩展

### 0x01.下载

[Redis Driver For PHP Release On PECL](http://pecl.php.net/package/redis)

[PhpRedis Release On Github](https://github.com/phpredis/phpredis/releases)

截止2023年3月最新版本为：v5.3.7

:::warning
考虑到版本兼容性，PHP 7.1 安装 phpredis 扩展的 4.3.0 版本，PHP 7.3 安装 5.x 版本。
:::

```bash
cd /usr/local/src
wget https://github.com/phpredis/phpredis/archive/refs/tags/5.3.7.tar.gz -O redis-5.3.7.tar.gz
tar -zxvf redis-5.3.7.tar.gz
```

### 0x02.编译安装

```bash
cd /usr/local/src/phpredis-5.3.7
# 准备 PHP 扩展库的编译环境
/usr/local/php73/bin/phpize
# 指定使用哪一个版本编译
./configure --with-php-config=/usr/local/php73/bin/php-config
make && make install
```

### 0x03.修改php.ini文件

确认 extension_dir 路径

```bash
/usr/local/php73/bin/php -i | grep extension_dir
```

:::tip 输出内容如下
extension_dir => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731 => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731
:::

编辑 php.ini 文件
```bash
vim /usr/local/php73/etc/php.ini
```

在配置文件的末尾添加以下配置项
```ini
[Redis]
extension=/usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731/redis.so
```

### 0x04.重启PHP-FPM

```bash
systemctl restart php-fpm73
```

### 0x05.验证是否安装成功

```bash
/usr/local/php73/bin/php --ri redis
```

:::tip 输出如下内容
```md
redis

Redis Support => enabled
Redis Version => 5.3.7
Redis Sentinel Version => 0.1
Available serializers => php, json
。。。。。。
```
:::

<font color="red">如果验证失败，查看 /var/log/php 下面对应版本的错误日志。</font>

## MongoDB扩展

:::tip 前置条件
sudo yum install php-pear php-devel gcc make
:::

### 0x01.下载

[MongoDB Driver For PHP Release On PECL](http://pecl.php.net/package/mongodb)

[MongoDB PHP extension Release On Github](https://github.com/mongodb/mongo-php-driver/releases) 

截止2023年3月最新版本为：v1.15.1

```bash
cd /usr/local/src
wget http://pecl.php.net/get/mongodb-1.15.1.tgz
tar -zxvf mongodb-1.15.1.tgz
```

### 0x02.编译安装

```bash
cd /usr/local/src/mongodb-1.15.1
# 准备 PHP 扩展库的编译环境
/usr/local/php73/bin/phpize
# 指定使用哪一个版本编译
./configure --with-php-config=/usr/local/php73/bin/php-config
make && make install
```

### 0x03.修改php.ini文件

确认 extension_dir 路径
```bash
/usr/local/php73/bin/php -i | grep extension_dir
```

:::tip 输出内容如下
extension_dir => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731 => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731
:::

编辑 php.ini 文件
```bash
vim /usr/local/php73/etc/php.ini
```

在配置文件的末尾添加以下配置项
```ini
[MongoDB]
extension=/usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731/mongodb.so
```

### 0x04.重启PHP-FPM

```bash
systemctl restart php-fpm73
```

### 0x05.验证是否安装成功

```bash
/usr/local/php73/bin/php --ri mongodb
```

:::tip 输出如下内容
```md
mongodb

MongoDB support => enabled
MongoDB extension version => 1.15.1
MongoDB extension stability => stable
。。。。。。
Directive => Local Value => Master Value
mongodb.debug => no value => no value
```
:::

<font color="red">如果验证失败，查看 /var/log/php 下面对应版本的错误日志。</font>

## Opcache扩展

PHP7 编译安装完成后，已默认安装了 opcache.so

文件路径：文件路径：/usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731

### 0x01.修改php.ini文件

确认 extension_dir 路径

```bash
/usr/local/php73/bin/php -i | grep extension_dir
```
:::tip 输出内容如下
extension_dir => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731 => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731
:::

编辑 php.ini 文件
```bash
vim /usr/local/php73/etc/php.ini
```

:::tip 约定
- CLI 版本禁止启用 Zend OPCache（默认是不启用）
- 设置 opcache.validate_timestamps=0（这个选项被禁用后，opcache.revalidate_freq 会被忽略，PHP文件永远不会被检查）
:::

```ini
# 开启opcache扩展
opcache.enable=1
# 强制重启php-fpm让修改的代码生效
opcache.validate_timestamps=0
```

在配置文件的末尾添加以下配置项
```ini
[opcache]
zend_extension=/usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731/opcache.so
```

### 0x02.重启PHP-FPM

```bash
systemctl restart php-fpm73
```
备注：存量项目可能需要使用`/etc/init.d/php-fpm7.3 restart`重启服务。

### 0x03.验证是否安装成功

```bash
/usr/local/php73/bin/php --ri "Zend OPcache" | grep "opcache.enable => On"
```

:::tip 输出如下内容
opcache.enable => On => On
:::

<font color="red">如果验证失败，查看 /var/log/php 下面对应版本的错误日志。</font>

### 0x04.参考资料

- https://segmentfault.com/a/1190000005844450
- https://www.php.net/manual/zh/opcache.installation.php
- https://www.php.net/manual/zh/opcache.configuration.php#ini.opcache.revalidate-freq

## DM数据库扩展

### 0x01.下载

可通过DM官网[下载页面](https://eco.dameng.com/download/)资源下载区获取 DM8 的[PHP/PDO 驱动程序](https://www.dameng.com/upload/file/20251028/php_pdo-20250513.zip)。该驱动程序包内包含多个 PHP 版本的扩展文件。

截至2025年11月21日，达梦数据库 DM8 的[PHP/PDO驱动程序](https://www.dameng.com/upload/file/20251028/php_pdo-20250513.zip)最新更新发布于2025年5月13日。

### 0x02.安装

```bash
cd /usr/local/src
unzip php_pdo-20250513.zip
cp /usr/local/src/php_pdo-20250513/*73* /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731/

chmod 755 /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731/libphp73_dm.so
chmod 755 /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731/php73_pdo_dm.so
```

### 0x03.修改php.ini文件

确认 extension_dir 路径

```bash
/usr/local/php73/bin/php -i | grep extension_dir
```
:::tip 输出内容如下
extension_dir => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731 => /usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731
:::

编辑 php.ini 文件
```bash
vim /usr/local/php73/etc/php.ini
```
在配置文件的末尾添加以下配置项
```ini
[PHP_DM]
extension_dir ="/usr/local/php73/lib/php/extensions/no-debug-non-zts-20180731"
extension=libphp73_dm.so
extension=php73_pdo_dm.so
[dm]
dm.port=5236
; ; 是否允许持久性连接getaddrinfo EAl_AGAIN wyb-api.wzwuyouban.com
 dm.allow_persistent = 1
; ; 允许建立持久性连接的最大数. -1 为没有限制.
 dm.max_persistent = -1getaddrinfo EAl_AGAIN wyb-api.wzwuyouban.com
; ; 允许建立连接的最大数(包括持久性连接). -1 为没有限制.
 dm.max_links = -1
; ; 默认的主机地址
 dm.default_host = localhost
; ; 默认登录的数据库
 dm.default_db = SYSTEM
; ; 默认的连接用户名
 dm.default_user = SYSDBA
; ; 默认的连接口令.
 dm.default_pw = SYSDBA
; ;连接超时，这个参数未实际的用到，等待服务器支持
 dm.connect_timeout = 10
; ;对于各种变长数据类型，每列最大读取的字节数。如果它设置为 0 或是小于 0,那么，读取变长字段时，将显示 NULL 值
 dm.defaultlrl = 4096
; ; 是否读取二进制类型数据，如果它设置为 0，那么二进制将被 NULL 值代替
 dm.defaultbinmode = 1
; ;是否允许检察持久性连接的有效性，如果设置为 ON，那么当重用一个持久性连接时，会检察该连接是否还有效
 dm.check_persistent = ON
```

### 0x04.重启PHP-FPM

```bash
systemctl restart php-fpm73
```

### 0x05.验证是否安装成功

```bash
/usr/local/php73/bin/php --ri dm
```
### 0x06.参考资料

- https://eco.dameng.com/document/dm/zh-cn/start/php-development-new.html

