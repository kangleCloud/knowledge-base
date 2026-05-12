# Nginx基础配置

Nginx 配置文件主要分成全局块，events块，http块，server块，upstream块。

> [!TIP]
>
> - 修改配置文件后，直接执行 `nginx -s reload` 命令，nginx会先检查配置文件语法是否正确，确认无误后才会发送QUIT信号至老的worker进程。为了形成良好的运维习惯，建议`nginx -s reload`前手动执行一次`nginx -t`。

> [!WARNING]
>
> 需确定日志文件以及 PID 文件存放的目录已创建。
>
> ```
> mkdir -p /data/logs/nginx1.28
> mkdir -p /data/run/nginx1.28
> ```

------

## 一、全局块配置

```vim
# 定义 Nginx 运行的用户和用户组
user nginx nginx;
# 根据 CPU 的内核数生成等数量的工作进程
worker_processes  auto;
# 工作进程的 CPU 绑定由 Nginx 自动调整
worker_cpu_affinity auto;
# 一个 Nginx 进程打开的最多文件描述符数目
worker_rlimit_nofile 65535;
# 在 Main 区块中全局配置（默认为 Nginx 安装目录）
error_log /data/logs/nginx1.28/error.log error;
# 设置 pid 文件的存放路径（默认为 Nginx 安装目录），防止 Nginx 服务被启动多次
pid /data/run/nginx1.28/nginx.pid;
```

> [!TIP]
>
> - worker_rlimit_nofile：这个指令是指当一个 nginx 进程打开的最多文件描述符数目，理论值应该是最多打开文件数（ulimit -n）与 nginx 进程数相除，但是 nginx 分配请求并不是那么均匀，所以最好与 ulimit -n 的值保持一致。这是因为 nginx 调度时分配请求到进程并不是那么的均衡，所以假如填写10240，总并发量达到 3-4万时就有进程可能超过 10240 了，这时会返回 502 错误。
> - worker_cpu_affinity：设置为 auto 开启 CPU 亲和机制。对于并发编程较为熟悉的伙伴都知道，因为进程/线程数往往都会远超出系统 CPU 的核心数，因为操作系统执行的原理本质上是采用时间片切换机制，也就是一个 CPU 核心会在多个进程之间不断频繁切换，造成很大的性能损耗。而 CPU 亲和机制则是指将每个 Nginx 的工作进程，绑定在固定的 CPU 核心上，从而减小 CPU 切换带来的时间开销和资源损耗。
> - error_log：https://nginx.org/en/docs/ngx_core_module.html#error_log

------

## 二、events块配置

```vim
events {
    # 使用 epoll 网络模型
    use epoll;
    # 调整每个 Worker 能够处理的连接数上限
    worker_connections 65535;
    # 如果请求数一直维持在一个很高的水平, 可以设置为 on
    multi_accept on;
}
```

> [!TIP]
>
> multi_accept：nginx 采用一个 master 进程和多个 worker 进程的模式工作。多个 worker 共享一个 socket (端口绑定), 当请求进来的时候, 被调度到的进程就会去 accept 连接。multi_accept 的作用就是控制他一次拿走一个连接, 还是拿走所有等待中的连接。

------

## 三、http全局块配置

> [!TIP]
>
> - 网页GZIP压缩检测：https://tool.chinaz.com/gzips/

```vim
http {
    # 文件扩展名与文件类型映射表
    include /usr/local/nginx1.28/conf/mime.types;
    # 基于 ngx_http_proxy_module 模块实现的代理功能（需创建配置文件）
    include /usr/local/nginx1.28/conf/proxy.conf;

    # 默认文件类型
    default_type application/octet-stream;
    # 默认编码
    charset utf-8;

    # 开启高效文件传输模式
    sendfile    on;
    tcp_nopush  on;

    # 增加小包的数量，提高响应速度
    # off 会增加通信的延时，提高带宽利用率（适用于高延时、数据量大的通信场景）。
    tcp_nodelay on;

    # 大文件传输配置
    client_max_body_size    50m;
    client_body_buffer_size 128k;

    # 隐藏 Nginx 版本号
    server_tokens off;

    # 指定每个 TCP 连接最多可以保持多长时间
    # Nginx 的默认值是 75 秒，有些浏览器最多只保持 60 秒
    keepalive_timeout 60s;

    # 改善网站的性能：减少资源占用，提高访问速度
    # nginx 接受 client 请求时的响应
    fastcgi_connect_timeout 300;
    fastcgi_send_timeout 300;
    fastcgi_read_timeout 300;
    fastcgi_buffer_size 64k;
    fastcgi_buffers 4 64k;
    fastcgi_busy_buffers_size 128k;
    fastcgi_temp_file_write_size 128k;

    # 开启 gzip 压缩
    gzip on;
    gzip_min_length 1k;     #最小压缩文件大小
    gzip_buffers 4 16k;     #压缩缓冲区
    gzip_comp_level 2;      #压缩等级
    gzip_types text/javascript text/css application/javascript application/json text/plain application/xml;  #压缩类型
    gzip_vary on;           #在响应头部添加 Accept-Encoding: gzip

    # 日志
    log_format main_json 
        '{"@timestamp":"$time_iso8601",'                      #时间格式
        '"server_addr":"$server_addr",'                       #服务器端地址
        '"hostname":"$hostname",'                             #主机名
        '"ip":"$http_x_forwarded_for",'                       #浏览当前页面的用户计算机的网关
        '"remote_addr":"$remote_addr",'                       #浏览当前页面的用户计算机的ip地址(上一级ip)
        '"request":"$request",'                               #客户端的请求地址
        '"request_method":"$request_method",'                 #http请求方法
        '"scheme":"$scheme",'                                 #请求使用的web协议
        '"body_bytes_sent":"$body_bytes_sent",'               #传输给客户端的字节数(不算响应头)
        '"request_time":"$request_time",'                     #处理客户端请求使用的时间
        '"upstream_response_time":"$upstream_response_time",' #请求过程中 upstream 响应时间
        '"upstream_addr":"$upstream_addr",'                   #后台 upstream 地址，即真正提供服务的主机地址
        '"host":"$host",'                                     #请求地址
        '"uri":"$uri",'                                       #请求中的当前url
        '"request_uri":"$request_uri",'                       #请求原始url
        '"args":"$args",'                                     #请求中的参数值
        '"http_referer":"$http_referer",'                     #url 跳转来源,用来记录从那个页面链接访问过来的
        '"http_user_agent":"$http_user_agent",'               #用户终端浏览器等信息
        '"status":"$status"}';                                #http响应代码

    # 需新增 /data/logs/nginx1.28 目录
    access_log  /data/logs/nginx1.28/access.log main_json;

    # server 虚拟主机
    include /usr/local/nginx1.28/conf/conf.d/*.conf;
    include /usr/local/nginx1.28/conf/conf.d/*/*.conf;
    include /usr/local/nginx1.28/conf/conf.d/*/*/*.conf;
}
```

### 1.proxy.conf

nginx 作为代理转发时使用，其中 set_header 部分会在 location 块中重新配置。

```bash
vim /usr/local/nginx1.28/conf/proxy.conf
```

```vim
# set header
proxy_set_header  Host             $host; #设置真实客户端地址
proxy_set_header  X-Real-IP        $remote_addr; #设置客户端真实IP地址
proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for; #记录代理地址

# timeout
proxy_connect_timeout 30; #后端服务器连接的超时时间（这个超时不能超过75秒）
proxy_send_timeout    60; #发送请求给upstream服务器的超时时间（默认为60s）
proxy_read_timeout    60; #设置从被代理服务器读取应答内容的超时时间（默认为60s）

# buffer
proxy_buffering on;
proxy_buffer_size 4k;           #设置代理服务器（nginx）保存用户头信息的缓冲区大小
proxy_buffers 4 32k;            #proxy_buffers缓冲区，网页平均在32k以下的设置
proxy_busy_buffers_size 64k;    #高负荷下缓冲大小（proxy_buffers*2）
proxy_temp_file_write_size 64k; #设定缓存文件夹大小，大于这个值，将从upstream服务器传

# next_upstream
proxy_next_upstream error timeout invalid_header http_502 http_504; #设置重试的场景（默认值为 error 和 timeout）
```

> [!TIP]
>
> 详见：https://nginx.org/en/docs/http/ngx_http_proxy_module.html

------

## 四、server块配置

每个 server 块独立成一个配置文件，并统一存放在 `/usr/local/nginx1.28/conf/conf.d` 中，在 http 块配置中通过 `include` 引入。

> [!IMPORTANT]
>
> - 非特殊情况，出网域名必须使用 https，禁止 http 访问。
> - http server 和 https server 的配置使用两个 server 块维护在一个配置文件中。
> - SSL 证书上传到 nginx 安装目录中的 cert 目录（如：/usr/local/nginx1.28），该目录需要新建。

> [!WARNING]
>
> - 为防止源码、中间件、框架自带的监控调试工具等敏感信息泄露，需要在`server`块中引入禁止访问的地址。配置如下：`include /usr/local/nginx1.28/conf/forbidden.conf;`，详见：[Nginx生产配置](prod.md)

创建文件目录

```bash
mkdir -pv /usr/local/nginx1.28/conf/conf.d
```

### 1.Http Server

```bash
vim /usr/local/nginx1.28/conf/conf.d/sample.conf
```

```vim
server {
    listen      80;
    server_name www.internal-domain.com; #非特殊情况，禁止使用模糊匹配

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # 新建的项目需禁止使用 PUT 和 DELETE 请求
    if ($request_method !~ ^(GET|HEAD|POST)$) {
        return 403;
    }

    # 禁止访问
    include /usr/local/nginx1.28/conf/forbidden.conf;

    location / {
        root       /path/to/website;
        index      index.html;
        try_files  $uri  /index.html; #可用于单页应用的 History 路由模式 
    }
}
```

### 2.Https Server

> [!NOTE]
>
> - SSL 证书路径需存放在 Nginx 实际安装目录。
> - SSL 证书文件名尽量使用泛域名作为文件名，如果是单独为某个域名申请的证书，需使用对应的域名进行命名。
> - [SSL Configuration Generator](https://ssl-config.mozilla.org/)
> - [Nginx v1.15.0 起弃用 ssl on;，改用 listen ... ssl; 方式](https://nginx.org/en/CHANGES)。

```vim
server {
    listen      443  ssl;
    server_name www.example.com; #非特殊情况，禁止使用模糊匹配

    # SSL Configuration
    ssl_certificate     /usr/local/nginx1.28/cert/domain.cer;
    ssl_certificate_key /usr/local/nginx1.28/cert/domain.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!3DES:!ADH:!RC4:!DH:!DHE;
    ssl_prefer_server_ciphers off;

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # 新建的项目需禁止使用 PUT 和 DELETE 请求
    if ($request_method !~ ^(GET|HEAD|POST)$) {
        return 403;
    }

    # 禁止访问
    include /usr/local/nginx1.28/conf/forbidden.conf;

    location / {
        root       /path/to/website;
        index      index.html;
        try_files  $uri  /index.html; #可用于单页应用的 History 路由模式 
    }
}
```

------

## 附录一、Nginx块示例及说明

### 1.块示例

配置文件地址：/usr/local/nginx1.28/conf/nginx.conf

```vim
... #全局块
events { 
    ... #events全局块
}
http {
    ... #http全局快
    server {
        ... #server全局块
        location [PATTERN] {
            ... #location块
        }
        location [PATTERN] {
            ...
        }
    }
    server {
        ...
    }
    ... #http全局快
}
```

### 2.块说明

- 全局块：配置影响 nginx 全局的指令。一般有运行 nginx 服务器的用户组，nginx 进程 pid 存放路径、日志存放路径、配置文件引入、允许生成 worker process 数等。
- events块：配置影响nginx服务器或与用户的网络连接。有每个进程的最大连接数，选取哪种事件驱动模型处理连接请求，是否允许同时接受多个网路连接，开启多个网络连接序列化等。
- http块：可以嵌套多个 server，配置代理、缓存、日志定义等绝大多数功能和第三方模块的配置。如文件引入、mime-type 定义、日志自定义、是否使用 sendfile 传输文件、连接超时时间、单连接请求数等。
- server块：配置虚拟主机的相关参数，一个 http 中可以有多个 server。其中还包括 location 块，用于配置请求的路由，以及各种页面的处理情况。
- upstream块：upstream 的指令用于设置一系列的后端服务器，设置反向代理及后端服务器的负载均衡。
