# Mysql8.0系统变量说明

:::tip [Option Files Read on Unix and Unix-Like Systems](https://dev.mysql.com/doc/refman/8.0/en/option-files.html)
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

## 一、服务器系统变量

## $01. basedir

Dynamic: No, Default Value: parent of mysqld installation directory

> The path to the MySQL installation base directory.

约定将变量 basedir 设置为 /usr/local/mysql{Major Version}.{Minor Version}（如 mysql8.0）。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_basedir

## $02. connect_timeout

Dynamic: Yes, Default Value: 10

> The number of seconds that the mysqld server waits for a connect packet before responding with Bad handshake.

约定使用默认值

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_connect_timeout

## $03. datadir

Dynamic: No

> The path to the MySQL server data directory.

约定将变量 datadir 设置为 /data/mysql。

```bash
groupadd mysql
useradd -g mysql mysql -s /sbin/nologin

mkdir -p /data/mysql
chown -R mysql:mysql /data/mysql
```

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_datadir

## $04. max_connections

Dynamic: Yes, Default Value: 151

> The maximum permitted number of simultaneous client connections. The maximum effective value is the lesser of the effective value of [open_files_limit](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_open_files_limit) (Default Value: 5000) - 810, and the value actually set for max_connections.

MySQL比较理想的最大连接数计算方式为: max_used_connections / max_connections * 100% ≈ 85%。

约定`4vCPUS+8G`的虚拟机将变量 max_connections 设置为 1000；`8vCPUS+16G`的虚拟机将变量 max_connections 设置为 2000。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_connections

## $05. log_timestamps

Dynamic: Yes, Default Value: UTC

> This variable controls the time zone of timestamps in messages written to the error log, and in general query log and slow query log messages written to files.

约定将变量 log_timestamps 设置为 SYSTEM

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_log_timestamps

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

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_log_error

## $07. long_query_time

Dynamic: Yes, Default Value: 10

> If a query takes longer than this many seconds, the server increments the Slow_queries status variable. If the slow query log is enabled, the query is logged to the slow query log file.

约定将变量 long_query_time 设置为 3。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_long_query_time

## $08. server_id

Dynamic: Yes, Default Value: 1

> This variable specifies the server ID. server_id is set to 1 by default.

约定将变量 server_id 设置为 1。（单节点或主节点）

:::warning
For servers that are used in a replication topology, you must specify a unique server ID for each replication server, in the range from 1 to 232 − 1. “Unique” means that each ID must be different from every other ID in use by any other source or replica in the replication topology. 
:::

https://dev.mysql.com/doc/refman/8.0/en/replication-options.html#sysvar_server_id

## $09. skip_name_resolve

Dynamic: No, Default Value: OFF

> Whether to resolve host names when checking client connections.

约定将变量 skip_name_resolve 设置为 On, 表示只能用IP地址检查客户端的登录。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_skip_name_resolve

## $10. slow_query_log

> Whether the slow query log is enabled. The value can be 0 (or OFF) to disable the log or 1 (or ON) to enable the log. (Dynamic: Yes, Default Value: OFF)

约定将变量 slow_query_log 设置为 ON 或者 1。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_slow_query_log

## $11. slow_query_log_file

Dynamic: Yes, Default Value: host_name-slow.log

> The name of the slow query log file.

约定将变量 slow_query_log_file 设置为 /var/log/mysql/mysqld-slow.log。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_slow_query_log_file

## $12. socket

Dynamic: No, Default Value: /tmp/mysql.sock

> On Unix platforms, this variable is the name of the socket file that is used for local client connections.

约定使用默认值

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_socket

## $13. interactive_timeout

Dynamic: Yes, Default Value: 28800

> The number of seconds the server waits for activity on an interactive connection before closing it.

交互式的连接可以理解为 GUI 工具连接数据库。默认值为28800秒（8小时），约定设置为60（s）。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_interactive_timeout

## $14. pid_file

Dynamic: No, Default Value: /tmp/{host_name}.pid

> The path name of the file in which the server writes its process ID. 

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_interactive_timeout

## $15. wait_timeout

Dynamic: Yes, Default Value: 28800

> The number of seconds the server waits for activity on a noninteractive connection before closing it.

:::warning
On thread startup, the session wait_timeout value is initialized from the global wait_timeout value or from the global interactive_timeout value, depending on the type of client (as defined by the CLIENT_INTERACTIVE connect option to mysql_real_connect()). See also interactive_timeout.
:::

非交互式的连接可以理解为代码连接数据库，默认值为28800秒（8小时），约定设置为60（s）。因该参数可能还依赖于`interactive_timeout`，所以约定设置`interactive_timeout`与`wait_timeout`值一致。

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_wait_timeout

## $16.sql_mode

Default Value: ONLY_FULL_GROUP_BY STRICT_TRANS_TABLES NO_ZERO_IN_DATE NO_ZERO_DATE ERROR_FOR_DIVISION_BY_ZERO NO_ENGINE_SUBSTITUTION

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_sql_mode

## $17. log_error_suppression_list

> The log_error_suppression_list system variable applies to events intended for the error log and specifies which events to suppress when they occur with a priority of WARNING or INFORMATION.

Dynamic: Yes, Default Value: empty string

示例：log_error_suppression_list='MY-013360'（多个可用逗号分隔）

:::tip
- MY-013360: 过滤未使用`caching_sha2_password`导致的告警日志
:::

https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_log_error_suppression_list

## 二、InnoDB启动选项和系统变量

InnoDB Startup Options and System Variables

## $01. innodb_buffer_pool_size

Dynamic: Yes, Default Value: 128MB

> The size in bytes of the buffer pool, the memory area where InnoDB caches table and index data.

On a dedicated database server, you might set the buffer pool size to 80% of the machine's physical memory size.（<font color="red">修改需慎重</font>）

:::warning
When the size of the buffer pool is greater than 1GB, setting innodb_buffer_pool_instances to a value greater than 1 can improve the scalability on a busy server.

Buffer pool size must always be equal to or a multiple of `innodb_buffer_pool_chunk_size` * `innodb_buffer_pool_instances`.
:::

:::tip
如果数据库服务器的I/O读写性能不佳，可以考虑增加`innodb_buffer_pool_size`参数的配置值，以提升性能。
:::

https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_buffer_pool_size

## $02. innodb_flush_log_at_trx_commit

Dynamic: Yes, Default Value: 1

> Controls the balance between strict ACID compliance for commit operations and higher performance that is possible when commit-related I/O operations are rearranged and done in batches. You can achieve better performance by changing the default value but then you can lose transactions in a crash.

如果 MySQL 造成 IO 瓶颈，可将 innodb_flush_log_at_trx_commit 设置为 2 以提升性能。该变量取值含义如下：
- 1：每次事务提交时刷盘（最安全，但性能最慢）
- 2：每秒刷盘一次（性能提升显著，但可能丢失最近一秒的事务）

https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_flush_log_at_trx_commit

## $03. innodb_redo_log_capacity

Dynamic: Yes, Default Value: 104857600 (100M)

> Defines the amount of disk space occupied by redo log files.

针对生产环境，MySQL 8.0.30 及以上版本，通用负载约定设置 `innodb_redo_log_capacity = 2147483648`（2GB），重度写入负载则建议调至 4GB～8GB 以换取更高性能。

:::warning
对于 MySQL 8.0.30 之前版本（含 5.7 全系及 8.0 早期版），重做日志通过 `innodb_log_file_size` 和 `innodb_log_files_in_group` 配置，约定设为 1G 和 2，修改后需重启服务。

innodb_log_file_size and innodb_log_files_in_group are deprecated in MySQL 8.0.30. These variables are superseded by innodb_redo_log_capacity.

https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_log_file_size
:::

https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_redo_log_capacity

## 三、二进制日志

System Variables Used with Binary Logging

## $01. log_bin

Dynamic: No

> Shows the status of binary logging on the server, either enabled (ON) or disabled (OFF). With binary logging enabled, the server logs all statements that change data to the binary log, which is used for backup and replication. ON means that the binary log is available, OFF means that it is not in use.

> In earlier MySQL versions, binary logging was disabled by default, and was enabled if you specified the --log-bin option. From MySQL 8.0, binary logging is enabled by default, with the log_bin system variable set to ON, whether or not you specify the --log-bin option. 

:::warning log_bin_basename 配置禁止使用
官方说明：[Holds the base name and path for the binary log files](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_log_bin_basename)，但是经过实际操作，不能使用此配置。
:::

尽管官方文档定义 log_bin 为布尔值，但因 log_bin_basename 的不确定性，约定将变量 log_bin 设置为 mysql-bin，该字符串为二进制日志文件的基本名称。默认位置是数据目录。

https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_log_bin

## $02. max_binlog_size

Dynamic: Yes, Default Value: 1GB

> If a write to the binary log causes the current log file size to exceed the value of this variable, the server rotates the binary logs (closes the current file and opens the next one).

约定将变量 max_binlog_size 设置为 1G。

https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_max_binlog_size

## $03. binlog_expire_logs_seconds

Dynamic: Yes, Default Value: 2592000

> Sets the binary log expiration period in seconds. After their expiration period ends, binary log files can be automatically removed.

约定将变量 binlog_expire_logs_seconds 设置为 15552000。（180 days）

:::warning expire_logs_days
Specifies the number of days before automatic removal of binary log files. [expire_logs_days](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_expire_logs_days) is deprecated, and you should expect it to be removed in a future release. Instead, use binlog_expire_logs_seconds, which sets the binary log expiration period in seconds. 
:::

https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_expire_logs_seconds

## 四、无需配置及已废弃的参数

### $01.binlog_format

配置文件中无需配置

binlog_format is deprecated as of MySQL 8.0.34, and is subject to removal in a future version of MySQL. This implies that support for logging formats other than row-based is also subject to removal in a future release. Thus, only row-based logging should be employed for any new MySQL Replication setups. 

https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_format

### $02.default_authentication_plugin

配置文件中无需配置，约定禁止将 mysql 默认的认证插件配置成`mysql_native_password`，通过升级客户端或者创建支持`mysql_native_password`认证的数据库用户解决应用程序无法正常操作数据库的问题。

In MySQL 8.0, caching_sha2_password is the default authentication plugin rather than mysql_native_password.

https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html


## 附录一、参考资料

- https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html
- https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#replication-sysvars-binlog
- https://dev.mysql.com/doc/refman/8.0/en/replication-options-replica.html
- https://dev.mysql.com/doc/refman/8.0/en/dynamic-system-variables.html
- https://www.cnblogs.com/clschao/articles/9962347.html
