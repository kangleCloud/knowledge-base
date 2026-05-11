# RabbitMQ Exporter

RabbitMQ 从 3.8+ 开始官方就内置了 Prometheus 支持，无需额外安装。

## 1.启用插件

```bash
rabbitmq-plugins enable rabbitmq_prometheus
```

## 2.在Server端添加配置文件

进入Prometheus的安装目录

```bash
cd /usr/local/prometheus3.8
```

创建文件目录

```bash
mkdir -p scrape_configs/rabbitmq-exporters
```

修改主配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

:::tip scrape_config块下的配置示例
```yaml
  - job_name: 'rabbitmq-exporter'
    file_sd_configs:
      - files:
        - '/usr/local/prometheus3.8/scrape_configs/rabbitmq-exporters/*.yml'
        refresh_interval: 30s
```
:::

新建实例配置文件（如：rabbitmq-1-42.yml）

```bash
vim scrape_configs/rabbitmq-exporters/<server-id>.yml
```

配置示例（后续修改该配置无需重启 Prometheus Server）
::: tabs
=== 单节点模式
```md
# RabbitMQ Exporter
- targets:
    - '10.1.0.42:15692'
  labels:
    job: 'RabbitMQ Exporter'
    namespace: 'project-rabbitmq-1-42' #服务器标识
```
---
=== 集群模式
📝待完善
---
:::

------------------------------------------- >>>>>> 此处为分割线 <<<<<< -------------------------------------------

检查配置文件是否正确

```bash
./promtool check config ./prometheus.yml
```

重启Prometheus

```bash
systemctl restart prometheus
```

## 3.配置 Grafana Dashboard

### 0x01.Dashboard

| Dashboard ID | 名称                                                                                   | 备注              |
| ------------ | ------------------------------------------------------------------------------------ | --------------- |
| 10991        | [RabbitMQ Overview](https://grafana.com/grafana/dashboards/10991-rabbitmq-overview/) | 全面的RabbitMQ监控面板 |

### 0x02.导入步骤

1. 登录 Grafana Web UI
2. 仪表盘 → 新建仪表盘 -> 导入仪表盘
3. 输入 Dashboard ID：`10991`（或选择其他面板）
4. 点击 `Load`
5. 点击 `Import`

## 附录1.参考资料

- <https://www.rabbitmq.com/docs/prometheus#overview-prometheus>

