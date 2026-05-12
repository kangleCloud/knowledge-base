# Nginx添加Lua模块

## 1.安装LuaJIT2

:::warning
https://luajit.org/download.html 下载的包集成到 Nginx 中，执行`nginx`命令后，会有如下错误提示：

<font color="red">detected a LuaJIT version which is not OpenResty's; many optimizations will be disabled and performance will be compromised (see https://github.com/openresty/luajit2 for OpenResty's LuaJIT or, even better, consider using the OpenResty releases from https://openresty.org/en/download.html)。</font>

约定使用 https://github.com/openresty/luajit2 提供的源码。
:::

https://github.com/openresty/luajit2

本文示例统一使用 luajit2 v2.1-20250529。

### 0x01.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/openresty/luajit2/archive/refs/tags/v2.1-20250529.tar.gz \
    -O luajit-2.1.tar.gz
tar -zxvf  luajit-2.1.tar.gz
```

### 0x02.编译安装

```bash
cd /usr/local/src/luajit2-2.1-20250529
make && make install PREFIX=/usr/local/luajit2.1
```

### 0x03.设置环境变量

```bash
echo 'export LUAJIT_LIB=/usr/local/luajit2.1/lib
export LUAJIT_INC=/usr/local/luajit2.1/include/luajit-2.1' >> /etc/profile
source /etc/profile
```

### 0x04.添加动态链接库

添加新的动态链接库目录
```bash
echo '/usr/local/luajit2.1/lib' >> /etc/ld.so.conf
```

更新配置
```bash
ldconfig -v
```

## 2.下载ngx_devel_kit

https://github.com/vision5/ngx_devel_kit/releases

本文示例统一使用 ngx_devel_kit v0.3.4。

### 0x01.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/vision5/ngx_devel_kit/archive/refs/tags/v0.3.4.tar.gz \
    -O ngx_devel_kit-0.3.4.tar.gz
tar -zxvf ngx_devel_kit-0.3.4.tar.gz
```

## 3.下载lua-nginx-module

https://github.com/openresty/lua-nginx-module/tags

本文示例统一使用 lua-nginx-module v0.10.28。

:::warning
lua-nginx-module 0.10.14 之后的版本不在支持 `lua_load_resty_core off`（Nginx 配置文件的 http 块中），需要安装 `lua-resty-core` 和 `lua-resty-lrucache`。
:::

### 0x01.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/openresty/lua-nginx-module/archive/refs/tags/v0.10.28.tar.gz \
    -O lua-nginx-module-0.10.28.tar.gz
tar -zxvf lua-nginx-module-0.10.28.tar.gz
```

## 4.安装lua-resty-core

https://github.com/openresty/lua-resty-core/tags

本文示例统一使用 lua-resty-core v0.1.31。

### 0x01.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/openresty/lua-resty-core/archive/refs/tags/v0.1.31.tar.gz \
    -O lua-resty-core-0.1.31.tar.gz
tar -zxvf lua-resty-core-0.1.31.tar.gz
```

### 0x02.编译安装

:::warning
安装 lua-resty-core 时，如果不加 PREFIX 参数，相关 lua 脚本会被默认安装到 /usr/local/lib/lua 中，需要将 `lua_package_path "/usr/local/lib/lua/?.lua;;";` 配置到 nginx.conf 的 `http` 块中。
:::

```bash
cd /usr/local/src/lua-resty-core-0.1.31
make && make install PREFIX=/usr/local/lua-resty-core-0.1
```

## 5.安装lua-resty-lrucache

https://github.com/openresty/lua-resty-lrucache

本文示例统一使用 lua-resty-lrucache v0.15。

### 0x01.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/openresty/lua-resty-lrucache/archive/refs/tags/v0.15.tar.gz \
    -O lua-resty-lrucache-0.15.tar.gz
tar -zxvf lua-resty-lrucache-0.15.tar.gz
```

### 0x02.编译安装

:::warning
安装 lua-resty-lrucache 时，如果不加 PREFIX 参数，相关 lua 脚本会被默认安装到 /usr/local/lib/lua 中，需要将 `lua_package_path "/usr/local/lib/lua/?.lua;;";` 配置到 nginx.conf 的 `http` 块中。
:::

```bash
cd /usr/local/src/lua-resty-lrucache-0.15
make && make install PREFIX=/usr/local/lua-resty-lrucache-0.15
```

## 6.重新编译Nginx

### 0x01.查看当前Nginx的信息

```bash
nginx -V
```

:::tip 输出如下内容
```vim
nginx version: nginx/1.28.3
built by gcc 10.3.1 (GCC) 
built with OpenSSL 1.1.1w  11 Sep 2023
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx1.28 --with-http_stub_status_module --with-http_gzip_static_module --with-http_realip_module --with-http_sub_module --with-http_ssl_module --with-openssl=/usr/local/src/openssl-1.1.1w
```
:::

### 0x02.下载Nginx（如若需要）

<font color="red">版本务必与服务器现有 Nginx 版本严格保持一致。</font>

```bash
cd /usr/local/src
wget http://nginx.org/download/nginx-1.28.3.tar.gz
tar -zxvf nginx-1.28.3.tar.gz
```

### 0x03.重新编译Nginx

```bash
cd nginx-1.28.3
```

```bash
./configure [第一步获取的 configure arguments] \
    --add-module=/usr/local/src/ngx_devel_kit-0.3.4 \
    --add-module=/usr/local/src/lua-nginx-module-0.10.28
```

:::tip 示例
```bash
./configure --prefix=/usr/local/nginx1.28 --with-http_stub_status_module --with-http_gzip_static_module --with-http_realip_module --with-http_sub_module --with-http_ssl_module --with-openssl=/usr/local/src/openssl-1.1.1w --add-module=/usr/local/src/ngx_devel_kit-0.3.4 --add-module=/usr/local/src/lua-nginx-module-0.10.28
```
:::

<font color="red">严禁执行 make install，此操作将覆盖现有 Nginx 文件。</font>
```bash
make
```

:::tip
如果在编译安装时，由于系统中自带的 OpenSSL 版本过低导致 make 失败，可以通过在 configure 参数中指定更高版本的 OpenSSL 源码路径来解决。具体示例如下：`--with-openssl=/usr/local/src/openssl-1.1.1w`。
:::

### 0x04.替换Nginx执行文件

```bash
cp /usr/local/nginx1.28/sbin/nginx /usr/local/nginx1.28/sbin/nginx.bak
cp -rf /usr/local/src/nginx-1.28.3/objs/nginx /usr/local/nginx1.28/sbin/
```

### 0x05.修改nginx.conf

在`http`块中新增如下配置

```vim
lua_package_path "/usr/local/lua-resty-core-0.1/lib/lua/?.lua;/usr/local/lua-resty-lrucache-0.15/lib/lua/?.lua;;";
```

### 0x06.查看模块是否添加成功

重启 Nginx
```bash
systemctl restart nginx
```

查看 Nginx 信息
```bash
nginx -V
```

## 附件1.参考资料

- https://blog.csdn.net/qq_27156945/article/details/104019069
- https://www.cnblogs.com/itqn/p/14054203.html
