# 自定义监控 mysql

:::warning
所有模板在克隆之后修改为**zabbix客户端(主动式)**

1. 配置 -> 模板 -> 修改名称为 `SJFY: MySQL by Zabbix agent` -> 设置分组为 `SJFY`
2. 选择克隆出来的模板
3. 选择监控项
4. 选择所有类型为**zabbix客户端**的监控项
5. 点击批量更新，修改类型为**zabbix客户端(主动式)**

:::

## 新建 mysql 配置文件

1. 新建 mysql 配置文件

    ```bash
    vim /usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/mysql-params.conf
    ```

   加入下面内容：

    ```vim
    UserParameter=mysql.version,/usr/local/mysql8.0/bin/mysql -V
    UserParameter=mysql.ping,/usr/local/mysql8.0/bin/mysqladmin --defaults-file=/usr/local/zabbix5.4/scripts/mysql.conf ping | grep -c alive
    UserParameter=mysql.status[*],/usr/local/zabbix5.4/scripts/mysqlmonitor.sh $1 $2
    UserParameter=mysql.slave_status,mysql --defaults-file=/usr/local/zabbix5.4/scripts/mysql.conf -e "show slave status \G;" 2>&1 |grep -E 'Slave_IO_Running:|Slave_SQL_Running:' |grep -c Yes
    ```

   :::tip

   对于 mysql8.0 版本:

   将`--defaults-file='/usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/.my.cnf'`

   修改为`--defaults-extras-file='/usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/.my.cnf'`
   :::

2. 新建数据库连接文件

    ```bash
    vim /usr/local/zabbix5.4/scripts/mysql.conf
    ```

   写入下面内容：

    ```toml
    [client]
    host=127.0.0.1
    user='zabbix_monitor'
    password='zabbix_monitor'
    socket = /tmp/mysql.sock
    
    [mysql]
    user='zabbix_monitor'
    password='zabbix_monitor'
    
    [mysqladmin]
    user='zabbix_monitor'
    password='zabbix_monitor'
    ```

   :::tip
   数据库连接用户 zabbix_monitor 为新建用户，也可以使用已经存在的用户进行监控。

    ```SQL
    CREATE USER 'zbx_monitor'@'%' IDENTIFIED BY '<password>';
    GRANT REPLICATION CLIENT,PROCESS,SHOW DATABASES,SHOW VIEW ON *.* TO 'zbx_monitor'@'%';
    ```

   :::

3. 新建脚本文件

      ```bash
      mkdir /usr/local/zabbix5.4/scripts
      
      chown -R zabbix:zabbix /usr/local/zabbix5.4/scripts
      ```

   写入下面内容：

      ```shell
      #/bin/bash
      DEF="--defaults-file=/usr/local/zabbix5.4/scripts/mysql.conf"
      MYSQL='/usr/local/mysql8.0/bin/mysql'
      MYSQL_ADMIN='/usr/local/mysql8.0/bin/mysqladmin'
      ARGS=1 
      if [ $# -ne "$ARGS" ];then 
          echo "Please input one arguement:" 
      fi 
      case $1 in 
          Uptime)
              result=`${MYSQL_ADMIN} $DEF status|cut -f2 -d":"|cut -f1 -d"T"` 
              echo $result 
          ;; 
          Com_update) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_update"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Slow_queries) 
              result=`${MYSQL_ADMIN} $DEF status |cut -f5 -d":"|cut -f1 -d"O"` 
              echo $result 
          ;; 
          Com_select) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_select"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Com_rollback) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_rollback"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Questions) 
              result=`${MYSQL_ADMIN} $DEF status|cut -f4 -d":"|cut -f1 -d"S"` 
              echo $result 
          ;; 
          Com_insert) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_insert"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Com_delete) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_delete"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Com_commit) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_commit"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Bytes_sent) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Bytes_sent" |cut -d"|" -f3` 
              echo $result 
          ;; 
          Bytes_received) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Bytes_received" |cut -d"|" -f3` 
              echo $result 
          ;; 
          Com_begin) 
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Com_begin"|cut -d"|" -f3` 
              echo $result 
          ;; 
          Max_connections)
              result=`${MYSQL} $DEF -e 'show variables like "%max_connections%";' |grep -w max_connections |cut -f2`
              echo $result
          ;;
          Connections)
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Connections"|cut -d"|" -f3`
              echo $result
          ;;
          Threads_connected)
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Threads_connected"|cut -d"|" -f3`
              echo $result
          ;;
          Max_used_connections)
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Max_used_connections"|cut -d"|" -f3`
              echo $result
          ;;
          Innodb_row_lock_time)
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Innodb_row_lock_time"|cut -d"|" -f3`
              echo $result
          ;;
          Innodb_row_lock_time_max)
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Innodb_row_lock_time_max"|cut -d"|" -f3`
              echo $result
          ;;
          Innodb_row_lock_waits)
              result=`${MYSQL_ADMIN} $DEF extended-status |grep -w "Innodb_row_lock_waits"|cut -d"|" -f3`
              echo $result
          ;;
          *) 
              echo "Usage:$0(Uptime|Com_update|Slow_queries|Com_select|Com_rollback|Questions)" 
          ;; 
      esac
      ```

      ```bash
      vim /usr/local/zabbix5.4/scripts/slowlogmonitor.sh
      ```

      ```shell
      #!/bin/bash
      # for zabbix php-fpm slowlog monitor
      # 2020-08-27
      
      # 关键词过滤函数(三个输入参数分别为关键词、关键词到日志段开头行数、关键词到日志段结尾行数)
      function KeywordFilter {
          ROW_NUMBER=`sed -n -e "/$1/=" ${SLOWLOGFILE}.TMP |sort -rn`      #获取关键词行数，倒序排列
      
          for i in ${ROW_NUMBER}                                           #从后向前剔除关键词日志段
          do
              begin=$[i-$2]                                                #日志段开头
              end=$[i+$3]                                                  #日志段结尾
              if [ ${begin} -gt 0 ];then                                   #考虑文件开头日志段是否完整的情况
                  sed -i "${begin},${end}d" ${SLOWLOGFILE}.TMP
              else
                  sed -i "1,${end}d" ${SLOWLOGFILE}.TMP
              fi
          done
      }
      
      # mysql慢日志采集函数
      function slowlogcheck-mysql {
          [ ! -f ${TMPFILE} ] && touch ${TMPFILE} && chmod 777 ${TMPFILE}  #创建临时文件，提供给zabbix读取
      
          if [ -s ${SLOWLOGFILE} ];then                                    #考虑慢日志文件不存在zabbix误报情况
              tail -50 ${SLOWLOGFILE} > ${TMPFILE}                         #截取最新50行日志
          fi
      
          cat ${TMPFILE}
      }
      
      
      case $1 in
          'php-fpm71')
              SLOWLOGFILE=/var/log/php/fpm-php71.slow.log
              TMPFILE=/tmp/php-fpm71-slowlog.tmp
              slowlogcheck-php-fpm
          ;;
          'php-fpm73')
              SLOWLOGFILE=/var/log/php/fpm-php73.slow.log
              TMPFILE=/tmp/php-fpm73-slowlog.tmp
              slowlogcheck-php-fpm
          ;;
          'mysql')
              SLOWLOGFILE=/data/mysql/localhost-slow.log
              TMPFILE=/tmp/mysql-slowlog.tmp
              slowlogcheck-mysql
          ;;
      esac
      ```

   修改脚本权限：

      ```bash
      chown zabbix:zabbix /usr/local/zabbix5.4/scripts/mysqlmonitor.sh
      chown zabbix:zabbix /usr/local/zabbix5.4/scripts/slowlogmonitor.sh
        
      chmod +x /usr/local/zabbix5.4/scripts/mysqlmonitor.sh
      chmod +x /usr/local/zabbix5.4/scripts/slowlogmonitor.sh
      ```

4. 重启 zabbix agent 服务

   ```bash
   systemctl restart zabbix-agentd
   ```

## Zabbix web 界面配置

> 在**配置 -> 主机**进行配置

1. 选择需要监控的 Mysql 服务器
2. 选择模板为 `SJFY: MySQL by Zabbix agent`