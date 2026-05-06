# Systemd 配置

## 一、示例

### 0x01. Keepalived service示例

```
[Unit]
Description=LVS and VRRP High Availability Monitor
After=network-online.target syslog.target
Wants=network-online.target
Documentation=man:keepalived(8)
Documentation=man:keepalived.conf(5)
Documentation=man:genhash(1)
Documentation=https://keepalived.org

[Service]
Type=forking
PIDFile=/run/keepalived.pid
KillMode=process
EnvironmentFile=-/usr/local/keepalived2.2/etc/sysconfig/keepalived
ExecStart=/usr/local/keepalived2.2/sbin/keepalived  $KEEPALIVED_OPTIONS
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target

```

参照<a href="/docs/middleware/keepalived/introduction.html#keepalived-service示例"> Keepalived.service示例 </a>

### 0x02. MinIO service示例

```
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/minio2309/bin/minio

[Service]
WorkingDirectory=/usr/local/minio2309

User=minio
Group=minio

EnvironmentFile=-/usr/local/minio2309/minio.conf
ExecStartPre=/bin/bash -c "if [ -z \"${MINIO_VOLUMES}\" ]; then echo \"Variable MINIO_VOLUMES not set in minio.conf\"; exit 1; fi"
ExecStart=/usr/local/minio2309/bin/minio server $MINIO_OPTS $MINIO_VOLUMES

# Let systemd restart this service always
Restart=always

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65536

# Specifies the maximum number of threads this process can create
TasksMax=infinity

# Disable timeout logic and wait until process is stopped
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target

```

参照<a href="/docs/middleware/minio/deploy-minio-snsd.html#使用systemd管理进程"> MinIO.service示例 </a>

### 0x03. Grafana Service示例

```
# 配置service文件
[Unit]
Description=Grafana instance
Documentation=http://docs.grafana.org
Wants=network-online.target
After=network-online.target
After=postgresql.service mariadb.service mysqld.service influxdb.service

[Service]
EnvironmentFile=/usr/local/grafana10.2/conf/grafana-server-env
User=grafana
Group=grafana
Type=notify
Restart=on-failure
WorkingDirectory=/usr/local/grafana10.2
RuntimeDirectory=grafana
RuntimeDirectoryMode=0750
ExecStart=/usr/local/grafana10.2/bin/grafana server                                     \
                            --config=${CONF_FILE}                                   \
                            --pidfile=${PID_FILE_DIR}/grafana-server.pid            \
                            --packaging=rpm                                         \
                            cfg:default.paths.logs=${LOG_DIR}                       \
                            cfg:default.paths.data=${DATA_DIR}                      \
                            cfg:default.paths.plugins=${PLUGINS_DIR}                \
                            cfg:default.paths.provisioning=${PROVISIONING_CFG_DIR}

LimitNOFILE=10000
TimeoutStopSec=20
CapabilityBoundingSet=
DeviceAllow=
LockPersonality=true
MemoryDenyWriteExecute=false
NoNewPrivileges=true
PrivateDevices=true
PrivateTmp=true
ProtectClock=true
ProtectControlGroups=true
ProtectHome=true
ProtectHostname=true
ProtectKernelLogs=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectProc=invisible
ProtectSystem=full
RemoveIPC=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=true
RestrictRealtime=true
RestrictSUIDSGID=true
SystemCallArchitectures=native
UMask=0027

[Install]
WantedBy=multi-user.target
```

参照<a href="/monitoring/grafana/install.html#二进制安装"> Grafana.service示例 </a>

## 二、参数详解

### 0x01. EnvironmentFile

`EnvironmentFile`字段：指定当前服务的环境参数文件。该文件内部的`key=value`键值对，可以用`$key`的形式，在当前配置文件中获取。

### 0x02. Type

`Type`字段定义启动类型。它可以设置的值如下：

- simple（默认值）：`ExecStart`字段启动的进程为主进程
- forking：`ExecStart`字段将以`fork()`方式启动，此时父进程将会退出，子进程将成为主进程

https://www.jinbuguo.com/systemd/systemd.service.html#Type=

### 0x03. ExecStart

`ExecStart`字段：定义启动进程时执行的命令。

与之作用相似的，还有如下这些字段。

> - `ExecReload`字段：重启服务时执行的命令
> - `ExecStop`字段：停止服务时执行的命令
> - `ExecStartPre`字段：启动服务之前执行的命令
> - `ExecStartPost`字段：启动服务之后执行的命令
> - `ExecStopPost`字段：停止服务之后执行的命令

## 三、参考资料

- [System and Service Manager](https://systemd.io/)
- [systemd 中文手册](http://www.jinbuguo.com/systemd/systemd.html)