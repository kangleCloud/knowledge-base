

# 基于Nginx+Lua实现隐私图片

为了确保用户上传的隐私图片只能通过授权签名方式访问，我们设计并实现了一个基于Nginx+ Lua 的图片上传与访问机制。



## 图片上传

当用户上传隐私图片时，除了存储原始图片至服务器文件目录外，服务端会同步创建一个图片相同文件名加上文件扩展名为 `.lock` 的标识文件。

比如图片路径在/data/attaches/1.jpeg，那么同步生成一个/data/attaches/1.jpeg.lock的空文件

以下是PHP示例代码，其他语言参照实现即可

代码如下：

```php
$lockFilename = $uploadData['full_path'] . '.lock';
file_put_contents($lockFilename, '');
```



## 图片访问

### 服务端生成隐私图片临时访问地址

以下是PHP示例代码，其他语言参照实现即可

代码如下：

```php
function getPrivateImgUrl(string $url)
{
    if (empty($url)) {
        return '';
    }

    $urlArr = parse_url($url);
    $path = $urlArr['path'];  # /attaches/10003/public/images/2023/02/13/a09ca75f772ece362171a41a59ba8ad84b3dfc0d.png
    $now = time();  # 当前时间戳 秒

    $token = md5($path . $now) . 'wxtZ4a826iWHIsKoXC2p0tUNWLrIbpV3';
    $token = md5($token);

    return $url . '?token=' . $token . '&time=' . $now;
}
```

### Nginx+Lua访问控制

Nginx校验当前图片是否有.lock文件，如果有即是隐私图片，那么就加载Lua脚本进行访问权限校验操作

Nginx配置如下：

```nginx
 location /attaches {
    root /data/huodong/content/php-activity-filesystem/storage;   
		if (-f ${request_filename}.lock) {
        access_by_lua_file /resource/huodong/php-activity-filesystem/lua_rule.lua;
    }
}
```

Lua脚本进行访问权限校验，如果签名验证通过，则服务器返回图片数据；否则服务器拒绝请求并向客户端返回错误响应

代码如下：

```lua
--定义签名秘钥
local sk = "wxtZ4a826iWHIsKoXC2p0tUNWLrIbpV3"
local args = ngx.req.get_uri_args()
local token = tostring(args["token"])
local now_time = ngx.now()*1000

local timestamp = args["time"]

--判断请求时间是否为空
if timestamp == nil then
    ngx.exit(ngx.HTTP_FORBIDDEN)
end

--判断请求时间是否超时,10秒
if (now_time-(timestamp*1000)) > 10000 then
    ngx.exit(ngx.HTTP_FORBIDDEN)
end

--获取请求路径（不含域名），加入签名
local file_path = ngx.var.uri
local sign_str = ngx.md5(ngx.md5(file_path..timestamp)..sk)

--校验签名
if sign_str ~= token then
    ngx.exit(ngx.HTTP_FORBIDDEN)
end
```



