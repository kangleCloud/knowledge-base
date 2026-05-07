# 单节点 Elasticsearch7.17.28 容器化docker-compose 部署

## 0x01.编写 docker-compose.yml 文件

```yaml
version: "3.8"

services:
  elasticsearch:
    image: elastic/elasticsearch:7.17.28
    container_name: es-7.17.28
    hostname: elasticsearch7-17-28
    restart: always
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - ./data:/usr/share/elasticsearch/data
      - ./plugins:/usr/share/elasticsearch/plugins
      - ./config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
      - ./logs:/usr/share/elasticsearch/logs
    ports:
      - "9200:9200"
      - "9300:9300"
    privileged: true
```
## 0x02.编写 elasticsearch.yml 配置文件

```yaml
# 集群名称
cluster.name: elasticsearch-7.17.28
# 节点名称
node.name: es-7.17.28
# 绑定host，0.0.0.0代表当前节点的ip
network.host: 0.0.0.0
# 设置其它节点和该节点交互的ip地址，如果不设置它会自动判断，值必须是个真实的ip地址(本机ip)
network.publish_host: 10.1.0.33
# 设置对外服务的http端口，默认为9200
http.port: 9200
# 设置节点间交互的tcp端口，默认是9300
transport.tcp.port: 9300
# 是否支持跨域，默认为false
http.cors.enabled: true
# 当设置允许跨域，默认为*,表示支持所有域名，如果我们只是允许某些网站能访问，那么可以使用正则表达式。比如只允许本地地址。 /https?:\/\/localhost(:[0-9]+)?/
http.cors.allow-origin: "*"
# 表示这个节点是否可以充当主节点
node.master: true
# 是否充当数据节点
node.data: true
# 所有主从节点ip:port
#discovery.seed_hosts: ["192.168.200.135:9300"]  #本地只有一个节点,无法正常启动,先注释
# 这个参数决定了在选主过程中需要 有多少个节点通信  预防脑裂 N/2+1
discovery.zen.minimum_master_nodes: 1
#初始化主节点
#cluster.initial_master_nodes: ["es-node-1"]  #本地只有一个节点,无法正常启动,先注释
reindex.remote.whitelist: "10.1.0.101:9200"
xpack.security.enabled: true
xpack.license.self_generated.type: basic
xpack.security.transport.ssl.enabled: true
```
## 0x03.创建所需目录

```bash
mkdir -p ./data
mkdir -p ./plugins
mkdir -p ./config
mkdir -p ./logs
```

## 0x04.常用 Elasticsearch 容器命令

```bash
docker-compose up -d # 启动 Elasticsearch 容器
docker-compose down # 停止并删除 Elasticsearch 容器
docker-compose ps # 查看 Elasticsearch 容器状态
docker-compose logs -f # 实时查看 Elasticsearch 容器日志
docker exec -it es-7.17.28 /bin/bash # 进入 Elasticsearch 容器终端
```
## 0x05.验证 Elasticsearch 是否启动成功

```bash
curl -X GET "http://localhost:9200/"
```