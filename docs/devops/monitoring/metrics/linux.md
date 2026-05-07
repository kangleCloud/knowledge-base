# Linux基础监控项

为确保监控指标项的一致性和可读性，**团队约定优先使用通用指标名称，并在不同监控平台中保持同一语义**。

图例：🔥=异常告警；⭐=自定义图表或监控项。

## 系统

### 0x01.System Load

推荐图表名称：`System load`

- Load average (1m avg) => 连续15分钟单核负载超过1.5报警 🔥
- Load average (5m avg)
- Load average (15m avg)
- Number of CPUs

## 处理器

### 0x01.CPU utilization

推荐图表名称：`CPU utilization`

- CPU utilization

### 0x02.CPU usage

推荐图表名称：`CPU usage`

- CPU user time (us) => 使用率超过50%报警 🔥
- CPU system time (sy)
- CPU nice time (ni)
- CPU idle time (id) => 在未触发Load average告警前提下低于20%空闲时报警 🔥
- CPU interrupt time (hi)
- CPU softirq time (si)

## 内存

### 0x01.Memory utilization

推荐图表名称：`Memory utilization`

- Memory utilization => 连续5分钟超过80%报警 🔥

### 0x02.Memory Usage

推荐图表名称：`Memory usage`

- Available memory
- Total memory

### 0x03.Swap usage

推荐图表名称：`Swap usage`

- Free swap space
- Total swap space

## 网络

网卡监控建议基于平台自带的主机指标采集能力或 Exporter 自动发现能力实现。<font color="red">约定超过实际带宽的50%报警。</font>

推荐图表名称：`Interface {#IFNAME}: Network traffic`

## 硬盘

磁盘监控建议结合平台的文件系统自动发现与挂载点过滤规则实现，避免临时目录造成误报。
