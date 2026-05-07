# Elasticsearch Exporter

截止2026年04月30日，Elasticsearch Exporter 的最新稳定版为 v1.10.0。

## 1.创建Exporter存放目录

```bash
mkdir -p /usr/local/prometheus-exporters
```

## 2.下载并解压缩

<https://github.com/prometheus-community/elasticsearch_exporter/releases>

```bash
cd /usr/local/src
wget https://github.com/prometheus-community/elasticsearch_exporter/releases/download/v1.10.0/elasticsearch_exporter-1.10.0.linux-amd64.tar.gz
```

```bash
tar zxvf elasticsearch_exporter-1.10.0.linux-amd64.tar.gz
mv elasticsearch_exporter-1.10.0.linux-amd64 \
    /usr/local/prometheus-exporters/elasticsearch_exporter-1.10
```

## 3.使用systemd管理进程

创建单元文件

```bash
vim  /etc/systemd/system/prometheus_es_exporter.service
```

添加如下内容（根据实际情况修改 Elasticsearch 连接参数）

::: el-tabs
\--- el-tab-item 单节点模式

```md
[Unit]
Description=Prometheus Elasticsearch Exporter
Documentation=https://github.com/prometheus-community/elasticsearch_exporter
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/local/prometheus-exporters/elasticsearch_exporter-1.10/elasticsearch_exporter \
  --web.listen-address=:9114 \
  --es.uri=http://elastic:<PASSWORD>@127.0.0.1:9200 \
  --es.timeout=20s
Restart=on-failure
SuccessExitStatus=0
SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
```

***

\--- el-tab-item 集群模式

```md
[Unit]
Description=Prometheus Elasticsearch Exporter
Documentation=https://github.com/prometheus-community/elasticsearch_exporter
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/local/prometheus-exporters/elasticsearch_exporter-1.10/elasticsearch_exporter \
  --web.listen-address=:9114 \
  --es.uri=http://elastic:<PASSWORD>@127.0.0.1:9200 \
  --es.all=true \
  --es.indices=true \
  --es.shards=true \
  --es.timeout=20s
Restart=on-failure
SuccessExitStatus=0
SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
```

***

:::

重载单元文件

```bash
systemctl daemon-reload
```

启动并设置开机自启

```bash
systemctl enable prometheus_es_exporter --now
```

查看状态

```bash
systemctl status prometheus_es_exporter
```

查看错误日志（如有需要）

```bash
journalctl -u prometheus_es_exporter -p err -n 50 --no-pager
```

## 4.在Server端添加配置文件

进入Prometheus的安装目录

```bash
cd /usr/local/prometheus3.8
```

创建文件目录

```bash
mkdir -p scrape_configs/elasticsearch-exporters
```

修改主配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

:::tip scrape\_config块下的配置示例

```yaml
  - job_name: 'elasticsearch-exporter'
    file_sd_configs:
      - files: ['/usr/local/prometheus3.8/scrape_configs/elasticsearch-exporters/*.yml']
        refresh_interval: 30s
```

:::

新建实例配置文件（如：es-1-41.yml）

```bash
vim scrape_configs/elasticsearch-exporters/<server-id>.yml
```

配置示例（修改 Prometheus 配置时无需重启服务，仅 prometheus.yml 文件除外）

```md
# Elasticsearch Exporter
- targets:
    - '10.1.0.41:9114'
  labels:
    job: 'ES Exporter'
    cluster: '项目名-集群名' 
    name: 'Elasticsearch-1-41' #服务器标识
    instance: '10.1.0.41' #私有IP
```

检查配置文件是否正确

```bash
./promtool check config ./prometheus.yml
```

重启Prometheus

```bash
systemctl restart prometheus
```

## 5.配置 Grafana Dashboard

### 0x01.Dashboard

| Dashboard ID | 名称 | 备注 |
| ------------ | ---- | ---- |
| 14191        | [Elasticsearch Overview](https://grafana.com/grafana/dashboards/14191-elasticsearch-overview/) | 官方 Dashboard，包含集群健康、CPU内存、磁盘、网络、JVM、索引等监控指标 |

### 0x02.导入步骤

1. 登录 Grafana Web UI
2. 仪表盘 → 新建仪表盘 -> 导入仪表盘
3. 输入 Dashboard ID：`14191`
4. 点击 `Load`
5. 点击 `Import`

## 附录1.参考资料

- [Prometheus OSS | Elasticsearch exporter](https://grafana.com/oss/prometheus/exporters/elasticsearch-exporter/)
- [Elasticsearch Exporter GitHub](https://github.com/prometheus-community/elasticsearch_exporter)
- [Grafana Dashboard - Elasticsearch Overview](https://grafana.com/grafana/dashboards/14191-elasticsearch-overview/)
- [Prometheus Community Helm Charts](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-elasticsearch-exporter)
