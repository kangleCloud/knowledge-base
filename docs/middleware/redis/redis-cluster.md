# Redis Cluster 配置

为提高 Redis 服务的高可用性并实现资源的高效利用，生产环境采用三物理节点集群架构，每个节点同时部署主从两个 Redis 实例（主节点 6380，从节点 6381）。通过交叉复制架构，确保每个主节点的从节点都位于其他物理节点上，这样当任一物理节点发生故障时，其主节点对应的从节点能够立即接管服务，实现快速故障转移和无缝切换，从而保障服务的持续可用性。

- 操作系统：openEuler release 22.03 (LTS-SP1)
- Redis：v7.0.*

:::tip
- 一个物理节点的端口分配方案，主节点使用 6380–6382 端口，从节点使用 6383–6385 端口。
- 为确保主从节点间的正常认证通信，masterauth（主节点认证密码）和 requirepass（客户端访问密码）必须在集群配置中保持一致。
:::

## 1.准备工作

准备三台主机，并按统一的服务器标识命名规范配置主机名。

| IP | 主机名(HOSTNAME) | 物理节点 | 主从节点端口
| -- | -- | -- | --
| 10.1.0.41 | Middleware-1-41 | 物理节点一 | 主节点端口：6380；从节点端口：6381
| 10.1.0.42 | Middleware-1-42 | 物理节点二 | 主节点端口：6380；从节点端口：6381
| 10.1.0.43 | Middleware-1-43 | 物理节点三 | 主节点端口：6380；从节点端口：6381

参照<a href="/docs/middleware/redis/install-redis7.0.md" target="_blank">Redis 7.0 单节点部署</a>分别在各物理节点上安装 Redis 服务。

## 2.三个主节点构建

在每个物理节点中构建一个主节点。

### 0x01.关闭已存在的Redis服务

关闭 Redis 服务若存在
```bash
systemctl stop redis
```

重命名 Redis 服务器的 systemd 配置文件
```bash
mv /etc/systemd/system/redis.service /etc/systemd/system/redis-6379.service
```

### 0x02.创建数据目录

```bash
mkdir -p /data/redis/6380
chown -R redis:redis /data/redis/6380
```

### 0x03.新建Redis配置文件

新建 Redis 配置文件
```bash
vim /usr/local/redis7.0/conf/redis-6380.conf 
```

```vim
# 修改监听的主机地址，允许所有服务器访问 
bind 0.0.0.0 

# 关闭保护模式，允许其他服务器访问 
protected-mode no

# 指定接受连接的端口
port 6380

# 设置日志文件路径及名称 
logfile  /var/log/redis/redis-server-6380.log 

# 设置工作目录 
dir /data/redis/6380

# 设置主从复制的认证密码（主节点该密码无效）
masterauth $PASSWORD

# 设置通用客户端认证密码
requirepass $PASSWORD

# 启用集群
cluster-enabled yes

# 指定 Redis 集群的节点配置文件路径（默认在 Redis 的 工作目录）
cluster-config-file nodes-6380.conf
```

### 0x04.新建systemd配置文件

```bash
vim  /etc/systemd/system/redis-6380.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Redis data structure server
Documentation=https://redis.io/documentation
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=redis
Group=redis
ExecStart=/usr/local/redis7.0/bin/redis-server \
    /usr/local/redis7.0/conf/redis-6380.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 0x05.启动并设置开机自启

重新加载 systemd 守护进程配置
```bash
systemctl daemon-reload
```

设置开机自启并立即启动 redis-6380 服务
```bash
systemctl enable redis-6380 --now
```

查看 redis-6380 服务的运行状态

::: tabs

=== systemd
```bash
systemctl status redis-6380
```
---

=== ps
```bash
ps -ef | grep redis
```
---

=== netstat
```bash
netstat -lnpt | grep redis
```
---

:::

## 3.三个从节点构建

在每个物理节点中构建一个从节点。

### 0x01.创建数据目录

```bash
mkdir -p /data/redis/6381
chown -R redis:redis /data/redis/6381
```

### 0x02.新建Redis配置文件

新建 Redis 配置文件
```bash
vim /usr/local/redis7.0/conf/redis-6381.conf 
```

```vim
# 修改监听的主机地址，允许所有服务器访问 
bind 0.0.0.0 

# 关闭保护模式，允许其他服务器访问 
protected-mode no

# 指定接受连接的端口
port 6381

# 设置日志文件路径及名称 
logfile  /var/log/redis/redis-server-6381.log 

# 设置工作目录 
dir /data/redis/6381

# 设置主从复制的认证密码（主节点该密码无效）
masterauth $PASSWORD

# 设置通用客户端认证密码
requirepass $PASSWORD

# 启用集群
cluster-enabled yes

# 指定 Redis 集群的节点配置文件路径（默认在 Redis 的 工作目录）
cluster-config-file nodes-6381.conf
```

### 0x03.新建systemd配置文件

```bash
vim  /etc/systemd/system/redis-6381.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Redis data structure server
Documentation=https://redis.io/documentation
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=redis
Group=redis
ExecStart=/usr/local/redis7.0/bin/redis-server \
    /usr/local/redis7.0/conf/redis-6381.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 0x04.启动并设置开机自启

重新加载 systemd 守护进程配置
```bash
systemctl daemon-reload
```

设置开机自启并立即启动 redis-6381 服务
```bash
systemctl enable redis-6381 --now
```

查看 redis-6381 服务的运行状态

::: tabs

=== systemd
```bash
systemctl status redis-6381
```
---

=== ps
```bash
ps -ef | grep redis
```
---

=== netstat
```bash
netstat -lnpt | grep redis
```
---

:::

## 4.创建集群并实现主从交叉

在任一节点执行，主节点为10.1.0.41:6380、10.1.0.42:6380、10.1.0.43:6380，从节点为10.1.0.43:6381、10.1.0.41:6381、10.1.0.42:6381，Redis Cluster 会自动调整从节点分配，尽量让主从分布在不同的机器上。

### 0x01.配置集群

:::warning
执行该命令并不能保证成功配置出由三个物理节点组成的三主三从交叉复制集群。可删除数据目录的文件并重启六个节点，多次尝试后，集群仍未正确构建，则需采用手动配置方式来完成交叉复制集群的部署。
:::

**<font color="red">参照如下交叉规则构建命令：</font>**
- 10.1.0.41:6380 的从节点是 10.1.0.42:6381。
- 10.1.0.42:6380 的从节点是 10.1.0.43:6381。
- 10.1.0.43:6380 的从节点是 10.1.0.41:6381。

```bash
/usr/local/redis7.0/bin/redis-cli --cluster create \
    10.1.0.41:6380 10.1.0.42:6380 10.1.0.43:6380 \
    10.1.0.42:6381 10.1.0.43:6381 10.1.0.41:6381 \
    --cluster-replicas 1 -a '$PASSWORD'
```

### 0x02.查看集群

查询集群的状态信息
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 127.0.0.1 -p 6380 -a '$PASSWORD' cluster info
```
:::tip 输出如下内容
```vim
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3
cluster_current_epoch:6
cluster_my_epoch:1
cluster_stats_messages_ping_sent:549
cluster_stats_messages_pong_sent:531
cluster_stats_messages_sent:1080
cluster_stats_messages_ping_received:526
cluster_stats_messages_pong_received:549
cluster_stats_messages_meet_received:5
cluster_stats_messages_received:1080
total_cluster_links_buffer_limit_exceeded:0
```
:::

查看集群的节点拓扑信息
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 127.0.0.1 -p 6380 -a '$PASSWORD' cluster nodes
```
:::tip 输出如下内容（已实现了交叉复制）
```vim
76a8040e0478b1bef6079301ac9891d1441ad51c 10.1.0.41:6381@16381 slave a46c444a4bbe118bddca35e86d5e130289df27c4 0 1748764917150 3 connected
8f5648bed4bbb39bb0cc922898417002d29ec7c5 10.1.0.42:6381@16381 slave e58e5d57a249c386d4d3447bacc54bff01bf69d0 0 1748764916000 1 connected
a46c444a4bbe118bddca35e86d5e130289df27c4 10.1.0.43:6380@16380 master - 0 1748764916146 3 connected 10923-16383
7ffc9b0e9b7e5b7ff190933e495e183636e544f2 10.1.0.43:6381@16381 slave 83dd81d269c3cc2901ac8fa723e42c88ed5a2c55 0 1748764915142 2 connected
83dd81d269c3cc2901ac8fa723e42c88ed5a2c55 10.1.0.42:6380@16380 master - 0 1748764914137 2 connected 5461-10922
e58e5d57a249c386d4d3447bacc54bff01bf69d0 10.1.0.41:6380@16380 myself,master - 0 1748764915000 1 connected 0-5460
```
:::

## 附录1.客户端

[Redis 集群和客户端库](https://redis.io/learn/operate/redis-at-scale/scalability/redis-cluster-and-client-libraries)

[Redis 集群配置可能会在运行时更改。Lettuce 以透明方式处理和重定向，但如果遇到太多命令进入重定向，则应刷新集群拓扑视图。](https://github.com/redis/lettuce/wiki/Redis-Cluster#refreshing-the-cluster-topology-view)



## 附录2.手动配置交叉复制

在任一节点执行即可。

### 0x01.配置互相发现

```bash
redis-cli -h 10.1.0.41 -p 6380 -a '$PASSWORD'
```

```sh
10.1.0.41:6380> CLUSTER MEET 10.1.0.41 6381
```

```sh
10.1.0.41:6380> CLUSTER MEET 10.1.0.42 6380
```

```sh
10.1.0.41:6380> CLUSTER MEET 10.1.0.42 6381
```

```sh
10.1.0.41:6380> CLUSTER MEET 10.1.0.43 6380
```

```sh
10.1.0.41:6380> CLUSTER MEET 10.1.0.43 6381
```

查看集群的节点拓扑信息
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 127.0.0.1 -p 6380 -a '$PASSWORD' cluster nodes
```
:::tip 输出如下内容
```vim
b310f98e9ca7f88b0f88ea91b9ee703c70650358 10.1.0.43:6381@16381 master - 0 1748779865224 5 connected
ecb49e99b7490295229ede810460a0e596d121a2 10.1.0.41:6380@16380 myself,master - 0 1748779865000 3 connected
41ef84f7d72fdba3cbe05c6b66994d187dcc161f 10.1.0.42:6380@16380 master - 0 1748779865000 2 connected
4cf8a01b4b65bae91302eff7ef705d5b1d0a423a 10.1.0.41:6381@16381 master - 0 1748779867232 1 connected
14bda5d353d7c649eea289ea4b2e81456bfc7cd4 10.1.0.43:6380@16380 master - 0 1748779864219 4 connected
f2cb4718b2d13611f6a0fb73903518f7020be7de 10.1.0.42:6381@16381 master - 0 1748779866228 0 connected
```
:::

### 0x02.配置集群槽位

```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.41 -p 6380 -a '$PASSWORD' cluster addslots {0..5461}
```

```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.42 -p 6380 -a '$PASSWORD' cluster addslots {5462..10922}
```

```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.43 -p 6380 -a '$PASSWORD' cluster addslots {10923..16383}
```

查询集群的状态信息
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.41 -p 6380 -a '$PASSWORD' cluster info
```
:::tip 输出如下内容
```vim
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3
cluster_current_epoch:5
cluster_my_epoch:3
cluster_stats_messages_ping_sent:927
cluster_stats_messages_pong_sent:970
cluster_stats_messages_meet_sent:5
cluster_stats_messages_sent:1902
cluster_stats_messages_ping_received:970
cluster_stats_messages_pong_received:932
cluster_stats_messages_received:1902
total_cluster_links_buffer_limit_exceeded:0
```
:::

查看集群的节点拓扑信息
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 127.0.0.1 -p 6380 -a '$PASSWORD' cluster nodes
```
:::tip 输出如下内容
```vim
b310f98e9ca7f88b0f88ea91b9ee703c70650358 10.1.0.43:6381@16381 master - 0 1748780362000 5 connected
ecb49e99b7490295229ede810460a0e596d121a2 10.1.0.41:6380@16380 myself,master - 0 1748780361000 3 connected 0-5461
41ef84f7d72fdba3cbe05c6b66994d187dcc161f 10.1.0.42:6380@16380 master - 0 1748780361000 2 connected 5462-10922
4cf8a01b4b65bae91302eff7ef705d5b1d0a423a 10.1.0.41:6381@16381 master - 0 1748780363418 1 connected
14bda5d353d7c649eea289ea4b2e81456bfc7cd4 10.1.0.43:6380@16380 master - 0 1748780362414 4 connected 10923-16383
f2cb4718b2d13611f6a0fb73903518f7020be7de 10.1.0.42:6381@16381 master - 0 1748780362000 0 connected
```
:::

### 0x03.配置三主三从

目前六个节点全是主节点，需要将`6381`的主节点配置成从节点。从节点对应的主节点关系如下：
- 10.1.0.41:6380 的从节点是 10.1.0.42:6381；
- 10.1.0.42:6380 的从节点是 10.1.0.43:6381；
- 10.1.0.43:6380 的从节点是 10.1.0.41:6381。

从 Redis 集群中获取节点信息，并筛选出特定端口的节点
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.41 -p 6380 -a '$PASSWORD' cluster nodes \
    | grep 6380 | awk '{print $1, $2}'
```
:::tip 输出如下内容
```vim
ecb49e99b7490295229ede810460a0e596d121a2 10.1.0.41:6380@16380
41ef84f7d72fdba3cbe05c6b66994d187dcc161f 10.1.0.42:6380@16380
14bda5d353d7c649eea289ea4b2e81456bfc7cd4 10.1.0.43:6380@16380
```
:::

交叉配置 10.1.0.41:6380 的从节点
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.42 -p 6381 -a '$PASSWORD' \
    CLUSTER REPLICATE ecb49e99b7490295229ede810460a0e596d121a2
```

交叉配置 10.1.0.42:6380 的从节点
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.43 -p 6381 -a '$PASSWORD' \
    CLUSTER REPLICATE 41ef84f7d72fdba3cbe05c6b66994d187dcc161f
```

交叉配置 10.1.0.43:6380 的从节点
```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 10.1.0.41 -p 6381 -a '$PASSWORD' \
    CLUSTER REPLICATE 14bda5d353d7c649eea289ea4b2e81456bfc7cd4
```

### 0x04.查看集群的节点拓扑

```bash
/usr/local/redis7.0/bin/redis-cli \
    -h 127.0.0.1 -p 6380 -a '$PASSWORD' cluster nodes
```
:::tip 输出如下内容
```vim
b310f98e9ca7f88b0f88ea91b9ee703c70650358 10.1.0.43:6381@16381 slave 41ef84f7d72fdba3cbe05c6b66994d187dcc161f 0 1748780701007 2 connected
ecb49e99b7490295229ede810460a0e596d121a2 10.1.0.41:6380@16380 myself,master - 0 1748780700000 3 connected 0-5461
41ef84f7d72fdba3cbe05c6b66994d187dcc161f 10.1.0.42:6380@16380 master - 0 1748780699000 2 connected 5462-10922
4cf8a01b4b65bae91302eff7ef705d5b1d0a423a 10.1.0.41:6381@16381 slave 14bda5d353d7c649eea289ea4b2e81456bfc7cd4 0 1748780698000 4 connected
14bda5d353d7c649eea289ea4b2e81456bfc7cd4 10.1.0.43:6380@16380 master - 0 1748780700001 4 connected 10923-16383
f2cb4718b2d13611f6a0fb73903518f7020be7de 10.1.0.42:6381@16381 slave ecb49e99b7490295229ede810460a0e596d121a2 0 1748780698996 3 connected
```
:::

## 附录3.参考资料

- https://redis.io/learn/operate/redis-at-scale/scalability/exercise-1
- https://redis.io/learn/operate/redis-at-scale/scalability/redis-cli-with-redis-cluster
- https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/
- https://developer.aliyun.com/article/887439
