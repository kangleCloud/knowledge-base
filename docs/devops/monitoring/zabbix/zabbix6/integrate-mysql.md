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
    vim /usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/mysql.conf
    ```

   加入下面内容：

    ```vim
    UserParameter=mysql.ping[*], /usr/local/mysql/bin/mysqladmin --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf' -h"$1" -P"$2" ping
    UserParameter=mysql.get_status_variables[*], /usr/local/mysql/bin/mysql --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf'  -h"$1" -P"$2" -sNX -e "show global status"
    UserParameter=mysql.db.discovery[*], /usr/local/mysql/bin/mysqli --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf'  -h"$1" -P"$2" -sN -e "show databases"
    UserParameter=mysql.dbsize[*], /usr/local/bin/mysql --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf'  -h"$1" -P"$2" -sN -e "SELECT COALESCE(SUM(DATA_LENGTH + INDEX_LENGTH),0) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='$3'"
    UserParameter=mysql.replication.discovery[*], /usr/local/mysql/bin/mysql --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf' -h"$1" -P"$2" -sNX -e "show slave status"
    UserParameter=mysql.slave_status[*], /usr/local/mysql/bin/mysql --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf' -h"$1" -P"$2" -sNX -e "show slave status"
    UserParameter=mysql.version[*],/usr/local/mysql/bin/mysqladmin --defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf' -h"$1" -P"$2" version
    ```

   :::tip

   对于 mysql8.0 版本:

   将`--defaults-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf'`

   修改为`--defaults-extras-file='/usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf'`
   :::

2. 新建数据库连接文件

    ```bash
    vim /usr/local/zabbix6.0/etc/zabbix_agentd.conf.d/.my.cnf
    ```

   写入下面内容：

    ```toml
    [client]
    host=127.0.0.1
    user='<MONITOR_USER>'
    password='<PASSWORD>'
    socket = /tmp/mysql.sock
    
    [mysql]
    user='<MONITOR_USER>'
    password='<PASSWORD>'
    
    [mysqladmin]
    user='<MONITOR_USER>'
    password='<PASSWORD>'
    ```

   :::tip
   数据库连接用户建议使用专用监控账号，也可以使用已有的最小权限账号进行监控。

    ```SQL
    CREATE USER 'zbx_monitor'@'%' IDENTIFIED BY '<password>';
    GRANT REPLICATION CLIENT,PROCESS,SHOW DATABASES,SHOW VIEW ON *.* TO 'zbx_monitor'@'%';
    ```

   :::

3. 重启 zabbix agent 服务

   ```bash
   systemctl restart zabbix-agentd
   ```

## Zabbix web 界面配置

> 在**配置 -> 主机**进行配置

1. 选择需要监控的 Mysql 服务器
2. 选择模板为 `SJFY: MySQL by Zabbix agent`
