# elasticsearch_exporter

## 安装elasticsearch_exporter 1.5.0

```bash
ps -ef | grep elasticsearch_exporter
mkdir -p /usr/local/exporter
cd /usr/local/exporter
tar -zxvf elasticsearch_exporter-1.5.0.linux-amd64.tar.gz
mv elasticsearch_exporter-1.5.0.linux-amd64 elasticsearch_exporter1.5
rm -rf elasticsearch_exporter-1.5.0.linux-amd64.tar.gz
```

## 配置elasticsearch_exporter为系统服务

```bash
vim /etc/systemd/system/elasticsearch_exporter.service
```

```ini
[Unit]
Description=Elasticsearch Exporter
After=network.target

[Service]
Environment="ES_USER=elastic"
Environment="ES_PASS=:%%25XWj2rcJ$Z6lpI"
Environment="ES_HOST=192.168.1.26:9200"

ExecStart=/usr/local/exporter/elasticsearch_exporter1.9/elasticsearch_exporter \
  --es.all \
  --es.indices \
  --es.indices_settings \
  --es.shards \
  --es.timeout=10s \
  --web.listen-address=:9114 \
  --web.telemetry-path=/metrics \
  --es.uri="http://${ES_USER}:${ES_PASS}@${ES_HOST}"

[Install]
WantedBy=multi-user.target
```

## 加载服务

```bash
# 重新加载服务
systemctl daemon-reload
# 设置开机启动
systemctl enable elasticsearch_exporter --now
# 查看服务状态
systemctl status elasticsearch_exporter
# 启动服务
systemctl start elasticsearch_exporter
# 重启服务
systemctl restart elasticsearch_exporter
# 停止服务
systemctl stop elasticsearch_exporter
```