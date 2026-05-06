# 自定义监控 Nginx

:::warning
所有模板在克隆之后修改为**zabbix客户端(主动式)**

1. 配置 -> 模板 -> 修改名称为 `SJFY: Nginx by Zabbix agent` -> 设置分组为 `SJFY`
2. 选择克隆出来的模板
3. 选择监控项
4. 选择所有类型为**zabbix客户端**的监控项
5. 点击批量更新，修改类型为**zabbix客户端(主动式)**

:::

## 修改 Nginx 的配置文件

1. 新增 nginx 的 `status.conf` 文件

   ```bash
   vim /usr/local/nginx1.24/conf.d/status.conf
   ```

   ```nginx configuration
   server {
       listen 80 default_server;
       server_name localhost;
       
       location /nginx_status {
           stub_status on;
           allow 127.0.0.1;
           allow ::1;
           deny all;
       }
   }
   ```

2. 验证是否获得数据

   ```bash
   curl 127.0.0.1/nginx_status
   ```

   获得数据如下：

   ```bash
   Active connections: 2
   server accepts handled requests
    15 15 21
   Reading: 0 Writing: 1 Waiting: 1
   ```

3. 在服务器重启 nginx 服务

    ```bash
    systemctl restart nginx
    ```

## 添加脚本

1. 添加 nginx status 状态脚本

   ```bash
   vim /usr/local/zabbix5.4/scripts/nginxstatus.sh
   ```

   写入下面内容：

   ```shell
   HOST="127.0.0.1"
   PORT="80"
   
   #服务运行状态
   function ping {
       /sbin/pidof nginx | wc -l
   }
   
   #当前活跃连接数
   function active {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| grep 'Active' | awk '{print $NF}'
   }
   
   #读取到客户端的Header信息数
   function reading {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| grep 'Reading' | awk '{print $2}'
   }
   
   #返回给客户端Header信息数
   function writing {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| grep 'Writing' | awk '{print $4}'
   }
   
   #已经处理完正在等候下一次请求指令的驻留链接数
   function waiting {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| grep 'Waiting' | awk '{print $6}'
   }
   
   #服务启动后接收的总连接数
   function accepts {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| awk NR==3 | awk '{print $1}'
   }
   #服务启动后处理的总连接数
   function handled {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| awk NR==3 | awk '{print $2}'
   }
   
   #服务启动后处理的总请求数
   function requests {
       /usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| awk NR==3 | awk '{print $3}'
   }
   
   #服务启动后丢弃的总连接数
   function dropped {
       local conn=(`/usr/bin/curl --insecure "http://$HOST:$PORT/nginx_status/" 2>/dev/null| awk NR==3 | awk '{print $1,$2
   }'`)
       expr ${conn[0]} - ${conn[1]}
   }
   
   case $1 in
       active)
           active
       ;;
       reading)
           reading
       ;;
       writing)
           writing
       ;;
       waiting)
           waiting
       ;;
       accepts)
           accepts
       ;;
       ping)
           ping
       ;;
       handled)
           handled
       ;;
       requests)
           requests
       ;;
       dropped)
           dropped
       ;;
   esac
   ```

2. 在 zabbix 中添加 nginx 配置文件

   ```bash
   vim /usr/local/zabbix5.4/etc/zabbix_agentd.conf.d/nginx.conf
   ```

   写入下面内容：

   ```shell
   UserParameter=nginx.status[*],/usr/local/zabbix5.4/scripts/nginxstatus.sh $1
   ```

3. 修改脚本文件权限

   ```bash
   chown -R zabbix:zabbix /usr/local/zabbix5.4/scripts
   
   chmod +X /usr/local/zabbix5.4/scripts/nginxstatus.sh
   ```

4. 重启 zabbix agent 服务

   ```bash
   systemctl restart zabbix-agentd
   ```

## 配置 zabbix web 界面

> 在**配置 -> 主机**中进行配置：

1. 选择需要监控的 Nginx 服务器
2. 选择模板为 `SJFY: Nginx by zabbix agent`
3. 新建宏：
    - `{$NGINX.STUB_STATUS.HOST}`：值为 127.0.0.1
    - `{$NGINX.STUB_STATUS.PATH}`：值为 nginx_status （与 nginx 配置文件中一致）