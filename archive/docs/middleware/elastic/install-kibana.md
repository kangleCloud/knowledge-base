# 单节点kibana安装

### 1、依赖软件：jdk8

### 2、下载kibana

```bash
# 下载地址 https://repo.huaweicloud.com/kibana/
# 下载指定大版本最新版
tar zxvf kibana-7.15.1-linux-x86_64.tar.gz
mv kibana-7.15.1-linux-x86_64 /usr/local/kibana
```

### 3、设置配置文件

```bash
cd /usr/local/kibana

vim config/kibana.yml

server.name: kibana

# kibana的主机地址 0.0.0.0可表示监听所有IP
server.host: "0.0.0.0"

# 这边设置自己es的地址，
elasticsearch.hosts: [ "http://**.**.**.**:9200" ]
elasticsearch.username: 'elastic'
elasticsearch.password: '********'

# # 显示登陆页面
xpack.monitoring.ui.container.elasticsearch.enabled: true

# 开启中文模式
i18n.locale: "zh-CN"

```



### 5、创建用户和目录

```bash
# 创建elastic用户
groupadd elastic
useradd elastic -g elastic -p elastic
# 赋权限
chown elastic:elastic -R /usr/local/kibana
```

### 6、启动

### 7、配置systemd守护

`vim /etc/systemd/system/kibana.service`

```
[Unit]
Description=kibana
After=network.target

[Service]
#Environment="JAVA_HOME=/usr/local/jdk8"
Type=simple
User=elastic
Group=elastic
ExecStart=/usr/local/kibana/bin/kibana
Restart=no
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

启动kibana并配置自启
```
systemctl daemon-reload
systemctl restart kibana
systemctl status kibana
systemctl enable kibana

```