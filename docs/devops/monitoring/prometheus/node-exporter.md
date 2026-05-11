# Node/System Exporter

截止2025年12月28日，NGINX Prometheus Exporter 的最新稳定版为 v1.10.2。

## 1.创建Exporter存放目录

```bash
mkdir -p /usr/local/prometheus-exporters
```

## 2.下载并解压缩

https://prometheus.io/download/#node_exporter

```bash
cd /usr/local/src
wget https://github.com/prometheus/node_exporter/releases/download/v1.10.2/node_exporter-1.10.2.linux-amd64.tar.gz
```

```bash
tar zxvf node_exporter-1.10.2.linux-amd64.tar.gz
mv node_exporter-1.10.2.linux-amd64 \
    /usr/local/prometheus-exporters/node_exporter-1.10
```

## 3.使用systemd管理进程

创建单元文件

```bash
vim  /etc/systemd/system/prometheus_node_exporter.service
```

添加如下内容

```md
[Unit]
Description=Prometheus Node Exporter
Documentation=https://prometheus.io/docs/guides/node-exporter/
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/local/prometheus-exporters/node_exporter-1.10/node_exporter \
  --web.listen-address=:9100
Restart=on-failure
SuccessExitStatus=0
SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
```

:::tip
当 node_exporter 的默认端口 9100 已被占用时，约定改用 19100 端口作为替代。
:::

重载单元文件

```bash
systemctl daemon-reload
```

启动并设置开机自启

```bash
systemctl enable prometheus_node_exporter --now
```

查看状态

```bash
systemctl status prometheus_node_exporter
```

查看日志（如有需要）

```bash
journalctl -f -u prometheus_node_exporter
```

## 4.在Server端添加配置文件

进入Prometheus的安装目录

```bash
cd /usr/local/prometheus3.8
```

创建文件目录

```bash
mkdir -p scrape_configs/node-exporters
```

修改主配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

:::tip scrape\_config块下的配置示例

```md
  - job_name: 'node-exporter'
    file_sd_configs:
      - files: ['/usr/local/prometheus3.8/scrape_configs/node-exporters/*.yml']
        refresh_interval: 30s
```

:::

新建实例配置文件（如：proxy-1-21.yml、middleware-1-41.yml）

```bash
vim scrape_configs/node-exporters/<server-id>.yml
```

配置示例（修改 Prometheus 配置时无需重启服务，仅 prometheus.yml 文件除外）
::: tabs
=== 通用JOB分组版（多个Prometheus服务）
[Node Exporter Dashboard 20240520 通用JOB分组版](https://grafana.com/grafana/dashboards/16098-node-exporter-dashboard-20240520-job/)
```md
# Node Exporter
- targets:
    - '10.1.0.41:9100'
  labels:
    origin_prometheus: '项目名'
    job: 'Node/System Exporter'
    nodename: 'middleware-1-41' #服务器标识
    instance: '10.1.0.41' #私有IP
    iid: '' #主机名/弹性IP（客户提供的堡垒机）
```
---
=== TenSunS自动同步版（单个Prometheus服务）
[Node Exporter Dashboard 20240520 TenSunS自动同步版](https://grafana.com/grafana/dashboards/8919-node-exporter-dashboard-20240520-tensuns/)
```md
# Node Exporter
- targets:
    - '10.1.0.41:9100'
  labels:
    group: '分组名'
    name: 'middleware-1-41' #服务器标识
    instance: '10.1.0.41' #私有IP
    iid: '' #主机名/弹性IP（客户提供的堡垒机）
```
---
:::

--------------------------------------- >>>>>> 此处为分割线 <<<<<< ---------------------------------------

检查配置文件是否正确

```bash
./promtool check config ./prometheus.yml
```

重启Prometheus

```bash
systemctl restart prometheus
```

## 5.查看集成结果

访问 Prometheus Web UI 地址：`http://<IP>:9091`

![](/images/devops/monitoring/prometheus-exporter-node.png)

## 6.配置 Grafana Dashboard

### 0x01. Dashboard

| Dashboard ID |     名称     |       备注       |
| ------------ | ------------ | --------------- |
| 8919         | [Node Exporter Dashboard 20240520 TenSunS自动同步版](https://grafana.com/grafana/dashboards/8919-node-exporter-dashboard-20240520-tensuns/) | 单体模式 |
| 16098        | [Node Exporter Dashboard 20240520 通用JOB分组版](https://grafana.com/grafana/dashboards/16098-node-exporter-dashboard-20240520-job/)        | 集群模式 |

### 0x02.导入步骤

1. 登录 Grafana Web UI
2. 仪表盘 → 新建仪表盘 -> 导入仪表盘
3. 输入 Dashboard ID：`16098`
4. 点击 `Load`
5. 点击 `Import`

### 0x03.配置变量

1. 点击 `面板` → `变量` → `origin_prometheus`
2. 输入正则表达式：`/项目名/`

## 附录1.参考资料

- [Exporters and integrations](https://prometheus.io/docs/instrumenting/exporters/)
- [Monitoring Linux host metrics with the Node Exporter](https://prometheus.io/docs/guides/node-exporter/) | [中文](https://prometheus.ac.cn/docs/guides/node-exporter/)
