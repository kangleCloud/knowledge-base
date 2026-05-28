const middlewareMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "中间件知识库概览",
        link: "/docs/middleware/",
      },
    ],
  },
  {
    text: "Redis",
    collapsed: false,
    items: [
      {
        text: "Redis 7.0 单节点部署",
        link: "/docs/middleware/redis/install-redis7.0.md",
      },
      {
        text: "Redis 7.0 三节点哨兵部署",
        link: "/docs/middleware/redis/redis-sentinel-3nodes.md",
      },
      {
        text: "Redis 集群部署",
        link: "/docs/middleware/redis/redis-cluster.md",
      },
      {
        text: "Redis 开发规范",
        link: "/docs/middleware/redis/developing-guideline.md",
      },
    ],
  },
  {
    text: "RabbitMQ",
    collapsed: true,
    items: [
      {
        text: "RabbitMQ 介绍",
        link: "/docs/middleware/rabbitmq/introduction.md",
      },
      {
        text: "RabbitMQ 3.11 安装",
        link: "/docs/middleware/rabbitmq/install-3.11.md",
      },
      {
        text: "镜像队列",
        link: "/docs/middleware/rabbitmq/mirror-queues.md",
      },
      {
        text: "延迟消息插件",
        link: "/docs/middleware/rabbitmq/delayed-message-plugin.md",
      },
    ],
  },
  {
    text: "Elastic Stack",
    collapsed: true,
    items: [
      {
        text: "Elasticsearch 7.17 单节点",
        link: "/docs/middleware/elastic/install-es7.17.md",
      },
      {
        text: "Elasticsearch 7.17 集群",
        link: "/docs/middleware/elastic/install-es7.17-cluster.md",
      },
      {
        text: "Elasticsearch 8.19 单节点",
        link: "/docs/middleware/elastic/install-es8.19.md",
      },
      {
        text: "Analysis-IK 插件",
        link: "/docs/middleware/elastic/install-es-analysis-ik.md",
      },
      {
        text: "Kibana 7.17",
        link: "/docs/middleware/elastic/install-kibana7.17.md",
      },
      {
        text: "Kibana 8.14",
        link: "/docs/middleware/elastic/install-kibana8.14.md",
      },
    ],
  },
  {
    text: "Nacos",
    collapsed: true,
    items: [
      {
        text: "Nacos 2.5 单机部署",
        link: "/docs/middleware/nacos/install-nacos2.5.md",
      },
      {
        text: "Nacos 2.2 单机部署",
        link: "/docs/middleware/nacos/install-nacos2.2.md",
      },
      {
        text: "Nacos 集群配置",
        link: "/docs/middleware/nacos/cluster.md",
      },
    ],
  },
  {
    text: "MinIO",
    collapsed: true,
    items: [
      {
        text: "单节点单驱动部署",
        link: "/docs/middleware/minio/deploy-minio-snsd.md",
      },
      {
        text: "四节点分布式部署",
        link: "/docs/middleware/minio/deploy-minio-mnmd.md",
      },
      {
        text: "基于 mc 的备份方案",
        link: "/docs/middleware/minio/backup-by-mc.md",
      },
    ],
  },
  {
    text: "Canal",
    collapsed: false,
    items: [
      {
        text: "Canal Server 单机部署",
        link: "/docs/middleware/canal/server-install.md",
      },
      {
        text: "Canal Admin 部署",
        link: "/docs/middleware/canal/admin-install.md",
      },
      {
        text: "Canal + RabbitMQ Quick Start",
        link: "/docs/middleware/canal/canal-rabbitmq-quickstart.md",
      },
    ],
  },
  {
    text: "其他中间件",
    collapsed: true,
    items: [
      {
        text: "Keepalived 介绍",
        link: "/docs/middleware/keepalived/introduction.md",
      },
      {
        text: "Keepalived 2.2 安装",
        link: "/docs/middleware/keepalived/install-keepalived2.2.md",
      },
      {
        text: "RocketMQ 5.3.1 单节点安装",
        link: "/docs/middleware/rocketmq/rocketmq5.3.1-install.md",
      },
      {
        text: "XXL-JOB 2.5 安装",
        link: "/docs/middleware/xxl-job-2.5-install.md",
      },
      {
        text: "kkFileView 安装",
        link: "/docs/middleware/kkfileview/install.md",
      },
      {
        text: "DataX 安装",
        link: "/docs/middleware/datax/datax.md",
      },
    ],
  },
];

export default middlewareMenu;
