# Middleware

## 适用场景

面向常用中间件的部署、配置、集群、插件扩展、连接治理和操作规范。

## 推荐入口

- Redis：[单节点部署](/docs/middleware/redis/install-redis7.0.md)、[三节点哨兵部署](/docs/middleware/redis/redis-sentinel-3nodes.md)、[集群部署](/docs/middleware/redis/redis-cluster.md)、[开发规范](/docs/middleware/redis/developing-guideline.md)
- RabbitMQ：安装、镜像队列、延迟消息插件
- Elastic Stack：Elasticsearch、Kibana、IK 插件
- Nacos：单机与集群配置
- MinIO：单节点部署、四节点部署与备份
- Canal：服务端、管理端和 RabbitMQ 集成

## 文档约定

- 部署类文档必须给出版本、环境、前置条件、验证与回滚。
- 规范类文档必须给出适用场景、建议做法和注意事项。

## 注意事项

- 具有历史价值但不再推荐的旧版本文档会转入 `archive/`。
- 若故障现象明确、排查步骤可复用，应拆到 `troubleshooting/`。
