# Mysql5.7系统变量说明

:::tip [Option Files Read on Unix and Unix-Like Systems](https://dev.mysql.com/doc/refman/5.7/en/option-files.html)
| File Name | Purpose |
| -- | -- |
| /etc/my.cnf |	Global options |
| /etc/mysql/my.cnf | Global options |
| SYSCONFDIR/my.cnf	| Global options |
| $MYSQL_HOME/my.cnf | Server-specific options (server only) |
| defaults-extra-file | The file specified with --defaults-extra-file, if any |
| ~/.my.cnf | User-specific options |
| ~/.mylogin.cnf | User-specific login path options (clients only) |
| DATADIR/mysqld-auto.cnf | System variables persisted with SET PERSIST or SET PERSIST_ONLY (server only) |
:::

:::tip
Dynamic: Whether the variable can be set at runtime.
:::

## 一、配置文件示例

<font color="red"><b>当前配置仅适用于单节点的Mysql实例</b></font>

:::danger
- log_timestamps=SYSTEM 配置只能用于 mysql5.7及其以上版本
- mysql5.7~mysql8.0.33 参数 binlog_format 默认值为 ROW，无需设置（<a href="https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_format">binlog_format is deprecated as of MySQL 8.0.34</a>）
- 如果将配置应用于存量系统，关闭 mysql 服务时需要使用存量系统的 my.cnf
:::

```vim
[mysqld]

# Specifies the server ID
server_id=1
# 只能用IP地址检查客户端的登录
skip_name_resolve=On
# 日志内记录时间使用系统时间（the local system time zone）
log_timestamps=SYSTEM

# 最大连接数
max_connections=2000

# 超时
interactive_timeout=60
wait_timeout=60

# 字符集（Default Value:latin1）
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci

# The path to the MySQL installation base directory
basedir=/usr/local/mysql5.7
# 数据文件所在位置
datadir=/data/mysql
# 设置socke文件所在目录
socket=/data/mysql/mysqld.sock
# 设置pid文件所在目录
pid_file=/data/mysql/mysqld.pid
# 数据库错误日志文件
log_error=/var/log/mysql/mysqld-error.log

# 慢日志相关配置
slow_query_log=1
long_query_time=3 #单位为秒
slow_query_log_file=/var/log/mysql/mysqld-slow.log

# 二进制日志
log_bin=mysql-bin
max_binlog_size=1G
expire_logs_days=180 #单位为天

# InnoDB启动选项和系统变量
innodb_buffer_pool_size=2048M

[client]

# 设置 MySQL 客户端尝试通过 socket 连接 MySQL 服务器的文件路径
socket=/data/mysql/mysqld.sock

```

## 二、服务器系统变量

## $01. basedir

Dynamic: No, Default Value: parent of mysqld installation directory

> The path to the MySQL installation base directory.

约定将变量 basedir 设置为 /usr/local/mysql{Major Version}.{Minor Version}（如 mysql5.7）。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_basedir

## $02. connect_timeout

Dynamic: Yes, Default Value: 10

> The number of seconds that the mysqld server waits for a connect packet before responding with Bad handshake.

约定使用默认值

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_connect_timeout

## $03. datadir

> The path to the MySQL server data directory. (Dynamic: No)

约定将变量 datadir 设置为 /data/mysql。

```bash
groupadd mysql
useradd -g mysql mysql -s /sbin/nologin

mkdir -p /data/mysql
chown -R mysql:mysql /data/mysql
```

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_datadir

## $04. max_connections

Dynamic: Yes, Default Value: 151

> The maximum permitted number of simultaneous client connections. The maximum effective value is the lesser of the effective value of [open_files_limit](https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_open_files_limit) (Default Value: 5000) - 810, and the value actually set for max_connections.

MySQL比较理想的最大连接数计算方式为: max_used_connections / max_connections * 100% ≈ 85%。

约定`4vCPUS+8G`的虚拟机将变量 max_connections 设置为 1000；`8vCPUS+16G`的虚拟机将变量 max_connections 设置为 2000。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_max_connections

## $05. log_timestamps

Dynamic: Yes, Default Value: UTC

> This variable controls the time zone of timestamps in messages written to the error log, and in general query log and slow query log messages written to files.

约定将变量 log_timestamps 设置为 SYSTEM

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_log_timestamps

## $06. log_error

Dynamic: No

> The default error log destination.

约定将变量 log_error 设置为 /var/log/mysql/mysqld-error.log。

```bash
groupadd mysql
useradd -g mysql mysql -s /sbin/nologin

mkdir -p /var/log/mysql
chown -R mysql:mysql /var/log/mysql
```

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_log_error

## $07. long_query_time

Dynamic: Yes, Default Value: 10

> If a query takes longer than this many seconds, the server increments the Slow_queries status variable. If the slow query log is enabled, the query is logged to the slow query log file.

约定将变量 long_query_time 设置为 3。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_long_query_time

## $08. server_id

Dynamic: Yes, Default Value: 1

> This variable specifies the server ID. server_id is set to 1 by default.

约定将变量 server_id 设置为 1。（单节点或主节点）

:::warning
For servers that are used in a replication topology, you must specify a unique server ID for each replication server, in the range from 1 to 232 − 1. “Unique” means that each ID must be different from every other ID in use by any other source or replica in the replication topology. 
:::

https://dev.mysql.com/doc/refman/5.7/en/replication-options.html#sysvar_server_id

## $09. skip_name_resolve

Dynamic: No, Default Value: OFF

> Whether to resolve host names when checking client connections.

约定将变量 skip_name_resolve 设置为 On, 表示只能用IP地址检查客户端的登录。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_skip_name_resolve

## $10. slow_query_log

Dynamic: Yes, Default Value: OFF

> Whether the slow query log is enabled. The value can be 0 (or OFF) to disable the log or 1 (or ON) to enable the log.

约定将变量 slow_query_log 设置为 ON 或者 1。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_slow_query_log

## $11. slow_query_log_file

Dynamic: Yes, Default Value: host_name-slow.log

> The name of the slow query log file.

约定将变量 slow_query_log_file 设置为 /var/log/mysql/mysqld-slow.log。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_slow_query_log_file

## $12. socket

Dynamic: No, Default Value: /tmp/mysql.sock

> On Unix platforms, this variable is the name of the socket file that is used for local client connections.

约定使用默认值

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_socket

## $13. interactive_timeout

Dynamic: Yes, Default Value: 28800

> The number of seconds the server waits for activity on an interactive connection before closing it.

交互式的连接可以理解为 GUI 工具连接数据库。默认值为28800秒（8小时），约定设置为60（s）。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_interactive_timeout

## $14. pid_file

Dynamic: No, Default Value: /tmp/{host_name}.pid

> The path name of the file in which the server writes its process ID. 

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_pid_file

## $15. wait_timeout

Dynamic: Yes, Default Value: 28800

> The number of seconds the server waits for activity on a noninteractive connection before closing it. 

:::warning
On thread startup, the session wait_timeout value is initialized from the global wait_timeout value or from the global interactive_timeout value, depending on the type of client (as defined by the CLIENT_INTERACTIVE connect option to mysql_real_connect()). See also interactive_timeout.
:::

非交互式的连接可以理解为代码连接数据库，默认值为28800秒（8小时），约定设置为60（s）。因该参数可能还依赖于`interactive_timeout`，所以约定设置`interactive_timeout`与`wait_timeout`值一致。

https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_wait_timeout

## 三、InnoDB启动选项和系统变量

InnoDB Startup Options and System Variables

## 0x01. innodb_buffer_pool_size

Dynamic: Yes, Default Value: 128MB

> The size in bytes of the buffer pool, the memory area where InnoDB caches table and index data.

On a dedicated database server, you might set the buffer pool size to 80% of the machine's physical memory size.（<font color="red">修改需慎重</font>）

:::warning
When the size of the buffer pool is greater than 1GB, setting innodb_buffer_pool_instances to a value greater than 1 can improve the scalability on a busy server.

Buffer pool size must always be equal to or a multiple of `innodb_buffer_pool_chunk_size` * `innodb_buffer_pool_instances`.
:::

https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_buffer_pool_size

## 0x02. innodb_flush_log_at_trx_commit

Dynamic: Yes, Default Value: 1

> Controls the balance between strict ACID compliance for commit operations and higher performance that is possible when commit-related I/O operations are rearranged and done in batches. You can achieve better performance by changing the default value but then you can lose transactions in a crash.

如果 MySQL 造成 IO 瓶颈，可将 innodb_flush_log_at_trx_commit 设置为 2 以提升性能。该变量取值含义如下：
- 1：每次事务提交时刷盘（最安全，但性能最慢）
- 2：每秒刷盘一次（性能提升显著，但可能丢失最近一秒的事务）

https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_flush_log_at_trx_commit

## 四、二进制日志

System Variables Used with Binary Logging

## 0x01. log_bin

Dynamic: No

> Shows the status of binary logging on the server, either enabled (ON) or disabled (OFF). With binary logging enabled, the server logs all statements that change data to the binary log, which is used for backup and replication. ON means that the binary log is available, OFF means that it is not in use.

> In earlier MySQL versions, binary logging was disabled by default, and was enabled if you specified the --log-bin option. From MySQL 5.7, binary logging is enabled by default, with the log_bin system variable set to ON, whether or not you specify the --log-bin option. 

:::warning log_bin_basename 配置禁止使用
官方说明：[Holds the base name and path for the binary log files](https://dev.mysql.com/doc/refman/5.7/en/replication-options-binary-log.html#sysvar_log_bin_basename)，但是经过实际操作，不能使用此配置。
:::

尽管官方文档定义 log_bin 为布尔值，但因 log_bin_basename 的不确定性，约定将变量 log_bin 设置为 mysql-bin，该字符串为二进制日志文件的基本名称。默认位置是数据目录。

https://dev.mysql.com/doc/refman/5.7/en/replication-options-binary-log.html#sysvar_log_bin

## 0x02. max_binlog_size

Dynamic: Yes, Default Value: 1GB

> If a write to the binary log causes the current log file size to exceed the value of this variable, the server rotates the binary logs (closes the current file and opens the next one).

约定将变量 max_binlog_size 设置为 1G。

https://dev.mysql.com/doc/refman/5.7/en/replication-options-binary-log.html#sysvar_max_binlog_size

## 0x03. expire_logs_days

Dynamic: Yes, Default Value: 0

> The number of days for automatic binary log file removal. The default is 0, which means “no automatic removal.” Possible removals happen at startup and when the binary log is flushed. Log flushing occurs as indicated in Section 5.4, “MySQL Server Logs”.

约定将变量 expire_logs_days 设置为 180（单位：天）。

https://dev.mysql.com/doc/refman/5.7/en/replication-options-binary-log.html#sysvar_expire_logs_days

## 参考资料

- https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html
- https://dev.mysql.com/doc/refman/5.7/en/replication-options-binary-log.html#replication-sysvars-binlog
- https://dev.mysql.com/doc/refman/5.7/en/replication-options-replica.html
- https://dev.mysql.com/doc/refman/5.7/en/dynamic-system-variables.html
