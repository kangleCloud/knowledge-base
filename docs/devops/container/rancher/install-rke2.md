# 脚本安装RKE2

Github Releases: https://github.com/rancher/rke2/releases

为规避 Rancher 的 RKE2 对欧拉（openEuler）及麒麟（Kylin）系统缺乏官方支持所带来的不确定性，统一采用离线方式部署RKE2。

截止2025年8月30日，RKE2 的 v1.33.X 最新稳定版为 v1.33.4。

:::tip
- 所有源码包下载到 /usr/local/src 中
- 通过操作系统的原生包管理工具来统一管理 RKE2 的安装部署及后续升级维护。
- RKE2 发行说明（包含其集成的各开源软件的版本信息）:
  - v1.33.X - https://docs.rke2.io/release-notes/v1.33.X
  - v1.32.X - https://docs.rke2.io/release-notes/v1.32.X
  - v1.31.X - https://docs.rke2.io/release-notes/v1.31.X
:::

## 1.环境要求

### 0x01.先决条件

准备三台主机，并按照团队统一的 K8S 服务器命名规范配置主机名。

### 0x02.硬件

- RAM：最低 4 GB（建议至少 8 GB）
- CPU：最少 2 CPU（建议至少 4 CPU）

:::tip
[RKE2 的性能取决于数据库的性能。由于 RKE2 嵌入式运行 etcd 并将数据目录存储在磁盘上，建议尽可能使用 SSD 以确保最佳性能。](https://docs.rke2.io/install/requirements#hardware)
:::

## 2.Server节点安装

```bash
mkdir /usr/local/src/rke2-artifacts-1.33.4 \
    && cd /usr/local/src/rke2-artifacts-1.33.4
```

### 0x01.下载相关资源

```bash
wget https://github.com/rancher/rke2/releases/download/v1.33.4%2Brke2r1/rke2-images.linux-amd64.tar.zst
wget https://github.com/rancher/rke2/releases/download/v1.33.4%2Brke2r1/rke2.linux-amd64.tar.gz
wget https://github.com/rancher/rke2/releases/download/v1.33.4%2Brke2r1/sha256sum-amd64.txt
```

```bash
curl -sfL https://get.rke2.io --output install.sh
chmod +x install.sh
```

### 0x02.安装rke2-server

```bash
INSTALL_RKE2_ARTIFACT_PATH=/usr/local/src/rke2-artifacts-1.33.4 \
INSTALL_RKE2_TAR_PREFIX=/usr/local/rke2-server-1.33 \
sh install.sh
```

### 0x03.添加环境变量

```bash
echo 'export PATH=$PATH:/usr/local/rke2-server-1.33/bin' >> /etc/profile
source /etc/profile
```

### 0x04.启动rke2-server服务

```bash
systemctl start rke2-server.service
```

:::tip 如有需要，可以查看日志
```bash
journalctl -u rke2-server -f
```
:::

查看 rke2-server 状态
```bash
systemctl status rke2-server.service
```

设置开机自启
```bash
systemctl enable rke2-server.service
```

## 3.Agent（Worker）节点安装

```bash
mkdir /usr/local/src/rke2-artifacts-1.33.4 \
    && cd /usr/local/src/rke2-artifacts-1.33.4
```

### 0x01.下载相关资源

```bash
wget https://github.com/rancher/rke2/releases/download/v1.33.4%2Brke2r1/rke2-images.linux-amd64.tar.zst
wget https://github.com/rancher/rke2/releases/download/v1.33.4%2Brke2r1/rke2.linux-amd64.tar.gz
wget https://github.com/rancher/rke2/releases/download/v1.33.4%2Brke2r1/sha256sum-amd64.txt
```

:::tip
也可以使用`scp [用户名@地址]:[文件名] [本地目录]`命令，将远端服务器上的文件下载到本地。
:::

```bash
curl -sfL https://get.rke2.io --output install.sh
chmod +x install.sh
```

### 0x02.安装rek2-agent

```bash
INSTALL_RKE2_ARTIFACT_PATH=/usr/local/src/rke2-artifacts-1.33.4 \
INSTALL_RKE2_TAR_PREFIX=/usr/local/rke2-agent-1.33 \
INSTALL_RKE2_TYPE=agent \
sh install.sh
```

### 0x03.添加环境变量

```bash
echo 'export PATH=$PATH:/usr/local/rke2-agent-1.33/bin' >> /etc/profile
source /etc/profile
```

### 0x04.配置rke2-agent服务

创建配置文件所在目录
```bash
mkdir -p /etc/rancher/rke2
```

<font color="red">在 RKE2 Server 节点上获取 token</font>
```bash
cat /var/lib/rancher/rke2/server/node-token
```
:::tip 输出如下示例
K10ceb1cd6b70fd97510dbfd0308c86d2b0e933e7efa0e3170a9e016940fb3c288c::server:9de34bdf9122a17ec17dd039fd29ed2c
:::

新建配置文件
```bash
vim /etc/rancher/rke2/config.yaml
```

写入以下内容：
```yaml
server: https://<server>:9345
token: <token from server node>
```

### 0x05.启动rke2-agent服务

```bash
systemctl start rke2-agent.service
```

:::tip 如有需要，可以查看日志
```bash
journalctl -u rke2-agent -f
```
:::

查看 rke2-agent 状态
```bash
systemctl status rke2-agent.service
```

设置开机自启
```bash
systemctl enable rke2-agent.service
```

## 4.配置RKE2附带的CLI工具

在 Master 和所有的 Worker 节点上配置。

### 0x01.kubectl

[Kubernetes 提供 kubectl 是使用 Kubernetes API 与 Kubernetes 集群的控制面进行通信的命令行工具。](https://kubernetes.io/zh-cn/docs/reference/kubectl/)

```bash
echo 'export KUBECONFIG=/etc/rancher/rke2/rke2.yaml' >> /etc/profile
echo 'export PATH=$PATH:/var/lib/rancher/rke2/bin' >> /etc/profile
source /etc/profile
```

:::warning 在 RKE2 Agent (K8S Worker) 节点上配置 rke2.yaml
```bash
scp root@<RKE2_SERVER_IP>:/etc/rancher/rke2/rke2.yaml /etc/rancher/rke2
```
:::

### 0x02.ctr

[虽然 ctr 工具与 containerd 是捆绑在一起的，但需要指出的是，ctr 工具仅用于对 containerd 进行调试。](https://github.com/containerd/containerd/blob/main/docs/getting-started.md#interacting-with-containerd-via-cli)

```bash
echo 'export CONTAINERD_ADDRESS=/run/k3s/containerd/containerd.sock' >> /etc/profile
source /etc/profile
```

### 0x03.crictl

[crictl 是 CRI 兼容的容器运行时命令行接口。 你可以使用它来检查和调试 Kubernetes 节点上的容器运行时和应用程序。](https://kubernetes.io/zh-cn/docs/tasks/debug/debug-cluster/crictl/)

```bash
tee /etc/crictl.yaml << 'EOF'
runtime-endpoint: unix:///run/k3s/containerd/containerd.sock
image-endpoint: unix:///run/k3s/containerd/containerd.sock
timeout: 10
debug: false
EOF
```

:::tip Containerd 内部 k8s.io 命名空间下的镜像说明（执行命令：`crictl images`）

RKE2-Server安装完成后，镜像如下：
```vim
IMAGE                                                           TAG                                      
docker.io/rancher/hardened-addon-resizer                        1.8.23-build20250612
docker.io/rancher/hardened-calico                               v3.30.2-build20250731                                 
docker.io/rancher/hardened-cluster-autoscaler                   v1.10.2-build20250611                                 
docker.io/rancher/hardened-coredns                              v1.12.3-build20250806                                 
docker.io/rancher/hardened-dns-node-cache                       1.26.0-build20250611                                  
docker.io/rancher/hardened-etcd                                 v3.5.21-k3s1-build20250612                            
docker.io/rancher/hardened-flannel                              v0.27.2-build20250723                                 
docker.io/rancher/hardened-k8s-metrics-server                   v0.8.0-build20250704                                  
docker.io/rancher/hardened-kubernetes                           v1.33.4-rke2r1-build20250814                          
docker.io/rancher/klipper-helm                                  v0.9.8-build20250709                                  
docker.io/rancher/klipper-lb                                    v0.4.13                                               
docker.io/rancher/mirrored-ingress-nginx-kube-webhook-certgen   v1.6.0                                                
docker.io/rancher/mirrored-pause                                3.6                                                   
docker.io/rancher/mirrored-sig-storage-snapshot-controller      v8.2.0                                                
docker.io/rancher/nginx-ingress-controller                      v1.12.4-hardened7                                     
docker.io/rancher/rke2-cloud-provider                           v1.33.1-0.20250516163953-99d91538b132-build20250612
docker.io/rancher/rke2-runtime                                  v1.33.4-rke2r1
```

RKE2-Agent安装完成后，Containerd 内部 k8s.io 命名空间下的镜像为空。
:::

## 5.配置HTTP代理

在 systemd 服务的环境文件中添加必要的 HTTP_PROXY、HTTPS_PROXY 和 NO_PROXY 变量。

::: tabs
=== RKE2-Server
```bash
vim /etc/default/rke2-server
```
---
=== RKE2-Agent
```bash
vim /etc/default/rke2-agent
```
----
:::

配置 containerd 的代理设置
```vim
CONTAINERD_HTTP_PROXY=http://<ip>:7890
CONTAINERD_HTTPS_PROXY=http://<ip>:7890
CONTAINERD_NO_PROXY=127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local
```

https://docs.rancher.cn/docs/rke2/advanced/#配置一个-http-代理

## 附录1.RKE2实践

### 0x01.查看版本号

```bash
rke2 -v
```

:::tip 输出如下内容
```vim
rke2 version v1.33.4+rke2r1 (5391922d12c380f3db393e2fc6e42d7f30939617) 
go version go1.24.5 X:boringcrypto
```
:::

[通过查阅 RKE2 的发行说明，可获取其集成的各开源软件的版本信息。](https://docs.rke2.io/release-notes/v1.33.X)

### 0x02.卸载RKE2

关闭服务
::: tabs
=== RKE2-Agent
```bash
systemctl disable rke2-agent.service
systemctl stop rke2-agent.service
```
---
=== RKE2-Server
```bash
systemctl disable rke2-server.service
systemctl stop rke2-server.service
```
----
:::

执行卸载脚本
::: tabs
=== RKE2-Agent
```bash
/usr/local/rke2-agent-1.33/bin/rke2-uninstall.sh
```
---
=== RKE2-Server
```bash
/usr/local/rke2-server-1.33/bin/rke2-uninstall.sh
```
---
:::

删除安装目录
::: tabs
=== RKE2-Agent
```bash
rm -rf /usr/local/rke2-agent-1.33
rm -rf /etc/rancher
rm -rf /run/k3s
rm -rf /run/containerd
rm -rf /var/run/calico
```
---
=== RKE2-Server
```bash
rm -rf /usr/local/rke2-server-1.33
rm -rf /etc/rancher
rm -rf /run/k3s
rm -rf /run/containerd
rm -rf /var/run/calico
```
---
:::

### 0x03.重新注册Agent节点

停止服务
```bash
sudo systemctl stop rke2-agent
```

清理节点数据
```bash
sudo rm -rf /var/lib/rancher/rke2/agent/
sudo rm -rf /etc/rancher/node/
```

重新创建密码文件（确保与Server节点上的密码一致）
```bash
sudo mkdir -p /etc/rancher/node/
echo "Server节点密码" | sudo tee /etc/rancher/node/password
```

重新启动服务
```bash
sudo systemctl start rke2-agent
```

## 附录2.参考资料

- https://docs.rancher.cn/docs/rke2/install/requirements
- https://docs.rancher.cn/docs/rke2/install/airgap#rke2-installsh-脚本安装
- https://docs.rancher.cn/docs/rke2/install/quickstart
- https://docs.rancher.cn/docs/rke2/reference/cli_tools
- https://documentation.suse.com/cloudnative/rke2/latest/zh/install/requirements.html
- https://documentation.suse.com/cloudnative/rke2/latest/zh/install/airgap.html#_rke2_install_sh_script_install
- https://documentation.suse.com/cloudnative/rke2/latest/zh/install/quickstart.html
- https://documentation.suse.com/cloudnative/rke2/latest/zh/reference/cli_tools.html
