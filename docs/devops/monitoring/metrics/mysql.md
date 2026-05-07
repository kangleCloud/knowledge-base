# MySQL监控项

为确保监控指标项的一致性和可读性，**团队约定优先使用通用指标名称，并在不同监控平台中保持同一语义**。

图例：🔥=异常告警；⭐=自定义图表或监控项。

## 无图形监控项

- Status - 运行状态 => 异常报警 🔥
- Slow queries log - 慢日志 => 慢日志文件有变更报警 ⭐🔥

## 数据库连接

### 0x01.Connections

⭐推荐图表名称：`SJFY MySQL: Connections`

- SJFY Mysql: Max connections - 最大连接数 ⭐
- Connections per second - 每秒连接数 => 超过200报警（实际阈值需参照具体情况） 🔥
- Max used connections - 使用的最大连接数

### 0x02.Threads

推荐图表名称：`Threads`

- Threads cached
- Threads connected - 连接的线程数 => 超过500报警（实际阈值需参照具体情况） 🔥
- Threads created per second
- Threads running

## 数据库操作

### 0x01.Operations

推荐图表名称：`Operations`

- Command Select per second - 每秒 Select 操作数量 => 超过500报警（实际阈值需参照具体情况） 🔥
- Command Insert per second - 每秒 Insert 操作数量
- Command Update per second - 每秒 Update 操作数量
- Command Delete per second - 每秒 Delete 操作数量

## 数据库性能

### 0x01.InnoDB row lock time

⭐推荐图表名称：`SJFY MySQL: InnoDB row lock time` 

- InnoDB row lock time - InnoDB 行锁定时间
- InnoDB row lock time max - InnoDB 最大行锁定时间

### 0x02.Innodb row lock waits

⭐推荐图表名称：`SJFY MySQL: Innodb row lock waits` 

- Innodb row lock waits - InnoDB表上的操作等待行锁的次数

### 0x03.Queries

推荐图表名称：`Queries`

- Queries per second - 服务器执行的语句数
- Slow queries per second - 时间超过long_query_time秒数的查询数
- Questions per second

## 数据库从库

:::tip
- https://dev.mysql.com/doc/refman/5.7/en/show-slave-status.html
- https://dev.mysql.com/doc/refman/8.0/en/show-replica-status.html
:::

### 0x01.无图形监控项

- SJFY Mysql: Slave io running - I/O线程是否启动并成功连接到源 => 不等于`YES`报警 ⭐🔥
- SJFY Mysql: Slave sql running - SQL线程是否启动 => 不等于`YES`报警 ⭐🔥

:::warning
为了让MySQL的主库和从库监控共享同一模板，需要将主库的从库配置关闭。
:::
