# MySQL Server Exporter

截止2026年1月2日，MySQL Server Exporter 的最新稳定版为 v0.18.0。

## 1.前置条件

### 0x01.创建MySQL账号

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`'`、`"`、`\`。
:::

连接Mysql

```bash
mysql -uroot -p
```

执行如下sql语句

```sql
CREATE USER 'exporter'@'localhost' IDENTIFIED BY '<PASSWORD>' WITH MAX_USER_CONNECTIONS 3;
```

```sql
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
```

```sql
FLUSH PRIVILEGES;
```

## 2.创建Exporter存放目录

```bash
mkdir -p /usr/local/prometheus-exporters
```

## 3.下载并解压缩

<https://prometheus.io/download/#mysqld_exporter>

```bash
cd /usr/local/src
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.18.0/mysqld_exporter-0.18.0.linux-amd64.tar.gz
```

```bash
tar zxvf mysqld_exporter-0.18.0.linux-amd64.tar.gz
mv mysqld_exporter-0.18.0.linux-amd64 \
    /usr/local/prometheus-exporters/mysqld_exporter-0.18
```

## 4.使用systemd管理进程

### 0x01.创建.my.cnf

```bash
vim /usr/local/prometheus-exporters/mysqld_exporter-0.18/.my.cnf
```

配置如下

```ini
[client]
host=localhost
port=3306
user=exporter
password=<PASSWORD>
socket=/data/mysql/mysqld.sock
```

:::tip
socket路径参照MySQL配置文件中的socket路径。
:::

### 0x02.创建单元文件

```bash
vim  /etc/systemd/system/prometheus_mysqld_exporter.service
```

添加如下内容

```vim
[Unit]
Description=Prometheus Mysql Exporter
Documentation=https://github.com/prometheus/mysqld_exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/prometheus-exporters/mysqld_exporter-0.18/mysqld_exporter \
  --config.my-cnf=/usr/local/prometheus-exporters/mysqld_exporter-0.18/.my.cnf \
  --web.listen-address=:9104
Restart=always

[Install]
WantedBy=multi-user.target
```

### 0x03.重载单元文件

```bash
systemctl daemon-reload
```

### 0x04.启动并设置开机自启

```bash
systemctl enable prometheus_mysqld_exporter --now
```

查看状态

```bash
systemctl status prometheus_mysqld_exporter
```

查看日志（如有需要）

```bash
cat /var/log/messages | grep mysqld_exporter
```

## 5.在Server端添加配置文件

进入Prometheus的安装目录

```bash
cd /usr/local/prometheus3.8
```

创建文件目录

```bash
mkdir -p scrape_configs/mysqld-exporters
```

修改主配置文件

```bash
vim /usr/local/prometheus3.8/prometheus.yml
```

:::tip scrape\_config块下的配置示例

```vim
  - job_name: 'mysqld-exporter'
    file_sd_configs:
      - files:
        - '/usr/local/prometheus3.8/scrape_configs/mysqld-exporters/*.yml'
        refresh_interval: 30s
```

:::

新建实例配置文件（如：mysql-1-41.yml）

```bash
vim scrape_configs/mysqld-exporters/<server-id>.yml
```

:::tip 配置示例（后续修改该配置无需重启 Prometheus Server）

```md
# Mysqld Exporter
- targets:
    - '10.1.0.41:9104'
  labels:
    job: 'MySQL Server Exporter'
    instance: 'project-mysql-1-41' #服务器标识
    ip: '10.1.0.41' #私有IP
    iid: '' #主机名/弹性IP（客户提供的堡垒机）
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

访问 Prometheus Web UI 地址：`http://<IP>:9091`

!\[]\(/images/devops/monitoring/prometheus-exporter-mysql.png null)

## 7.配置 Grafana Dashboard

### 0x01.Dashboard

| Dashboard ID | 名称                                                                                             | 备注                   |
| ------------ | ---------------------------------------------------------------------------------------------- | -------------------- |
| 14057        | [MySQL Exporter Quickstart and Dashboard](https://grafana.com/grafana/dashboards/14057-mysql/) | Made by Grafana Labs |

### 0x02.导入步骤

1. 登录 Grafana Web UI
2. 点击左侧菜单 `+` → `Import`
3. 输入 Dashboard ID：`14057`
4. 点击 `Load`
5. 选择 Prometheus 数据源
6. 点击 `Import`

### 0x03.配置变量

1. 点击 `面板` → `变量` → `instance`
2. 输入正则表达式：`/服务器标识中的项目别名/`
3. 取消勾选`选择内容选项`中的`多值`、`允许自定义`、`包含"全部"选项`。

### 0x04.新增IP变量

面板筛选项新增基于`instance`变量的 IP 地址显示功能，用于显示当前实例的 IP 地址。<font color="red">（注意：为简化面板配置，该变量仅用于显示，不用于筛选。）</font>

1. 点击 `面板` → `变量` → `新增变量`
2. 设置如下参数：
   - 变量类型：`查询`
   - 概况 • 名称：`ip`
   - 查询选项 • 数据源：`Prometheus`
   - 查询选项 • Query type: `Label values`
   - 查询选项 • Label\*：`ip`
   - 查询选项 • Label filters：`instance=${instance}`

## 附录1.参考资料

- <https://github.com/prometheus/mysqld_exporter>
- <https://www.cnblogs.com/wangyongqiang/p/15823372.html>
