# CI/CD

## 适用场景

面向持续集成、Kubernetes 交付集成、标准发布流程与应用部署操作。

## 推荐阅读

- [Jenkins 安装](/docs/devops/cicd/jenkins-install.md)
- [K8S 集群内集成 Jenkins](/docs/devops/cicd/k8s-jenkins-install.md)
- [Jenkins 连接 K8S 配置](/docs/devops/cicd/k8s-jenkins-config.md)
- [Jenkins K8S 工作流](/docs/devops/base/jenkins/k8s/workflow.md)
- [基本部署流程](/docs/devops/cicd/deploy/deploy-base.md)
- [Java 项目部署](/docs/devops/cicd/deploy/deploy-java.md)
- [Vue 项目部署](/docs/devops/cicd/deploy/deploy-vue.md)

## 子主题清单

- 持续集成：Jenkins 安装与基础能力建设
- K8S 集成：集群内安装、控制器配置、工作流设计
- 发布交付：通用部署流程、Java 发布、前端发布

## 代表文档入口

- CI 基建：`jenkins-install.md`
- 集群接入：`k8s-jenkins-install.md`、`k8s-jenkins-config.md`
- 发布标准：`deploy/deploy-base.md`、`deploy/deploy-java.md`

## 注意事项

- 发布类文档需要说明环境信息、发布前检查、验证步骤和回滚方案。
- 若流程依赖外部质量平台或扫描平台，应在具体业务文档中单独说明，不在主分类入口保留独立平台页。
