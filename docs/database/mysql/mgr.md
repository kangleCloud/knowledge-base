# MySQL 组复制集群搭建

- https://downloads.mysql.com/archives/community/
- https://dev.mysql.com/downloads/mysql/

:::warning 注意
- 所有源码包下载到 /usr/local/src 中，每次安装应使用最新稳定版
- 本文搭建过程基于 openEuler 22.03 LTS 及 MySQL 5.7.40，是否兼容 CentOS 或 MySQL 8.0.*，有待验证
:::

## 一、组复制集群搭建

### 1.1 单主模式搭建

#### 1.1.1 集群环境

| IP           | 角色    | 主机名      | Server ID | 数据库版本   | 操作系统版本        |
| ------------ | ------- | ----------- | --------- | ------------ | ------------------- |
| 192.168.0.21 | master  | mysql-mgr-1 | 21        | MySQL 5.7.40 | openEuler 22.03 LTS |
| 192.168.0.22 | slave-1 | mysql-mgr-2 | 22        | MySQL 5.7.40 | openEuler 22.03 LTS |
| 192.168.0.23 | slave-2 | mysql-mgr-3 | 23        | MySQL 5.7.40 | openEuler 22.03 LTS |

#### 1.1.2 环境配置

1. **关闭防火墙及 selinux**

   <font color="red">若服务器初始化时已关闭，则可跳过该步骤。</font>

   ```bash
   systemctl stop firewalld && systemctl disable firewalld
   sed -i 's/=enforcing/=disabled/g' /etc/selinux/config  && setenforce 0
   ```

2. **配置时钟同步**

   <font color="red">若服务器初始化时已配置，则可跳过该步骤。</font>

   安装 ntp：

   ```bash
   yum install -y ntp
   ```

   配置定时任务：

   ```bash
   crontab -l >~/crontab.bak
   echo -e "# 时钟同步\n*/30 * * * * /usr/sbin/ntpdate ntp.sjtu.edu.cn" >>~/crontab.bak
   crontab ~/crontab.bak
   ```

3. **修改主机名**

   master 节点执行：

   ```bash
   hostnamectl set-hostname mysql-mgr-1
   ```

   slave-1 节点执行：

   ```bash
   hostnamectl set-hostname mysql-mgr-2
   ```

   slave-2 节点执行：

   ```bash
   hostnamectl set-hostname mysql-mgr-3
   ```

   退出终端重新连接，可看到主机名已修改。

4. **配置 host**

   所有节点执行：

   ```bash
   cat << EOF >> /etc/hosts
   
   # MySQL MGR 集群使用
   192.168.0.21 mysql-mgr-1
   192.168.0.22 mysql-mgr-2
   192.168.0.23 mysql-mgr-3
   EOF
   ```

#### 1.1.3 安装 MySQL

见 MySQL 5.7 安装；

#### 1.1.4 修改配置文件

修改各节点的配置文件：

```bash
vim /etc/my.cnf
```

新增如下配置：

```bash
# binlog相关配置
server_id=21
binlog_format=ROW

# MGR相关
gtid_mode=ON
enforce_gtid_consistency=ON
binlog_checksum=NONE
transaction_write_set_extraction=XXHASH64
loose-group_replication_group_name='178f73cc-5fbf-4d99-bf9d-ee5010ff9a43'
loose-group_replication_start_on_boot=OFF
loose-group_replication_local_address='192.168.0.21:33061'
loose-group_replication_group_seeds='192.168.0.21:33061,192.168.0.22:33061,192.168.0.23:33061'
loose-group_replication_bootstrap_group=OFF
loose-group_replication_ip_whitelist='192.168.0.0/24'
```

> **注：**
>
> 1. `binlog_format`需调整为 ROW；
> 2. `loose-group_replication_group_name`参数的 UUID 可通过在服务器使用`cat /proc/sys/kernel/random/uuid`命令生成；
> 3. 各节点配置除`server_id`与`loose-group_replication_local_address`参数需调整外 ，其他均配置一致。

重启 MySQL：

```bash
/etc/init.d/mysqld restart
```

#### 1.1.5 搭建 MGR 集群

1. **安装组复制插件**

   各节点登录后执行：

   ```sql
   mysql> INSTALL PLUGIN group_replication SONAME 'group_replication.so';
   ```

   查看插件安装情况：

   ```sql
   mysql> SHOW PLUGINS;
   +----------------------------+----------+--------------------+----------------------+---------+
   | Name                       | Status   | Type               | Library              | License |
   +----------------------------+----------+--------------------+----------------------+---------+
   | binlog                     | ACTIVE   | STORAGE ENGINE     | NULL                 | GPL     |
   ... 省略 ...
   | ARCHIVE                    | ACTIVE   | STORAGE ENGINE     | NULL                 | GPL     |
   | ngram                      | ACTIVE   | FTPARSER           | NULL                 | GPL     |
   | group_replication          | ACTIVE   | GROUP REPLICATION  | group_replication.so | GPL     |
   +----------------------------+----------+--------------------+----------------------+---------+
   45 rows in set (0.00 sec)
   ```

   可见插件已经安装成功。

2. **创建复制账号**

   ```sql
   mysql> GRANT REPLICATION SLAVE ON *.* TO repl@'%' IDENTIFIED BY '<REPLICATION_PASSWORD>';
   mysql> FLUSH PRIVILEGES;
   ```

3. **清理 binlog**

   配置集群同步前清空各节点的 binlog 日志。因创建的复制账号权限较低，当 binlog 日志中有类似创建用户及用户授权的命令时，复制将出错；
   **视情况，确保清空 binlog 后不会损失数据后，再执行**：

   ```sql
   mysql> RESET MASTER;
   ```

   > **注：**
   >
   > 也可在执行创建用户命令前执行`SET SQL_LOG_BIN=0;`命令停止记录 binlog，创建用户后再使用`SET SQL_LOG_BIN=1;`命令开启日志记录。

4. **构建 MGR 集群**

   - **master 节点**

     把 mysql-mgr-1 节点作为初始 master 节点，在该节点执行以下命令。

     声明 MGR 集群信息：

     ```sql
     mysql> CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='<REPLICATION_PASSWORD>' FOR CHANNEL 'group_replication_recovery';
     ```

     启动引导模式，表示后加入集群的服务器以此台服务器为基准：

     ```sql
     mysql> SET GLOBAL group_replication_bootstrap_group=ON;
     ```

     启动组复制同步：

     ```sql
     mysql> START GROUP_REPLICATION;
     ```

     集群启动后，关闭引导模式：

     ```sql
     mysql> SET GLOBAL group_replication_bootstrap_group=OFF;
     ```

     查看集群状态：

     ```sql
     mysql> SELECT * FROM performance_schema.replication_group_members;
     ```

   - **slave 节点**

     把 mysql-mgr-2 和 mysql-mgr-3 节点作为初始 slave 节点，在这两个节点分别执行以下命令。

     声明 MGR 集群信息：

     ```sql
     mysql> CHANGE MASTER TO MASTER_USER='repl', MASTER_PASSWORD='<REPLICATION_PASSWORD>' FOR CHANNEL 'group_replication_recovery';
     ```

     启动组复制同步：

     ```sql
     mysql> START GROUP_REPLICATION;
     ```

     查看集群状态：

     ```sql
     mysql> SELECT * FROM performance_schema.replication_group_members;
     ```

#### 1.1.6 查看集群状态

```sql
mysql> SELECT * FROM performance_schema.replication_group_members;
+---------------------------+--------------------------------------+-------------+-------------+--------------+
| CHANNEL_NAME              | MEMBER_ID                            | MEMBER_HOST | MEMBER_PORT | MEMBER_STATE |
+---------------------------+--------------------------------------+-------------+-------------+--------------+
| group_replication_applier | c19d3718-b187-11ed-8cd6-000c294af696 | mysql-mgr-1 |        3306 | ONLINE       |
| group_replication_applier | d02752a0-b189-11ed-9f3f-000c2983d9b5 | mysql-mgr-2 |        3306 | ONLINE       |
| group_replication_applier | d62d339f-b189-11ed-9f02-000c296cdc84 | mysql-mgr-3 |        3306 | ONLINE       |
+---------------------------+--------------------------------------+-------------+-------------+--------------+
3 rows in set (0.00 sec)
```

如上，各节点状态均为“ONLINE”，表示组复制同步环境搭建完成。

### 1.2 多主模式搭建

搭建方式与单主模式一致，仅配置文件中需增加如下两行：

```bash
# 多主模式下增加如下两条配置
group_replication_single_primary_mode=OFF
group_replication_enforce_update_everywhere_checks=ON
```

## 二、ProxySQL 代理安装

MGR 本身无法做到无感知切换，通过和 ProxySQL 一起使用，来实现集群节点的动态切换及读写分类等。

### 2.1 安装 ProxySQL

1. **获取安装包**

   ```bash
   cd /usr/local/src
   wget https://github.com/sysown/proxysql/releases/download/v2.4.8/proxysql-2.4.8-1-centos7.x86_64.rpm
   ```

2. **安装 ProxySQL**

   ```bash
   yum install -y proxysql-2.4.8-1-centos7.x86_64.rpm
   ```

3. **启动 ProxySQL 并配置开机自启**

   ```bash
   systemctl start proxysql
   systemctl enable proxysql
   ```

4. **测试**

   登录 ProxySQL 管理端口并查看信息：

   ```sql
   [root@mysql-mgr-1 src]# mysql -P6032 -h127.0.0.1 -uadmin -padmin --prompt='proxysql> '
   mysql: [Warning] Using a password on the command line interface can be insecure.
   Welcome to the MySQL monitor.  Commands end with ; or \g.
   Your MySQL connection id is 1
   Server version: 5.5.30 (ProxySQL Admin Module)
   
   Copyright (c) 2000, 2022, Oracle and/or its affiliates.
   
   Oracle is a registered trademark of Oracle Corporation and/or its
   affiliates. Other names may be trademarks of their respective
   owners.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   proxysql> show databases;
   +-----+---------------+-------------------------------------+
   | seq | name          | file                                |
   +-----+---------------+-------------------------------------+
   | 0   | main          |                                     |
   | 2   | disk          | /var/lib/proxysql/proxysql.db       |
   | 3   | stats         |                                     |
   | 4   | monitor       |                                     |
   | 5   | stats_history | /var/lib/proxysql/proxysql_stats.db |
   +-----+---------------+-------------------------------------+
   5 rows in set (0.00 sec)
   ```

### 2.2 配置 MGR 集群（以单主模式为例）

在主节点执行以下操作。

1. **创建 ProxySQL 相关用户**

   创建 monitor 用户，用于 ProxySQL 获取集群状态：

   ```sql
   mysql> CREATE USER 'monitor'@'%' IDENTIFIED BY '<MONITOR_PASSWORD>';
   mysql> GRANT SELECT ON sys.* TO 'monitor'@'%';
   ```

   创建 proxysql 用户，用于客户端及 ProxySQL 访问集群：

   ```sql
   mysql> CREATE USER 'proxysql'@'%' IDENTIFIED BY '<PROXYSQL_PASSWORD>';
   mysql> GRANT ALL PRIVILEGES ON *.* TO 'proxysql'@'%';
   ```

   刷新权限：

   ```sql
   mysql> FLUSH PRIVILEGES;
   ```

   在各个节点确认用户已成功创建：

   ```sql
   mysql> SELECT * FROM mysql.user;
   ```

2. **创建函数及视图**

   运行以下 SQL：

   ```sql
   USE sys;
   
   DELIMITER $$
   
   CREATE FUNCTION IFZERO(a INT, b INT)
   RETURNS INT
   DETERMINISTIC
   RETURN IF(a = 0, b, a)$$
   
   CREATE FUNCTION LOCATE2(needle TEXT(10000), haystack TEXT(10000), offset INT)
   RETURNS INT
   DETERMINISTIC
   RETURN IFZERO(LOCATE(needle, haystack, offset), LENGTH(haystack) + 1)$$
   
   CREATE FUNCTION GTID_NORMALIZE(g TEXT(10000))
   RETURNS TEXT(10000)
   DETERMINISTIC
   RETURN GTID_SUBTRACT(g, '')$$
   
   CREATE FUNCTION GTID_COUNT(gtid_set TEXT(10000))
   RETURNS INT
   DETERMINISTIC
   BEGIN
     DECLARE result BIGINT DEFAULT 0;
     DECLARE colon_pos INT;
     DECLARE next_dash_pos INT;
     DECLARE next_colon_pos INT;
     DECLARE next_comma_pos INT;
     SET gtid_set = GTID_NORMALIZE(gtid_set);
     SET colon_pos = LOCATE2(':', gtid_set, 1);
     WHILE colon_pos != LENGTH(gtid_set) + 1 DO
        SET next_dash_pos = LOCATE2('-', gtid_set, colon_pos + 1);
        SET next_colon_pos = LOCATE2(':', gtid_set, colon_pos + 1);
        SET next_comma_pos = LOCATE2(',', gtid_set, colon_pos + 1);
        IF next_dash_pos < next_colon_pos AND next_dash_pos < next_comma_pos THEN
          SET result = result +
            SUBSTR(gtid_set, next_dash_pos + 1,
                   LEAST(next_colon_pos, next_comma_pos) - (next_dash_pos + 1)) -
            SUBSTR(gtid_set, colon_pos + 1, next_dash_pos - (colon_pos + 1)) + 1;
        ELSE
          SET result = result + 1;
        END IF;
        SET colon_pos = next_colon_pos;
     END WHILE;
     RETURN result;
   END$$
   
   CREATE FUNCTION gr_applier_queue_length()
   RETURNS INT
   DETERMINISTIC
   BEGIN
     RETURN (SELECT sys.gtid_count( GTID_SUBTRACT( (SELECT
   Received_transaction_set FROM performance_schema.replication_connection_status
   WHERE Channel_name = 'group_replication_applier' ), (SELECT
   @@global.GTID_EXECUTED) )));
   END$$
   
   CREATE FUNCTION gr_member_in_primary_partition()
   RETURNS VARCHAR(3)
   DETERMINISTIC
   BEGIN
     RETURN (SELECT IF( MEMBER_STATE='ONLINE' AND ((SELECT COUNT(*) FROM
   performance_schema.replication_group_members WHERE MEMBER_STATE != 'ONLINE') >=
   ((SELECT COUNT(*) FROM performance_schema.replication_group_members)/2) = 0),
   'YES', 'NO' ) FROM performance_schema.replication_group_members JOIN
   performance_schema.replication_group_member_stats USING(member_id));
   END$$
   
   CREATE VIEW gr_member_routing_candidate_status AS SELECT
   sys.gr_member_in_primary_partition() as viable_candidate,
   IF( (SELECT (SELECT GROUP_CONCAT(variable_value) FROM
   performance_schema.global_variables WHERE variable_name IN ('read_only',
   'super_read_only')) != 'OFF,OFF'), 'YES', 'NO') as read_only,
   sys.gr_applier_queue_length() as transactions_behind, Count_Transactions_in_queue as 'transactions_to_cert' from performance_schema.replication_group_member_stats;$$
   
   DELIMITER ;
   ```

   在 MGR 集群各个节点检查视图是否创建成功：

   ```sql
   mysql> SELECT * FROM sys.gr_member_routing_candidate_status;
   +------------------+-----------+---------------------+----------------------+
   | viable_candidate | read_only | transactions_behind | transactions_to_cert |
   +------------------+-----------+---------------------+----------------------+
   | YES              | NO        |                   0 |                    0 |
   +------------------+-----------+---------------------+----------------------+
   1 row in set (0.00 sec)
   ```

### 2.3 配置 ProxySQL

使用 MySQL 客户端连接 ProxySQL 管理端口 6032，执行以下操作。

1. **添加后端节点**

   ```sql
   proxysql> insert into mysql_servers(hostgroup_id,hostname,port,max_connections,comment) values(20,'192.168.0.21',3306,3000,'mysql-mgr-1');
   proxysql> insert into mysql_servers(hostgroup_id,hostname,port,max_connections,comment) values(20,'192.168.0.22',3306,3000,'mysql-mgr-2');
   proxysql> insert into mysql_servers(hostgroup_id,hostname,port,max_connections,comment) values(20,'192.168.0.23',3306,3000,'mysql-mgr-3');
   ```

   持久化配置：

   ```sql
   proxysql> load mysql servers to runtime;
   proxysql> save mysql servers to disk;
   ```

   查看结果：

   ```sql
   proxysql> select * from mysql_servers;
   ```

2. **配置分组信息**

   配置各 hostgroup 信息：

   ```sql
   insert into mysql_group_replication_hostgroups(writer_hostgroup,backup_writer_hostgroup,reader_hostgroup,offline_hostgroup,active,max_writers,writer_is_also_reader,max_transactions_behind) values(20,40,30,10,1,1,0,100);
   ```

   持久化配置;

   ```sql
   proxysql> load mysql servers to runtime;
   proxysql> save mysql servers to disk;
   ```

   查看结果：

   ```sql
   proxysql> select * from mysql_group_replication_hostgroups;
   ```

3. **配置监控账户**

   使用上述步骤中创建的 monitor 用户：

   ```sql
   proxysql> set mysql-monitor_username='monitor';
   proxysql> set mysql-monitor_password='<MONITOR_PASSWORD>';
   ```

   持久化配置：

   ```sql
   proxysql> load mysql variables to runtime;
   proxysql> save mysql variables to disk;
   ```

4. **配置对外访问账户**

   使用上述步骤中创建的 proxysql 用户：

   ```sql
   proxysql> insert into mysql_users(username,password,active,default_hostgroup,transaction_persistent)values('proxysql','<PROXYSQL_PASSWORD>',1,20,1);
   ```

   持久化配置：

   ```sql
   proxysql> load mysql users to runtime;
   proxysql> save mysql users to disk;
   ```

5. **配置路由规则实现读写分离**

   ```sql
   proxysql> insert into mysql_query_rules(rule_id,active,match_digest,destination_hostgroup,apply)values(1,1,'^SELECT.*FOR UPDATE$',20,1);
   proxysql> insert into mysql_query_rules(rule_id,active,match_digest,destination_hostgroup,apply)values(2,1,'^SELECT',30,1);
   ```

   持久化配置：

   ```sql
   proxysql> load mysql query rules to runtime;
   proxysql> save mysql query rules to disk;
   ```
