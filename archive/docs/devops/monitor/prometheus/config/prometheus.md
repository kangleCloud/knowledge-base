# Prometheus Configuration Guide

## 配置文件

- Prometheus 的配置文件通常使用 YAML 格式编写，默认文件名为 `prometheus.yml`。以下是一个基本的配置文件示例：

```yaml
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
   - "/usr/local/prometheus/rules/*.yml"
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "prometheus"

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["192.168.1.25:9090"]
        labels:
          group: 'gl_zone_prometheus'
          addr: '192.168.1.25'
          produce: 'prometheus'
          nodeName: 'prometheus-1-25'

  - job_name: "nginx-exporter"
    file_sd_configs:
    - files: ['/usr/local/prometheus3.4/monitor_config/nginx_config/*.yml']
      refresh_interval: 5s

  - job_name: "node-exporter"
    file_sd_configs:
    - files: ['/usr/local/prometheus3.4/monitor_config/host_config/*.yml']
      refresh_interval: 5s

  - job_name: "elasticsearch-exporter"
    file_sd_configs:
    - files: ['/usr/local/prometheus3.4/monitor_config/elasticsearch_config/*.yml']
      refresh_interval: 5s
```