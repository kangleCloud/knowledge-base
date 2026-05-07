const troubleshootingMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "故障排查总览",
        link: "/docs/troubleshooting/",
      },
    ],
  },
  {
    text: "常见故障",
    collapsed: false,
    items: [
      {
        text: "Elasticsearch 重置 elastic 密码",
        link: "/docs/troubleshooting/elasticsearch/reset-elastic-password.md",
      },
      {
        text: "Keepalived VIP 未漂移",
        link: "/docs/troubleshooting/keepalived/vip-not-failover.md",
      },
      {
        text: "NFS 卸载时报 device is busy",
        link: "/docs/troubleshooting/nfs/unmount-device-busy.md",
      },
      {
        text: "RocketMQ Producer 连接失败",
        link: "/docs/troubleshooting/rocketmq/producer-vip-channel.md",
      },
    ],
  },
];

export default troubleshootingMenu;
