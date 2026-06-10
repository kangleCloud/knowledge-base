# knowledge-base 整理报告

## 1. 本次整理摘要

- 整理时间：2026-05-07
- 整理目标：收口 `knowledge-base` 的知识库结构，统一分类、索引、命名与文档规范，并对敏感信息、过期文档和历史文档做清理。
- 本次增量重点：重构 `DevOps` 分类入口，新增四个子分类首页，并全量删除 `SonarQube`、`SkyWalking`、`Zabbix` 相关主库与归档文档。

## 2. 当前最终结构

- `docs/backend/`：22 篇 Markdown
- `docs/database/`：19 篇 Markdown
- `docs/middleware/`：28 篇 Markdown
- `docs/devops/`：89 篇 Markdown
- `docs/troubleshooting/`：5 篇 Markdown
- `archive/`：27 个归档文件
- `public/images/`：47 个静态资源文件

## 3. 站点与索引调整

- 重写首页 [index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/index.md)。
- 新增仓库索引 [README.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/README.md)。
- 主分类首页保留为：
  - [docs/backend/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/backend/index.md)
  - [docs/database/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/database/index.md)
  - [docs/middleware/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/middleware/index.md)
  - [docs/devops/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/devops/index.md)
  - [docs/troubleshooting/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/troubleshooting/index.md)
- 本次新增 `DevOps` 子分类首页：
  - [docs/devops/base/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/devops/base/index.md)
  - [docs/devops/container/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/devops/container/index.md)
  - [docs/devops/cicd/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/devops/cicd/index.md)
  - [docs/devops/monitoring/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/devops/monitoring/index.md)
- `DevOps` 首页推荐入口已改为可点击分类入口：
  - 基础运维
  - 容器平台
  - CI/CD
  - 监控告警
- 重写 `.vitepress` 导航与侧边栏：
  - [config.mts](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/.vitepress/config.mts)
  - [nav.mts](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/.vitepress/nav.mts)
  - [menu/index.mts](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/.vitepress/menu/index.mts)
  - `devops/base.ts`、`devops/container.ts`、`devops/cicd.ts`、`devops/monitoring.ts`
- LVM 动态扩容入口统一保留为 `docs/devops/base/linux/lvm-extend.md`。
- 为避免归档文件进入站点构建，继续使用 `srcExclude: ["archive/**"]`。

## 4. 迁移、新增与归并

### 4.1 Backend

从 `vitepress-ttd/docs/backend/java` 与 `vitepress-ttd/docs/backend/practice` 迁入并纳入主库的内容包括：

- Java 工具与规范：`javahelper/*`、`logguide.md`、`styleguide.md`
- Spring Boot：`springboot/security.md`、`springboot/excel.md`
- 开发实践：`distributed-locks.md`、`high-performance-server-design-patterns.md`、`openresty-gray.md`、`rabbitmq-usage-protocol.md`、`spring-web-request-valid-annotation.md`

同时保留并重整了原有 `knowledge-base` 中的后端内容：

- `framework/mybatis/mybatis.md`
- `framework/spring/springboot-annotation.md`
- `framework/spring/springboot-life-cycle.md`
- `jvm/base.md`
- `middleware/redis/*`
- `middleware/minio/minio-util.md`
- `middleware/sentinel/base.md`

### 4.2 Database

从 `vitepress-ttd/docs/database` 迁入并整理的内容包括：

- MySQL：`advanced-sql-in-mysql.md`、`basic-specification.md`、`data-definition-language.md`、`db-table-specification.md`、`mgr.md`、`mmss.md`、`percona-xtrabackup-2.4.md`、`percona-xtrabackup-8.0.md`、`sql-develop-specification.md`、`system-variable-for-mysql5.7.md`、`system-variable-for-mysql8.0.md`
- MongoDB：`install-mongodb-6.0.md`、`install-mongodb-7.0.md`
- Hive：`sql.md`
- 达梦：原 `docs/database/dm/base.md` 归并为 `docs/database/dameng/base.md`

### 4.3 Middleware

从 `vitepress-ttd/docs/middleware` 迁入并整理的内容包括：

- Canal：`admin-install.md`、`canal-rabbitmq-quickstart.md`、`server-install.md`
- DataX：`datax.md`
- Elastic：`install-es8.19.md`、`install-kibana7.17.md`
- Keepalived：`introduction.md`、`install-keepalived2.2.md`
- kkFileView：`install.md`
- MinIO：`backup-by-mc.md`
- Redis：`install-redis7.0.md`、`developing-guideline.md`
- XXL-JOB：`xxl-job-2.5-install.md`

原有主版本继续保留：

- Nacos：`install-nacos2.2.md`、`install-nacos2.5.md`、`cluster.md`
- RabbitMQ：`introduction.md`、`install-3.11.md`、`mirror-queues.md`、`delayed-message-plugin.md`
- Elasticsearch：`install-es7.17.md`、`install-es7.17-cluster.md`、`install-es-analysis-ik.md`
- RocketMQ：`rocketmq5.3.1-install.md`
- MinIO：`deploy-minio-snsd.md`

### 4.4 DevOps

从 `vitepress-ttd/docs/devops` 迁入并整理的内容包括：

- 基础运维：`install-git.md`、`install-go.md`、`linux-command.md`、`logrotate.md`
- 服务器系统：`alternatives.md`、`cockpit.md`、`firewalld.md`、`initialization.md`、`systemd.md`、`systemd-command.md`
- Nginx：`best-practices.md`、`ha-with-keepalived.md`、`install-with-lua.md`、`integration-php-fpm.md`、`location-example.md`、`nginx-lua-module.md`、`recompiling-with-modules.md`、`smooth-upgrades.md`、`upstream.md`
- Node / Python：`nodejs/install-nodejs.md`、`python/conda.md`、`python/install-python2-on-openeuler.md`、`python/install-python3-on-centos7.md`
- 容器平台：`rancher/install-rke2.md`、`rancher/install-rancher-by-helm.md`
- CI/CD：`deploy/*`
- 监控告警：`Prometheus`、`Grafana`、`Alertmanager` 及通用监控规范

本次针对 `DevOps` 的补充与归并：

- 新增 `base/`、`container/`、`cicd/`、`monitoring/` 四个可访问分类首页
- `docs/devops/index.md` 从纯文本列表改为可点击入口
- `monitoring/metrics/*` 与 `monitoring/monitorkeys.md` 从产品绑定文档改写为通用监控指标规范
- `SonarQube`、`SkyWalking`、`Zabbix` 相关文档从主库与归档中全量移除，不再保留历史入口

原有主版本继续保留：

- `devops/base/java/install-jdk.md`
- `devops/base/java/install-maven.md`
- `devops/base/harbor/install.md`
- `devops/base/nfs/install.md`
- `devops/base/linux/lvm.md`
- `devops/base/linux/lvm-extend.md`
- `devops/base/php7/*`
- `devops/base/supervisor/supervisor-install.md`
- `devops/base/supervisor/supervisor-config.md`
- `devops/base/jenkins/k8s/workflow.md`
- `devops/container/docker/*`
- `devops/container/kubernetes/kubernetes-install/*`
- `devops/container/helm/install-helm3-by-binaries.md`
- `devops/cicd/jenkins-install.md`
- `devops/cicd/k8s-jenkins-install.md`
- `devops/cicd/k8s-jenkins-config.md`

### 4.5 Troubleshooting

新增独立排障文档：

- [docs/troubleshooting/elasticsearch/reset-elastic-password.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/troubleshooting/elasticsearch/reset-elastic-password.md)
- [docs/troubleshooting/keepalived/vip-not-failover.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/troubleshooting/keepalived/vip-not-failover.md)
- [docs/troubleshooting/nfs/unmount-device-busy.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/troubleshooting/nfs/unmount-device-busy.md)
- [docs/troubleshooting/rocketmq/producer-vip-channel.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/troubleshooting/rocketmq/producer-vip-channel.md)

## 5. 重命名与结构归并

- `docs/database/dm/base.md` -> `docs/database/dameng/base.md`
- `docs/backend/java/middleware/sentinal/` -> `docs/backend/java/middleware/sentinel/`
- `docs/devops/base/ansiable/` -> `docs/devops/base/ansible/`
- `docs/devops/container/kubernetes/kubernetes-install/Kubernetes-base-install.md` -> `docs/devops/container/kubernetes/kubernetes-install/kubernetes-base-install.md`

## 6. 归档保留

以下内容因历史价值、旧版本兼容、重复实现或不再纳入主导航，保留在 `archive/`：

- `archive/docs/backend/practice/lua-private-image.md`
- `archive/docs/backend/practice/nexus-repository-use.md`
- `archive/docs/backend/practice/nlr-build-high-performance-server.md`
- `archive/docs/database/mongodb/install-mongodb-4.4.md`
- `archive/docs/database/mysql/shentong-install.md`
- `archive/docs/devops/base/introduction.md`
- `archive/docs/devops/base/maven.md`
- `archive/docs/devops/base/nfs.md`
- `archive/docs/devops/base/nginx/nginx+lua_install.md`
- `archive/docs/devops/base/server-os/init-os.md`
- `archive/docs/devops/base/shell-styleguide.md`
- `archive/docs/devops/base/supervisor/install-archive.md`
- `archive/docs/devops/base/supervisor/install.md`
- `archive/docs/devops/base/supervisor/program-settings.md`
- `archive/docs/devops/base/supervisor/webui-archive.md`
- `archive/docs/devops/base/xxzx-checklists.md`
- `archive/docs/devops/container/k8s/install-helm3-by-binaries.md`
- `archive/docs/middleware/elastic/install-es8.14.md`
- `archive/docs/middleware/elastic/install-kibana.md`
- `archive/docs/middleware/redis/cluster.md`
- `archive/docs/middleware/redis/install-redis.md`

归档原因说明：

- 旧版本安装文档：保留历史环境兼容参考，不作为主导航入口。
- 临时实践稿、检查清单、旧结构文档：保留背景信息，但不纳入当前知识库主结构。
- 已有更新主版本的文档：保留旧稿以便追溯差异。

## 7. 删除

### 7.1 首轮整理删除

- `api-examples.md`
- `markdown-examples.md`
- `docs/database/base.md`
- `docs/middleware/base.md`
- `docs/devops/base/base.md`
- `docs/devops/container/base.md`
- `docs/backend/java/framework/spring/spring.md`
- 其他空白页：
  - `docs/database/dameng/install-dameng.md`
  - `docs/middleware/minio/install-minio-client.md`
  - `docs/middleware/rabbitmq/developing-guideline.md`
  - `docs/middleware/rabbitmq/quorum-queues.md`

### 7.2 本次 DevOps 清理删除

- `docs/devops/cicd/sonarqube-install.md`
- `docs/devops/monitoring/skywalking/install.md`
- `docs/devops/monitoring/zabbix/quickstart.md`
- `docs/devops/monitoring/zabbix/zabbix-scripts/java-error-keyword.md`
- `docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-agent.md`
- `docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-agent2.md`
- `docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-jmx.md`
- `docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-proxy.md`
- `docs/devops/monitoring/zabbix/zabbix6/install-zabbix60-server.md`
- `docs/devops/monitoring/zabbix/zabbix6/integrate-mysql.md`
- `docs/devops/monitoring/zabbix/zabbix6/integrate-nginx.md`
- `docs/devops/monitoring/zabbix/zabbix6/integrate-phpfpm.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/install-zabbix54-agent.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/install-zabbix54-jmx.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/install-zabbix54-proxy.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/install-zabbix54-server.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/integrate-mysql.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/integrate-nginx.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/integrate-phpfpm.md`
- `archive/docs/devops/monitoring/zabbix/zabbix5/integrate-redis.md`

删除原因说明：

- 默认示例文件、空白页、无内容草稿与占位首页不保留。
- `SonarQube`、`SkyWalking`、`Zabbix` 已明确不再保留，因此主库与归档历史副本均做物理删除。

## 8. 补全、统一与合并

- 统一 `DevOps` 入口结构：主入口 + 四个子分类首页。
- 为 `base/`、`container/`、`cicd/`、`monitoring/` 分类首页补齐：
  - 适用场景
  - 推荐阅读
  - 子主题清单
  - 代表文档入口
  - 注意事项
- 统一 `DevOps` 菜单入口，使各子分类均可从侧边栏直接进入分类首页。
- 将以下文档从产品绑定写法改为通用监控规范写法：
  - `docs/devops/monitoring/metrics/linux.md`
  - `docs/devops/monitoring/metrics/mysql.md`
  - `docs/devops/monitoring/metrics/nginx.md`
  - `docs/devops/monitoring/metrics/redis.md`
  - `docs/devops/monitoring/monitorkeys.md`
- 为避免主站正文继续暗示已废弃方案仍被支持，同时修正文内示例：
  - `docs/middleware/rabbitmq/introduction.md`
  - `docs/devops/base/server-os/upgrade-openssl.md`
  - `archive/docs/devops/base/xxzx-checklists.md`
  - `archive/docs/devops/base/shell-styleguide.md`

## 9. 脱敏

已完成以下类型的脱敏：

- MySQL 集群、MGR、XtraBackup 文档中的真实或疑似真实口令
- SonarQube 数据库密码
- 七牛 `AccessKey` / `SecretKey`
- Harbor 管理密码与 `docker login` 示例口令
- Zabbix 监控连接密码
- Kubeadm join token
- Canal、XXL-JOB、RabbitMQ、达梦等默认口令示例
- Alertmanager bearer token / smtp password

统一替换为以下占位符：

- `<PASSWORD>`
- `<TOKEN>`
- `<ACCESS_KEY>`
- `<SECRET_KEY>`
- `<DB_PASSWORD>`
- `<REPLICATION_PASSWORD>`
- `<ROOT_PASSWORD>`
- `<MONITOR_PASSWORD>`
- `<PROXYSQL_PASSWORD>`
- `<SMTP_PASSWORD>`

## 10. 链接与静态资源

- 保留 `public/images/` 下的现有有效资源，总计 47 个文件。
- 本次 `DevOps` 清理未发现 `SonarQube`、`SkyWalking`、`Zabbix` 的独立残留图片资源。
- `archive/**` 继续通过 `srcExclude` 排除，不参与站点构建。

## 11. 验证结果

- 敏感字段扫描：未发现真实敏感信息，结果仅保留占位符。
- 关键字扫描：`SonarQube|SkyWalking|Zabbix` 仅出现在本整理报告中。
- 构建验证：`npm run docs:build` 已通过。
- 构建告警：存在 Vite chunk size 警告，但不影响本次构建成功。

## 12. 遗留 TODO

- 部分历史文档仍保留原始 Markdown/HTML 混写风格，后续可按分类继续重写。
- `docs/database/dameng/shuoming-dameng.md` 仍偏操作手册风格，后续可进一步整理为更标准的小节结构。
- 如后续继续大规模精修，建议在本报告末尾追加增量记录，避免不同轮次整理结论冲突。
