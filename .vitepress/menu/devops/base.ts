const devopsMenu = [
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
    text: "主机与基础运维",
    collapsed: false,
    items: [
      {
        text: "系统初始化",
        link: "/docs/devops/base/server-os/initialization.md",
      },
      {
        text: "防火墙配置",
        link: "/docs/devops/base/server-os/firewalld.md",
      },
      {
        text: "系统优化",
        link: "/docs/devops/base/server-os/optimization.md",
      },
      {
        text: "升级 OpenSSL",
        link: "/docs/devops/base/server-os/upgrade-openssl.md",
      },
      {
        text: "升级 OpenSSH",
        link: "/docs/devops/base/server-os/upgrade-openssh.md",
      },
      {
        text: "Systemd 介绍",
        link: "/docs/devops/base/server-os/systemd.md",
      },
      {
        text: "Alternatives 管理",
        link: "/docs/devops/base/server-os/alternatives.md",
      },
      {
        text: "磁盘扩容",
        link: "/docs/devops/base/server-os/disk-expansion.md",
      },
      {
        text: "Linux 常用命令",
        link: "/docs/devops/base/linux-command.md",
      },
      {
        text: "Logrotate 日志轮转",
        link: "/docs/devops/base/logrotate.md",
      },
      {
        text: "Git 安装",
        link: "/docs/devops/base/install-git.md",
      },
      {
        text: "Go 安装",
        link: "/docs/devops/base/install-go.md",
      },
    ],
  },
  {
    text: "Nginx",
    collapsed: true,
    items: [
      {
        text: "Nginx 安装",
        link: "/docs/devops/base/nginx/install.md",
      },
      {
        text: "Nginx 基础配置",
        link: "/docs/devops/base/nginx/configuration.md",
      },
      {
        text: "Nginx 最佳实践",
        link: "/docs/devops/base/nginx/best-practices.md",
      },
      {
        text: "Nginx 生产实践",
        link: "/docs/devops/base/nginx/prod.md",
      },
      {
        text: "Nginx + Lua 安装",
        link: "/docs/devops/base/nginx/install-with-lua.md",
      },
      {
        text: "Nginx Lua 模块",
        link: "/docs/devops/base/nginx/nginx-lua-module.md",
      },
      {
        text: "集成 PHP-FPM",
        link: "/docs/devops/base/nginx/integration-php-fpm.md",
      },
      {
        text: "负载均衡配置",
        link: "/docs/devops/base/nginx/upstream.md",
      },
      {
        text: "Keepalived 高可用",
        link: "/docs/devops/base/nginx/ha-with-keepalived.md",
      },
      {
        text: "Location 示例",
        link: "/docs/devops/base/nginx/location-example.md",
      },
      {
        text: "平滑升级",
        link: "/docs/devops/base/nginx/smooth-upgrades.md",
      },
      {
        text: "重新编译添加模块",
        link: "/docs/devops/base/nginx/recompiling-with-modules.md",
      },
    ],
  },
  {
    text: "运行时与服务",
    collapsed: true,
    items: [
      {
        text: "JDK 安装",
        link: "/docs/devops/base/java/install-jdk.md",
      },
      {
        text: "Maven 安装",
        link: "/docs/devops/base/java/install-maven.md",
      },
      {
        text: "Node.js 安装",
        link: "/docs/devops/base/nodejs/install-nodejs.md",
      },
      {
        text: "Conda 安装与使用",
        link: "/docs/devops/base/python/conda.md",
      },
      {
        text: "CentOS 7 安装 Python 3",
        link: "/docs/devops/base/python/install-python3-on-centos7.md",
      },
      {
        text: "openEuler 安装 Python 2",
        link: "/docs/devops/base/python/install-python2-on-openeuler.md",
      },
      {
        text: "PHP 7 介绍",
        link: "/docs/devops/base/php7/introduction.md",
      },
      {
        text: "安装 PHP 7.3",
        link: "/docs/devops/base/php7/install-php73.md",
      },
      {
        text: "安装 PHP 7.4",
        link: "/docs/devops/base/php7/install-php74.md",
      },
      {
        text: "安装 PHP 扩展",
        link: "/docs/devops/base/php7/install-php7-extension.md",
      },
      {
        text: "Composer 安装",
        link: "/docs/devops/base/php7/composer.md",
      },
      {
        text: "php.ini 配置",
        link: "/docs/devops/base/php7/php-ini.md",
      },
      {
        text: "php-fpm 配置",
        link: "/docs/devops/base/php7/php-fpm.md",
      },
    ],
  },
  {
    text: "服务治理与存储",
    collapsed: true,
    items: [
      {
        text: "Supervisor 安装",
        link: "/docs/devops/base/supervisor/supervisor-install.md",
      },
      {
        text: "Supervisor 应用配置",
        link: "/docs/devops/base/supervisor/supervisor-config.md",
      },
      {
        text: "Supervisor 监控",
        link: "/docs/devops/base/supervisor/supervisor-monitor.md",
      },
      {
        text: "Harbor 安装",
        link: "/docs/devops/base/harbor/install.md",
      },
      {
        text: "Ansible 安装",
        link: "/docs/devops/base/ansible/ansible-install.md",
      },
      {
        text: "NFS 安装与维护",
        link: "/docs/devops/base/nfs/install.md",
      },
      {
        text: "LVM 基础操作",
        link: "/docs/devops/base/linux/lvm.md",
      },
      {
        text: "LVM 动态扩容",
        link: "/docs/devops/base/linux/lvm-extend.md",
      },
    ],
  },
];

export default devopsMenu;
