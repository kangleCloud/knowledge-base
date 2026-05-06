# 自定义监控 Nginx

:::warning
所有模板在克隆之后修改为**zabbix客户端(主动式)**

1. 配置 -> 模板 -> 修改名称为 `SJFY: Nginx by Zabbix agent` -> 设置分组为 `SJFY`
2. 选择克隆出来的模板
3. 选择监控项
4. 选择所有类型为**zabbix客户端**的监控项
5. 点击批量更新，修改类型为**zabbix客户端(主动式)**

:::

## Zabbix 6.0 版本服务器设置

### 修改 Nginx 的配置文件

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