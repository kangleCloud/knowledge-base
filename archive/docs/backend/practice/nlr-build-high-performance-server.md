# 基于Nginx+Lua+Redis构建高性能服务

随着业务系统的不断迭代，业务会变得相对复杂，在后期要求业务系统需支撑大并发的访问，这个时候若初期没有考虑大并发的构建方案那么就需要对已有系统进行深度的改造，带来的工作量以及风险是巨大的。这时我们可以通过引入NGINX+LUA+REDIS构建一套动态数据托底组件达到免侵入提升性能的目的。

## 1. 系统准备
- nginx、lua、redis、mysql系统环境准备
- lua组件：limit.req、http、cjson、redis等（I兰州已有相关组件）

## 2. 数据流向图
![](/images/backend/practice/nlr/nginx_lua_data.jpg)

## 3. 具体执行过程
- 1. 建立监测拦截接口配置，DDL配置如下：
```sql
CREATE TABLE `sys_lua_limit_datas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uri` varchar(200) NOT NULL DEFAULT '' COMMENT '限制路由',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否启用',
  `limit_rate` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'QPS最多',
  `limit_burst` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '触发limit_rate后，多少进入delay等待',
  `limit_type` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT '限制类型 1固定兜底数据 2动态兜底数据',
  `limit_static_redata` varchar(500) NOT NULL DEFAULT '' COMMENT '固定兜底数据内容,json数据',
  `limit_dynamic_redata_url` varchar(500) NOT NULL DEFAULT '' COMMENT '//动态兜底数据请求URL（不含动态参数）',
  `limit_dynamic_redata_url_params` varchar(500) NOT NULL DEFAULT '' COMMENT '动态兜底数据请求URL参数 多个逗号分隔',
  `limit_dynamic_timeout` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '动态兜底数据过期时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `state` (`state`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COMMENT='lua数据兜底方案配置';
```

- 2. 使用后端语言编写获取拦截信息的API接口，返回结果为json格式

- 3. 使用lua脚本编写获取拦截信息数据，同时存入nginx缓存块中，同时构建定时器，定期刷新缓存信息

代码如下：
```lua
--定时加载配置uri信息，通过调接口实现
local function timer_load_rules()
    -- ngx.say("timer_load_rules start ")
    local httpc = http.new()
    httpc:set_timeout(10000)
    local res, err = httpc:request_uri(url_get_rules)
    if err ~= nil then
        -- ngx.say("query err " .. tostring(err))
        return nil
    end
    if res and res.status == 200 then
        local body = res.body
        httpc:set_keepalive(10000, 100)
        if body ~= nil then
            local data = cjson.decode(body) 
            for i=1 ,#data do
                local uri_key = data[i]["uri"]
                local uri_val= cjson.encode(data[i])
                --把每条规则放入共享内存 key:uri  value: 规则信息
                shd_rules_dict:safe_set(uri_key,uri_val)
            end
        end
    else
        -- ngx.say("url get error res body : " .. tostring(body))
    end
end

--设置定时刷新规则信息
function _M.timer_worker()
    timer_init(6, timer_load_rules)
end
```

- 4. nginx+lua限流脚本编写，检测当前GET请求的接口地址是否在拦截信息库中，若不在则直接放行至业务端进行处理。若在监控规则中，利用limit.req组件的限流功能进行判断，若触发限流规则，依据返回规则返回相应的静态数据或动态数据

检测代码如下：
```lua
--[[
    @info:  limit_uri限速方法
            uri：请求uri,限速维度
            rate：触发限速的请求数
            burst：触发限速后扔可访问的请求数
      nginx异常状态码  513（超出rate+burst的请求）
--]]
local function limit_uri()
    local uri = ngx.var.server_name .. ngx.var.uri
    local value = shd_rules_dict:get(uri)
    --未配置限速的URI，结束程序
    if value == nil then
        --ngx.say("no rate limit, the uri : "..uri)
        return
    end
    
    --获取限速规则
    local data =  cjson.decode(value)
    local limit_status = data["state"]
    --状态未开启限速的URI，结束程序
    if type(limit_status) ~= "nil" and tonumber(limit_status) == 0 then
        --ngx.say("rate limit not open  the uri : "..uri)
        return
    end
    
    local rate = data["limit_rate"]
    local burst = data["limit_burst"]
    local lim, err = limit_req.new(my_limit_req_store, rate, burst)
    if not lim then
        --ngx.say("failed to instantiate a resty.limit.req object : "..err)
        return
    end
    local delay, err = lim:incoming(uri, true)
    local req_method = ngx.var.request_method
    -- 触发限速逻辑
    if not delay and req_method == "GET" then
        if err == "rejected" then        
            -- 获取数据返回类型
            if data["limit_type"] == 1 then
                -- 返回指定内容
                ngx.say(data["limit_static_redata"])
                return ngx.exit(200)
            else
                -- 返回动态内容
                get_dynamic_redata(data)
            end
        end
        
        -- failed to limit req
        -- return ngx.exit(500)
    end
    -- 触发限速，若限速时间大于10ms，nginx休眠
    if delay >= 0.001 then
        -- ngx.say("the  request will delay time "..delay .. " the uri : "..uri )
        ngx.sleep(delay)
    -- else
        -- ngx.say(" normal req: ".. delay)
        -- 正常速率之内
    end
end
```

- 5. 通过url+params为key值从redis中获取动态数据，同时更新redis地址集合过期时间，用于定时器定时更新相应接口的数据，达到动态托底的目的，同时刷新间隔、生命周期均采用第一步中配置的参数，刷新时间越短数据越接近实时数据。若动态数据在redis中未找到，那么请求直接放行至业务系统进行处理，保证C端页面不会开空窗。

代码如下：
```lua
-- 获取动态兜底数据
local function get_dynamic_redata(rule_data)
    -- 连接redis，判断redis中是否有值
    local redis_cnf = {
        ip = redis_host,
        port = redis_port,
        auth = redis_auth,
        poolsize = redis_poolsize
    }
    local redis = require('resty.redis_pool'):new(redis_cnf)
    
    local args = split(rule_data["limit_dynamic_redata_url_params"],",")
    local cur_arg_str = ""
    
    local ngx_args = ngx.req.get_uri_args()
    
    for i = 1, #args do
        cur_arg_str = cur_arg_str .. args[i] .. "=" .. get_ngx_param(ngx_args, args[i]) .. "&"
    end
    
    -- 获取动态数据URL数值
    local dynamic_url = rule_data["limit_dynamic_redata_url"]
    if string.find(dynamic_url, "?") == nil then
        dynamic_url = dynamic_url .. "?" .. cur_arg_str
    else
        dynamic_url = dynamic_url .. "&" .. cur_arg_str
    end
    
    local cur_url_md5 = ngx.md5(dynamic_url)
    
    local cur_redis_key = 'lua:dynamic_redata:'..cur_url_md5
    
    local redis_pool_uri, redis_pool_uri_err = redis:get('lua:dynamic_uri_pool:'..cur_url_md5)
    if redis_pool_uri == ngx.null or redis_pool_uri == nil then
        redis:set('lua:dynamic_uri_pool:'..cur_url_md5, 1)
        redis:expire('lua:dynamic_uri_pool:'..cur_url_md5, rule_data["limit_dynamic_timeout"])
        
        redis:sadd('lua:dynamic_urls', dynamic_url)
    else
        redis:expire('lua:dynamic_uri_pool:'..cur_url_md5, rule_data["limit_dynamic_timeout"])
    end

    local redis_redata, redis_err = redis:get(cur_redis_key)
    -- redis缓存数据不为nil值 返回
    if redis_redata ~= nil and redis_redata ~= ngx.null then
        redis:expire('lua:dynamic_uri_pool:'..cur_url_md5, rule_data["limit_dynamic_timeout"])
        ngx.header["Content-Type"] = "application/json; charset=utf-8"
        ngx.say(redis_redata)
        return ngx.exit(200)
    end
end
```

- 6. 上一步提到接口数据从redis中来，那么就需要一个定时器进行接口数据的更新。具体流程就是从redis中拿出所有需要更新的接口地址（含参数），然后往业务系统进行请求获取数据（当前操作需要注意下，业务系统需要留一个白名单，确保lua发起的接口请求能够跳过验签），拿到业务系统的数据后更新redis缓存。

代码如下：
```lua
-- 加载动态数据
local function timer_load_dynamic_data()
    -- 连接redis，判断redis中是否有值
    local redis_cnf = {
        ip = redis_host,
        port = redis_port,
        auth = redis_auth,
        poolsize = redis_poolsize
    }
    local redis = require('resty.redis_pool'):new(redis_cnf)
    
    local redis_redata, redis_err = redis:smembers('lua:dynamic_urls')
    
    if redis_err ~= nil then
        do return '' end
    end

    for i = 1, #redis_redata do
        local cur_url = redis_redata[i]
        local cur_url_md5 = ngx.md5(cur_url)
        
        local redis_pool_uri, redis_pool_uri_err = redis:get('lua:dynamic_uri_pool:'..cur_url_md5)
        
        local cur_redis_key = 'lua:dynamic_redata:'..cur_url_md5
        
        if redis_pool_uri == ngx.null then
            redis:del(cur_redis_key)
            redis:srem('lua:dynamic_urls', cur_url)
        else
            -- 获取动态数据URL数值            
            local httpc = http.new()
            httpc:set_timeout(10000)
            local res, err = httpc:request_uri(cur_url)
        
            if err ~= nil then
                do return "" end
            end
            
            if res and res.status == 200 then
                local body = res.body
                if body ~= nil then
                    redis:set(cur_redis_key, body)
                end
            end
        end
        
    end
end

-- 定时刷新动态数据缓存
function _M.dynamic_timer_worker()
    timer_init(1, timer_load_dynamic_data)
end
```

- 7. nginx+lua定时器函数如下：
```lua
-- 定时器函数
local function timer_init(timer_span, routine_func, ...)
    if timer_span == 0 then
        timer_span = 1
    end
    local delay = 0
    local ok, err = new_timer(delay, timer_routine_boot, timer_span, routine_func, ...)
    if not ok then
        local b = ngx.worker.exiting()
        return
    end
end
```

- 8. 经过以上步骤的实现，整个nginx+lua+redis的动态托底组件已基本完成，接下来只要在服务的nginx配置文件中加载组件就可以实际运行起来，配置demo如下：
```nginx
lua_shared_dict my_limit_req_store 500m;
lua_shared_dict limit_rules 500m;
lua_socket_log_errors off;
init_worker_by_lua '
    local alr = require "limit_test_v2"
    alr.timer_worker()
alr.dynamic_timer_worker()
';
```

在要启用的项目的nginx的conf中新增
```nginx
access_by_lua ' 
    local alr = require "limit_test_v2" 
    alr.access_limit() 
';
```

## 4. 总结
从以上描述可以看到， 该组件对目标系统无任何侵入性;使用简单，只需要在Nginx层做一些简单的配置;并且只要Nginx、redis不挂，目标系统即使挂掉只要redis中缓存有效仍然可以提供服务。整体思路其实很简单，就是在目标系统外加一层代理，然后我们就可以在代理层做各种事情。
目前示例项目已测试使用，示例 GIT 地址：https://git.example.com/demo-project/lua-cache.git

## 5. 参考资料
- https://dbaplus.cn/news-21-678-1.html?hmsr=toutiao.io
- https://www.cnblogs.com/aoeiuv/p/6856056.html
- https://www.jianshu.com/p/e3cf5b92c370
