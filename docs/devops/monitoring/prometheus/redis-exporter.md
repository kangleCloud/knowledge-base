# Redis Exporter

截止2026年3月21日，Redis Exporter 的最新稳定版为 v1.82.0。

## 1.创建Exporter存放目录

```bash
mkdir -p /usr/local/prometheus-exporters
```

## 2.下载并解压缩

<https://github.com/oliver006/redis_exporter/releases>

```bash
cd /usr/local/src
wget https://mirrors.2500city.com/devops/Prometheus/exporters/redis_exporter-v1.82.0.linux-amd64.tar.gz
```

```bash
tar zxvf redis_exporter-v1.82.0.linux-amd64.tar.gz
mv redis_exporter-v1.82.0.linux-amd64 \
    /usr/local/prometheus-exporters/redis_exporter-1.82.0
```

## 3.使用systemd管理进程

创建单元文件

```bash
vim  /etc/systemd/system/prometheus_redis_exporter.service
```

添加如下内容（根据实际情况修改 Redis 连接参数）

```md
[Unit]
Description=Prometheus Redis Exporter
Documentation=https://github.com/oliver006/redis_exporter
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/local/prometheus-exporters/redis_exporter-1.82.0/redis_exporter \
  --web.listen-address=:9121 \
  --redis.addr=redis://127.0.0.1:6379 \
  --redis.password=<PASSWORD>
Restart=on-failure
SuccessExitStatus=0
SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
```

重载单元文件

```bash
systemctl daemon-reload
```

启动并设置开机自启

```bash
systemctl enable prometheus_redis_exporter --now
```

查看状态

```bash
systemctl status prometheus_redis_exporter
```

查看日志（如有需要）

```bash
journalctl -f -u prometheus_redis_exporter
```

## 4.在Server端添加配置文件

进入Prometheus的安装目录

```bash
cd /usr/local/prometheus3.8
```

创建文件目录

```bash
mkdir -p scrape_configs/redis-exporters
```

修改主配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

:::tip scrape_config块下的配置示例
```yaml
  - job_name: 'redis-exporter'
    file_sd_configs:
      - files: ['/usr/local/prometheus3.8/scrape_configs/redis-exporters/*.yml']
        refresh_interval: 30s
```
:::

新建实例配置文件（如：redis-1-41.yml）

```bash
vim scrape_configs/redis-exporters/<server-id>.yml
```

配置示例（修改 Prometheus 配置时无需重启服务，仅 prometheus.yml 文件除外）

```md
# Redis Exporter
- targets:
    - '10.1.0.41:9121'
  labels:
    group: '项目名称'
    name: 'Middleware-1-41' #服务器标识
    instance: '10.1.0.41' #私有IP
    iid: '' #主机名/弹性IP（客户提供的堡垒机）
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
| ------------ | ---- | -- |
| 17507        | [Redis Exporter Dashboard CN 20221128-StarsL.cn](https://grafana.com/grafana/dashboards/17507-1-redis-exporter-dashboard/) | -- |

### 0x02.导入步骤

1. 登录 Grafana Web UI
2. 仪表盘 → 新建仪表盘 -> 导入仪表盘
3. 输入 Dashboard ID：`17507`
4. 点击 `Load`
5. 点击 `Import`

### 0x03.配置变量

1. 点击 `面板` → `变量` → `group`
2. 输入正则表达式：`/项目名/`

## **<font color="red">附录1.补充</font>**

Redis 监控配置规范文档（Grafana 展示异常∞问题处理）

一、问题现象

在使用 Grafana + Prometheus + redis_exporter 监控 Redis 时，内存使用率指标出现 ∞（正无穷） 符号，无法正常展示百分比数据。

二、问题原因

1、Redis 默认配置 maxmemory 0，即不限制内存使用

2、Grafana 内存使用率计算公式：
```bash
内存使用率(%) = used_memory / maxmemory * 100
```

3、因 maxmemory=0，分母为 0 导致计算结果为无穷大，面板展示为 ∞


三、Redis 配置规范（解决∞显示问题）

1、临时生效（重启失效）

```bash
redis-cli -a '<password>' CONFIG SET maxmemory 8G
```
Redis 最大内存 ≦ 服务器物理内存的 70%～80%

```bash
redis-cli -a '<password>' CONFIG SET maxmemory-policy allkeys-lru
```
设置内存满了以后的淘汰策略：删除最久未使用的缓存

:::warning
- Redis 最大内存 ≦ 服务器物理内存的 70%～80%
- 禁止设置为 0（无限制），否则 Grafana 会显示 ∞，且存在 OOM 风险
- 生产环境必须搭配内存淘汰策略 allkeys-lru
- 容器 / 虚拟机环境需小于容器限制内存，防止被系统 OOM kill
:::

2、永久生效（修改配置文件）

编辑 redis.conf：

```bash
# 限制最大使用内存（根据服务器实际资源调整）
maxmemory 8G

# 内存满后淘汰策略（缓存场景推荐）
maxmemory-policy allkeys-lru

# 密码配置（保持现有密码不变）
requirepass "你的Redis密码"
```

重启 Redis 服务生效。

## 附录2.参考资料

- [Redis Exporter GitHub](https://github.com/oliver006/redis_exporter)
- [Prometheus OSS | Redis exporter](https://grafana.com/oss/prometheus/exporters/redis-exporter/)

