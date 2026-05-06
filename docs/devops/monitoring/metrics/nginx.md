# Nginx监控项

为确保监控指标项的一致性和可读性，并同时减轻构建模板的工作负担，**团队约定非自定义监控项直接采用 Zabbix 官方模板中的监控项名称**。

图例：🔥=异常告警；⭐=自定义图形或监控项。

## 无图形监控项

- Service status - 运行状态 => 异常报警 🔥

## Stub Status

### 0x01.Connections by state

Zabbix 图形名称：`Connections by state`

- Connections active - 活跃的连接数量 => 超过200报警（实际阈值需参照具体情况） 🔥
- Connections waiting - 已经处理完正在等候下一次请求指令的驻留链接
- Connections writing - 响应数据到客户端的数量
- Connections reading - 读取客户端的连接数

### 0x02.Connections per second

Zabbix 图形名称：`Connections per second`

- Connections accepted per second - 每秒接受的连接数
- Connections handled per second - 每秒处理的连接数
- Connections dropped per second - 每秒丢弃的连接数

### 0x03.Requests per second

Zabbix 图形名称：`Requests per second`

- 每秒请求数（Requests per second） => 超过500报警（实际阈值需参照具体情况） 🔥

:::warning
使用 Zabbix 官方的 Nginx by Zabbix agent 模板监控 Requests per second 项时，监测结果并不准确，目前尚未找到问题的解决方案。
:::