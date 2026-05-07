# Nginx监控项

为确保监控指标项的一致性和可读性，**团队约定优先使用通用指标名称，并在不同监控平台中保持同一语义**。

图例：🔥=异常告警；⭐=自定义图表或监控项。

## 无图形监控项

- Service status - 运行状态 => 异常报警 🔥

## Stub Status

### 0x01.Connections by state

推荐图表名称：`Connections by state`

- Connections active - 活跃的连接数量 => 超过200报警（实际阈值需参照具体情况） 🔥
- Connections waiting - 已经处理完正在等候下一次请求指令的驻留链接
- Connections writing - 响应数据到客户端的数量
- Connections reading - 读取客户端的连接数

### 0x02.Connections per second

推荐图表名称：`Connections per second`

- Connections accepted per second - 每秒接受的连接数
- Connections handled per second - 每秒处理的连接数
- Connections dropped per second - 每秒丢弃的连接数

### 0x03.Requests per second

推荐图表名称：`Requests per second`

- 每秒请求数（Requests per second） => 超过500报警（实际阈值需参照具体情况） 🔥

:::warning
如果直接采集 `stub_status` 并换算每秒请求数，部分平台默认面板的展示结果可能与业务预期存在偏差，落地前需要做一次压测校验。
:::
