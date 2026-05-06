# 自定义监控 php-fpm

:::warning
所有模板在克隆之后修改为**zabbix客户端(主动式)**

1. 配置 -> 模板 -> 修改名称为 `SJFY: PHP-FPM by Zabbix agent` -> 设置分组为 `SJFY`
2. 选择克隆出来的模板
3. 选择监控项
4. 选择所有类型为**zabbix客户端**的监控项
5. 点击批量更新，修改类型为**zabbix客户端(主动式)**

:::

## zabbix 6.0版本服务器设置

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

## 配置 zabbix web 界面

> 在**配置 -> 主机**中进行配置：

1. 选择需要监控的 php 服务器
2. 选择模板为 `SJFY: PHP-FPM by zabbix agent`
3. 新建宏：
    - `{$PHP_FPM.HOST}`：值为 127.0.0.1
    - `{$PHP_FPM.PING.PAGE}`：值为 php_ping （与 nginx 配置文件中一致）
    - `{$PHP_FPM.STATUS.PAGE}`：值为 php_status （与 nginx 配置文件中一致）