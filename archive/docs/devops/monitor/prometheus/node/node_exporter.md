# node_exporter

## 安装node_exporter 1.10

```bash
ps -ef | grep node_exporter
mkdir -p /usr/local/exporter
cd /usr/local/exporter
tar -zxvf node_exporter-1.10.2.linux-amd64.tar.gz
mv node_exporter-1.10.2.linux-amd64 node_exporter1.10
rm -rf node_exporter-1.10.2.linux-amd64.tar.gz
```

## 配置node_exporter为系统服务

```bash
netstat -tulnp | grep 8100
```

```bash
vim /etc/systemd/system/node_exporter.service
```

```ini
[Unit]                                                                                                                                                
Description="node_exporter"                                                                                                                           
Documentation=https://prometheus.io/                                                                                                                  
After=network.target                                                                                                                                  
                                                                                                                                                      
[Service]                                                                                                                                             
ExecStart=/usr/local/exporter/node_exporter1.10/node_exporter \
            --web.listen-address=:8100 \
            --collector.systemd \
            --collector.systemd.unit-whitelist=(sshd|nginx).service \
            --collector.processes --collector.tcpstat                                                                                              
                                                                                                                                                      
[Install]                                                                                                                                             
WantedBy=multi-user.target
```

## 加载服务

```bash
# 重新加载服务
systemctl daemon-reload
# 设置开机启动
systemctl enable node_exporter --now
# 查看服务状态
systemctl status node_exporter
# 启动服务
systemctl start node_exporter
# 重启服务
systemctl restart node_exporter
# 停止服务
systemctl stop node_exporter
```