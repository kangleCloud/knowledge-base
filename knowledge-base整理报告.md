# knowledge-base 整理报告

## 1. 本次整理摘要

- 整理时间：2026-05-06
- 整理目标：将 `knowledge-base` 收口为 `backend/`、`database/`、`middleware/`、`devops/`、`troubleshooting/` 五大类，并对历史文档做归档、去重、脱敏和结构统一。
- 验证结果：`npm run docs:build` 已通过。

## 2. 最终结构

- `docs/backend/`：22 篇 Markdown
- `docs/database/`：19 篇 Markdown
- `docs/middleware/`：28 篇 Markdown
- `docs/devops/`：99 篇 Markdown
- `docs/troubleshooting/`：5 篇 Markdown
- `archive/`：35 个归档文件
- `public/images/`：47 个迁移后的静态资源文件

## 3. 站点与索引调整

- 重写首页 [index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/index.md)。
- 新增仓库索引 [README.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/README.md)。
- 新增五个分类首页：
  - [docs/backend/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/backend/index.md)
  - [docs/database/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/database/index.md)
  - [docs/middleware/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/middleware/index.md)
  - [docs/devops/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/devops/index.md)
  - [docs/troubleshooting/index.md](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/docs/troubleshooting/index.md)
- 重写 `.vitepress` 导航与侧边栏：
  - [config.mts](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/.vitepress/config.mts)
  - [nav.mts](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/.vitepress/nav.mts)
  - [menu/index.mts](/Users/zhuningkang/Documents/git/github/knowledge/knowledge-base/.vitepress/menu/index.mts)
  - 新增 `backend`、`monitoring`、`troubleshooting` 菜单。
- 为避免归档文件进入站点构建，已在 `config.mts` 中增加 `srcExclude: ["archive/**"]`。

## 4. 迁移与新增

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
- 达梦：保留并归并到 `dameng/`，其中原 `docs/database/dm/base.md` 改为 `docs/database/dameng/base.md`

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

原有 `knowledge-base` 中已有且保留为主版本的内容包括：

- Nacos：`install-nacos2.2.md`、`install-nacos2.5.md`、`cluster.md`
- RabbitMQ：`introduction.md`、`install-3.11.md`、`mirror-queues.md`、`delayed-message-plugin.md`
- Elasticsearch：`install-es7.17.md`、`install-es7.17-cluster.md`、`install-es-analysis-ik.md`
- RocketMQ：`rocketmq5.3.1-install.md`
- MinIO：`deploy-minio-snsd.md`

### 4.4 DevOps

从 `vitepress-ttd/docs/devops` 迁入并整理的内容包括：

- 基础运维：`install-git.md`、`install-go.md`、`linux-command.md`、`logrotate.md`
- 服务器系统：`alternatives.md`、`cockpit.md`、`disk-expansion.md`、`firewalld.md`、`initialization.md`、`systemd.md`、`systemd-command.md`
- Nginx：`best-practices.md`、`ha-with-keepalived.md`、`install-with-lua.md`、`integration-php-fpm.md`、`location-example.md`、`nginx-lua-module.md`、`recompiling-with-modules.md`、`smooth-upgrades.md`、`upstream.md`
- Node / Python：`nodejs/install-nodejs.md`、`python/conda.md`、`python/install-python2-on-openeuler.md`、`python/install-python3-on-centos7.md`
- 监控：`monitoring/**`（Prometheus、Grafana、Alertmanager、SkyWalking、Zabbix 6）
- 容器：`rancher/install-rke2.md`、`rancher/install-rancher-by-helm.md`
- CI/CD：`deploy/*`、`sonarqube-install.md`

原有 `knowledge-base` 中继续保留为主版本的内容包括：

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

## 6. 归档

以下文档因历史价值、版本过旧、重复实现或不再纳入主导航，已移入 `archive/`：

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
- `archive/docs/devops/monitor/prometheus/config/prometheus.md`
- `archive/docs/devops/monitor/prometheus/node/elasticsearch_exporter.md`
- `archive/docs/devops/monitor/prometheus/node/nginx_exporter.md`
- `archive/docs/devops/monitor/prometheus/node/node_exporter.md`
- `archive/docs/devops/monitor/prometheus/node/nginx-dashboard.json`
- `archive/docs/devops/monitor/prometheus/node/node_dashboard.json`
- `archive/docs/devops/monitoring/zabbix/zabbix5/*`
- `archive/docs/middleware/elastic/install-es8.14.md`
- `archive/docs/middleware/elastic/install-kibana.md`
- `archive/docs/middleware/redis/cluster.md`
- `archive/docs/middleware/redis/install-redis.md`

归档原因说明：

- `MongoDB 4.4`：版本过旧，但仍可能用于历史环境排查。
- `Zabbix 5.4`：旧版本监控方案，保留历史兼容价值。
- `Redis install-redis.md`、`cluster.md`：被 `install-redis7.0.md` 与 `redis-cluster.md` 取代。
- `Elastic 8.14 / Kibana 旧版入口`：保留历史版本，不作为主导航入口。
- `lua-private-image`、`nexus-repository-use`、`nlr-build-high-performance-server`：暂不进入主知识库，但可能有参考价值。
- `旧 monitor` 目录：被 `docs/devops/monitoring/` 结构替代。

## 7. 删除

直接删除的文件包括：

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

删除原因说明：

- 默认示例文件、空白页、无内容草稿与不再使用的占位首页不保留。

## 8. 脱敏

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

## 9. 链接与静态资源

- 新增 `public/images/` 下的迁移图片资源，覆盖后端实践、中间件、DevOps 监控等场景。
- 修复了部分旧站点遗留内部链接：
  - `devops/baseops/*` -> `docs/devops/base/*`
  - `Redis install-redis.html` -> `install-redis7.0.md`
  - `Analysis-IK` 相关链接 -> 当前 `docs/middleware/elastic/install-es-analysis-ik.md`
- 对于原先指向 `memo.html` 的命名规范链接，已改为正文说明，避免保留无效跳转。

## 10. 验证结果

- 敏感字段扫描：未发现真实敏感信息，扫描结果仅保留占位符。
- 构建验证：`npm run docs:build` 通过。
- 归档验证：`archive/**` 已通过 `srcExclude` 排除，不参与站点构建。

## 11. 遗留 TODO

- 部分历史文档仍保留原始 Markdown/HTML 混写风格，后续如需进一步统一，可按分类逐步重写。
- `docs/devops/base/php7/*`、`docs/devops/monitoring/metrics/*`、`docs/devops/monitoring/monitorkeys.md` 目前已纳入结构，但仍可继续补齐“适用场景 / 验证 / 回滚”模板。
- `docs/database/dameng/shuoming-dameng.md` 仍偏操作手册风格，后续可进一步整理为更标准的小节结构。
- 当前报告按“主导航文档 + 归档文档”维度记录；若后续继续大规模精修，建议在报告末尾追加增量记录。
