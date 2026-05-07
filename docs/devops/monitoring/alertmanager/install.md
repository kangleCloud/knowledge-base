# 安装 Alertmanager

- https://github.com/prometheus/alertmanager/releases

:::warning 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 Alertmanager0.25
:::

## 1. 基于二进制包安装

### 0x01.下载压缩的tar文件二进制

```bash
cd /usr/local/src
wget https://github.com/prometheus/alertmanager/releases/download/v0.25.0/alertmanager-0.25.0.linux-amd64.tar.gz
```

### 0x02.解压文件并移动至 /usr/local 目录

```bash
cd /usr/local/src
tar xvf alertmanager-0.25.0.linux-amd64.tar.gz
cp -ar alertmanager-0.25.0.linux-amd64 /usr/local/alertmanager0.25
```

## 2. 修改配置文件
`vim /usr/local/alertmanager0.25/alertmanager.yml`

```vim
global: 
  # 当alertmanager持续多长时间未接收到告警后标记告警状态为 resolved
  resolve_timeout: 5m
  # 配置邮件发送信息
  smtp_smarthost: 'smtp.163.com:25' # snmtp主机
  smtp_from: 'xx@163.com'   # 发件人邮箱
  smtp_auth_username: 'xx@163.com'  # 发件人邮箱账号
  smtp_auth_password: '*****'    # 发件人邮箱密码
  smtp_require_tls: false
  # 所有报警信息进入后的根路由，用来设置报警的分发策略
route:
  # 接收到的报警信息里面有许多alertname=NodeLoadHigh 这样的标签的报警信息将会批量被聚合到一个分组里面
  group_by: ['alertname']
  # 当一个新的报警分组被创建后，需要等待至少 group_wait 时间来初始化通知，如果在等待时间内当前group接收到了新的告警，这些告警将会合并为一个通知向receiver发送
  group_wait: 30s

  # 相同的group发送告警通知的时间间隔
  group_interval: 30s
  # 如果一个报警信息已经发送成功了，等待 repeat_interval 时间来重新发送
  repeat_interval: 1m

  # 默认的receiver：如果一个报警没有被一个route匹配，则发送给默认的接收器
  receiver: default

  # 上面所有的属性都由所有子路由继承，并且可以在每个子路由上进行覆盖。
   routes:
   - {}
  # 配置告警接收者的信息
  receivers:
  - name: 'default'     # 收件人
    email_configs:
    - to: 'xx@163.com'  # 收件人邮箱
      send_resolved: true  # 接受告警恢复的通知
```

## 3. 使用Systemd管理进程

### 0x01. 创建配置文件

`vim /etc/systemd/system/alertmanager.service`
```vim
[Unit]
Description="alertmanager"
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/alertmanager0.25/alertmanager
WorkingDirectory=/usr/local/alertmanager0.25
Restart=on-failure
SuccessExitStatus=0
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### 0x02.设置alertmanager 服务开机自启
```bash
systemctl daemon-reload
systemctl enable alertmanager --now
```

## 4.常用命令

```bash
# 查看运行状态
systemctl status alertmanager

# 停止应用
systemctl stop alertmanager

# 开始应用
systemctl start alertmanager

# 重启应用
systemctl restart alertmanager

# 校验配置文件
./amtool check-config alertmanager.yml
```