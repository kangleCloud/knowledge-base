# RocketMQ Producer 连接 Broker 失败

## 现象

- Producer 发送消息时报连接异常，例如 `RemotingConnectException`。
- 部署在 Docker 或 NAT 环境时，客户端拿到的 Broker 地址不可达。

## 影响范围与环境

- 适用于 RocketMQ 单节点或多节点部署，尤其是容器化、NAT 或多网卡环境。
- 常见原因是 `brokerIP1` 配置错误或客户端仍启用了 VIP Channel。

## 排查步骤

1. 确认 Broker 注册到 NameServer 的地址。

```bash
sh mqadmin clusterList -n <NAMESRV_ADDR>
```

2. 检查 `broker.conf` 中的 `brokerIP1` 是否为客户端可访问的宿主机 IP。

3. 如果业务客户端部署在容器外部，确认返回的不是容器内部 IP。

## 修复步骤

1. 在 Broker 端修正 `brokerIP1`。

```properties
brokerIP1=<HOST_IP>
```

2. 重启 Broker 使配置生效。

```bash
systemctl restart rocketmq-broker
```

3. 如果客户端仍因 VIP Channel 连接异常，可在客户端侧关闭 VIP Channel。

```java
producer.setVipChannelEnabled(false);
```

## 验证恢复

1. 再次发送测试消息，确认无连接异常。
2. 查看 Broker 日志，确认客户端连接与消息投递恢复正常。
3. 通过控制台或消费端验证消息已成功进入队列并被消费。

## 注意事项

- 容器环境不要把 `brokerIP1` 配成容器内网地址。
- 如果存在多个网卡，需明确对外服务使用的那张网卡 IP。
- 变更前建议保留旧配置，便于快速回退。

## 回滚方案

- 如果新配置导致 Broker 无法启动或客户端大面积异常，立即恢复上一个可用的 `broker.conf` 并重启 Broker。
- 客户端关闭 VIP Channel 后如出现兼容性问题，可恢复原代码配置并重新核对 Broker 对外地址。
