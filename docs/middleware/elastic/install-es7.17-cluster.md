# Elasticsearch7.17集群搭建

本文档使用三台虚拟机（192.168.1.27、192.168.1.28、192.168.1.29）搭建 Elasticsearch7.17 集群。

:::warning
- 确保节点间的通信端口（默认 9200 和 9300）开放。
:::

## 一、安装Elasticsearch7.17

在每个节点上安装 Elasticsearch 7.17

[Past Releases of Elasticsearch](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)

截止2024年10月16日，Elasticsearch 7.17.* 系列最新稳定版为 7.17.24

<font color="red"><b>每次安装需到官网查看 Elasticsearch 7.17 系列的最新版。</b></font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 Elasticsearch7.17
:::

### 1.max_map_count设置

```bash
vim /etc/sysctl.conf
```

在文件末尾添加内容
```vim
# Elasticsearch7.17
vm.max_map_count=262144
```

强制Linux重新加载`/etc/sysctl.conf`的新配置
```bash
sysctl -p
```

https://www.elastic.co/guide/en/elasticsearch/reference/7.17/vm-max-map-count.html

### 2.添加用户

```bash
groupadd es
useradd -g es es -s /sbin/nologin
```

### 3.下载并解压安装包

```bash
cd /usr/local/src
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.17.24-linux-x86_64.tar.gz
tar xvf elasticsearch-7.17.24-linux-x86_64.tar.gz
mv /usr/local/src/elasticsearch-7.17.24 /usr/local/elasticsearch7.17
```

### 4.创建数据及日志目录

```bash
mkdir -p /data/elasticsearch7.17
chown -R es:es /data/elasticsearch7.17

mkdir -p /var/log/elasticsearch7.17
chown -R es:es /var/log/elasticsearch7.17

chown -R es:es /usr/local/elasticsearch7.17
```

:::tip
`chown -R es:es /usr/local/elasticsearch7.17`可以解决 elasticsearch: could not find java in bundled JDK at /usr/local/elasticsearch7.17/jdk/bin/java。
:::

## 二、修改配置文件

:::tip 端口说明
- http.port：[The port to bind for HTTP client communication](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-network.html#common-network-settings)
- transport.port：[The port to bind for communication between nodes](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-network.html#common-network-settings)

<font color="red"><b>约定 http.port 设置为 9200，transport.port 设置为 9300。</b></font>
:::

:::tip cluster.initial_master_nodes
`cluster.initial_master_nodes` 用于配置主节点，理论上仅指定一个节点也能完成启动。但通过配置多个节点参与选举，不仅能提升初始化过程的稳定性和容错性，还能更可靠地选出主节点，确保集群顺利运行。

[<font color="red"><b>群集首次成功形成后，需从每个节点的配置中删除 cluster.initial_master_nodes 设置。在重新启动群集或向现有群集添加新节点时，请勿使用此设置。</b></font>](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/important-settings.html#initial_master_nodes)
:::

:::warning
- 在编写 YML 配置文件时，请注意以下格式要求
  - 每个参数的冒号（`:`）后需留有一个空格。
  - 当方括号（`[]`）中包含多个值时，值之间的逗号（`,`）后需留有一个空格。
:::

### 1.节点一

```bash
vim  /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

修改如下配置参数

```vim
#cluster.name: my-application //[!code --]
node.name: my-es-cluster//[!code ++]

#node.name: node-1 //[!code --]
node.name: node-1//[!code ++]

#path.data: /path/to/data //[!code --]
path.data: /data/elasticsearch7.17//[!code ++]

#path.logs: /path/to/logs //[!code --]
path.logs: /var/log/elasticsearch7.17//[!code ++]

#network.host: 192.168.0.1 //[!code --]
network.host: 0.0.0.0//[!code ++]

#http.port: 9200 //[!code --]
http.port: 9200//[!code ++]
#//[!code ++]
# The port to bind for communication between nodes//[!code ++]
#//[!code ++]
transport.port: 9300//[!code ++]

#discovery.seed_hosts: ["host1", "host2"] //[!code --]
discovery.seed_hosts: ["192.168.1.27", "192.168.1.28", "192.168.1.29"]//[!code ++]

#cluster.initial_master_nodes: ["node-1", "node-2"] //[!code --]
cluster.initial_master_nodes: ["192.168.1.27", "192.168.1.28", "192.168.1.29"]//[!code ++]
```

### 2.节点二

```bash
vim  /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

修改如下配置参数

```vim
#cluster.name: my-application //[!code --]
node.name: my-es-cluster//[!code ++]

#node.name: node-1 //[!code --]
node.name: node-2//[!code ++]

#path.data: /path/to/data //[!code --]
path.data: /data/elasticsearch7.17//[!code ++]

#path.logs: /path/to/logs //[!code --]
path.logs: /var/log/elasticsearch7.17//[!code ++]

#network.host: 192.168.0.1 //[!code --]
network.host: 0.0.0.0//[!code ++]

#http.port: 9200 //[!code --]
http.port: 9200//[!code ++]
#//[!code ++]
# The port to bind for communication between nodes//[!code ++]
#//[!code ++]
transport.port: 9300//[!code ++]

#discovery.seed_hosts: ["host1", "host2"] //[!code --]
discovery.seed_hosts: ["192.168.1.27", "192.168.1.28", "192.168.1.29"]//[!code ++]

#cluster.initial_master_nodes: ["node-1", "node-2"] //[!code --]
cluster.initial_master_nodes: ["192.168.1.27", "192.168.1.28", "192.168.1.29"]//[!code ++]
```


### 3.节点三

```bash
vim  /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

修改如下配置参数

```vim
#cluster.name: my-application //[!code --]
node.name: my-es-cluster//[!code ++]

#node.name: node-1 //[!code --]
node.name: node-3//[!code ++]

#path.data: /path/to/data //[!code --]
path.data: /data/elasticsearch7.17//[!code ++]

#path.logs: /path/to/logs //[!code --]
path.logs: /var/log/elasticsearch7.17//[!code ++]

#network.host: 192.168.0.1 //[!code --]
network.host: 0.0.0.0//[!code ++]

#http.port: 9200 //[!code --]
http.port: 9200//[!code ++]
#//[!code ++]
# The port to bind for communication between nodes//[!code ++]
#//[!code ++]
transport.port: 9300//[!code ++]

#discovery.seed_hosts: ["host1", "host2"] //[!code --]
discovery.seed_hosts: ["192.168.1.27", "192.168.1.28", "192.168.1.29"]//[!code ++]

#cluster.initial_master_nodes: ["node-1", "node-2"] //[!code --]
cluster.initial_master_nodes: ["192.168.1.27", "192.168.1.28", "192.168.1.29"]//[!code ++]
```

## 三、使用Systemd管理进程

在每个节点上启动 elasticsearch7.17 服务，并配置开机启动

### 1.编辑service文件

```bash
vim /etc/systemd/system/elasticsearch7.17.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Elasticsearch7.17
Documentation=https://www.elastic.co
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
PrivateTmp=true
Environment=ES_HOME=/usr/local/elasticsearch7.17
Environment=ES_PATH_CONF=/usr/local/elasticsearch7.17/config
Environment=PID_DIR=/data/elasticsearch7.17
Environment=ES_SD_NOTIFY=true
WorkingDirectory=/usr/local/elasticsearch7.17

User=es
Group=es

ExecStart=/usr/local/elasticsearch7.17/bin/elasticsearch -p ${PID_DIR}/elasticsearch.pid --quiet

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65535
# Specifies the maximum number of processes
LimitNPROC=4096
# Specifies the maximum size of virtual memory
LimitAS=infinity
# Specifies the maximum file size
LimitFSIZE=infinity
# Disable timeout logic and wait until process is stopped
TimeoutStopSec=0
# SIGTERM signal is used to stop the Java process
KillSignal=SIGTERM
# Send the signal only to the JVM rather than its control group
KillMode=process
# Java process is never killed
SendSIGKILL=no
# When a JVM receives a SIGTERM signal it exits with code 143
SuccessExitStatus=143
# Allow a slow startup before the systemd notifier module kicks in to extend the timeout
TimeoutStartSec=900

[Install]
WantedBy=multi-user.target
```

https://github.com/elastic/elasticsearch/blob/v7.17.12/distribution/packages/src/common/systemd/elasticsearch.service

### 2.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 3.启动并设置开机自启

```
systemctl enable elasticsearch7.17 --now
```

:::tip Systemctl指令
```bash
systemctl status elasticsearch7.17  #查看服务
systemctl start elasticsearch7.17   #启动服务
systemctl stop elasticsearch7.17    #停止服务
systemctl restart elasticsearch7.17 #重启服务
systemctl enable elasticsearch7.17  #开启开机自启服务
systemctl disable elasticsearch7.17 #关闭开机自启服务
```
:::

### 4. 验证服务是否可用

:::warning
当使用`systemctl status elasticsearch7.17`命令检查服务状态时，显示 Elasticsearch 服务已经启动，但通过`netstat -nltp | grep 9200`命令却无法检测到9200端口的监听状态。这种情况通常是因为 Elasticsearch 服务仍处于初始化阶段，尚未完全准备好处理请求，或者存在其他启动过程中的延迟。
:::

::: tabs

=== netstat
```bash
netstat -nltp | grep 9200
```
输出如下内容

`tcp6       0      0 :::9200                 :::*                    LISTEN      2095487/java`
---

=== _cat/health
```bash
curl 127.0.0.1:9200/_cat/health?pretty
```
输出如下内容（输出green即为可用）

`1739334792 04:33:12 my-es-cluster green 3 3 6 3 0 0 0 0 - 100.0%`
---

:::

## 四、验证集群状态

### 1.检查集群状态

```bash
curl -X GET "localhost:9200/_cluster/health?pretty"
```
输出如下内容
```json
{
  "cluster_name" : "my-es-cluster",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 3,
  "number_of_data_nodes" : 3,
  "active_primary_shards" : 3,
  "active_shards" : 6,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

### 2.查询集群节点信息

```bash
curl -X GET "localhost:9200/_cat/nodes?v"
```
输出如下内容
```
ip           heap.percent ram.percent cpu load_1m load_5m load_15m node.role   master name
192.168.1.27           48          97   0    0.05    0.02     0.00 cdfhilmrstw *      node-1
192.168.1.29           26          96   0    0.10    0.03     0.01 cdfhilmrstw -      node-3
192.168.1.28           27          96   0    0.01    0.00     0.00 cdfhilmrstw -      node-2
```
- heap.percent: JVM 堆内存使用百分比。
- ram.percent: 系统内存使用百分比。
- node.role: 节点角色（如 m 表示 master，d 表示 data）。
- master: * 表示当前主节点。

## 五、删除initial_master_nodes

[<font color="red"><b>群集首次成功形成后，从每个节点的配置中删除 cluster.initial_master_nodes 设置。在重新启动群集或向现有群集添加新节点时，请勿使用此设置。</b></font>](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/important-settings.html#initial_master_nodes)

在每个节点的配置文件中删除 cluster.initial_master_nodes
```bash
vim  /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

重启 elasticsearch 服务
```bash
systemctl restart elasticsearch7.17
```

## 六、启用基础安全功能

[If your cluster has multiple nodes, then you must configure TLS between nodes. Production mode clusters will not start if you do not enable TLS.](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-basic-setup.html)

### 1.生成TLS证书

由于集群构建在受控的内部网络中，暂定在 node-1 节点上使用 Elasticsearch 提供的工具生成一个自签名的节点证书，然后将生成的证书文件复制到其他节点。

```bash
cd /usr/local/elasticsearch7.17
```

生成 elastic-certificates.p12 文件
```bash
bin/elasticsearch-certutil cert \
  -out config/certs/elastic-certificates.p12 \
  -pass ""
```
```bash
chown -R es:es /usr/local/elasticsearch7.17/config/certs
```

将生成的 elastic-certificates.p12 所在目录复制到节点2并修改其所属组
```bash
scp -r -P 22 \
  config/certs \
  root@192.168.1.28:/usr/local/elasticsearch7.17/config/
```
```bash
ssh -p 22 \
  root@192.168.1.28 \
  chown -R es:es /usr/local/elasticsearch7.17/config/certs
```

将生成的 elastic-certificates.p12 所在目录复制到节点3并修改其所属组
```bash
scp -r -P 22 \
  config/certs \
  root@192.168.1.29:/usr/local/elasticsearch7.17/config/
```
```bash
ssh -p 22 \
  root@192.168.1.29 \
  chown -R es:es /usr/local/elasticsearch7.17/config/certs
```

### 2.修改配置文件并重启服务

编辑每个节点的 elasticsearch.yml 文件
```bash
vim /usr/local/elasticsearch7.17/config/elasticsearch.yml
```

在配置文件的末尾，添加以下配置
```
# 启用 X-Pack 安全功能
xpack.security.enabled: true

# 配置节点间通信加密
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: /usr/local/elasticsearch7.17/config/certs/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: /usr/local/elasticsearch7.17/config/certs/elastic-certificates.p12
```

重启每个节点的elasticsearch7.17
```bash
systemctl restart elasticsearch7.17
```

### 3.设置内置用户密码

:::tip
为了便于后期维护，不允许通过`bin/elasticsearch-setup-passwords auto`设置内置用户密码。
:::

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。
特殊符号不可以包含`'`、`"`、 `@`、`#`、`:`
:::


手动设置密码，按提示依次输入各个账户密码（**约定所有账户的密码一致**）。
```bash
/usr/local/elasticsearch7.17/bin/elasticsearch-setup-passwords interactive
```

查询集群节点信息
```bash
curl -u elastic:'<password>' -X GET "localhost:9200/_cat/nodes?v"
```

## 七、安装分词插件

在每个节点上安装 Analysis-IK 分词插件，参考 <a href="/docs/middleware/elastic/install-es-analysis-ik.md" target="_blank">Analysis-IK 分词插件</a>

## 附件一、节点说明

- Every node in the cluster can handle HTTP and transport traffic by default. The transport layer is used exclusively for communication between nodes; the HTTP layer is used by REST clients. [Commonly used network settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-network.html#common-network-settings)

- If you don’t set node.roles, the node is assigned the following roles: master、data、data_content、data_hot、data_warm、data_cold、data_frozen、ingest、ml、remote_cluster_client、transform. [Node Roles](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-node.html#node-roles)

https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-node.html

:::tip 总结
- 默认情况下，群集中的每个节点都能处理 HTTP 和传输流量。
- 默认情况下，节点同时具备<b>主节点（Master Node）和数据节点（Data Node）</b>的角色。
:::

## 附录二、参考资料

- [Three-node clusters](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/high-availability-cluster-small-clusters.html#high-availability-cluster-design-three-nodes)
- [Networking](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-network.html)
- [Settings-based seed hosts provider](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-discovery-hosts-providers.html#settings-based-hosts-provider)
- [Bootstrapping a cluster](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/modules-discovery-bootstrap-cluster.html)
- [Important Elasticsearch configuration](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/important-settings.html)
- [Node settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html)
- [Set up minimal security for Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-minimal-setup.html)
- [Set up basic security for the Elastic Stack](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-basic-setup.html)
- [CentOS 7 系统部署 Elasticsearch 7.17.x 集群](https://blog.59izt.com/2023/10/18/Linux/041-CentOS7-%E9%83%A8%E7%BD%B2-Elasticsearch-%E9%9B%86%E7%BE%A4/)
- [elasticsearch-7.17.15 集群安装部署及kibana配置](https://www.cnblogs.com/dawnlz/p/18262874)
