# 基于Helm安装Rancher Server

https://www.suse.com/zh-cn/suse-rancher/support-matrix/all-supported-versions

[根据 Rancher 官方推荐，生产环境中的 Rancher Server 应通过 Helm Chart 在 Kubernetes 集群上进行安装。](https://ranchermanager.docs.rancher.com/zh/getting-started/installation-and-upgrade/resources/choose-a-rancher-version)

<font color="red">使用 Helm 在 K8S Master 节点上获取并安装 Cert-Manager Chart 以及 Rancher Chart。</font>

:::tip
通过 helm install 部署应用，会触发 Kubernetes 集群的各个 Worker 节点上的 kubelet 指令容器运行时（如 containerd）拉取所需的镜像。这些镜像被存储在容器运行时的内部，并且对于 containerd 来说，它们被管理在 k8s.io 这个命名空间之下。
:::

## 1. 前提条件

### 0x01.脚本安装RKE2

<a href="/docs/devops/container/rancher/install-rke2" target="_blank">脚本安装RKE2</a>

### 0x02.二进制文件安装Helm

<a href="/docs/devops/container/k8s/install-helm3-by-binaries" target="_blank">二进制文件安装Helm3</a>

## 2.获取 Cert-Manager Chart

<font color="red">Rancher Server 默认设计为安全的，并且需要 SSL/TLS 配置。约定使用 Rancher 默认的自签名证书。</font>

https://artifacthub.io/packages/helm/cert-manager/cert-manager

### 0x01.添加 Cert-Manager 仓库

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
```

### 0x02.下载 Cert-Manager Chart

在 jetstack 仓库中搜索 cert-manager 并列出所有历史版本
```bash
helm search repo jetstack/cert-manager --versions
```

:::tip 输出如下内容
```vim
NAME                                    CHART VERSION   APP VERSION     DESCRIPTION                                       
jetstack/cert-manager                   v1.18.2         v1.18.2         A Helm chart for cert-manager                     
jetstack/cert-manager                   v1.18.1         v1.18.1         A Helm chart for cert-manager                     
jetstack/cert-manager                   v1.18.0         v1.18.0         A Helm chart for cert-manager                     
......
```
:::

下载 jetstack 仓库中的 cert-manager-1.18.2.tgz 到 /usr/local/src 目录中
```bash
cd /usr/local/src
helm fetch jetstack/cert-manager --version=v1.18.2
```

### 0x03.创建命名空间

前提：<a href="/docs/devops/container/rancher/install-rke2.html#_0x01-kubectl" target="_blank">配置 kubectl</a>

```bash
kubectl create namespace cert-manager
```

### 0x04.创建 Cert-Manager CRD

[CRD： Custom Resource Definition](https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/custom-resources/)

```bash
cd /usr/local/src
curl -L -o cert-manager-crd-1.18.2.yaml \
  https://github.com/cert-manager/cert-manager/releases/download/v1.18.2/cert-manager.crds.yaml
kubectl apply -f cert-manager-crd-1.18.2.yaml
```

### 0x05.安装 Cert-Manager

```bash
cd /usr/local/src
helm install cert-manager ./cert-manager-v1.18.2.tgz \
    --namespace cert-manager
```

### 0x06.查看 Pods 状态

```bash
kubectl get pods --namespace cert-manager -o wide
```

:::tip 如果状态不是 Running，在 Pod 上运行 describe，并检查 Events
```bash
kubectl -n cert-manager describe pod
```
:::

## 3.获取 Rancher Chat

https://artifacthub.io/packages/helm/rancher-stable/rancher

### 0x01.添加 Rancher 仓库

```bash
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
helm repo update
```

### 0x02.下载 Rancher Chart

在 rancher-stable 仓库中搜索 rancher Chart 并列出所有历史版本
```bash
helm search repo rancher-stable/rancher --versions
```

:::tip 输出如下内容
```vim
NAME                    CHART VERSION   APP VERSION     DESCRIPTION                                       
rancher-stable/rancher  2.12.1          v2.12.1         Install Rancher Server to manage Kubernetes clu...
rancher-stable/rancher  2.11.3          v2.11.3         Install Rancher Server to manage Kubernetes clu...
rancher-stable/rancher  2.11.2          v2.11.2         Install Rancher Server to manage Kubernetes clu...
rancher-stable/rancher  2.11.1          v2.11.1         Install Rancher Server to manage Kubernetes clu...
......
```
:::

下载 rancher-stable 仓库中的 rancher-2.12.1.tgz 到 /usr/local/src 目录中
```bash
cd /usr/local/src
helm fetch rancher-stable/rancher --version=v2.12.1
```

### 0x03.手动导入Rancher镜像

<a href="/docs/devops/container/rancher/install-rancher-by-helm.html#_0x03-查找-rancher-需要的镜像" target="_blank">查找 Rancher 需要的镜像</a>，<font color="red">预先将镜像导入到各个节点</font>。

::: el-tabs
--- el-tab-item rancher:v2.12.1

下载镜像文件到服务器
```bash
cd /usr/local/src/
docker pull rancher/rancher:v2.12.1
docker save -o /usr/local/src/rancher-image-2.12.1.tar rancher/rancher:v2.12.1
```

导入镜像（k8s.io 是 containerd 默认用来存放 K8S 容器镜像的命名空间）
```bash
ctr -n=k8s.io images import /usr/local/src/rancher-image-2.12.1.tar
```

确认镜像已导入
```bash
crictl images | grep rancher\/rancher
```
---
--- el-tab-item shell:v0.5.0

下载镜像文件到服务器
```bash
cd /usr/local/src/
docker pull rancher/shell:v0.5.0
docker save -o /usr/local/src/rancher-shell-image-0.5.0.tar rancher/shell:v0.5.0
```

导入镜像（k8s.io 是 containerd 默认用来存放 K8S 容器镜像的命名空间）
```bash
ctr -n=k8s.io images import /usr/local/src/rancher-shell-image-0.5.0.tar
```

确认镜像已导入
```bash
crictl images | grep rancher\/shell
```
---
--- el-tab-item webhook:v0.8.1

下载镜像文件到服务器
```bash
cd /usr/local/src/
docker pull rancher/rancher-webhook:v0.8.1
docker save -o /usr/local/src/rancher-webhook-image-0.8.1.tar \
  rancher/rancher-webhook:v0.8.1
```

导入镜像（k8s.io 是 containerd 默认用来存放 K8S 容器镜像的命名空间）
```bash
ctr -n=k8s.io images import /usr/local/src/rancher-webhook-image-0.8.1.tar
```

确认镜像已导入
```bash
crictl images | grep rancher\/rancher-webhook
```
---
--- el-tab-item system-upgrade-controller:v0.16.0

下载镜像文件到服务器
```bash
cd /usr/local/src/
docker pull rancher/system-upgrade-controller:v0.16.0
docker save -o /usr/local/src/rancher-system-upgrade-controller-image-0.16.0.tar \
  rancher/system-upgrade-controller:v0.16.0
```

导入镜像（k8s.io 是 containerd 默认用来存放 K8S 容器镜像的命名空间）
```bash
ctr -n=k8s.io images import /usr/local/src/rancher-system-upgrade-controller-image-0.16.0.tar
```

确认镜像已导入
```bash
crictl images | grep rancher\/system-upgrade-controller
```
---
:::

------------------------------ >>>>>> 此处为分割线 <<<<<< ------------------------------

:::tip 生成Rancher镜像文件
::: el-tabs
--- el-tab-item rancher:v2.12.1
```bash
docker pull rancher/rancher:v2.12.1
docker save -o /usr/local/src/rancher-image-2.12.1.tar rancher/rancher:v2.12.1
```
---
--- el-tab-item shell:v0.5.0
```bash
docker pull rancher/shell:v0.5.0
docker save -o /usr/local/src/rancher-shell-image-0.5.0.tar rancher/shell:v0.5.0
```
---
--- el-tab-item webhook:v0.8.1
```bash
docker pull rancher/rancher-webhook:v0.8.1
docker save -o /usr/local/src/rancher-webhook-image-0.8.1.tar \
  rancher/rancher-webhook:v0.8.1
```
---
--- el-tab-item system-upgrade-controller:v0.16.0
```bash
docker pull rancher/system-upgrade-controller:v0.16.0
docker save -o /usr/local/src/rancher-system-upgrade-controller-image-0.16.0.tar \
  rancher/system-upgrade-controller:v0.16.0
```
---
:::

### 0x04.创建命名空间

前提：<a href="/docs/devops/container/rancher/install-rke2.html#_0x01-kubectl" target="_blank">配置 kubectl</a>

```bash
kubectl create namespace cattle-system
```

### 0x04.安装 Rancher

```bash
helm install rancher /usr/local/src/rancher-2.12.1.tgz \
  --namespace cattle-system \
  --set hostname=rancher.<PROJECT_DOMAIN> \
  --set replicas=2 \
  --set certmanager.version=1.18.2 \
  --set bootstrapPassword='<PASSWORD_FOR_RANCHER_ADMIN>'
```

:::tip 关键参数解释
- hostname：访问 Rancher 的 URL
- replicas：指定 Rancher 部署的副本数，与 Worker 节点数一致
- bootstrapPassword：设置第一个管理员用户 (admin) 的密码
:::

### 0x05.检查 Rancher 运行状态

```bash
kubectl get pods --namespace cattle-system -o wide
```

:::tip 如果状态不是 Running，用如下命令定位问题

查看 cattle-system 命名空间下所有 Pod 的详尽配置和状态信息
```bash
kubectl -n cattle-system describe pod
```

查看某个特定 Pod 的日志
```bash
kubectl logs -n cattle-system <pod-name>
```
:::

### 0x06.使用浏览器访问

- 访问地址：https://rancher.<PROJECT_DOMAIN>
- 默认用户名/密码：admin / <PASSWORD_FOR_RANCHER_ADMIN>。

![](/images/devops/container/rancher.png)

## 附录1.实践

### 0x01.卸载 Cert-Manager

列出现有的 Helm 发布
```bash
helm list --namespace cert-manager
```

[`helm uninstall <RELEASE_NAME> -namespace <NAMESPACE>`](https://helm.sh/zh/docs/helm/helm_uninstall/)
```bash
helm uninstall cert-manager --namespace cert-manager
```

### 0x02.卸载 Rancher

::: el-tabs
--- el-tab-item 方案一
[`helm uninstall <RELEASE_NAME> -namespace <NAMESPACE>`](https://helm.sh/zh/docs/helm/helm_uninstall/)
```bash
helm uninstall rancher --namespace cattle-system
```
如果 helm uninstall 卡住了，可以尝试 `helm uninstall rancher --namespace cattle-system --no-hooks` 跳过钩子，有时钩子脚本会出问题。
---
--- el-tab-item 方案二
列出现有的 Helm 发布
```bash
helm list --namespace cattle-system
```

删除命名空间本身以及其内的所有剩余资源
```bash
kubectl delete namespace cattle-system
```
---
:::

------------------------------ >>>>>> 此处为分割线 <<<<<< ------------------------------

删除无效的 Pod
```bash
kubectl delete pod <pod-name> --namespace cattle-system
```

强制删除状态是 Terminating 的 Pod
```bash
kubectl delete pod <pod-name> --force --grace-period=0 --namespace=cattle-system
```

### 0x03.更新 Rancher

```bash
helm upgrade rancher /usr/local/src/rancher-2.12.1.tgz \
  --namespace cattle-system \
  --set hostname=rancher.<PROJECT_DOMAIN> \
  --set replicas=2 \
  --set certmanager.version=1.18.2 \
  --set bootstrapPassword='<PASSWORD_FOR_RANCHER_ADMIN>' \
  --set fakeValue=$(date +%s)
```

:::tip 关键参数解释
- fakeValue：设置一个每次都会变化的值来强制更新
:::

### 0x03.查找 Rancher 需要的镜像

```bash
helm install rancher /usr/local/src/rancher-2.12.1.tgz \
  --namespace cattle-system \
  --set hostname=rancher.<PROJECT_DOMAIN> \
  --set replicas=2 \
  --set certmanager.version=1.18.2 \
  --set bootstrapPassword='<PASSWORD_FOR_RANCHER_ADMIN>' \
  --dry-run --debug | grep image
```

### 0x04.查看当前已经部署的配置

```bash
helm get values rancher -n cattle-system
```

### 0x05.获取引导密码

```bash
kubectl get secret --namespace cattle-system bootstrap-secret -o \
  go-template='{{.data.bootstrapPassword|base64decode}}{{ "\n" }}'
```

### 0x06.重置Rancher密码

```bash
kubectl exec -it -n cattle-system \
  $(kubectl get pods -n cattle-system -l app=rancher -o \
  jsonpath='{.items[0].metadata.name}') \
  -- reset-password
```

## 附录2.参考资料

- [开始使用 > 快速入门指南 > 部署 Rancher > Helm CLI 快速入门 > 使用 Helm 来安装 Rancher](https://ranchermanager.docs.rancher.com/zh/getting-started/quick-start-guides/deploy-rancher-manager/helm-cli#使用-helm-来安装-rancher)
- [开始使用 > 安装和升级 > 其他安装方式 > 离线 Helm CLI 安装 > 安装 Rancher](https://ranchermanager.docs.rancher.com/zh/getting-started/installation-and-upgrade/other-installation-methods/air-gapped-helm-cli-install/install-rancher-ha)
- [选择 Rancher 版本](https://ranchermanager.docs.rancher.com/zh/getting-started/installation-and-upgrade/resources/choose-a-rancher-version)
- [Rancher Server Kubernetes 集群的问题排查](https://ranchermanager.docs.rancher.com/zh/getting-started/installation-and-upgrade/install-upgrade-on-a-kubernetes-cluster/troubleshooting)
