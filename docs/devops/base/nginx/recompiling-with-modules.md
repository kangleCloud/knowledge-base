# 重新编译添加模块

下载地址：https://nginx.org/en/download.html

:::tip
- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 nginx1.28
:::

## 1.下载源代码包并解压缩

<font color="red">下载与待重新编译Nginx同版本的源代码包</font>

:::tip
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

```bash
cd /usr/local/src
wget http://nginx.org/download/nginx-1.28.0.tar.gz
tar -zxvf nginx-1.28.0.tar.gz
```

## 2.查看当前Nginx的信息

```bash
nginx -V
```

:::tip 输出如下内容
```md
nginx version: nginx/1.28.0
built by gcc 10.3.1 (GCC)
built with OpenSSL 1.1.1wa  16 Nov 2023
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx1.28 --with-http_stub_status_module --with-http_gzip_static_module --with-http_realip_module --with-http_sub_module --with-http_ssl_module
```
:::

## 3.重新编译

```bash
cd /usr/local/src/nginx-1.28.0
```

此处以添加 ngx_http_secure_link_module 为示例
```bash
./configure [复制上一步输出的 configure arguments] \
    --with-http_secure_link_module
    
```

<font color="red">严禁执行 make install，此操作将覆盖现有 Nginx 文件。</font>
```bash
make
```

## 4.替换Nginx执行文件

```bash
cp /usr/local/nginx1.28/sbin/nginx /usr/local/nginx1.28/sbin/nginx.bak
cp -rf /usr/local/src/nginx-1.28.0/objs/nginx /usr/local/nginx1.28/sbin/
```

## 5.重启服务

```bash
systemctl restart nginx
```

## 6.查看模块是否添加成功

```bash
nginx -V
```