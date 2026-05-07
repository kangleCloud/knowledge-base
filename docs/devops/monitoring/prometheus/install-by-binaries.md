# 二进制文件安装Prometheus

截至2025年12月21日，Prometheus官网发布的最新稳定版本为3.8.1。部署时应确保使用官网提供的[最新稳定版本进行安装](https://prometheus.io/download/)。

## 1.下载并解压缩

```bash
cd /usr/local/src
wget https://github.com/prometheus/prometheus/releases/download/v3.8.1/prometheus-3.8.1.linux-amd64.tar.gz
tar zxvf prometheus-3.8.1.linux-amd64.tar.gz
mv prometheus-3.8.1.linux-amd64 /usr/local/prometheus3.8
```

## 2.创建Prometheus用户

```bash
groupadd prometheus
useradd -g prometheus -M -s /sbin/nologin prometheus
```

## 3.创建数据目录

```bash
mkdir -p /data/prometheus
chown -R prometheus:prometheus /data/prometheus
```

## 4.修改配置文件

备份配置文件

```bash
cp /usr/local/prometheus3.8/prometheus.yml \
  /usr/local/prometheus3.8/prometheus.yml.bak
```

修改配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

删除 scrape\_configs 块配置（不包含`scrape_configs:`这一行）

```md
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "prometheus"

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["localhost:9090"]
       # The label name is added as a label `label_name=<label_value>` to any timeseries scraped from this config.
        labels:
          app: "prometheus"
```

检查配置文件是否正确

```bash
/usr/local/prometheus3.8/promtool check config \
  /usr/local/prometheus3.8/prometheus.yml
```

## 5.使用systemd管理进程

### 0x01.创建单元文件

```bash
vim  /etc/systemd/system/prometheus.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```md
[Unit]
Description=Prometheus
Documentation=https://prometheus.io/docs/introduction/overview/
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecStart=/usr/local/prometheus3.8/prometheus \
  --config.file=/usr/local/prometheus3.8/prometheus.yml \
  --storage.tsdb.path=/data/prometheus \
  --storage.tsdb.retention.time=180d \
  --web.enable-lifecycle \
  --web.listen-address=":9091"
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
SuccessExitStatus=0
LimitNOFILE=65536
SyslogIdentifier=prometheus
Restart=always
StandardOutput=append:/data/prometheus/prometheus.log
StandardError=append:/data/prometheus/prometheus.error.log

[Install]
WantedBy=multi-user.target
```

:::tip
Prometheus默认监听端口为9090，为了避免与其他服务（如：Cockpit）冲突，这里将Prometheus监听端口改为9091。
:::

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable prometheus --now
```

:::tip Systemd指令

```bash
systemctl status prometheus
systemctl restart prometheus
systemctl start prometheus
systemctl stop prometheus
systemctl reload prometheus
```

:::

### 0x04.查看日志

```bash
journalctl -f -u prometheus
```

## 6.基本认证

待完善

[Securing Prometheus API and UI endpoints using basic auth](https://prometheus.io/docs/guides/basic-auth) | [中文](https://prometheus.ac.cn/docs/guides/basic-auth/)

## 7.使用浏览器访问

访问地址：`http://<IP>:9091`

!\[]\(/images/devops/monitoring/prometheus.png null)

## 附录1.常用命令

检查配置文件是否正确

```bash
cd /usr/local/prometheus3.8
./promtool check config ./prometheus.yml
```

动态加载配置文件

```bash
curl -X POST 127.0.0.1:1/-/reload
```

## 附录2.Exporters

- Node/System Exporter - Port: 9100
- Nginx Prometheus Exporter - Port: 9113
- MySQL Server Exporter - Port: 9104
- Redis Exporter - Port: 9121
- Elasticsearch Exporter - Port: 9114
- RabbitMQ Exporter - Port: 15692
- PHP-FPM Exporter - Port: 9253

[Prometheus Downlaod](https://prometheus.io/download/)

[Exporters and integrations](https://prometheus.io/docs/instrumenting/exporters/)

[Prometheus Exporter Quickstarts | Grafana Labs](https://grafana.com/oss/prometheus/exporters/)

## 附录3.参考资料

- [Getting started](https://prometheus.io/docs/prometheus/latest/getting_started) | [中文](https://prometheus.ac.cn/docs/prometheus/latest/getting_started)
