# Linux基础监控项

为确保监控指标项的一致性和可读性，并同时减轻构建模板的工作负担，**团队约定非自定义监控项直接采用 Zabbix 官方模板中的监控项名称**。

图例：🔥=异常告警；⭐=自定义监控项。

## 系统

### 0x01.System Load

Zabbix 图形名称：`System load`

- Load average (1m avg) => 连续15分钟单核负载超过1.5报警 🔥
- Load average (5m avg)
- Load average (15m avg)
- Number of CPUs

## 处理器

### 0x01.CPU utilization

Zabbix 图形名称：`CPU utilization`

- CPU utilization

### 0x02.CPU usage

Zabbix 图形名称：`CPU usage`

- CPU user time (us) => 使用率超过50%报警 🔥
- CPU system time (sy)
- CPU nice time (ni)
- CPU idle time (id) => 在未触发Load average告警前提下低于20%空闲时报警 🔥
- CPU interrupt time (hi)
- CPU softirq time (si)

## 内存

### 0x01.Memory utilization

Zabbix 图形名称：`Memory utilization`

- Memory utilization => 连续5分钟超过80%报警 🔥

### 0x02.Memory Usage

Zabbix 图形名称：`Memory usage`

- Available memory
- Total memory

### 0x03.Swap usage

Zabbix 图形名称：`Swap usage`

- Free swap space
- Total swap space

## 网络

基于 Zabbix 构建的监控系统，通过使用 "Linux by Zabbix agent active" 模板，并结合自动发现规则来实现网卡监控功能。<font color="red">约定超过实际带宽的50%报警。</font>

Zabbix 图形名称：`Interface {#IFNAME}: Network traffic`

## 硬盘

基于 Zabbix 构建的监控系统，通过使用 "Linux by Zabbix agent active" 模板，并结合自动发现规则来实现硬盘监控功能。
