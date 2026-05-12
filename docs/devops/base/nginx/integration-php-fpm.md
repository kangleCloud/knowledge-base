# Nginx集成PHP-FPM

Nginx 本身不能处理 PHP，它只是个 Web 服务器，当接收到请求后，如果是 PHP 请求，则发给 PHP 解释器处理，并把结果返回给客户端。

Nginx 一般是把请求发 Fastcgi 管理进程处理，Fastcgi 管理进程选择 CGI 子进程处理结果并返回被 Nginx。

目前团队使用的 PHP 版本都已集成 PHP-FPM，详见：<a target="_blank" href="/docs/devops/base/php7/install-php73.html">PHP7 安装文档</a>

## fastcgi_params

尽管在 [FastCGI Example](https://www.nginx.com/resources/wiki/start/topics/examples/fastcgiexample) 中推荐将所有典型的 FASTCGI 设置保存在一个文件中，但是为了便于维护，约定参照配置文件 nginx.conf 中提供的示例集成 PHP-FPM（fastcgi_params 文件存放在 nginx 的安装目录）。

Nginx 集成 PHP 的示例
```vim
location ~ \.php {
    fastcgi_pass   127.0.0.1:9073;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include        fastcgi_params;
}
```

为了配置 PHP 项目的环境变量，可以在 fastcgi_params 文件中新增一些常量，通过 `$_SERVER` 获取常量值。（PHP 的 CLI 模式下可通过 `/etc/profile` 设置全局变量。）

```bash
# 编辑文件
vim /usr/local/nginx1.28/conf/fastcgi_params
```

```vim
# 新增常量
fastcgi_param  YII_ENV  test;
fastcgi_param  CI_ENV   testing;
```


> /usr/local/nginx1.28/conf/nginx.conf 中提供的示例 :  
> ```vim
> # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
> #
> # location ~ \.php$ {
> #    root           html;
> #    fastcgi_pass   127.0.0.1:9000;
> #    fastcgi_index  index.php;
> #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
> #    include        fastcgi_params;
> #}
> ```

:::tip
nginx 源码安装包括两个 FastCGI 配置文件，分别是 fastcgi_params 和 fastcgi.conf。关于这两个配置文件的区别，详见：https://blog.martinfjordvald.com/nginx-config-history-fastcgi_params-versus-fastcgi-conf/
:::

## Yii2示例

https://www.yiiframework.com/doc/guide/2.0/zh-cn/start-installation#recommended-nginx-configuration

**此处示例为 Yii2 的基础模板**

```vim
server {

    listen 80; ## listen for ipv4
    #listen [::]:80 default_server ipv6only=on; ## listen for ipv6

    # 添加几条有关安全的响应头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    server_name _;

    root   /path/to/webroot/project-name/web;
    index  index.html index.htm index.php;

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # avoid processing of calls to non-existing static files by Yii
    location ~ \.(js|css|png|jpg|gif|swf|ico|pdf|mov|fla|zip|rar)$ {
        try_files $uri =404;
    }
    error_page 404 /404.html;

    location / {
        # Redirect everything that isn't a real file to index.php
        try_files $uri $uri/ /index.php$is_args$args;
    }
    
    location ~ \.php$ {
        root           /path/to/webroot/project-name/web;
        fastcgi_pass   127.0.0.1:9073;
        fastcgi_index  index.php;
        include        /usr/local/nginx1.28/conf/fastcgi.conf;
    }
}
```

验证配置
```bash
/usr/local/nginx1.28/sbin/nginx -t

# 输出如下内容
nginx: the configuration file ... syntax is ok
nginx: configuration file ... test is successful
```

重新加载配置文件
```
systemctl reload nginx
```

## Codeigniter3示例

```vim
server {
    listen       80;
    server_name  _;

    root   /path/to/website/project-name;
    index  index.html index.htm index.php;

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        root           /path/to/website/project-name;
        fastcgi_pass   127.0.0.1:9073;
        fastcgi_index  index.php;
        include        /usr/local/nginx1.28/conf/fastcgi.conf;
    }
}
```

验证配置同上，此处省略。。。

## Phalcon3示例

官网示例：https://docs.phalcon.io/3.4/en/webserver-setup#phalcon-configuration-1

```vim
server {
    listen       80;
    server_name  _;

    root   /path/to/website/project-name/public;
    index  index.html index.htm index.php;

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location / {
        try_files $uri $uri/ /index.php?_url=$uri&$args;
    }
    
    location ~ \.php$ {
        root           /path/to/website/project-name/public;
        include        /usr/local/nginx1.28/conf/fastcgi.conf;
        fastcgi_pass   127.0.0.1:9073;
        fastcgi_index  index.php;
    }
}
```

验证配置同上，此处省略。。。

## ThinkPHP5示例

官网部署说明：https://www.kancloud.cn/manual/thinkphp5/129745

```vim
server {
    listen       80;
    server_name  _;

    root   /path/to/website/project-name/public;
    index  index.html index.htm index.php;

    # 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志。
    # 并且即使它们不存在，也不写入错误日志。
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location / {
        if (!-e $request_filename) {
            rewrite ^(.*)$ /index.php?s=$1 last;
            break;
        }
    }
    
    location ~ \.php$ {
        root           /path/to/website/project-name/public;
        fastcgi_pass   127.0.0.1:9071;
        fastcgi_index  index.php;
        include        /usr/local/nginx1.28/conf/fastcgi.conf;
    }
}
```

验证配置同上，此处省略。。。
