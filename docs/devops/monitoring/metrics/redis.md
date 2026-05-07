# Redis监控项

为确保监控指标项的一致性和可读性，**团队约定优先使用通用指标名称，并在不同监控平台中保持同一语义**。

图例：🔥=异常告警；⭐=自定义图表或监控项。

## 无图形监控项

- Ping - 运行状态 => 异常报警 🔥

## 客户端连接

### 0x01.Connections

⭐推荐图表名称：`Redis: Connections`

- Connected clients - 客户端连接数 => 超过最大连接数的80%报警 🔥
- Rejected connections - 由于达到 maxclients 而被拒绝的连接数
- Max clients - 客户端最大连接数

## 内存使用

### 0x01.Memory

⭐推荐图表名称：`Redis: Memory`

- Max memory - 分配给 Redis 的最大内存 => 超过物理内存的50% 🔥
- Memory used - 内部存储的数据内存使用量
- Memory used Lua - 内部存储的 Lua 内存使用量的最大值
- Memory used RSS - 从操作系统的角度显示 Redisdb 进程占用的物理内存总量

### 0x01.Memory fragmentation

:::warning
建议复用现有 Redis 内存碎片图表，并针对内存碎片率补充独立触发条件。
:::

推荐图表名称：`Memory fragmentation`

- Memory fragmentation ratio - 内存碎片率 => 超过1.5报警 🔥

:::tip
无论底层平台如何实现，对应指标的语义均应保持为 `Memory fragmentation ratio`，也可通过如下计算方式得到：`mem_fragmentation_ratio = used_memory_rss / used_memory`
:::

## 性能

### 0x01.Commands

:::warning
建议复用现有 Redis 请求速率图表，并结合业务峰值补充独立触发条件。
:::

推荐图表名称：`Commands`

- Instantaneous operations per sec = 每秒处理的操作数 => 超过500报警（实际阈值需参照具体情况） 🔥

### 0x02.Keyspace

⭐推荐图表名称：`Redis: Keyspace`

- Redis: Keyspace hits per sec - 命中次数 ⭐
- Redis: Keyspace misses per sec - 没命中次数 ⭐

### 0x03.Hit Rate

⭐推荐图表名称：`Redis: Hit Rate`

- Redis: Cache Hit Rate - 缓存命中率 ⭐

:::tip 计算公式
keyspace_hits / (keyspace_hits + keyspace_misses) * 100
:::

## Cluster集群

### 0x01.无图形监控项

- Redis: Cluster health status - 集群健康状态 => 异常报警 ⭐🔥
- Redis: Cluster status - cluster 模式集群状态值  => 异常报警 ⭐🔥
- Redis: Cluster num of node - 主从节点数量 => 异常报警 ⭐🔥
- Redis: Cluster delay of replication - 主从复制延迟 => 异常报警 ⭐🔥
- Redis: Cluster num of slave - slave数量 => 异常报警 ⭐🔥

## 哨兵集群

### 0x01.无图形监控项

- Redis: Sentinel running status - 哨兵集群运行状态 => 异常报警 ⭐🔥
- Redis: Sentinel health status - 哨兵集群健康状态 => 异常报警 ⭐🔥
- Redis: Sentinel addr of sentinel_master - 哨兵集群主节点地址 => 改变则报警 ⭐🔥
- Redis: Sentinel num of sentinels - 哨兵集群节点数量 => 异常报警 ⭐🔥
- Redis: Sentinel num of sentinel_master - 哨兵集群主节点数 => 异常报警 ⭐🔥
- Redis: Sentinel num of sentinel_slave - 哨兵集群从节点数 => 异常报警 ⭐🔥
