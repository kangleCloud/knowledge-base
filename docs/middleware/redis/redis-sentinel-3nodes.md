# Redis 7.0 三节点哨兵模式部署

> 本文档基于 [Redis 7.0 单节点部署](/docs/middleware/redis/install-redis7.0.md) 的源码安装步骤扩展，适用于 3 台服务器部署 Redis 主从复制 + Sentinel 哨兵高可用模式。
>
> 说明：该方案不是 Redis Cluster，不做数据分片；它提供的是单主双从、自动故障转移和主节点发现能力。

## 一、部署规划

### 1.1 架构说明

三台服务器均部署：

- 一个 Redis Server 实例，端口 `6379`
- 一个 Redis Sentinel 实例，端口 `26379`

初始角色规划如下：

| 节点 | 主机名 | 示例 IP | Redis 角色 | Redis 端口 | Sentinel 端口 |
|---|---|---:|---|---:|---:|
| 节点 1 | redis-node-1 | 192.168.10.11 | Master | 6379 | 26379 |
| 节点 2 | redis-node-2 | 192.168.10.12 | Replica | 6379 | 26379 |
| 节点 3 | redis-node-3 | 192.168.10.13 | Replica | 6379 | 26379 |

> 实际部署时请将以上示例 IP 替换为生产服务器真实内网 IP。

### 1.2 哨兵参数规划

| 参数 | 建议值 | 说明 |
|---|---:|---|
| master-name | mymaster | Sentinel 监控主节点名称，业务客户端也需要使用该名称 |
| quorum | 2 | 至少 2 个 Sentinel 认为 Master 下线，才会进入客观下线判断 |
| down-after-milliseconds | 10000 | Master 连续 10 秒无响应后，Sentinel 认为其主观下线 |
| failover-timeout | 60000 | 故障转移超时时间，单位毫秒 |
| parallel-syncs | 1 | 故障转移后，每次只允许 1 个从节点同步新主节点 |

### 1.3 密码规划

Redis 生产环境必须设置访问密码。

| 名称 | 示例占位符 | 说明 |
|---|---|---|
| Redis 密码 | `$REDIS_PASSWORD` | 用于客户端连接 Redis、主从复制、Sentinel 连接 Redis |
| Sentinel 密码 | `$SENTINEL_PASSWORD` | 可选，用于保护 Sentinel 端口；启用前需确认业务客户端支持 |

密码要求：

- 长度不少于 12 位
- 包含大小写字母、数字、特殊符号
- 三个 Redis 节点的 `requirepass` 与 `masterauth` 必须保持一致

### 1.4 端口放行

三台服务器之间需要互通以下端口：

| 端口 | 协议 | 用途 |
|---:|---|---|
| 6379 | TCP | Redis Server 服务端口、主从复制端口 |
| 26379 | TCP | Redis Sentinel 服务端口 |

建议只允许业务服务器和三台 Redis 服务器内网访问，不建议对公网开放。

## 二、先决条件

以下操作需要在三台服务器全部执行。

### 2.1 创建 redis 用户

```bash
groupadd redis
useradd -g redis redis -s /sbin/nologin
```

如用户已存在，可忽略报错或执行：

```bash
id redis
```

### 2.2 设置 vm.overcommit_memory

```bash
vim /etc/sysctl.conf
```

在文件末尾追加：

```vim
# Redis
vm.overcommit_memory = 1
```

重新加载配置：

```bash
sysctl -p
```

### 2.3 关闭透明大页（生产建议）

Redis 对 Transparent Huge Pages 较敏感，生产环境建议关闭。

临时关闭：

```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

写入开机启动，例如追加到 `/etc/rc.local`，并确认有执行权限：

```bash
cat >> /etc/rc.local <<'EOF_RC'
# Redis disable THP
echo never > /sys/kernel/mm/transparent_hugepage/enabled
EOF_RC
chmod +x /etc/rc.local
```

## 三、源码安装 Redis 7.0

以下操作需要在三台服务器全部执行。

### 3.1 下载源码包并解压

```bash
cd /usr/local/src
wget http://download.redis.io/releases/redis-7.0.15.tar.gz
tar -zxvf redis-7.0.15.tar.gz
```

> 如果生产环境无法访问公网，可提前将源码包上传至 `/usr/local/src`。

### 3.2 编译并安装

```bash
cd /usr/local/src/redis-7.0.15
make PREFIX=/usr/local/redis7.0 install
```

### 3.3 创建配置、数据、日志目录

```bash
mkdir -p /usr/local/redis7.0/conf
mkdir -p /data/redis
mkdir -p /data/redis/sentinel
mkdir -p /var/log/redis

chown -R redis:redis /usr/local/redis7.0/conf
chown -R redis:redis /data/redis
chown -R redis:redis /var/log/redis
```

### 3.4 添加环境变量

```bash
echo 'export PATH=/usr/local/redis7.0/bin:$PATH' >> /etc/profile
source /etc/profile
redis-cli -v
```

## 四、Redis Server 配置

### 4.1 节点 1：Master 配置

在 `redis-node-1` 上执行：

```bash
vim /usr/local/redis7.0/conf/redis.conf
```

写入以下内容：

```vim
bind 0.0.0.0
protected-mode no
port 6379
daemonize no
supervised no

pidfile /var/run/redis_6379.pid
logfile /var/log/redis/redis-server.log
dir /data/redis

databases 16

requirepass $REDIS_PASSWORD
masterauth $REDIS_PASSWORD

appendonly yes
appendfilename "appendonly.aof"
dbfilename dump.rdb

replica-read-only yes
repl-diskless-sync yes

# 可选：至少有 1 个从节点在线且延迟不超过 10 秒时才允许写入
# 对可用性要求更高时可不启用；对数据一致性要求更高时可启用
# min-replicas-to-write 1
# min-replicas-max-lag 10
```

> 请将 `$REDIS_PASSWORD` 替换为真实密码。配置文件中不要保留 `$REDIS_PASSWORD` 字符串。

### 4.2 节点 2：Replica 配置

在 `redis-node-2` 上执行：

```bash
vim /usr/local/redis7.0/conf/redis.conf
```

写入以下内容：

```vim
bind 0.0.0.0
protected-mode no
port 6379
daemonize no
supervised no

pidfile /var/run/redis_6379.pid
logfile /var/log/redis/redis-server.log
dir /data/redis

databases 16

requirepass $REDIS_PASSWORD
masterauth $REDIS_PASSWORD

replicaof 192.168.10.11 6379

appendonly yes
appendfilename "appendonly.aof"
dbfilename dump.rdb

replica-read-only yes
repl-diskless-sync yes
```

### 4.3 节点 3：Replica 配置

在 `redis-node-3` 上执行：

```bash
vim /usr/local/redis7.0/conf/redis.conf
```

写入以下内容：

```vim
bind 0.0.0.0
protected-mode no
port 6379
daemonize no
supervised no

pidfile /var/run/redis_6379.pid
logfile /var/log/redis/redis-server.log
dir /data/redis

databases 16

requirepass $REDIS_PASSWORD
masterauth $REDIS_PASSWORD

replicaof 192.168.10.11 6379

appendonly yes
appendfilename "appendonly.aof"
dbfilename dump.rdb

replica-read-only yes
repl-diskless-sync yes
```

### 4.4 配置文件权限

三台服务器全部执行：

```bash
chown redis:redis /usr/local/redis7.0/conf/redis.conf
chmod 640 /usr/local/redis7.0/conf/redis.conf
```

## 五、Redis Server systemd 配置

三台服务器全部执行。

### 5.1 编辑 redis.service

```bash
vim /etc/systemd/system/redis.service
```

写入以下内容：

```ini
[Unit]
Description=Redis data structure server
Documentation=https://redis.io/documentation
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=redis
Group=redis
ExecStart=/usr/local/redis7.0/bin/redis-server /usr/local/redis7.0/conf/redis.conf
Restart=always
RestartSec=5
PrivateTmp=true
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

### 5.2 启动 Redis Server

建议按以下顺序启动：

1. 先启动节点 1 的 Master
2. 再启动节点 2、节点 3 的 Replica

三台服务器分别执行：

```bash
systemctl daemon-reload
systemctl enable redis --now
systemctl status redis
```

## 六、Redis Sentinel 配置

Sentinel 配置文件需要三台服务器都配置。三台服务器内容基本一致，都监控初始 Master：`192.168.10.11:6379`。

> 注意：Sentinel 启动后会自动重写 `redis-sentinel.conf`，因此该配置文件必须允许 `redis` 用户写入。

### 6.1 三台服务器创建 sentinel 配置

三台服务器全部执行：

```bash
vim /usr/local/redis7.0/conf/redis-sentinel.conf
```

写入以下内容：

```vim
bind 0.0.0.0
protected-mode no
port 26379
daemonize no
supervised no

pidfile /var/run/redis-sentinel.pid
logfile /var/log/redis/redis-sentinel.log
dir /data/redis/sentinel

sentinel monitor mymaster 192.168.10.11 6379 2
sentinel auth-pass mymaster $REDIS_PASSWORD
sentinel down-after-milliseconds mymaster 10000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```

说明：

- `mymaster` 是主节点名称，业务客户端连接 Sentinel 时需要使用该名称。
- `192.168.10.11 6379` 是初始 Master 地址，后续发生故障转移后 Sentinel 会自动改写配置。
- `2` 是 quorum，表示至少 2 个 Sentinel 认为 Master 不可达，才会进入客观下线判断。
- `sentinel auth-pass` 必须与 Redis Server 的 `requirepass` 保持一致，否则 Sentinel 无法监控和切换主从。

### 6.2 配置文件权限

三台服务器全部执行：

```bash
chown redis:redis /usr/local/redis7.0/conf/redis-sentinel.conf
chmod 640 /usr/local/redis7.0/conf/redis-sentinel.conf
```

### 6.3 可选：启用 Sentinel 访问密码

如果业务客户端支持 Sentinel 认证，可增加 Sentinel 自身访问密码。

三台服务器的 `redis-sentinel.conf` 增加：

```vim
requirepass $SENTINEL_PASSWORD
sentinel sentinel-pass $SENTINEL_PASSWORD
```

启用后，访问 Sentinel 需要认证：

```bash
redis-cli -h 192.168.10.11 -p 26379 -a '$SENTINEL_PASSWORD' SENTINEL get-master-addr-by-name mymaster
```

> 如果业务客户端不支持 Sentinel 密码，请不要启用该配置，改为通过防火墙限制 `26379` 端口访问来源。

## 七、Redis Sentinel systemd 配置

三台服务器全部执行。

### 7.1 编辑 redis-sentinel.service

```bash
vim /etc/systemd/system/redis-sentinel.service
```

写入以下内容：

```ini
[Unit]
Description=Redis Sentinel
Documentation=https://redis.io/documentation
Wants=network-online.target
After=network-online.target redis.service

[Service]
Type=simple
User=redis
Group=redis
ExecStart=/usr/local/redis7.0/bin/redis-sentinel /usr/local/redis7.0/conf/redis-sentinel.conf
Restart=always
RestartSec=5
PrivateTmp=true
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

### 7.2 启动 Redis Sentinel

三台服务器分别执行：

```bash
systemctl daemon-reload
systemctl enable redis-sentinel --now
systemctl status redis-sentinel
```

## 八、防火墙配置

以下示例使用 firewalld，仅允许三台 Redis 服务器之间互通 Redis 和 Sentinel 端口。

三台服务器全部执行，按实际 IP 修改：

```bash
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.11" port protocol="tcp" port="6379" accept'
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.12" port protocol="tcp" port="6379" accept'
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.13" port protocol="tcp" port="6379" accept'

firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.11" port protocol="tcp" port="26379" accept'
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.12" port protocol="tcp" port="26379" accept'
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.10.13" port protocol="tcp" port="26379" accept'

firewall-cmd --reload
firewall-cmd --list-rich-rules
```

如果业务服务器需要连接 Redis 或 Sentinel，需要额外放行业务服务器 IP。

## 九、部署验证

为避免密码出现在命令历史中，建议临时使用环境变量：

```bash
export REDISCLI_AUTH='$REDIS_PASSWORD'
```

### 9.1 查看 Redis 主从状态

在任意节点执行：

```bash
redis-cli -h 192.168.10.11 -p 6379 INFO replication
redis-cli -h 192.168.10.12 -p 6379 INFO replication
redis-cli -h 192.168.10.13 -p 6379 INFO replication
```

正常情况下：

- 节点 1 显示：`role:master`
- 节点 2 显示：`role:slave`
- 节点 3 显示：`role:slave`
- Master 上可以看到 `connected_slaves:2`

### 9.2 查看 Sentinel 监控状态

```bash
redis-cli -h 192.168.10.11 -p 26379 SENTINEL master mymaster
redis-cli -h 192.168.10.11 -p 26379 SENTINEL replicas mymaster
redis-cli -h 192.168.10.11 -p 26379 SENTINEL sentinels mymaster
```

重点检查：

- `num-slaves` 是否为 `2`
- `num-other-sentinels` 是否为 `2`
- `flags` 是否为 `master`

### 9.3 获取当前 Master 地址

```bash
redis-cli -h 192.168.10.11 -p 26379 SENTINEL get-master-addr-by-name mymaster
redis-cli -h 192.168.10.12 -p 26379 SENTINEL get-master-addr-by-name mymaster
redis-cli -h 192.168.10.13 -p 26379 SENTINEL get-master-addr-by-name mymaster
```

三个 Sentinel 返回的 Master 地址应一致。

### 9.4 写入和读取测试

在当前 Master 写入：

```bash
redis-cli -h 192.168.10.11 -p 6379 SET deploy:test "redis-sentinel-ok"
redis-cli -h 192.168.10.11 -p 6379 GET deploy:test
```

在 Replica 读取：

```bash
redis-cli -h 192.168.10.12 -p 6379 GET deploy:test
redis-cli -h 192.168.10.13 -p 6379 GET deploy:test
```

## 十、故障转移测试

### 10.1 自动故障转移测试

在初始 Master 节点 `192.168.10.11` 上停止 Redis：

```bash
systemctl stop redis
```

等待 10 到 30 秒后，在任意 Sentinel 节点执行：

```bash
redis-cli -h 192.168.10.12 -p 26379 SENTINEL get-master-addr-by-name mymaster
redis-cli -h 192.168.10.12 -p 26379 SENTINEL master mymaster
```

正常情况下，节点 2 或节点 3 会被提升为新的 Master。

查看日志：

```bash
journalctl -u redis-sentinel -n 100 --no-pager
cat /var/log/redis/redis-sentinel.log
```

### 10.2 恢复原 Master

在原 Master 节点重新启动 Redis：

```bash
systemctl start redis
```

恢复后，原 Master 通常会被 Sentinel 自动改造为新 Master 的 Replica。

验证：

```bash
redis-cli -h 192.168.10.11 -p 6379 INFO replication
redis-cli -h 192.168.10.12 -p 26379 SENTINEL replicas mymaster
```

### 10.3 手动故障转移

如需主动切换主节点，可执行：

```bash
redis-cli -h 192.168.10.11 -p 26379 SENTINEL failover mymaster
```

执行后查看当前 Master：

```bash
redis-cli -h 192.168.10.11 -p 26379 SENTINEL get-master-addr-by-name mymaster
```

> 生产环境不建议使用 `DEBUG sleep` 模拟故障，直接停止 Redis 服务更容易恢复和定位。

## 十一、业务客户端连接示例

### 11.1 Spring Boot 3 示例

```yaml
spring:
  data:
    redis:
      password: ${REDIS_PASSWORD}
      sentinel:
        master: mymaster
        nodes:
          - 192.168.10.11:26379
          - 192.168.10.12:26379
          - 192.168.10.13:26379
        # 如果启用了 Sentinel 自身密码，按客户端版本支持情况增加：
        # password: ${SENTINEL_PASSWORD}
```

### 11.2 连接注意事项

- 业务系统不要固定连接某一台 Redis Server 的 `6379` 作为写入口。
- 推荐业务系统连接 Sentinel，由 Sentinel 返回当前 Master 地址。
- Sentinel 的 `master-name` 必须与客户端配置一致，例如本文中的 `mymaster`。
- Redis Server 密码和 Sentinel 密码不是同一个概念，启用 Sentinel 密码前需确认客户端支持。

## 十二、运维常用命令

### 12.1 Redis 服务管理

```bash
systemctl status redis
systemctl start redis
systemctl stop redis
systemctl restart redis
systemctl enable redis
systemctl disable redis
```

### 12.2 Sentinel 服务管理

```bash
systemctl status redis-sentinel
systemctl start redis-sentinel
systemctl stop redis-sentinel
systemctl restart redis-sentinel
systemctl enable redis-sentinel
systemctl disable redis-sentinel
```

### 12.3 查看日志

```bash
journalctl -u redis -n 100 --no-pager
journalctl -u redis-sentinel -n 100 --no-pager

tail -f /var/log/redis/redis-server.log
tail -f /var/log/redis/redis-sentinel.log
```

### 12.4 查看主从复制

```bash
redis-cli -h 192.168.10.11 -p 6379 INFO replication
```

### 12.5 查看 Sentinel 状态

```bash
redis-cli -h 192.168.10.11 -p 26379 SENTINEL masters
redis-cli -h 192.168.10.11 -p 26379 SENTINEL master mymaster
redis-cli -h 192.168.10.11 -p 26379 SENTINEL replicas mymaster
redis-cli -h 192.168.10.11 -p 26379 SENTINEL sentinels mymaster
redis-cli -h 192.168.10.11 -p 26379 SENTINEL get-master-addr-by-name mymaster
```

## 十三、常见问题及处理方法

### 13.1 Sentinel 看不到其他两个 Sentinel

现象：

```text
num-other-sentinels:0
```

排查：

1. 三台服务器 `26379` 端口是否互通。
2. `redis-sentinel.conf` 中 `bind` 是否绑定到内网可访问地址。
3. 防火墙是否只放行了 `6379`，但未放行 `26379`。
4. 三个 Sentinel 的 `master-name` 是否完全一致。

### 13.2 Sentinel 看不到两个 Replica

现象：

```text
num-slaves:0
```

排查：

1. Replica 节点 `replicaof 192.168.10.11 6379` 是否配置正确。
2. `masterauth` 是否与 Master 的 `requirepass` 一致。
3. Replica 到 Master 的 `6379` 是否互通。
4. 执行 `INFO replication` 查看 Replica 是否已连接 Master。

### 13.3 主从认证失败

常见日志：

```text
NOAUTH Authentication required
WRONGPASS invalid username-password pair
```

处理：

1. 三台 Redis 的 `requirepass` 保持一致。
2. 三台 Redis 的 `masterauth` 保持一致。
3. 三台 Sentinel 的 `sentinel auth-pass mymaster` 与 Redis 密码一致。
4. 修改后重启 Redis 和 Sentinel。

### 13.4 Sentinel 配置被自动修改

这是正常现象。Sentinel 会在以下场景自动重写配置文件：

- 发现新的 Replica
- 发现新的 Sentinel
- 发生故障转移
- 当前 Master 地址发生变化

因此：

- `redis-sentinel.conf` 必须归属 `redis` 用户。
- 不建议在 Sentinel 配置文件中写大量注释，后续可能被重写清理。

### 13.5 Master 停止后没有自动切换

排查：

1. 至少需要 2 个 Sentinel 存活并可互通。
2. `quorum` 配置是否为 `2`。
3. Sentinel 之间 `26379` 是否互通。
4. Sentinel 到 Redis Server 的 `6379` 是否互通。
5. `down-after-milliseconds` 是否设置过大，导致等待时间较长。

## 十四、生产注意事项

1. Redis 和 Sentinel 端口不应暴露公网。
2. Redis 密码不要写入公开脚本、代码仓库或截图中。
3. Sentinel 至少部署 3 个，避免 2 个 Sentinel 出现脑裂和无法多数派的问题。
4. 三台服务器建议部署在不同物理机或不同故障域。
5. Redis 持久化目录 `/data/redis` 应有足够磁盘空间，并纳入监控。
6. Sentinel 模式只保证高可用，不解决大容量分片问题；如需分片，应评估 Redis Cluster。
7. 客户端应连接 Sentinel，不应写死某一台 Redis Server 为 Master。
8. 故障演练应在业务低峰期执行，并提前确认回滚方案。

## 十五、参考资料

- Redis 官方 Sentinel 文档：https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/
- Redis 官方源码安装文档：https://redis.io/docs/getting-started/installation/install-redis-from-source/
- [Redis 7.0 单节点部署](/docs/middleware/redis/install-redis7.0.md)
