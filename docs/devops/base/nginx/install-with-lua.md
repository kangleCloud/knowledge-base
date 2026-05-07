# Nginx+Lua安装

最新稳定版：https://nginx.org/en/download.html

截止2024年11日，Nginx 1.24.*（*表示最新的补丁版本） 系列最新稳定版为 1.24.0

:::warning
团队正在逐步废弃通过检查文件是否存在对应 Lock 文件的授权校验方案，转而采用在访问路径中添加“private”标识的方式进行授权访问。因此，<font color="red">Nginx 的 Lua 扩展仅需部署在最外层代理服务器上即可实现授权校验</font>，从而简化了整体部署流程。此外，<font color="red">接口缓存功能也可以在这一层实现</font>，无需对业务代码进行大幅改动，即可有效提升系统的并发处理能力。
:::

:::tip
- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 nginx1.24
:::

## 一、安装必要的库

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

## 二、安装Lua及相关包

### 0x01.安装LuaJIT2.1

<a href="/docs/devops/base/nginx/nginx-lua-module.html#_1-安装luajit2" target="_blank">安装LuaJIT2</a>

### 0x02.下载ngx_devel_kit

<a href="/docs/devops/base/nginx/nginx-lua-module.html#_2-下载ngx-devel-kit" target="_blank">下载ngx_devel_kit</a>

### 0x03.下载lua-nginx-module

<a href="/docs/devops/base/nginx/nginx-lua-module.html#_3-下载lua-nginx-module" target="_blank">下载lua-nginx-module</a>

### 0x04.安装lua-resty-core

<a href="/docs/devops/base/nginx/nginx-lua-module.html#_4-安装lua-resty-core" target="_blank">安装lua-resty-core</a>

### 0x05.安装lua-resty-lrucache

<a href="/docs/devops/base/nginx/nginx-lua-module.html#_5-安装lua-resty-lrucache" target="_blank">安装lua-resty-lrucache</a>

## 三、编译安装Nginx

### 0x01.创建Nginx用户

```bash
groupadd nginx
useradd -g nginx nginx -s /sbin/nologin
```

### 0x02.下载源代码包并解压缩

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

```bash
cd /usr/local/src
wget http://nginx.org/download/nginx-1.24.0.tar.gz
tar -zxvf nginx-1.24.0.tar.gz
```

### 0x03.编译并安装

```bash
cd /usr/local/src/nginx-1.24.0
```

:::warning
- `./configure` 中的 --with-http_***_module 模块默认是不会安装的，[需要显式配置](http://nginx.org/en/docs/configure.html)。
:::

::: el-tabs
--- el-tab-item 自定义openssl路径
```bash
./configure --prefix=/usr/local/nginx1.24 \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-http_realip_module \
    --with-http_sub_module \
    --with-http_ssl_module \
    --with-openssl=/usr/local/src/openssl-1.1.1w \
    --add-module=/usr/local/src/ngx_devel_kit-0.3.4 \
    --add-module=/usr/local/src/lua-nginx-module-0.10.28
```
---

--- el-tab-item 系统默认openssl路径
```bash
./configure --prefix=/usr/local/nginx1.24 \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-http_realip_module \
    --with-http_sub_module \
    --with-http_ssl_module \
    --add-module=/usr/local/src/ngx_devel_kit-0.3.4 \
    --add-module=/usr/local/src/lua-nginx-module-0.10.28
```
---
:::

```bash
make && make install
```

### 0x05.添加环境变量

```bash
echo 'PATH=$PATH:/usr/local/nginx1.24/sbin
export PATH' >> /etc/profile
```

刷新环境变量
```bash
source /etc/profile
```

### 0x06.修改Nginx配置文件

创建日志目录（日志目录所属用户需同启动 nginx 服务的用户一致）
```bash
mkdir -pv /var/log/nginx1.24
```

备份
```bash
\cp /usr/local/nginx1.24/conf/nginx.conf /usr/local/nginx1.24/conf/nginx.conf.bak
```

清空
```bash
echo > /usr/local/nginx1.24/conf/nginx.conf
```

编辑
```bash
vim /usr/local/nginx1.24/conf/nginx.conf
```

配置文件内容请参照<a href="/docs/devops/base/nginx/configuration.html" target="_blank">Nginx基础配置</a>

在`http`块中新增 Lua 先关配置
```vim
lua_package_path "/usr/local/lua-resty-core-0.1/lib/lua/?.lua;/usr/local/lua-resty-lrucache-0.15/lib/lua/?.lua;;";
```

## 四、使用Systemd管理进程

:::tip
- service 执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.创建service文件

:::tip
- 为了便于后期维护，约定在 nginx.service 中明确加载的配置文件路径（如：-c /usr/local/nginx1.24/conf/nginx.conf）。
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
ExecStart=/usr/local/nginx1.24/sbin/nginx -c /usr/local/nginx1.24/conf/nginx.conf
ExecReload=/usr/local/nginx1.24/sbin/nginx -s reload
ExecStop=/usr/local/nginx1.24/sbin/nginx -s quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载systemd配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

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

### 0x04.查看是否安装成功

查看 Nginx 状态
```bash
systemctl status nginx
```

查看 Nginx 信息
```bash
nginx -V
```


## 五、常见错误

- **1. 执行 `/usr/local/nginx1.24/sbin/nginx`，提示 libluajit-5.1.so.2 没有找到**

:::danger 错误信息
error while loading shared libraries: libluajit-5.1.so.2: cannot open shared object file: No such file or directory
:::

:::tip ✔️解决方法
::: el-tabs

--- el-tab-item 方案一：添加动态链接库
添加新的动态链接库目录
```bash
echo '/usr/local/luajit2.1/lib' >> /etc/ld.so.conf
```

更新配置
```
ldconfig -v
```
---

--- el-tab-item 方案二：添加软链
```bash
ln -s /usr/local/luajit2.0/lib/libluajit-5.1.so.2 /usr/lib64/libluajit-5.1.so.2
```
---

:::

- **2. 编译安装时缺失pcre**

:::danger 错误信息
```vim
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_ffi_set_jit_stack_size':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:189: undefined reference to `pcre_jit_stack_free'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:196: undefined reference to `pcre_jit_stack_alloc'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_regex_compile':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:121: undefined reference to `pcre_compile'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:147: undefined reference to `pcre_fullinfo'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_ffi_compile_regex':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:282: undefined reference to `pcre_study'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:313: undefined reference to `pcre_assign_jit_stack'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:308: undefined reference to `pcre_study'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:342: undefined reference to `pcre_fullinfo'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_regex_free_study_data':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:101: undefined reference to `pcre_free_study'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_ffi_compile_regex':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:350: undefined reference to `pcre_fullinfo'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:357: undefined reference to `pcre_fullinfo'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_ffi_exec_regex':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:428: undefined reference to `pcre_dfa_exec'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:439: undefined reference to `pcre_exec'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_ffi_destroy_regex':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:461: undefined reference to `pcre_free_study'
/usr/bin/ld: objs/addon/src/ngx_http_lua_regex.o: in function `ngx_http_lua_ffi_pcre_version':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_regex.c:595: undefined reference to `pcre_version'
/usr/bin/ld: objs/addon/src/ngx_http_lua_pcrefix.o: in function `ngx_http_lua_pcre_malloc_init':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_pcrefix.c:63: undefined reference to `pcre_malloc'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_pcrefix.c:70: undefined reference to `pcre_free'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_pcrefix.c:72: undefined reference to `pcre_malloc'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_pcrefix.c:73: undefined reference to `pcre_free'
/usr/bin/ld: objs/addon/src/ngx_http_lua_pcrefix.o: in function `ngx_http_lua_pcre_malloc_done':
/usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_pcrefix.c:99: undefined reference to `pcre_malloc'
/usr/bin/ld: /usr/local/src/lua-nginx-module-0.10.24/src/ngx_http_lua_pcrefix.c:100: undefined reference to `pcre_free'
collect2: 错误：ld 返回 1
make[1]: *** [objs/Makefile:321：objs/nginx] 错误 1
make[1]: 离开目录“/usr/local/src/nginx-1.24.0”
make: *** [Makefile:10：build] 错误 2
```
:::

:::tip ✔️解决方法
编译时添加`--with-ld-opt="-lpcre"`
:::

## 附录一、参考资料

- https://github.com/openresty/lua-nginx-module#installation
- https://www.nginx.com/resources/wiki/start/topics/examples/systemd/
- https://www.nginx.com/resources/wiki/start/topics/examples/redhatnginxinit/