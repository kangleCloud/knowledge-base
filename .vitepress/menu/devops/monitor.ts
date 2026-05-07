// write your menu in here
const MonitorMenu = [
    {
        text: 'Prometheus安装配置',
        collapsed: false,
        items: [
            {
                text: 'Prometheus安装配置',
                link: '/docs/devops/monitor/prometheus/config/prometheus-install.md',
            },
        ],
    },
    {
        text: 'Prometheus节点监控',
        collapsed: false,
        items: [
            {
                text: 'node_exporter',
                link: '/docs/devops/monitor/prometheus/node/node_exporter.md',
            },
            {
                text: 'nginx_exporter',
                link: '/docs/devops/monitor/prometheus/node/nginx_exporter.md',
            },
            {
                text: 'elasticsearch_exporter',
                link: '/docs/devops/monitor/prometheus/node/elasticsearch_exporter.md',
            },
            {
                text: 'mysql_exporter',
                link: '/docs/devops/monitor/prometheus/node/mysql_exporter.md',
            },
        ],
    }
]

export default MonitorMenu;
