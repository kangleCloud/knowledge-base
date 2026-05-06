const devopsMonitoringMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "DevOps 知识库概览",
        link: "/docs/devops/",
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
      {
        text: "SkyWalking 安装",
        link: "/docs/devops/monitoring/skywalking/install.md",
      },
    ],
  },
  {
    text: "Zabbix",
    collapsed: true,
    items: [
      {
        text: "Zabbix 快速入门",
        link: "/docs/devops/monitoring/zabbix/quickstart.md",
      },
      {
        text: "Zabbix 6.0 Server",
        link: "/docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-server.md",
      },
      {
        text: "Zabbix 6.0 Proxy",
        link: "/docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-proxy.md",
      },
      {
        text: "Zabbix 6.0 Agent",
        link: "/docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-agent.md",
      },
      {
        text: "Zabbix 6.0 Agent2",
        link: "/docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-agent2.md",
      },
      {
        text: "Zabbix 6.0 JMX",
        link: "/docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-jmx.md",
      },
      {
        text: "Zabbix 集成 MySQL",
        link: "/docs/devops/monitoring/zabbix/zabbix6/integrate-mysql.md",
      },
      {
        text: "Zabbix 集成 Nginx",
        link: "/docs/devops/monitoring/zabbix/zabbix6/integrate-nginx.md",
      },
      {
        text: "Zabbix 集成 PHP-FPM",
        link: "/docs/devops/monitoring/zabbix/zabbix6/integrate-phpfpm.md",
      },
    ],
  },
];

export default devopsMonitoringMenu;
