# 单节点 Kibana7.17 部署

[Past Releases of Kibana](https://www.elastic.co/cn/downloads/past-releases#kibana)

截止2025年07月27日，Kibana 7.17.* 系列最新稳定版为 7.17.29。

<font color="red"><b>每次安装需到官网查看 Kibana 7.17 系列的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 Kibana7.17
:::

## 1.安装

### 0x01.添加用户

```bash
groupadd kibana
useradd -g kibana kibana -s /sbin/nologin
```

### 0x02.下载

```bash
cd /usr/local/src
curl -O https://artifacts.elastic.co/downloads/kibana/kibana-7.17.29-linux-x86_64.tar.gz
tar -zxvf kibana-7.17.29-linux-x86_64.tar.gz
mv /usr/local/src/kibana-7.17.29-linux-x86_64 /usr/local/kibana7.17
```

### 0x02.修改配置

```bash
vim /usr/local/kibana7.17/config/kibana.yml
```

:::warning
在 Kibana 配置文件中设置了 server.host 为特定 IP （如：172.17.145.211）地址后，服务无法正常访问，而改为 0.0.0.0 后则可正常访问。目前尚未查明具体原因。
:::

```vim
# 监听所有可用网络接口
server.host: "0.0.0.0"

# Elasticsearch
elasticsearch.hosts: ["http://$IP:9200"]
elasticsearch.username: "$USERNAME"
elasticsearch.password: "$PASSWORD"

# 开启中文模式
i18n.locale: "zh-CN"
```

### 0x03. 修改文件目录属主

```bash
chown -R kibana:kibana /usr/local/kibana7.17
```

## 2.使用systemd运行Kibana

### 0x01.创建单元文件

```bash
vim /etc/systemd/system/kibana.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Kibana
Documentation=https://www.elastic.co/guide/en/kibana/7.17/get-started.html
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=kibana
Group=kibana
Environment=PID_DIR=/usr/local/kibana7.17
ExecStart=/usr/local/kibana7.17/bin/kibana --pid.file=${PID_DIR}/kibana.pid
Restart=always
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=3
WorkingDirectory=/usr/local/kibana7.17
LimitNOFILE=65536
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 0x02.重载单元文件

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable kibana --now
```

:::tip Systemctl指令
```bash
systemctl status kibana  #查看服务
systemctl start kibana   #启动服务
systemctl stop kibana    #停止服务
systemctl restart kibana #重启服务
systemctl enable kibana  #开启开机自启服务
systemctl disable kibana #关闭开机自启服务
```
:::

### 0x04.验证服务是否可用

```bash
netstat -nltp | grep 5601
```

:::tip 输出如下内容
tcp        0      0 0.0.0.0:5601            0.0.0.0:*               LISTEN      566/node
:::

### 0x05.使用浏览器访问

http://{$IP}:5601

![](/images/middleware/elastic/kibana.png)

## 附件1.参照资料

- https://www.elastic.co/guide/en/kibana/7.17/targz.html#install-linux64
- https://www.elastic.co/guide/en/kibana/7.17/start-stop.html