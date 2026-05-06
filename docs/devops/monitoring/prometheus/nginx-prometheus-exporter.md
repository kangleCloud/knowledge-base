# Nginx Prometheus Exporter

截止2025年12月29日，NGINX Prometheus Exporter 的最新稳定版为 v1.5.1。

## 1.配置Nginx的stub_status

参照 <a href="/docs/devops/base/nginx/best-practices.html#_6-http-stub-status" target="_blank">Nginx最佳实践 > http_stub_status</a>

## 2.创建Exporter存放目录

```bash
mkdir -p /usr/local/prometheus-exporters
```

## 3.下载并解压缩

https://github.com/nginx/nginx-prometheus-exporter/tags

```bash
cd /usr/local/src
wget https://mirrors.2500city.com/devops/Prometheus/exporters/nginx-prometheus-exporter_1.5.1_linux_amd64.tar.gz
```

```bash
mkdir -p /usr/local/prometheus-exporters/nginx-prometheus-exporter_1.5
tar zxvf nginx-prometheus-exporter_1.5.1_linux_amd64.tar.gz \
  -C /usr/local/prometheus-exporters/nginx-prometheus-exporter_1.5
```

## 4.使用systemd管理进程

:::warning
配置 NGINX_SCRAPE_URI 时，需依据实际部署环境确定其具体取值，并验证该端点的网络可达性。
:::

### 0x01.创建socket单元文件

```bash
vim  /etc/systemd/system/nginx-prometheus-exporter.socket
```

添加如下内容
```vim
[Unit]
Description=NGINX Prometheus Exporter

[Socket]
ListenStream=9113

[Install]
WantedBy=sockets.target
```

https://github.com/nginx/nginx-prometheus-exporter/blob/main/examples/systemd/nginx_exporter.socket

### 0x02.创建service单元文件

```bash
vim  /etc/systemd/system/nginx-prometheus-exporter.service
```

添加如下内容
```vim
[Unit]
Description=NGINX Prometheus Exporter
Requires=nginx-prometheus-exporter.socket

[Service]
ExecStart=/usr/local/prometheus-exporters/nginx-prometheus-exporter_1.5/nginx-prometheus-exporter \
  --nginx.scrape-uri=http://127.0.0.1:80/nginx_status \
  --web.systemd-socket

[Install]
WantedBy=multi-user.target
```

https://github.com/nginx/nginx-prometheus-exporter/blob/main/examples/systemd/nginx_exporter.service

### 0x03.重载单元文件

```bash
systemctl daemon-reload
```

### 0x04.启动并设置开机自启

```bash
systemctl enable nginx-prometheus-exporter --now
```

### 0x05.查看状态
```bash
systemctl status nginx-prometheus-exporter
```

### 0x06.查看日志（如有需要）

```bash
journalctl -f -u prometheus
```

## 5.在Server端添加配置文件

进入Prometheus的安装目录
```bash
cd /usr/local/prometheus3.8
```

创建文件目录
```bash
mkdir -p scrape_configs/nginx-prometheus-exporter
```

修改主配置文件
```bash
vim /usr/local/prometheus3.8/prometheus.yml
```
:::tip scrape_config块下的配置示例
```vim
  - job_name: 'nginx-prometheus-exporter'
    file_sd_configs:
      - files:
        - '/usr/local/prometheus3.8/scrape_configs/nginx-prometheus-exporter/*.yml'
        refresh_interval: 30s
```
:::

新建实例配置文件（如：proxy-1-21.yml）
```bash
vim scrape_configs/nginx-prometheus-exporter/<server-id>.yml
```

:::tip 配置示例（后续修改该配置无需重启 Prometheus Server）
```vim
# Nginx Prometheus Exporter
- targets:
    - '10.1.0.41:9113'
  labels:
    instance: '10.1.0.41'
```
:::

检查配置文件是否正确
```bash
./promtool check config ./prometheus.yml
```

重启Prometheus
```bash
systemctl restart prometheus
```

## 6.查看集成结果

访问 Prometheus Web UI 地址：`http://<IP>:9090`

![](/images/devops/monitoring/prometheus-exporter-nginx.png)

## 7.配置 Grafana Dashboard

### 0x01.导入官方Dashboard

Grafana 官方提供了 NGINX Prometheus Exporter 的 Dashboard，您可以通过以下步骤导入：

1. 登录 Grafana Web UI（默认地址：`http://<IP>:3000`）
2. 点击左侧菜单栏的 **Dashboards** → **Browse**
3. 点击右上角的 **Import** 按钮
4. 在 **Import via grafana.com** 输入框中输入 Dashboard ID：`12708`
5. 点击 **Load** 按钮
6. 在接下来的页面中：
   - 选择您的 Prometheus 数据源
   - 可以根据需要修改 Dashboard 名称和文件夹
   - 点击 **Import** 按钮完成导入

### 0x02.常用Dashboard

除了官方 Dashboard 外，您还可以使用以下社区维护的 Dashboard：

| Dashboard ID | 名称 | 描述 |
|--------------|------|------|
| 12708 | NGINX Prometheus Exporter | 官方推荐的 NGINX 监控 Dashboard |
| 768 | NGINX Overview | 全面的 NGINX 监控视图 |
| 9614 | NGINX Plus Stats | 适用于 NGINX Plus 的监控 Dashboard |

### 0x03.验证Dashboard

导入完成后，您可以在 Grafana 中查看 NGINX 相关指标，包括：

- 活跃连接数
- 请求速率
- 响应状态码分布
- 上游服务器状态
- 连接建立速率

确保您的 Dashboard 能够正常显示数据，说明 NGINX Prometheus Exporter 已经成功集成到 Grafana 中。

## 附录1.参考资料

- https://github.com/nginx/nginx-prometheus-exporter
- https://grafana.com/grafana/dashboards/12708-nginx-prometheus-exporter/

