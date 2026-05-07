# DevOps

## 适用场景

面向基础运维、容器平台、CI/CD、监控告警、发布流程和系统治理。

## 推荐入口

- [基础运维](/docs/devops/base/)：系统初始化、防火墙、Systemd、Nginx、Supervisor、Harbor、NFS、LVM
- [容器平台](/docs/devops/container/)：Docker、Kubernetes、Helm、Rancher
- [CI/CD](/docs/devops/cicd/)：Jenkins、K8S 集成、发布流程
- [监控告警](/docs/devops/monitoring/)：Prometheus、Grafana、Alertmanager

## 文档约定

- 部署与发布类文档需要同时给出环境信息、操作步骤、验证命令和回滚方案。
- 监控类文档需要说明采集目标、依赖关系、验证步骤和注意事项。

## 注意事项

- 纯备忘录、核对记录、空白草稿不进入主导航。
- 与生产故障相关、仍可能复用的历史文档优先放入 `archive/`；明确废弃且不再保留的方案直接移除。
