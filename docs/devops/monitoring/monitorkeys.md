# 监控指标

为确保监控指标项的一致性和可读性，**团队约定优先采用通用指标名称，并在不同监控平台中保持同一语义**。

:::tip 图例
- 🔥 异常告警
- ⭐ 自定义监控项
:::

## PHP-FPM

- 无图形展示的报警项
  - 运行状态（PHP-FPM service status） => 异常报警 🔥
  - 慢日志（PHP-FPM slow log） => 慢日志文件有变更报警 🔥
  - 错误日志（PHP-FPM error log） => 错误日志文件有变更报警 🔥
- PHP-FPM Status（**需加版本号**）
  - 活跃进程数（active processes）
  - 最大的活跃进程数量（max active processes） `FPM启动开始算`
  - 请求等待队列（listen queue）
  - 请求等待队列最高的数量（max listen queue）
  - 空闲进程数量（idle processes）
  - 总进程数量（total processes）
  - 进程达到最大数量限制的次数（max children reached）

## JVM

:::tip
- mp: MemoryPool
- PS: Parallel Scavenge
- GC: Garbage Collection
:::

### 0x01.堆内存

**推荐图表名称：JVM Heap Memory**

- 已提交（分配）的堆内存（Heap memory committed）
- 最大堆内存（Heap memory maximum size）
- 已使用堆内存（Heap memory used） => 超过90%告警🔥

### 0x02.堆内存-老年代内存池

**图形（面板）名称：JVM Heap Memory - mp PS Old Gen**

- PS 老年代最大值（mp PS Old Gen max）
- 已提交（分配）的 PS 年老代（mp PS Old Gen committed）
- 已使用的 PS 老年代（mp PS Old Gen used） => 超过85%告警🔥

### 0x03.垃圾收集器收集计数

**图形（面板）名称：JVM GC Collection Count**

- 每秒触发 PS Scavenge 次数（年轻代）（gc PS Scavenge number of collections per second）
- 每秒触发 PS Mark-Sweep 次数（老年代）（gc PS MarkSweep number of collections per second） => 超过0.033告警🔥

### 0x04.非堆内存

**图形（面板）名称：JVM Non-Heap Memory**

- 已提交（分配）的非堆内存（Non-Heap Memory committed）
- 最大非堆内存（Non-Heap memory maximum size）
- 已使用非堆内存（Non-Heap memory used） => 超过90%告警🔥

### 0x05.非堆内存-代码缓存区

**图形（面板）名称：JVM Non-Heap Memory - mp Code Cache**

- 最大代码缓存区（mp Code Cache max）
- 已提交（分配）的代码缓存区（mp Code Cache committed）
- 已使用的代码缓存区（mp Code Cache used）

### 0x06.线程计数

**图形（面板）名称：JVM Thread Count**

- 正在运行的守护进程线程数（Daemon thread count）
- 自JVM启动或峰值重置以来同时执行的最大线程数（Peak thread count）
- 当前时刻运行的线程数（Thread count）

### 0x07.文件描述符

**图形（面板）名称：JVM File Descriptors**

- 最大文件描述符数（File descriptors maximum count）
- 打开文件描述符数 (File descriptors opened) => 超过90%告警🔥

### 0x08.操作系统-CPU负载

**图形（面板）名称：JVM Operating System - Process CPU Load**

- CPU 负载（Process CPU Load）

## Elasticsearch 🛠️

- 集群健康=> 分片和节点可用性（Cluster Health: Shards and Node Availability）
  - 集群名称（cluster_name）
  - 集群健康状态（status） => 正常的话是green，缺少副本分片为yellow，缺少主分片为red
  - 集群节点数（number_of_nodes）
  - 数据节点数（number_of_data_nodes）
  - 主分片数（active_primary_shards）
  - 可用的分片数（active_shards）
  - 未分配的分片（unassigned_shards） => 未分配的分片大于0告警

* 注=> 
使用=> `GET _cluster/health`

- 索引性能=> 刷新和合并时间（Indexing Performance Metrics: Refresh And Merge Times）
  - 总刷新计数（indices.refresh.total）
  - 刷新总时间（indices.refresh.total_time_in_millis）
  - 目前的合并（indices.merges.current_docs）
  - 合并总数（indices.merges.total_docs）
  - 合并花费总时间（indices.merges.total_stopped_time_in_millis）

- 节点健康=> 内存、磁盘以及CPU（Node Health: Memory, Disk, and CPU Metrics）
  - 当前内存（ram.current）
  - 内存使用比（ram.percent）: 大于85%告警
  - 磁盘总量（disk.total）
  - 已使用磁盘（disk.used ）
  - 使用磁盘占比（disk.used_percent ） =>  大于75%告警
  - CPU 使用率（cpu） =>  大于80%告警

* 注=> 
使用=> `GET _cat/nodes?h=disk.total,disk.used,disk.avail,disk.used_percent,ram.current,cpu`

- JVM 健康指标=> 堆、GC、池大小（Heap, GC, and Pool Size）
  - 最大堆内存（jvm.mem.heap_max_in_bytes）
  - 已使用堆内存（jvm.mem.heap_used_in_bytes）
  - 堆内存使用占（jvm.mem.heap_used_percent）
  - 年轻代垃圾回收次数（jvm.gc.collectors.young.collection_count）
  - 年轻代垃圾回收时间（毫秒）（jvm.gc.collectors.young.collection_time_in_millis）
  - 老年代垃圾回收次数（jvm.gc.collectors.old.collection_count）
  - 老年代垃圾回收时间（jvm.gc.collectors.old.collection_time_in_millis）
  - 内存池（jvm.mem.pools）

* 注=> 
使用=> `GET _nodes/stats`

## Rabbitmq 🛠️

- 无图形式的内存报警项
  - 内存水位告警=> 使用内存超过vm_memory_high_watermark[relative值不超过0.7]值
  - 磁盘告警=> 剩余值小于disk_free_limit[relative为1-2倍内存或absoult]值
  - 接口 /api/queues
  - 队列报警=> rabbitmq state [flow or down]
- 内存和磁盘(Rabbitmq-Memory and DISK)
  - broker节点内存占用(Broker memory used)=> 以水位配置为基准
  - 磁盘剩余空间(Disk free space)=> 以磁盘的剩余值配置为基准
  - 队列消息(Queued message)-Ready unacked Total
  - socket句柄数(Socket descriptors)
- 持久化统计(Persistence Statistics)
  - 事务统计-Mnesia transactions(Ram per second) (Disk per second)
  - 持久化操作-队列索引(QI Journal per second)
  - 持久化操作-存储读(Store Read per second)
  - 持久化操作-存储写(Store Write per second)
  - 持久化操作-队列索引读(QI Read per second)
  - 持久化操作-队列索引写(QI Write per second)
- IO统计
  - 磁盘读的速率(Rabbit IO Read per second)
  - 磁盘读的速率(Rabbit IO Write per second)
  - 磁盘切换速率(Rabbit IO Seek per second)
  - 磁盘同步刷写速率(Rabbit IO FSync per second)
    -流失统计(churn statistics)
  - 连接速率(Connect [created,deleted] per second)
  - 通道速率(Channel [created,close] per second)
  - 队列速率(Queue [declared,created,deleted] per second)
- GC统计
  - GC发生频率(GC take place per second)
  - GC回收内存率(GC reclaimed per second)

## 参考资料

- https://help.aliyun.com/document_detail/148793.htm
- https://blog.csdn.net/qq_39378493/article/details/116701333
