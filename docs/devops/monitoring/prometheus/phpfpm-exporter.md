# PHP-FPM Exporter

本文档说明如何使用 [hipages/php-fpm_exporter](https://github.com/hipages/php-fpm_exporter) 来暴露 PHP-FPM 的监控指标。截至2026年1月3日，该 Exporter 的最新稳定版为 v2.2.0。

## 1.启用status

编辑php-fpm配置文件（需基于实际情况）
```bash
vim /usr/local/php73/etc/php-fpm.d/www.conf
```

修改进程池配置
```vim
pm.status_path = /php-fpm73_status
```

重启php-fpm
```bash
systemctl restart php-fpm73
```

## 2.创建Exporter存放目录

```bash
mkdir -p /usr/local/prometheus-exporters
```

## 3.下载并解压缩

https://github.com/hipages/php-fpm_exporter/releases

```bash
cd /usr/local/src
wget https://mirrors.2500city.com/devops/Prometheus/exporters/php-fpm_exporter_2.2.0_linux_amd64.tar.gz
```

```bash
mkdir -p /usr/local/prometheus-exporters/php-fpm_exporter_2.2
tar zxvf php-fpm_exporter_2.2.0_linux_amd64.tar.gz \
  -C /usr/local/prometheus-exporters/php-fpm_exporter_2.2
```

## 4.使用systemd管理进程

配置以 php7.3 为例

### 0x01.创建service单元文件

```bash
vim  /etc/systemd/system/prometheus_php-fpm_exporter.service
```

添加如下内容
```vim
[Unit]
Description=Prometheus PHP-FPM Exporter
Documentation=https://github.com/hipages/php-fpm_exporter
After=network.target

[Service]
Type=simple
User=root
Group=root
Restart=on-failure
RestartSec=10
ExecStart=/usr/local/prometheus-exporters/php-fpm_exporter_2.2/php-fpm_exporter \
  server --phpfpm.scrape-uri tcp://127.0.0.1:9073/php-fpm73_status \
  --web.listen-address=:9253

[Install]
WantedBy=multi-user.target
```

:::tip
php-fpm_exporter 支持采集多个进程池。
:::

### 0x03.重载单元文件

```bash
systemctl daemon-reload
```

### 0x04.启动并设置开机自启

```bash
systemctl enable prometheus_php-fpm_exporter --now
```

### 0x05.查看状态
```bash
systemctl status prometheus_php-fpm_exporter
```

### 0x06.查看日志（如有需要）

```bash
journalctl -f -u prometheus_php-fpm_exporter
```

## 5.在Server端添加配置文件

进入Prometheus的安装目录
```bash
cd /usr/local/prometheus3.8
```

创建文件目录
```bash
mkdir -p scrape_configs/php-fpm_exporter
```

修改主配置文件
```bash
vim /usr/local/prometheus3.8/prometheus.yml
```
:::tip scrape_config块下的配置示例
```vim
  - job_name: 'php-fpm_exporter'
    file_sd_configs:
      - files:
        - '/usr/local/prometheus3.8/scrape_configs/php-fpm_exporter/*.yml'
        refresh_interval: 30s
```
:::

新建实例配置文件（如：web-1-21.yml）
```bash
vim scrape_configs/php-fpm_exporter/<server-id>.yml
```

:::tip 配置示例（后续修改该配置无需重启 Prometheus Server）
```vim
# Prometheus PHP-FPM Exporter
- targets:
    - '10.1.0.41:9253'
  labels:
    hostname: 'Middleware-1-41'
    instance: '10.1.0.41:9253'
```
:::

检查配置文件是否正确
```bash
/usr/local/prometheus3.8/promtool check config \
  /usr/local/prometheus3.8/prometheus.yml
```

重启Prometheus
```bash
systemctl restart prometheus
```

## 6.查看集成结果

访问 Prometheus Web UI 地址：`http://<IP>:9090`

![](/images/devops/monitoring/prometheus-exporter-phpfpm.png)

## 7.配置 Grafana Dashboard

### 7.1 导入 Dashboard

访问 Grafana 官方模板库：https://grafana.com/grafana/dashboards/3901

推荐使用以下模板：

| Dashboard ID | 名称 | 说明 |
|-------------|------|------|
| 3901 | PHP-FPM | 专门用于监控 PHP-FPM 的官方模板 |

### 7.2 导入步骤

1. 登录 Grafana Web UI
2. 点击左侧菜单 `+` → `Import`
3. 输入 Dashboard ID：`3901`
4. 点击 `Load`
5. 选择 Prometheus 数据源
6. 点击 `Import`

## 附录1.参考资料

- https://github.com/hipages/php-fpm_exporter
- https://grafana.com/grafana/dashboards/3901

