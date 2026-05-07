# MinIO Exporter

MinIO 从 RELEASE.2021+ 开始已内置 Prometheus 指标端点，无需额外安装 Exporter 二进制文件。

:::warning
- 本文配置仅支持以下场景：1.集群模式的 MinIO 实例；2.纠删码模式（Erasure stripe size 为 1）的单节点单驱动
:::

## 1.环境准备 

### 0x01.安装mc

MinIO Client（mc）用于生成 Prometheus 认证令牌。

```bash
cd /usr/local/minio2405/bin
wget https://dl.min.io/client/mc/release/linux-amd64/archive/mc.RELEASE.2025-02-21T16-00-46Z
mv mc.RELEASE.2025-02-21T16-00-46Z mc
chmod +x mc
```

配置 mc 别名
```bash
mc alias set myminio http://127.0.0.1:9000 <ACCESS_KEY> <SECRET_KEY>
```

:::tip 输出如下信息
Added `myminio` successfully.
:::

- https://docs.min.io/enterprise/aistor-object-store/reference/cli/
- https://min-io.cn/docs/minio/linux/reference/minio-mc.html

### 0x02.创建策略文件

进入 MinIO 的安装目录
```bash
cd /usr/local/minio2405
```

创建策略文件
```bash
cat <<EOF > prom-metrics-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
      {
        "Action": ["admin:Prometheus"],
        "Effect": "Allow"
      }
  ]
}
EOF
```

### 0x03.创建权限策略

```bash
mc admin policy create myminio prom-metrics-policy prom-metrics-policy.json
```

:::tip 输出如下信息
Created policy `prom-metrics-policy` successfully.
:::

### 0x04.创建用户

- <font color="red">在多个 MinIO 实例上使用完全相同的用户名和密码，即可生成相同的 bearer_token，从而在 Prometheus 配置文件中仅需配置一个 job_name 即可。</font>

```bash
mc admin user add myminio <ACCESS_KEY> <SECRET_KEY>
```

:::tip 输出如下信息
Added user `prom-scraper` successfully.
:::

:::tip
- ACCESS_KEY 为 MinIO 用户名，约定为：prom-scraper。
- SECRET_KEY 为 MinIO 密码，需符合 MinIO 密码策略。
:::

### 0x05.绑定策略

:::warning
执行 `mc admin info myminio` 后，需确认 Erasure stripe size 为 1，才能成功执行绑定策略命令。如果没有 Erasure stripe size，直接执行生成 Token 的命令，多个 MinIO 实例的场景下，就无法合并到一个 job_name 中。
:::

```bash
mc admin policy attach myminio prom-metrics-policy --user prom-scraper
```

:::tip 输出如下信息
```md
Attached Policies: [prom-metrics-policy]
To User: prom-scraper
```
:::

### 0x06.生成统一的 Token

MinIO 默认对 Metrics 端点启用认证，需通过以下命令生成 Bearer Token：

```bash
mc admin prometheus generate myminio
```

:::tip 输出如下信息
```yaml
scrape_configs:
- job_name: minio-job
  bearer_token: <TOKEN>
  metrics_path: /minio/v2/metrics/cluster
  scheme: http
  static_configs:
  - targets: ['127.0.0.1:9000']
```
:::

:::warning
请妥善保存输出中的 `bearer_token`，后续配置 Prometheus 时需要用到。
:::

## 2.在 Server 端添加配置文件

进入Prometheus的安装目录

```bash
cd /usr/local/prometheus3.8
```

创建文件目录

```bash
mkdir -p scrape_configs/minio-exporters
```

修改主配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

:::tip scrape_config块下的配置示例
```yaml
  - job_name: 'minio-job'
    bearer_token: '<TOKEN>'
    metrics_path: /minio/v2/metrics/cluster
    file_sd_configs:
      - files: ['/usr/local/prometheus3.8/scrape_configs/minio-exporters/*.yml']
        refresh_interval: 30s
```
:::

新建实例配置文件（如：minio-1-41.yml）

```bash
vim scrape_configs/minio-exporters/<server-id>.yml
```

配置示例（后续修改该配置无需重启 Prometheus Server）

```md
# MinIO Exporter
- targets:
    - '10.1.0.41:9000'
  labels:
    job: 'MinIO-<server-id>' #服务器标识
```

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

| Dashboard ID | 名称 | 备注 |
| ------------ | ---- | -- |
| 13502        | [MinIO Dashboard](https://grafana.com/grafana/dashboards/13502-minio-dashboard/) | MinIO 官方面板 |

### 0x02.导入步骤

1. 登录 Grafana Web UI
2. 仪表盘 → 新建仪表盘 -> 导入仪表盘
3. 输入 Dashboard ID：`13502`
4. 点击 `Load`
5. 点击 `Import`

## 附录1.参考资料

- [使用Prometheus进行监控和报警](https://minio.org.cn/docs/minio/linux/operations/monitoring/collect-minio-metrics-using-prometheus.html)
- [使用Grafana监控MinIO服务器](https://minio.org.cn/docs/minio/linux/operations/monitoring/grafana.html)
- [Monitoring and alerting using Prometheus](https://docs.min.io/enterprise/aistor-object-store/operations/monitoring/metrics-and-alerts/collect-minio-metrics-using-prometheus/)
