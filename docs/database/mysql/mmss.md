# MySQL双主双从集群

## 先决条件

1. 安装 Mysql8.0 和 Keepalived，具体操作可以观看这两篇文章。

- <a href="/docs/database/mysql/install-mysql8" target="_blank">Mysql8.0 的安装</a>
- <a href="/docs/middleware/keepalived/install" target="_blank">Keepalived 的安装</a>

2. 在 mysql 内创建 repl 用户，并且给与 replication slave 权限

    ```bash
    mysql -uroot -p'<ROOT_PASSWORD>'
    ```

    ```sql
    create user 'repl'@'%' identified by '<REPLICATION_PASSWORD>';
    
    grant replication slave on *.* to 'repl'@'%';
    ```

3. 两台服务器内 `my.cnf` 配置文件中的 `server_id` 应保证是不一样的

    ```bash
    [mysqld]

    # Specifies the server ID
    server_id=1     # 两台服务器内应保证不一样         
    ```

## 配置 Mysql 主主同步

1. 备份主数据库1（在服务器1上操作）

    ```bash
    mysqldump -uroot -p'<ROOT_PASSWORD>' --routines --single-transaction --source-data=2 --no-autocommit -A > alldatas.sql
    ```

    查看 `alldatas.sql` 是否是最新生成的

    ```bash
    [root@host-192-168-150-106 ~]# ll
    total 30268
    -rw-r--r--  1 root root      631 Mar  9  2021 aliyum.txt
    -rw-r--r--  1 root root  1281533 Jul 24 09:33 alldatas.sql   
    ```

    记录主数据库1的 `MASSTER_LOG_FILE` 以及 `MASTERT_LOG_POS`

    ```bash
    head -n 30 alldatas.sql |grep MASTER_LOG_FILE
    -- CHANGE MASTER TO MASTER_LOG_FILE='ON.000001', MASTER_LOG_POS=157;
    ```

    也可以进入数据库使用 `show master status\G` 命令进行查看（推荐）

    ```bash
    mysql> show master status\G
    *************************** 1. row ***************************
                 File: ON.000001
             Position: 157
         Binlog_Do_DB: 
     Binlog_Ignore_DB: 
    Executed_Gtid_Set: 
    1 row in set (0.02 sec)
    ```

2. 分别登录两台服务器执行下列命令进行停止同步（需要在两台服务器上分别操作）

    ```bash
    mysql -uroot -p'<ROOT_PASSWORD>'

    # 停止同步
    stop slave;
    reset slave all;
    show slave status \G
    ```

3. 将备份数据导入到主数据库2（在服务器2上操作）

    ```bash
    mysql -uroot -p'<ROOT_PASSWORD>' < alldatas.sql
    ```

4. 将主数据库2指向主数据库1（在服务器2上操作）

    ```bash
    reset master;
    show master status\G

    CHANGE MASTER TO
    MASTER_HOST='192.168.150.106',
    MASTER_USER='repl',
    MASTER_PASSWORD='<REPLICATION_PASSWORD>',
    MASTER_PORT=3306,
    MASTER_LOG_FILE='ON.000001',    # 这里填写的是主数据库1中所生成的信息
    MASTER_LOG_POS=157;             # 这里填写的是主数据库1中所生成的信息

    start slave;
    show slave status\G

    show master status\G
    ```

5. 将主数据库1指向主数据库2（在服务器1上操作）

    ```bash
    CHANGE MASTER TO
    MASTER_HOST='192.168.150.107',
    MASTER_USER='repl',
    MASTER_PASSWORD='<REPLICATION_PASSWORD>',
    MASTER_PORT=3306,
    MASTER_LOG_FILE='ON.000001',        # 这里是主数据库2中所生成的信息
    MASTER_LOG_POS=157;                 # 这里是主数据库2中所生成的信息

    start slave;
    show slave status\G
    ```

6. 查看主主同步状态（在两台服务器上分别操作）
    ```sql
    mysql> show slave status\G
    *************************** 1. row ***************************
               Slave_IO_State: Waiting for source to send event
                  Master_Host: 192.168.150.107
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: ON.000001
          Read_Master_Log_Pos: 530
               Relay_Log_File: host-192-168-150-106-relay-bin.000010
                Relay_Log_Pos: 319
        Relay_Master_Log_File: ON.000001
             Slave_IO_Running: Yes      # 这里显示 Yes 表示成功
            Slave_SQL_Running: Yes      # 这里显示 Yes 表示成功，配置一台服务器时也会同时显示 Yes，并不是同时配置完成时才会显示
    ```

## 配置 Keepalived 脚本

1. 安装服务活性检测软件

```shell
yum -y install psmisc
```
> psmisc提供killall指令

2. 在 master 节点上创建 Mysql 检查脚本文件
   
    ```bash
    mkdir -pv /usr/local/keepalived2.2/scripts
    touch /usr/local/keepalived2.2/scripts/check-mysql.sh
    chmod +x /usr/local/keepalived2.2/scripts/check-mysql.sh

    vim /usr/local/keepalived2.2/scripts/check-mysql.sh
    ```

    `check-mysql.sh` 脚本中的内容如下：

    ```bash
    #!/bin/bash

    # 若 mysql 进程不存在，则停止 keepalived 服务
    killall -0 mysqld &>/dev/null

    if [ $? -ne 0 ];then    # 判断上一条指令的状态码，若状态码为0则服务存活，否则服务未启动
        /etc/init.d/mysqld start
        sleep 1s    # mysql_safe启动mysqld进程需要一定的时间
        killall -0 mysqld &>/dev/null
        if [ $? -ne 0 ];then
            systemctl stop keepalived
        fi
    fi
    ```

    在 master 节点上创建配置文件

    ```bash
    vim /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
    ```

    文件内容如下：

    ```bash
    ! Configuration File for keepalived

    global_defs {
        router_id Mysql-1-106 #参照服务器标识命名约定
    }

    vrrp_script chk_mysql {
        script "/usr/local/keepalived2.2/scripts/check-mysql.sh"
        interval 2
        fall 2
        rise 1
    }

    vrrp_instance VI_1 {
        state MASTER
        interface eth0
        virtual_router_id 51
        priority 100
        advert_int 1
        authentication {
            auth_type PASS
            auth_pass 1111
        }
        virtual_ipaddress {
            192.168.33.201
        }
        # 防止主备节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
        unicast_src_ip 192.168.150.106 #本机 IP 地址
        unicast_peer {
            192.168.150.107 #对端节点 IP 地址
        }
        track_script {
            chk_mysql
        }
    }
    ```
2. 在 backup 节点上创建 Mysql 检查脚本文件
   
    ```bash
    mkdir -pv /usr/local/keepalived2.2/scripts
    touch /usr/local/keepalived2.2/scripts/check-mysql.sh
    chmod +x /usr/local/keepalived2.2/scripts/check-mysql.sh

    vim /usr/local/keepalived2.2/scripts/check-mysql.sh
    ```

    `check-mysql.sh` 脚本中的内容如下：

    ```bash
     #!/bin/bash

    # 若 mysql 进程不存在，则停止 keepalived 服务
    killall -0 mysqld &>/dev/null
    if [ $? -ne 0 ];then    # 判断上一条指令的状态码，若状态码为0则服务存活，否则服务未启动 
        /etc/init.d/mysqld start
        sleep 1s    # mysql_safe启动mysqld进程需要一定的时间
        killall -0 mysqld &>/dev/null
        if [ $? -ne 0 ];then
            systemctl stop keepalived
        fi
    fi
    ```

    在 backup 节点上创建配置文件

    ```bash
    vim /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
    ```

    文件内容如下：

    ```bash
    ! Configuration File for keepalived

    global_defs {
        router_id Mysql-2-107 #参照服务器标识命名约定
    }

    vrrp_script chk_mysql {
        script "/usr/local/keepalived2.2/scripts/check-mysql.sh"
        interval 2
        fall 2
        rise 1
    }

    vrrp_instance VI_1 {
        state BACKUP
        interface eth0
        virtual_router_id 51
        priority 90
        advert_int 1
        authentication {
            auth_type PASS
            auth_pass 1111
        }
        virtual_ipaddress {
            192.168.33.201
        }
        # 防止主备节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
        unicast_src_ip 192.168.150.107 #本机 IP 地址
        unicast_peer {
            192.168.150.106 #对端节点 IP 地址
        }
        track_script {
            chk_mysql
        }
    }
    ```

## 启动 Mysql 和 Keepalived 服务

完成配置后，需要在两台服务器上分别启动 Mysql 和 keepalived 服务，并查看运行状态

```bash
/etc/init.d/mysqld start

systemctl start keepalived

/etc/init.d/mysqld status

systemctl status keepalived
```

## 常见错误
