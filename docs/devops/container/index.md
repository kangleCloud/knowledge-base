# 容器平台

## 适用场景

面向容器运行时、Kubernetes 集群、Helm 包管理与 Rancher 平台部署。

## 推荐阅读

- [YUM 安装 Docker](/docs/devops/container/docker/install-by-yum.md)
- [安装 Docker Compose](/docs/devops/container/docker/install-docker-compose.md)
- [Kubernetes 基础安装](/docs/devops/container/kubernetes/kubernetes-install/kubernetes-base-install.md)
- [kubectl 使用](/docs/devops/container/kubernetes/kubernetes-install/kubectl.md)
- [Kubernetes 挂载 NFS](/docs/devops/container/kubernetes/kubernetes-install/kubernetes-nfs.md)
- [Helm 3 二进制安装](/docs/devops/container/helm/install-helm3-by-binaries.md)
- [脚本安装 RKE2](/docs/devops/container/rancher/install-rke2.md)
- [Helm 安装 Rancher Server](/docs/devops/container/rancher/install-rancher-by-helm.md)

## 子主题清单

- Docker：安装、Compose、常用命令
- Kubernetes：基础安装、集群命令、存储集成
- Helm：客户端安装与包管理
- Rancher：RKE2、Rancher Server

## 代表文档入口

- 容器运行时：`docker/install-by-yum.md`、`docker/docker-commands.md`
- 集群安装：`kubernetes/kubernetes-install/kubernetes-base-install.md`
- 平台配套：`helm/install-helm3-by-binaries.md`、`rancher/install-rancher-by-helm.md`

## 注意事项

- 容器平台文档应优先说明环境要求、节点角色、网络与存储依赖。
- 集群与平台部署文档必须给出初始化验证、节点健康检查和回滚/卸载思路。
