# 二进制文件安装Grafana

截至2026年1月11日，Grafana 官网发布的最新稳定版本为 v12.3.1。部署时应确保使用官网提供的[最新稳定版本进行安装](https://grafana.com/grafana/download?pg=oss-graf&edition=oss)。

## 1.创建Grafana用户

```bash
groupadd grafana
useradd -g grafana grafana -s /sbin/nologin
```

## 2.下载并解压缩

```bash
cd /usr/local/src
wget https://mirrors.2500city.com/devops/Grafana/grafana_12.3.1_20271043721_linux_amd64.tar.gz
tar zxvf grafana_12.3.1_20271043721_linux_amd64.tar.gz
mv grafana-12.3.1 /usr/local/grafana12.3
chown -R grafana:grafana  /usr/local/grafana12.3
```

## 3.创建数据目录

```bash
mkdir -p /data/grafana
chown -R grafana:grafana  /data/grafana

mkdir -p /var/log/grafana
chown -R grafana:grafana  /var/log/grafana
```

## 4.创建并修改配置文件

### 0x01.创建配置文件

```bash
cp /usr/local/grafana12.3/conf/sample.ini \
  /usr/local/grafana12.3/conf/grafana.ini
```

### 0x02.修改配置文件

```bash
vim  /usr/local/grafana12.3/conf/grafana.ini
```

如下配置参数修改（<font color="red">参数需逐个修改</font>）
```md
data = /data/grafana
logs = /var/log/grafana
plugins = /data/grafana/plugins

http_port = 3000
```

:::tip
当 Grafana 的默认端口 3000 已被占用时，约定改用 3001 端口作为替代。
:::

## 5.使用systemd管理进程

### 0x01.创建单元文件

```bash
vim  /etc/systemd/system/grafana-server.service
```

添加如下内容
> 配置文件中不支持在每行命令的后面添加注释
```md
[Unit]
Description=Grafana Server
Documentation=https://grafana.com/docs/grafana/latest/setup-grafana
After=network.target

[Service]
Type=simple
User=grafana
Group=grafana
ExecStart=/usr/local/grafana12.3/bin/grafana server \
  --config=/usr/local/grafana12.3/conf/grafana.ini \
  --homepath=/usr/local/grafana12.3 \
  --pidfile=/data/grafana/grafana-server.pid
  
Restart=on-failure
SuccessExitStatus=0
LimitNOFILE=65536
SyslogIdentifier=grafana
Restart=always

[Install]
WantedBy=multi-user.target
```

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable grafana-server --now
```

### 0x04. 验证服务是否可用

查看状态
```bash
systemctl status grafana-server
```

查看端口
```bash
netstat -nltp | grep 3000
```

查看日志（如有需要）
```bash
journalctl -f -u grafana-server
```

## 6.使用浏览器访问

访问地址：`http://<IP>:3000`，默认的账号及密码是 admin，新密码需要满足要求。

:::warning 密码要求
密码长度需不少于12位，且必须包含大小写字母、数字及特殊符号，同时严格禁止使用连续或重复字母（如abc、aaa）、连续或重复数字（如123、111）或可识别的时间数字（如2025、202506等），以最大限度保障系统安全。
:::

![](/images/devops/monitoring/grafana.png)

## 附录1.参考文档

- [Install Grafana as a standalone binary](https://grafana.com/docs/grafana/latest/setup-grafana/installation/redhat-rhel-fedora/#install-grafana-as-a-standalone-binary)
