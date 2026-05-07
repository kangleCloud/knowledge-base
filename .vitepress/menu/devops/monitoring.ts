const devopsMonitoringMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "DevOps 知识库概览",
        link: "/docs/devops/",
      },
      {
        text: "监控告警分类首页",
        link: "/docs/devops/monitoring/",
      },
    ],
  },
  {
    text: "Prometheus 与 Exporter",
    collapsed: false,
    items: [
      {
        text: "Prometheus 二进制安装",
        link: "/docs/devops/monitoring/prometheus/install-by-binaries.md",
      },
      {
        text: "Node Exporter",
        link: "/docs/devops/monitoring/prometheus/node-exporter.md",
      },
      {
        text: "Nginx Prometheus Exporter",
        link: "/docs/devops/monitoring/prometheus/nginx-prometheus-exporter.md",
      },
      {
        text: "MySQL Server Exporter",
        link: "/docs/devops/monitoring/prometheus/mysql-server-exporter.md",
      },
      {
        text: "Redis Exporter",
        link: "/docs/devops/monitoring/prometheus/redis-exporter.md",
      },
      {
        text: "RabbitMQ Exporter",
        link: "/docs/devops/monitoring/prometheus/rabbitmq-exporter.md",
      },
      {
        text: "MinIO Exporter",
        link: "/docs/devops/monitoring/prometheus/minio-exporter.md",
      },
      {
        text: "Elasticsearch Exporter",
        link: "/docs/devops/monitoring/prometheus/elasticsearch-exporter.md",
      },
      {
        text: "PHP-FPM Exporter",
        link: "/docs/devops/monitoring/prometheus/phpfpm-exporter.md",
      },
    ],
  },
  {
    text: "可观测性与告警",
    collapsed: true,
    items: [
      {
        text: "Grafana 安装",
        link: "/docs/devops/monitoring/grafana/install-by-binaries.md",
      },
      {
        text: "Alertmanager 安装",
        link: "/docs/devops/monitoring/alertmanager/install.md",
      },
      {
        text: "Alertmanager 部署与升级",
        link: "/docs/devops/monitoring/alertmanager/deploy.md",
      },
    ],
  },
  {
    text: "监控规范",
    collapsed: true,
    items: [
      {
        text: "Linux 基础监控项",
        link: "/docs/devops/monitoring/metrics/linux.md",
      },
      {
        text: "MySQL 监控项",
        link: "/docs/devops/monitoring/metrics/mysql.md",
      },
      {
        text: "Nginx 监控项",
        link: "/docs/devops/monitoring/metrics/nginx.md",
      },
      {
        text: "Redis 监控项",
        link: "/docs/devops/monitoring/metrics/redis.md",
      },
      {
        text: "监控指标总览",
        link: "/docs/devops/monitoring/monitorkeys.md",
      },
    ],
  },
];

export default devopsMonitoringMenu;
