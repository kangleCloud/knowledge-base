# Keepalived VIP 未漂移

## 现象

- 停止主节点 Keepalived 后，VIP 没有漂移到备节点。
- 备节点没有接管流量，业务仍然访问失败。

## 影响范围与环境

- 适用于 Keepalived 双节点或多节点主备场景。
- 常见于 VRRP 参数不一致、优先级设置错误、脚本权重不合理或网络不支持多播。

## 排查步骤

1. 明确当前 VIP 配置。

```bash
grep -n 'virtual_ipaddress' -n /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
```

2. 检查主备两端 Keepalived 状态。

```bash
systemctl status keepalived
ip addr | grep "$VIP"
```

3. 检查主备配置中的以下关键项是否一致或合理：

- `virtual_router_id`
- `interface`
- `priority`
- `advert_int`
- `authentication`
- `track_script` 与 `weight`

4. 如果部署在云环境，确认网络是否支持多播；不支持时需改为单播配置。

## 修复步骤

1. 调整主备优先级和 `weight`，确保脚本失败后备节点有机会接管。
2. 修正主备配置差异，重新加载 Keepalived。

```bash
systemctl reload keepalived
```

3. 如果服务已进入异常状态，可先停止主节点 Keepalived，再观察备节点是否接管。

```bash
systemctl stop keepalived
```

## 验证恢复

1. 在备节点执行以下命令确认 VIP 已出现。

```bash
ip addr | grep "$VIP"
```

2. 从客户端验证业务入口已恢复可访问。
3. 恢复主节点后再次观察 VIP 是否按预期回切或保持在备节点。

## 注意事项

- `priority` 与 `weight` 配错会导致永远不切换或频繁抖动。
- 生产环境改动前先备份当前 Keepalived 配置。
- 若依赖健康检查脚本，需同时确认脚本本身可执行且返回码正确。

## 回滚方案

- 如修改后行为异常，立即恢复原 `keepalived.conf` 并执行 `systemctl reload keepalived`。
- 如回滚后仍异常，先保留单节点服务对外，待配置核对完成后再恢复双节点切换。
