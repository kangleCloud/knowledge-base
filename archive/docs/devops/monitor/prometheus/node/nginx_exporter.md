# nginx_exporter

## 安装nginx_exporter 0.10.0

```bash
ps -ef | grep nginx_exporter
cd /usr/local/exporter
mkdir -p /usr/local/exporter/nginx-prometheus-exporter1.5
tar -zxvf nginx-prometheus-exporter_1.5.1_linux_amd64.tar.gz -C /usr/local/exporter/nginx-prometheus-exporter1.5
rm -rf nginx-prometheus-exporter_1.5.1_linux_amd64.tar.gz
```

## 配置nginx_exporter为系统服务

```bash
netstat -tulnp | grep 9115
```

```bash
vim /etc/systemd/system/nginx-prometheus-exporter.service
```

```ini
[Unit]
Description=nginx-prometheus-exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/exporter/nginx-prometheus-exporter1.5/nginx-prometheus-exporter \
  --web.listen-address=:9115 \
  --nginx.scrape-uri=http://127.0.0.1/nginx_status
Restart=always

[Install]
WantedBy=multi-user.target
```

### 配置nginx状态页面

- 在nginx配置文件中添加以下内容：

```bash
vim /Usr/local/nginx1.28/conf/conf.d/status.conf
```

```nginx
server {
    listen   80;
    server_name 127.0.0.1;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

## 加载服务

```bash
# 重新加载服务
systemctl daemon-reload
# 设置开机启动
systemctl enable nginx-prometheus-exporter --now
# 查看服务状态
systemctl status nginx-prometheus-exporter
# 启动服务
systemctl start nginx-prometheus-exporter
# 重启服务
systemctl restart nginx-prometheus-exporter
# 停止服务
systemctl stop nginx-prometheus-exporter
```