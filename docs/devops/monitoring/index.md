# 监控告警

## 适用场景

面向指标采集、可视化展示、告警通知与统一监控规范建设。

## 推荐阅读

- [Prometheus 二进制安装](/docs/devops/monitoring/prometheus/install-by-binaries.md)
- [Node Exporter](/docs/devops/monitoring/prometheus/node-exporter.md)
- [Nginx Prometheus Exporter](/docs/devops/monitoring/prometheus/nginx-prometheus-exporter.md)
- [Grafana 安装](/docs/devops/monitoring/grafana/install-by-binaries.md)
- [Alertmanager 安装](/docs/devops/monitoring/alertmanager/install.md)
- [Alertmanager 部署与升级](/docs/devops/monitoring/alertmanager/deploy.md)
- [Linux 基础监控项](/docs/devops/monitoring/metrics/linux.md)
- [监控指标](/docs/devops/monitoring/monitorkeys.md)

## 子主题清单

- 指标采集：Prometheus 与常见 Exporter
- 可视化：Grafana 部署与图表落地
- 告警：Alertmanager 安装、部署、升级
- 监控规范：Linux、MySQL、Nginx、Redis、JVM 等通用指标约定

## 代表文档入口

- 平台搭建：`prometheus/install-by-binaries.md`、`grafana/install-by-binaries.md`
- 告警链路：`alertmanager/install.md`、`alertmanager/deploy.md`
- 指标规范：`metrics/linux.md`、`metrics/mysql.md`、`monitorkeys.md`

## 注意事项

- 监控类文档应优先采用通用指标命名和面板语义，避免绑定单一平台产品。
- 告警策略与阈值需结合环境容量评估，文档中的阈值仅作为基线示例。
