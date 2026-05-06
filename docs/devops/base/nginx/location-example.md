# Location 指令说明及示例

location 指令是 nginx 中最关键的指令之一，location 指令的功能是用来匹配不同的 URI 请求，进而对请求做不同的处理和响应，这其中较难理解的是多个 location 的匹配顺序，本文会作为重点来解释和说明。

开始之前先明确一些约定，我们输入的网址叫做请求 URI，nginx 用请求 URI 与 location 中配置的 URI 做匹配。

https://nginx.org/en/docs/http/ngx_http_core_module.html#location

## 一、基本语法

`location [ = | ~ | ~* | ^~ ] /URI { … }`

- 「=」修饰符：精确匹配，用于不含正则表达式的 URI 前，要求字符串与请求中的 URI 严格匹配，完全相等时才能停止向下搜索并处理请求

```vim
# redirect server error pages to the static page /50x.html
error_page   500 502 503 504  /50x.html;
location = /50x.html {
    root   /usr/share/nginx/html;
}

# 微信公众平台服务号配置JS接口安全域名
location = /MP_verify_7Y9HLc4m7Aa8OPvS.txt {
    default_type text/html;
    return 200 "7Y9HLc4m7Aa8OPvS";
}

# 关闭 [/favicon.ico] 和 [/robots.txt] 的访问日志
# 并且即使它们不存在，也不写入错误日志
location = /favicon.ico { access_log off; log_not_found off; }
location = /robots.txt  { access_log off; log_not_found off; }

```

- 「^~」修饰符：要求字符串一旦与请求中的 URI 匹配到就会立即处理，而且不再匹配其他的正则 URI。（一般用来匹配目录）

```vim
# 移动客户端接口
location ^~ /api {
    proxy_pass http://192.168.33.10:8088;
}
# 管理后台端接口
location ^~ /admin/api {
    proxy_pass http://192.168.33.11:8088;
}
# 文件上传服务
location ^~ /upload {
    proxy_pass http://192.168.33.12:8088;
}
```

- 「~」修饰符：最佳匹配，用于表示 url 包含正则表达式，并且<font color="red">区分大小写</font>

```
# pass the PHP scripts to FastCGI server listening on 127.0.0.1:9073
location ~ \.php$ {
    root           /data/webapp;
    fastcgi_pass   127.0.0.1:9073;
    fastcgi_index  index.php;
}
```

- 「~*」修饰符：与 「~」一样，只是<font color="blue">不区分大小写</font>

```
# avoid processing of calls to non-existing static files
location ~* \.(js|css|png|jpg|gif|swf|ico|pdf|mov|fla|zip|rar)$ {
    try_files $uri =404;
}
error_page 404 /404.html;

# access forbidden
location ~* /(composer\.json|composer\.lock|package\.json|package-lock\.json) {
    return 403;
}
location ~* /.(htaccess|env|svn|git|well-known|DS_Store) {
    return 403;
}
```

- 「 」（空）修饰符：前缀匹配，用于不含正则表达式的 URI 前，要求字符串与请求中的 URI 从头开始匹配

```
location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;
}
```

## 二、匹配顺序

nginx 有两层指令来匹配请求 URI。第一个层次是 server 指令，它通过域名、ip 和端口来做第一层级匹配，当找到匹配的 server 后就进入此 server 的 location 匹配。

location 的匹配并不完全按照其在配置文件中出现的顺序来匹配，请求 URI 会按如下规则进行匹配：

1. 先精准匹配 = ，精准匹配成功则会立即停止其他类型匹配；
2. 没有精准匹配成功时，进行前缀匹配。先查找带有 ^~ 的前缀匹配，带有 ^~ 的前缀匹配成功则立即停止其他类型匹配，普通前缀匹配（不带参数 ^~ ）成功则会暂存，继续查找正则匹配；
3. = 和 ^~ 均未匹配成功前提下，查找正则匹配 ~ 和 ~* 。当同时有多个正则匹配时，按其在配置文件中出现的先后顺序优先匹配，命中则立即停止其他类型匹配；
4. 所有正则匹配均未成功时，返回步骤 2 中暂存的普通前缀匹配（不带参数 ^~ ）结果。

以上规则简单总结就是优先级从高到低依次为（**序号越小优先级越高**）：
:::warning 日常维护中需遵循的编写顺序
1. location = uri {}   # 精准匹配
2. location ^~ uri {}  # 带参前缀匹配
3. location ~ uri {}   # 正则匹配（区分大小写）
4. location ~* uri {}  # 正则匹配（不区分大小写）
5. location /a         # 普通前缀匹配，优先级低于带参数前缀匹配
6. location /          # 任何没有匹配成功的，都会匹配这里处理
:::

## 三、URL重写配置

在 location 块中，last 和 break 是存在差异的；使用了 last 指令，rewrite 后会跳出 location 作用域，重新开始再走一次刚刚的行为；使用了 break 指令，rewrite 后不会跳出 location 作用域，它的生命也在这个location中终结。其他语法规则可参考 <a href="/docs/devops/base/nginx/configuration.html#server%E5%9D%97%E9%85%8D%E7%BD%AE">server 块中的 URL 重写</a>

```vim
location /avatar {
    if (!-e $request_filename) {
        rewrite ^/avatar/(.*)$ /avatar/avatar_default.png break;
    }
}
```

## 四、文件路径

在 Nginx 中`root`和`alias`都用于指定文件路径，但它们的处理方式不同。`root`会将 URI 追加到指定目录后，形成完整的文件路径，而`alias`会直接将`location`路径映射到指定目录，<font color="red">不再追加 URI</font>。

:::warning
- <font color="red">alias 只能作用在 location 块中</font>，而 root 可以存在 server、http 和 location 块中.
- alias 所在 location 块中的 rewrite 指令不能使用 break，因为 alias 会覆盖 URI 的路径。
:::

### 0x01.root

- 访问地址：`http://www.internal-domain.com/html/root.html`
- 物理地址：`/webapp/default/html/root.html`

```
location /html {
    root /webapp/default;
    index index.html index.htm;
}
```

### 0x02.alias
- 访问地址：`http://domain.com/html/test/alias.html`
- 物理地址：`/webapp/default/html/alias.html`。

```
location /html/test {
    alias /webapp/default/html;
    index index.html index.htm;
}
```

alias 语法：http://nginx.org/en/docs/http/ngx_http_core_module.html#alias

## 五、http协议转发

nginx 中有两个模块有 `proxy_pass` 指令，此处只描述 `ngx_http_proxy_module` 模块的 `proxy`。

- 语法：proxy_pass URL
- 场景：location, if in location, limit_except
- 说明：设置后端代理服务器的协议（protocol）和地址（address）,以及 `location` 中可以匹配的一个可选的 URI。协议可以是 `http` 或 `https`。地址可以是一个域名或 `ip` 地址和端口，或者一个 unix-domain socket 路径。
- 官方文档: http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass

在 nginx 中配置 `proxy_pass` 代理转发时，如果在 `proxy_pass` 后面的 URL 加 /，表示绝对根路径；如果没有 /，表示相对路径，把匹配的路径部分也给代理走。（可以通过 nginx 的日志查看访问地址和代理到的实际地址）

**文档中的示例目前只适用于由 Java、PHP、Nodejs 等开发的应用程序，静态文件（如 html、js、css等）待验证。**

:::tip 约定
- ~~`location` 指令中 `uri` 的结尾不允许是 `/`（合理性待验证）。~~
:::

- `proxy_pass` 指令后面的 URL 加 / （<font color="red">不允许使用</font>）

```vim
location ^~ /admin/api {
    proxy_pass http://127.0.0.1:8080/;
}
```

访问 URL：http://192.168.33.11/admin/api/news/articles <br>
代理到 URL：http://127.0.0.1:8080//news/articles

- `proxy_pass`  指令后面的 URL 不加 / 

```vim
location ^~ /admin/api {
    proxy_pass http://127.0.0.1:8080;
}
```

访问 URL：http://192.168.33.11/admin/api/news/articles <br>
代理到 URL：http://127.0.0.1:8080/admin/api/news/articles

- `proxy_pass` 指令后面的 URL 添加其它路由，并且最后添加 / （<font color="red">不允许使用</font>）

```vim
location ^~ /japi {
    proxy_pass http://127.0.0.1:8080/api/;
}
```

访问 URL：http://192.168.33.11/japi/news/articles <br>
代理到 URL：http://127.0.0.1:8080/api//news/articles

- `proxy_pass` 指令后面的 URL 添加其它路由，但最后没有添加 /

```vim
location ^~ /japi {
    proxy_pass http://127.0.0.1:8080/api;
}
```

访问 URL：http://192.168.33.11/japi/news/articles <br>
代理到 URL：http://127.0.0.1:8080/api/news/articles

:::tip 补充：ngx_stream_proxy_module 的 proxy_pass
- 语法：proxy_pass address
- 场景：server
- 说明：设置后端代理服务器的地址。这个地址（address）可以是一个域名或 ip 地址和端口，或者一个 unix-domain socket路径。
- 官方文档: http://nginx.org/en/docs/stream/ngx_stream_proxy_module.html#proxy_pass
:::

## 六、URI结尾带不带斜杠

⭐⭐⭐ location 中的字符有没有 `/` 是有影响的，不要随意配置。

如果 URI 结构是 `https://domain.com/` 的形式，尾部有没有 `/` 都不会造成重定向。因为浏览器在发起请求的时候，默认加上了 `/`。虽然很多浏览器在地址栏里也不会显示 `/`。

如果 URI 的结构是 `https://domain.com/homepage/` 。尾部如果缺少 `/` 将导致重定向。因为根据约定，URL 尾部的 `/` 表示目录，没有 `/` 表示文件。所以访问 `/homepage/` 时，服务器会自动去该目录下找对应的默认文件。如果访问 `/homepage` 的话，服务器会先去找 `homepage` 文件，找不到的话会将 `homepage` 当成目录，重定向到 `/homepage/`，去该目录下找默认文件。