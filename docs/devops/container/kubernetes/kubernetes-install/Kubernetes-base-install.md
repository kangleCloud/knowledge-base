# Kubernetes 安装

## kubeadmin

- 每台机器准备工作

- 关闭防火墙、selinux 和 swap

```bash
# 关闭防火墙
systemctl stop firewalld
systemctl disable firewalld

# 关闭selinux
# 永久关闭
sed -i 's/enforcing/disabled/' /etc/selinux/config  
# 临时关闭
# setenforce 0  

# 关闭swap
# 永久关闭
sed -ri 's/.*swap.*/#&/' /etc/fstab
# 临时
# swapoff -a 
```

- 设置主机名和 hosts 文件

```bash
# 根据规划设置主机名【master节点上操作】
hostnamectl set-hostname master
# 根据规划设置主机名【node1节点操作】
hostnamectl set-hostname node1
# 根据规划设置主机名【node2节点操作】
hostnamectl set-hostname node2

# 添加hosts
cat >> /etc/hosts << EOF
192.168.6.239 master
192.168.6.158 node1
192.168.6.91  node2
EOF
```

- 配置时间同步

```bash
# 将桥接的IPv4流量传递到iptables的链
vim /etc/sysctl.conf 
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1

# 生效
sysctl -p  

```

::: tip

- 如果出现 net.bridge 参数无法应用
- 如果 net.bridge 参数显示错误，可能是因为你的系统缺少 br_netfilter 模块。
  :::

```bash
# 加载 bridge 模块
modprobe br_netfilter

# 验证模块是否加载
lsmod | grep bridge

# 将其添加到 /etc/modules 文件中，以便在每次系统启动时加载：
echo "br_netfilter" >> /etc/modules
```

## 安装 Docker 或 containerd

- 这里以 containerd 为例进行安装

```bash
# 参考 https://github.com/containerd/containerd/blob/main/docs/getting-started.md
# 配置containerd
containerd config default > /etc/containerd/config.toml

# 注意修改配置文件中的 sandbox_image 可能会与使用的k8s版本不匹配
# sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.10"

# 启动containerd
systemctl enable --now containerd
# 查看状态
systemctl status containerd.service
```

- 基础镜像准备 每台机器

```bash
# 查看本地镜像
crictl images               
```

- 配置containerd 加速器

```bash
  mkdir -p /etc/containerd/certs.d/docker.io
  mkdir -p /etc/containerd/certs.d/registry.k8s.io
  mkdir -p /etc/containerd/certs.d/harbor.example.com
```

## 安装 kubeadm、kubelet 和 kubectl

### 基础镜像准备 每台机器

- 你需要在每台机器上安装以下的软件包：
    - `kubeadm`：用来初始化集群的指令。
    - `kubelet`：在集群中的每个节点上用来启动 Pod 和容器等。
    - `kubectl`：用来与集群通信的命令行工具。

### 安装 kubeadm

#### 配置相关依赖

- 安装依赖包 每台机器

```bash
    yum install -y yum-utils device-mapper-persistent-data lvm2 curl
    
    mkdir -p /etc/yum/keyrings
    # 下载并导入 GPG key
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/rpm/repodata/repomd.xml.key \
    -o /etc/yum/keyrings/kubernetes.gpg
```

- 配置 Kubernetes yum 仓库

```bash
    vim /etc/yum.repos.d/kubernetes.repo
```

```yaml
    # 创建 yum 仓库文件
  [ kubernetes ]
      name=Kubernetes
      baseurl=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/
      enabled=1
      gpgcheck=1
      gpgkey=file:///etc/yum/keyrings/kubernetes.gpg
```

```bash
    # 刷新缓存并安装
     yum clean all
     yum makecache
     yum install -y kubelet kubeadm kubectl
```

#### 初始化Master

```bash
[root@Web-1-239 yum.repos.d]# kubeadm config images list

I1023 13:53:00.626860 2658651 version.go:261] remote version is much newer: v1.34.1; falling back to: stable-1.31
W1023 13:53:04.857168 2658651 version.go:109] could not fetch a Kubernetes version from the internet: unable to get URL "https://dl.k8s.io/release/stable-1.31.txt": Get "https://cdn.dl.k8s.io/release/stable-1.31.txt": Service Unavailable
W1023 13:53:04.857218 2658651 version.go:110] falling back to the local client version: v1.31.5
registry.k8s.io/kube-apiserver:v1.31.5
registry.k8s.io/kube-controller-manager:v1.31.5
registry.k8s.io/kube-scheduler:v1.31.5
registry.k8s.io/kube-proxy:v1.31.5
registry.k8s.io/coredns/coredns:v1.12.0
registry.k8s.io/pause:3.10
registry.k8s.io/etcd:3.5.21-0
```

- 创建 kubeadm 配置文件 初始化 Master 节点上执行

```bash
cd /usr/local/src/k8s/
touch kubeadm-config.yaml
kubeadm config print init-defaults > kubeadm-config.yaml

# 设置开机启动systemctl enable kubelet
systemctl enable kubelet

# 预拉取镜像 根据你本地上面创建的kubeadm-config.yaml文件，进入这个文件所在路径执行下面
kubeadm config images pull --config=kubeadm-config.yaml

# 初始化master，找到你本地上面创建的kubeadm-config.yaml文件，进入这个文件所在路径执行下面
kubeadm init --config=kubeadm-config.yaml

# 也可以根据kubeadm-config.yaml文件定义内容来输出你配置的镜像仓库
kubeadm config images list --config=kubeadm-config.yaml
```

- 如果初始化过程中提示失败

```bash

# 1. 停止 kubelet
systemctl stop kubelet

# 2. 重置旧集群
kubeadm reset -f

# 3. 清理残留清单
rm -rf /etc/kubernetes/manifests/*

# 4. 确保端口 10250 空闲
lsof -i:10250  # 确认无占用

# 5. 设置 NO_PROXY
export NO_PROXY=192.168.6.239,10.96.0.0/12,127.0.0.1,localhost

# 6. 重新初始化
kubeadm init --config=kubeadm-config.yaml
```

- 配置 kubectl 使用权限 在 Master 节点上执行

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=/etc/kubernetes/admin.conf
```

#### 加入 Node 节点

- 在 Node 节点上执行 kubeadm join 命令

```bash
kubeadm join
# 这个是你执行kubeadm init --config=kubeadm-config.yaml具体输出的
kubeadm join <CONTROL_PLANE_IP>:6443 --token <TOKEN> \
	--discovery-token-ca-cert-hash sha256:26454712fa078251fe8660de9a9ceec80d195ec9242b0aaadce966eec7022ff4 
```

### 安装 Calico 网络插件

```bash
wget https://raw.githubusercontent.com/projectcalico/calico/v3.26.0/manifests/calico.yaml

kubectl apply -f calico.yaml

# kubectl delete -f calico.yaml

kubectl get pods -n kube-system -o wide
```

## NFS制备器

### 在 对象存储的服务器上安装 NFS 服务

### Kubernetes 中使用 NFS
```bash
yum install -y nfs-utils
systemctl enable --now nfs-server
```
- *配置 StorageClass*

- 使用 Helm 安装 `nfs-subdir-external-provisioner`，这是一个支持动态分配的 NFS 存储插件：
```bash
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm repo update
helm install nfs-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
 --set nfs.server=<NFS_SERVER_IP> \
 --set nfs.path=/data/nfs-k8s \
 --set storageClass.name=nfs-sc \
 --namespace kube-system 
```

- *创建 PVC 和 Pod*
- pvc.yaml 文件
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: test-nfs-pvc
spec:
 accessModes:
   - ReadWriteMany
 resources:
   requests:
     storage: 1Gi
 storageClassName: nfs-sc
```

- pod.yaml 文件
```yaml
apiVersion: v1
kind: Pod
metadata:
 name: test-nfs-pod
spec:
 containers:
   - name: nginx-container
     image: nginx
     volumeMounts:
       - mountPath: "/usr/share/nginx/html"
         name: nfs-volume
 volumes:
   - name: nfs-volume
     persistentVolumeClaim:
       claimName: test-nfs-pvc
```

- 应用 PVC 和 Pod 配置
```bash
kubectl apply -f pvc.yaml
kubectl apply -f pod.yaml
```

- 验证 Pod 是否成功挂载 NFS 存储
- 在 NFS 服务器的 `/data/nfs-k8s` 路径下创建文件。
```bash
# 登录到 Pod 内部，查看挂载是否成功
kubectl exec -it test-nfs-pod -- ls /usr/share/nginx/html
```

## 安装 Helm

## 安装 Harbor 私有镜像仓库
