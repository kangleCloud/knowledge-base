# 安装Nginx

最新稳定版：https://nginx.org/en/download.html

截止2024年11月，Nginx 1.28.*（*表示最新的补丁版本） 系列最新稳定版为 1.28.0

:::warning
<font color="red"><b>当 Nginx 作为最外层的反向代理时，需安装 Lua 扩展，用于实现如下功能：</b></font>

- 通过地址验签的方式对隐私文件的授权访问
- 通过缓存接口数据的方式提升系统并发性能

详见：<a href="devops/baseops/nginx/install-with-lua.html" target="_blank">Nginx+Lua安装</a>
:::

:::tip

- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 nginx1.28
  :::

## 1.安装必要的库

:::warning
使用安全套接字层密码库需安装 openssl & openssl-devel，为修复低版本 OpenSSL 的安全漏洞，系统初始化时将通过源码编译方式安装最新版本的 OpenSSL，<font color="red">此处不允许直接安装或升级 openssl & openssl-devel</font>。
:::

```bash
yum -y install pcre pcre-devel zlib zlib-devel
```

:::tip

- 使用正则表达式需要安装 pcre & pcre-devel
- 使用 gzip 压缩需要安装 zlib & zlib-devel
  :::

## 2.编译安装Nginx

### 0x01.创建Nginx用户

```bash
groupadd nginx
useradd -g nginx nginx -s /sbin/nologin
```

### 0x02.下载源代码包并解压缩

```bash
cd /usr/local/src
wget http://nginx.org/download/nginx-1.28.3.tar.gz
tar -zxvf nginx-1.28.3
.tar.gz
```

### 0x03.编译并安装

```bash
cd /usr/local/src/nginx-1.28.3
```

:::warning

- `./configure` 中的 --with-http_***_module 模块默认是不会安装的，需要显式配置

http://nginx.org/en/docs/configure.html
:::

::: tabs

=== 自定义openssl路径

```bash
./configure --prefix=/usr/local/nginx1.28 \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-http_realip_module \
    --with-http_sub_module \
    --with-http_ssl_module \
    --with-openssl=/usr/local/src/openssl-1.1.1w
```

---

=== 系统默认openssl路径

```bash
./configure --prefix=/usr/local/nginx1.28 \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-http_realip_module \
    --with-http_sub_module \
    --with-http_ssl_module
```
:::

---

```bash
make && make install
```

### 0x04.添加环境变量

```bash
echo 'PATH=$PATH:/usr/local/nginx1.28/sbin
export PATH' >> /etc/profile
```

```bash 
source /etc/profile
```

### 0x05.修改Nginx配置文件

创建日志目录（日志目录所属用户需同启动 nginx 服务的用户一致）

```bash
mkdir -pv /data/logs/nginx1.28
```

编辑 nginx.conf 文件

```bash
vim /usr/local/nginx1.28/conf/nginx.conf
```

配置文件内容请参照<a href="/docs/devops/base/nginx/configuration.html" target="_blank">Nginx基础配置</a>

## 3.使用Systemd管理进程

:::tip

- service 执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
  :::

### 0x01.创建service文件

:::tip

- 为了便于后期维护，约定在 nginx.service 中明确加载的配置文件路径（如：-c /usr/local/nginx1.28/conf/nginx.conf）。
- 配置文件中不支持在每行命令的后面添加注释
  :::

在 /etc/systemd/system 目录下面新建一个 service 文件

```bash
vim /etc/systemd/system/nginx.service
```

```vim
[Unit]
Description=nginx
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx1.28/sbin/nginx -c /usr/local/nginx1.28/conf/nginx.conf
ExecReload=/usr/local/nginx1.28/sbin/nginx -s reload
ExecStop=/usr/local/nginx1.28/sbin/nginx -s quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 0x03.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x04.启动并设置开机自启

```bash
systemctl enable nginx --now
```

:::tip Systemctl指令

```bash
systemctl status nginx  #启动服务
systemctl start nginx   #启动服务
systemctl stop nginx    #停止服务
systemctl reload nginx  #重新加载配置
systemctl enable nginx  #开启开机自启服务
systemctl disable nginx #关闭开机自启服务
```

:::

## 附录1.使用信号控制管理进程

<font color="red"><b>`systemctl`与信号控制方式不能混用，原因未找到</b></font>

```bash
/usr/local/nginx1.28/sbin/nginx -c /usr/local/nginx1.28/conf/nginx.conf #启动
/usr/local/nginx1.28/sbin/nginx -s stop    #关闭
/usr/local/nginx1.28/sbin/nginx -s quit    #关闭
/usr/local/nginx1.28/sbin/nginx -s reload  #重新加载配置文件
/usr/local/nginx1.28/sbin/nginx -t         #核验配置文件是否正确
```

`nginx -s quit` 是一个优雅的关闭方式，Nginx在退出前完成已经接受的请求处理。

`nginx -s reload`是平滑重启，不会强制结束正在工作的连接，需要等所有连接都结束才会重启。如果需要立即生效，需执行关闭和启动两个命令。

:::tip 使用 rc.local 方式实现开机自启

启用并编辑 rc.local

```bash
chmod +x /etc/rc.d/rc.local
vim /etc/rc.d/rc.local
```

在文件末尾添加

```vim
/usr/local/nginx1.28/sbin/nginx -c /usr/local/nginx1.28/conf/nginx.conf
```

:::

## 附录2.补充

### 0x01.卸载Yum安装的Nginx

卸载 nginx 软件包

```bash
yum remove nginx -y
```

删除通过 `whereis nginx` 命令显示的文件目录

```bash
rm -rf /usr/lib64/nginx /etc/nginx /usr/share/nginx
```

删除日志文件

```bash
rm -rf /data/logs/nginx1.28
```

## 附录3.参考资料

- https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#compiling-and-installing-from-source