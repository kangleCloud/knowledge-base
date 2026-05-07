# 负载均衡配置说明

Nginx 负载均衡是由代理模块和上游（upstream）模块共同实现的，Nginx 通过代理模块的反向代理功能将用户请求转发到上游服务器组，上游模块通过指定的负载均衡策略及相关的参数配置将用户请求转发到目标服务器上。

上游模块可以与 Nginx 的代理指令（proxy_pass）、FastCGI 协议指令（fastcgi_pass）等指令实现多种协议后端服务器的负载均衡。

:::tip
upstream 指令应用在 http 指令块中，日常工作中，团队约定将`upstream`块和`server`块配置在一个 conf 文件中，并在`http`块中使用`include`指令引入。
:::

## 1.配置示例

```vim
http {
    ...
    upstream api {
        keepalive 32;
        keepalive_requests 1000;
        keepalive_timeout 60s;

        # 保证至少一台服务器允许失败一次
        server 192.168.33.11:80 weight=1 max_fails=0;
        server 192.168.33.12:80 weight=1 max_fails=0;
        server 192.168.33.13:80 weight=1 max_fails=1;
    }

    server {
        ...
        location / {
            proxy_pass http://api;
        }
    }
}
```

## 2.负载均衡策略

Nginx 的 upstream 支持 5 种分配方式，分别是：轮询（默认）、权重、ip_hash、fair、url_hash，其中前三种为 Nginx 原生支持的分配方式，后两种为第三方支持的分配方式。

一般业务服务器配置都是一致的，所以日常工作中直接采用<font color="red">**权重（加权轮询）**</font>的方式即可。

## 3.常用参数说明

### $01.weight

后端服务器权重，默认为 1，权重越大接收的请求越多。例：weight=5。

### $02.max_fails

检查节点的健康状态并允许请求失败的次数，达到该次数就将节点下线。默认为 1，0 表示禁止失败尝试。例：max_fails=2。

### $03.fail_timeout

max_fails 失败次数达到限制后暂停该节点服务的时间，默认是 10 秒。例：fail_timeout=10s。

### $04.backup

热备配置，当服务池中所有服务器均出现问题后会自动上线 backup 服务器。

### $05.down

标志服务器不可用，不参与负载均衡。这个参数通常配合 ip_hash 使用。

### $06.max_conns

限制最大连接数，通常对后端服务器硬件不一致的情况进行配置。

### $07.keepalive

限制空闲长连接的最大数量。Nginx 官网文档的示例值为 32。

### $08.keepalive_timeout

空闲长连接的最长保持时间。默认值为 60s。

### $09.keepalive_requests

每个长连接最多可以处理的请求数。默认值为 1000。

## 附件1.参考资料

- https://juejin.cn/post/6844903741678698510
- https://juejin.cn/post/7112826654291918855
- https://nginx.org/en/docs/http/ngx_http_upstream_module.html


