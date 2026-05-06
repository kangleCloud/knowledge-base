# 自定义监控 redis

:::warning

所有模板在克隆之后修改为**zabbix客户端(主动式)**

1. 配置 -> 模板 -> 修改名称为 `SJFY: Redis by Zabbix agent` -> 设置分组为 `SJFY`
2. 选择克隆出来的模板
3. 选择监控项
4. 选择所有类型为**zabbix客户端**的监控项
5. 点击批量更新，修改类型为**zabbix客户端(主动式)**

:::

## zabbix 5.4版本服务器设置

1. 创建 redis 监控脚本
    ```bash
    vim /usr/local/zabbix5.4/scripts/redis_monitor.sh 
    ```

   写入下面内容：

   :::warning
   脚本文件中的路径请根据实际情况进行修改
   :::

    ```shell
    #! /bin/bash
    #redis monitor
    
    REDISCLI="/home/redis-4.0.10/src/redis-cli" 
    HOST="127.0.0.1"
    PORT="6379"
    PASSWD="3KxiE7"
    
    case $1 in
        #连接的客户端数量
        connected_clients)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "connected_clients" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #由于达到maxclients而被拒绝的连接数
        rejected_connections)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "rejected_connections" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #服务运行以来的总客户端连接数
        total_connections_received)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "total_connections_received" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #客户端最大连接数
        maxclients)
            result=`$REDISCLI -h $HOST -p $PORT config get maxclients |awk NR==2 |awk '{print $1}'`
            echo $result
        ;;    
        #阻塞的客户端数量
        blocked_clients)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "blocked_clients" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #最大可用物理内存
        maxmemory)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "maxmemory" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #服务使用内存
        used_memory)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_memory" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #系统给redis分配的内存
        used_memory_rss)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_memory_rss" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #内存使用的峰值
        used_memory_peak)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_memory_peak" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #lua引擎使用的内存
        used_memory_lua)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_memory_lua" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #内存碎片率(used_memory_rss和used_memory之间的比率，小于1表示使用了swap，大于1表示碎片比较多)
        mem_fragmentation_ratio)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "mem_fragmentation_ratio" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #命中次数
        keyspace_hits)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "keyspace_hits" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #没命中次数
        keyspace_misses)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "keyspace_misses" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #redis主进程在核心态所占用的cpu
        used_cpu_sys)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_cpu_sys" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #redis主进程在用户态所占用的cpu
        used_cpu_user)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_cpu_user" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #后台进程的核心态cpu使用率
        used_cpu_sys_children)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_cpu_sys_children" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #后台进程的用户态cpu使用率
        used_cpu_user_children)
            result=`$REDISCLI -h $HOST -p $PORT info | grep -w "used_cpu_user_children" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #最近一次rdb持久化的状态
        rdb_last_bgsave_status)
            result=`$REDISCLI -h $HOST -p $PORT info  | grep -w "rdb_last_bgsave_status" | awk -F':' '{print $2}' | grep -c ok`
            echo $result
        ;;
        #最近一次aof bgrewrite的状态
        aof_last_bgrewrite_status)
            result=`$REDISCLI -h $HOST -p $PORT info  | grep -w "aof_last_bgrewrite_status" | awk -F':' '{print $2}' | grep -c ok`
            echo $result
        ;;
        #最近一次aof写入状态
        aof_last_write_status)
            result=`$REDISCLI -h $HOST -p $PORT info  | grep -w "aof_last_write_status" | awk -F':' '{print $2}' | grep -c ok`
            echo $result
        ;;
        #服务启动后处理的总命令数
        total_commands_processed)
            result=`$REDISCLI -h $HOST -p $PORT info  | grep -w "total_commands_processed" | awk -F':' '{print $2}'`
            echo $result
        ;;
        #每秒执行的命令个数(qps)
        instantaneous_ops_per_sec)
            result=`$REDISCLI -h $HOST -p $PORT info  | grep -w "instantaneous_ops_per_sec" | awk -F':' '{print $2}'`
            echo $result
        ;;
        *)
            echo -e "\033[33mUsage: $0 {connected_clients|blocked_clients|used_memory|used_memory_rss|used_memory_peak|used_memory_lua|used_cpu_sys|used_cpu_user|used_cpu_sys_children|used_cpu_user_children|rdb_last_bgsave_status|aof_last_bgrewrite_status|aof_last_write_status}\033[0m" 
        ;;
    esac
    ```

2. 给予脚本运行权限
    ```bash
    chmod +x /usr/local/zabbix5.4/scripts/redis_monitor.sh
    ```

3. 修改脚本的用户组

    ```bash
    chown -R zabbix:zabbix /usr/local/zabbix5.4/scripts/redis_monitor.sh
    ```

## 新增 zabbix 配置文件

```bash
vim /usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/redis.conf
```

写入下面内容：

```shell
UserParameter=Redis.Info[*],/usr/local/zabbix/scripts/redismonitor.sh $1 $2 2>/dev/null
UserParameter=Redis.Status,(/home/redis-4.0.10/src/redis-cli -p 6379 ping)2>/dev/null |grep -c PONG   
```

:::warning
配置文件中的路径请根据实际情况进行修改
:::

## 配置 zabbix web 界面

> 在**配置 -> 主机**中进行配置：

1. 选择需要监控的 redis 服务器
2. 选择模板为 `SJFY: Redis by zabbix agent`