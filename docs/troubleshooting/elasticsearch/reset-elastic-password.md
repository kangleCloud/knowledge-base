# Elasticsearch 重置 `elastic` 用户密码

## 现象

- 已启用安全认证，但忘记 `elastic` 用户密码。
- 使用 `curl -u elastic:'<PASSWORD>'` 访问接口返回认证失败。
- Kibana、Exporter 或业务侧因为认证失败无法访问 Elasticsearch。

## 影响范围与环境

- 适用于 Elasticsearch 7.17 单节点或集群，且已启用 `xpack.security.enabled: true`。
- 操作前需具备服务器登录权限和 Elasticsearch 安装目录访问权限。

## 排查步骤

1. 确认安全认证已开启。

```bash
grep -E 'xpack.security.enabled|xpack.security.transport.ssl.enabled' /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

2. 确认服务状态正常。

```bash
systemctl status elasticsearch7.17
curl 127.0.0.1:9200/_cat/health
```

3. 如果只是单个系统账号密码不确定，优先确认是否仍保存于部署记录或密码库；找不到再执行重置。

## 修复步骤

1. 使用安装包自带工具重新设置内置用户密码。

```bash
/usr/local/elasticsearch7.17/bin/elasticsearch-setup-passwords interactive
```

2. 为 `elastic`、`kibana_system`、`logstash_system` 等内置账号重新输入符合安全要求的随机密码。

3. 按需更新 Kibana、Exporter 和业务配置中的占位密码。

## 验证恢复

1. 验证 `elastic` 账号可正常认证。

```bash
curl -u elastic:'<PASSWORD>' 127.0.0.1:9200/_cat/health
```

2. 验证依赖组件恢复连接，例如 Kibana 或 Prometheus Exporter。

3. 检查 Elasticsearch 日志中不再出现认证失败记录。

## 注意事项

- 密码建议不少于 12 位，并同时包含大小写字母、数字和特殊字符。
- 不要把真实密码写回文档、脚本或配置示例中。
- 如果需要变更多套环境，先从测试环境验证操作流程。

## 回滚方案

- 如果新密码同步到依赖组件后出现异常，可立即改回旧密码前一版或重新执行一次密码设置流程。
- 如因配置更新引发组件不可用，先恢复依赖组件中的旧配置，再单独重置密码并重新校验。
