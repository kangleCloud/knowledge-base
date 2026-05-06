# Nginx平滑升级

最新稳定版：https://nginx.org/en/download.html

截止2025年10月20日，Nginx 1.28.*（*表示最新的补丁版本） 系列最新稳定版为 1.28.0

:::tip
- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 nginx1.28
:::

## 1.下载源代码包并解压缩

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
nginx version: nginx/1.24.0
built by gcc 10.3.1 (GCC) 
built with OpenSSL 1.1.1w  11 Sep 2023
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx1.24 --with-http_stub_status_module --with-http_gzip_static_module --with-http_realip_module --with-http_sub_module --with-http_ssl_module --with-openssl=/usr/local/src/openssl-1.1.1w
```
:::

## 3.编译并安装

```bash
cd /usr/local/src/nginx-1.28.0
```

```bash
./configure --prefix=/usr/local/nginx1.28 \
    [复制上一步输出的 configure arguments（不包含 --prefix）]
```

编译安装
```bash
make && make install
```

## 4.修改环境变量

```bash
vim /etc/profile
```

删除类似如下的内容
```vim
export PATH=$PATH:/usr/local/nginx1.24/sbin //[!code --]
```

添加新的环境变量
```bash
echo 'export PATH=$PATH:/usr/local/nginx1.28/sbin' >> /etc/profile
source /etc/profile
```

## 5.复制配置文件

```bash
\cp -rf /usr/local/nginx1.24/conf/* /usr/local/nginx1.28/conf/
```

## 6.修改service文件

:::tip
- 为了便于后期维护，约定在 nginx.service 中明确加载的配置文件路径（如：-c /usr/local/nginx1.28/conf/nginx.conf）。
- 配置文件中不支持在每行命令的后面添加注释
:::

备份service文件
```bash
cp /etc/systemd/system/nginx.service /etc/systemd/system/nginx.service.bak
```

编辑service文件
```bash
vim /etc/systemd/system/nginx.service
```

修改内容如下
```vim
[Unit]
Description=nginx
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx1.24/sbin/nginx -c /usr/local/nginx1.24/conf/nginx.conf //[!code --]
ExecReload=/usr/local/nginx1.24/sbin/nginx -s reload //[!code --]
ExecStop=/usr/local/nginx1.24/sbin/nginx -s quit //[!code --]
ExecStart=/usr/local/nginx1.28/sbin/nginx -c /usr/local/nginx1.28/conf/nginx.conf //[!code ++]
ExecReload=/usr/local/nginx1.28/sbin/nginx -s reload //[!code ++]
ExecStop=/usr/local/nginx1.28/sbin/nginx -s quit //[!code ++]
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

## 7.重启服务

测试 Nginx 配置文件的语法是否正确
```bash
/usr/local/nginx1.28/sbin/nginx -t
```

重新加载配置
```bash
systemctl daemon-reload
```

停止运行中的Nginx进程
```bash
/usr/local/nginx1.24/sbin/nginx -s quit
```

重启服务
```bash
systemctl restart nginx
```

## 9.查看是否升级成功

查看 Nginx 状态
```bash
systemctl status nginx
```

查看 Nginx 信息
```bash
nginx -V
```