# 自定义监控 php-fpm

:::warning
所有模板在克隆之后修改为**zabbix客户端(主动式)**

1. 配置 -> 模板 -> 修改名称为 `SJFY: PHP-FPM by Zabbix agent` -> 设置分组为 `SJFY`
2. 选择克隆出来的模板
3. 选择监控项
4. 选择所有类型为**zabbix客户端**的监控项
5. 点击批量更新，修改类型为**zabbix客户端(主动式)**

:::

## zabbix 5.4版本服务器设置

### 修改 php-fpm 配置文件

1. 修改 `www.conf` 文件
    ```bash
    vim /usr/local/php73/etc/php-fpm.d/www.conf
    ```

   加入下面内容：

    ```php
    pm.status_path = /php_status
    ping.path = /php_ping
    ```

2. 测试配置文件的可用行

    ```bash
    /usr/local/php73/sbin/php-fpm -t
    
    # 输出内容如下
    [06-Sep-2023 14:57:21] NOTICE: configuration file /usr/local/php7.3/etc/php-fpm.conf test is successful
    ```

3. 验证是否获取数据

    ```bash
    curl 127.0.0.1/php_status
    
    # 获得数据如下
    pool:                 www
    process manager:      static
    start time:           06/Sep/2023:14:35:24 +0800
    start since:          1653
    accepted conn:        633
    listen queue:         0
    max listen queue:     0
    listen queue len:     511
    idle processes:       799
    active processes:     1
    total processes:      800
    max active processes: 6
    max children reached: 0
    slow requests:        0
    ```

    ```bash
    curl 127.0.0.1/php_ping
    
    # 获得数据如下
    pong
    ```

4. 重新加载 php-fpm 服务

    ```bash
    systemctl reload php-fpm
    ```

### 修改 nginx 的配置文件

1. 修改配置文件

    ```bash
    vim /usr/local/nginx1.24/conf.d/status.conf
    ```

   ```nginx configuration
   # 新增下面的 location 模块
   location ~ ^/(php_status|php_ping)$ {
      fastcgi_pass 127.0.0.1:9000;
      fastcgi_index index.php;
      fastcgi_connect_timeout 180;
      fastcgi_read_timeout 600;
      fastcgi_send_timeout 600;
      fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
      include        fastcgi_params;
      allow 127.0.0.1;
      deny all;
   }
    ```

2. 重新加载 nginx 服务

    ```bash
    systemctl reload nginx
    ```

# 配置脚本文件

1. 配置 php 脚本

   ```bash
   vim /usr/local/zabbix5.4/scripts/php-fpm73_monitor.sh
   ```

   写入下面内容，按情况修改：

   ```shell
   #! /bin/sh
   #php-fpm monitor
   
   HOST="127.0.0.1"
   PORT="9073"
   
   case $1 in
       #php-fpm运行状态
       ping)
           netstat -ln |grep ${PORT} | wc -l
       ;;
       #php-fpm已运行了多少秒
       start_since)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==4{print $3}'
       ;;
       #当前pool接收的请求数
       conn)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==5{print $3}'
       ;;
       #当前处于等待状态中的连接数
       listen_queue)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==6{print $3}'
       ;;
       #服务从启动到当前，处于等待状态的连接数最大值
       max_listen_queue)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==7{print $4}'
       ;;
       #当前处于等待连接队列的套接字大小
       listen_queue_len)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==8{print $4}'
       ;;
       #当前处于空闲状态的进程数
       idle_processes)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==9{print $3}'
       ;;
       #当前处于活动状态的进程数
       active_processes)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==10{print $3}'
       ;;
       #总进程数量
       total_processes)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==11{print $3}'
       ;;
       #服务从启动到当前，最多有几个进程处于活动状态
       max_active_processes)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==12{print $4}'
       ;;
       #进程达到最大数量限制的次数
       max_children_reached)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==13{print $4}'
       ;;
       #服务慢请求次数
       slow_requests)
           /usr/bin/curl ${HOST}/php_status_73 2>/dev/null |awk 'NR==14{print $3}'  
       ;;
       *)
           echo "Usage: $0 {ping|start_since|conn|listen_queue|max_listen_queue|listen_queue_len|idle_processes|active_processes|total_processes|max_active_processes|max_children_reached|slow_requests}"
           exit 1
       ;;
   esac
   ```

   ```bash
   vim /usr/local/zabbix5.4/scripts/slowlog_monitor.sh
   ```

   写入下面内容：

   ```shell
   #!/bin/bash
   # for zabbix php-fpm slowlog monitor
   # 2022-08-31
   
   # 关键词过滤函数
   function filter-keyword {
       filename="$SLOWLOGFILE"
   
       # 定义关键字数组
       keywords="_get_token()"
   
       slowLog=`cat $filename | sed 's/^$/|/g'` 
       OLD_IFS="$IFS"
       IFS='|'
       slowLogArray=($slowLog)
   
       i=0
       filteredLog=''
       for keyword in keywords
       do
           for log in ${slowLogArray[@]}
           do
               if [[ "$log" =~ $keyword ]]; then
                   continue
               fi
               filteredLog="$filteredLog$log"
           done
   
           IFS="$OLD_IFS"
           echo "$filteredLog" > "$filename.filtered"
       done
   }
   
   # php-fpm慢日志采集函数
   function slowlogcheck-php-fpm {
       [ ! -f ${TMPFILE} ] && touch ${TMPFILE} && chmod 777 ${TMPFILE}  #创建临时文件，提供给zabbix读取
   
       if [ -s ${SLOWLOGFILE}.filtered ];then                                    #考虑慢日志文件不存在zabbix误报情况
           /usr/bin/cp -rf ${SLOWLOGFILE}.filtered ${SLOWLOGFILE}.TMP            #复制慢日志文件，过滤处理在该文件上进行
           [ -s ${SLOWLOGFILE}.TMP ] && tail -50 ${SLOWLOGFILE}.TMP > ${TMPFILE}     #若非空，则截取最新50行日志
       fi
   
       cat ${TMPFILE}
   }
   
   case $1 in
       'php-fpm71')
           SLOWLOGFILE=/data/log/php/php-fpm71.slow.log
           TMPFILE=/tmp/php-fpm71-slowlog.tmp
           slowlogcheck-php-fpm
       ;;
       'php-fpm72')
           SLOWLOGFILE=/data/log/php/php-fpm72.slow.log
           TMPFILE=/tmp/php-fpm72-slowlog.tmp
           slowlogcheck-php-fpm
       ;;
       'php-fpm73')
           SLOWLOGFILE=/data/log/php/php-fpm73.slow.log
           TMPFILE=/tmp/php-fpm73-slowlog.tmp
           slowlogcheck-php-fpm
       ;;
   esac
   ```

2. 增加 zabbix 中关于 php 的配置文件

   ```bash
   vim /usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/php-fpm.conf
   ```

   ```shell
   UserParameter=php_status_71[*],/bin/sh /usr/local/zabbix5.4/scripts/php-fpm73_monitor.sh $1
   ```

   ```bash
   vim /usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/slowlog.conf
   ```

   ```shell
   UserParameter=Slowlog.Info[*],/usr/local/zabbix5.4/scripts/slowlog_monitor.sh $1
   ```

3. 修改权限

   ```bash
   chown -R zabbix:zabbix /usr/local/zabbix5.4/scipts
   
   chmod +x /usr/local/zabbix5.4/scipts/php-fpm73_monitor.sh
   chmox +x /usr/local/zabbix5.4/scripts/slowlog_monitor.sh
   ```

4. 重启 zabbix agent 服务

   ```bash
   systemctl restart zabbix-agentd
   ```

## 配置 zabbix web 界面

> 在**配置 -> 主机**中进行配置：

1. 选择需要监控的 php 服务器
2. 选择模板为 `SJFY: PHP-FPM by zabbix agent`
3. 新建宏：
    - `{$PHP_FPM.HOST}`：值为 127.0.0.1
    - `{$PHP_FPM.PING.PAGE}`：值为 php_ping （与 nginx 配置文件中一致）
    - `{$PHP_FPM.STATUS.PAGE}`：值为 php_status （与 nginx 配置文件中一致）