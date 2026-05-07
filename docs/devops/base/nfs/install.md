# Linux系统NFS服务安装、配置与挂载

## 一、NFS服务概述

NFS（Network File System）是UNIX/Linux系统实现跨主机文件共享的核心协议，具备以下特性：

支持异构系统共享（Linux/Unix间）
提供POSIX兼容文件操作语义
采用RPC机制实现透明访问
支持TCP/UDP传输（推荐TCP）
适用场景：K8S持久化存储、容器共享卷、开发环境代码同步、集群日志收集等。

------

## 二、多平台环境准备

```bash
# 通用准备步骤（所有发行版）
sudo systemctl stop firewalld && sudo systemctl disable firewalld  # 测试环境关闭防火墙
sudo setenforce 0  # 临时关闭SELinux
sudo sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config  # 永久关闭
```

------

## 三、服务端配置

### 1. 软件安装

```bash
# CentOS/RHEL/麒麟KYLIN（yum系）
sudo yum install -y nfs-utils rpcbind

# Ubuntu/Debian/统信UOS（apt系）
sudo apt update && sudo apt install -y nfs-kernel-server rpcbind
```

### 2. 共享目录配置

```bash
sudo mkdir -p /data/nfs_shared
sudo chmod 1777 /data/nfs_shared  # Sticky bit防文件误删
```

### 3. 访问控制配置（/etc/exoprts）

```bash
# 生产环境推荐配置：
/data/nfs_shared 192.210.19.56(rw,no_root_squash,no_all_squash,sync,no_subtree_check)
```

> [!NOTE]
>
> 这行代码的意思是把共享目录 / data/share / 共享给 192.210.19.56 这个客户端 ip，后面括号里的内容是权限参数，其中：
>
> rw 表示设置目录可读写。
>
> sync 表示数据会同步写入到内存和硬盘中，相反 rsync 表示数据会先暂存于内存中，而非直接写入到硬盘中。
>
> no_root_squash NFS 客户端连接服务端时如果使用的是 root 的话，那么对服务端分享的目录来说，也拥有 root 权限。
>
> no_all_squash 不论 NFS 客户端连接服务端时使用什么用户，对服务端分享的目录来说都不会拥有匿名用户权限。
>
> 如果有多个共享目录配置，则使用多行，一行一个配置。



### 4. 服务管理

```bash
# 所有发行版通用命令：
sudo exportfs -arv  # 动态重载配置
sudo systemctl enable --now rpcbind nfs-server  # 启动并设置自启
showmount -e localhost # 验证查看服务端 (本机) 是否可连接：
```

### 5. 防火墙策略（生产环境必须）

```bash
vim /etc/sysconfig/nfs

RQUOTAD_PORT=1001
LOCKD_TCPPORT=30001
LOCKD_UDPPORT=30002
MOUNTD_PORT=1002
```

```bash
firewall-cmd --zone=public --add-port=111/tcp --add-port=111/udp --add-port=2049/tcp --add-port=2049/udp --add-port=1001/tcp --add-port=1001/udp --add-port=1002/tcp --add-port=1002/udp --add-port=30001/tcp --add-port=30002/udp --permanent
firewall-cmd --reload
```



------

## 四、客户端配置

### 1. 基础安装

```bash
# yum系客户端：
sudo yum install -y nfs-utils

# apt系客户端：
sudo apt install -y nfs-common

# 查看是否可以连接服务器挂载
showmount -e 192.210.19.205
```

### 2. 手动挂载

```bash
mkdir -p /data/resource
sudo mount -t nfs 192.210.19.205:/data/share /nfs -o nolock,nfsvers=3,vers=3
```

> [!TIP]
>
> 如果不加 -o nolock,nfsvers=3 则在挂载目录下的文件属主和组都是 nobody，如果指定 nfsvers=3 则显示 root。

```bash
# 解除挂载
umount /nfs
```



### 3. 自动挂载（/etc/fstab）

```bash
vim /etc/rc.d/rc.local
#在文件最后添加一行：
mount -t nfs 192.168.11.34:/nfs /mnt/share/ -o nolock,nfsvers=3,vers=3
```

>[!TIP]
>
>如果按本文上面的部分配置好，NFS 即部署好了，但是如果你重启客户端系统，发现不能随机器一起挂载，需要再次手动操作挂载，这样操作比较麻烦，因此我们需要设置开机自动挂载。我们不要把挂载项写到 / etc/fstab 文件中，因为开机时先挂载本机磁盘再启动网络，而 NFS 是需要网络启动后才能挂载的，所以我们把挂载命令写入到 / etc/rc.d/rc.local 文件中即可.

### 4.测试验证

```bash
df -Th

文件系统    容量 已用 可用 已用% 挂载点
/dev/mapper/centos-root   18G 5.0G 13G 29% /
devtmpfs      904M  0 904M 0% /dev
tmpfs       916M  0 916M 0% /dev/shm
tmpfs       916M 9.3M 906M 2% /run
tmpfs       916M  0 916M 0% /sys/fs/cgroup
/dev/sda1      497M 164M 334M 33% /boot
tmpfs       184M  0 184M 0% /run/user/0
192.168.11.31:/data/share  18G 1.7G 16G 10% /mnt/share

```



------

## 五、国产系统特别注意事项

### 1. 麒麟KYLIN（银河麒麟）

- 基于CentOS/Fedora，使用yum管理
- 需启用兼容仓库：

```bash
sudo yum-config-manager --enable kylin-desktop
```

### 2. 统信UOS

- 基于Debian，使用apt管理
- 需配置官方源：

```bash
sudo sed -i 's#http://packages#https://pro.uniontech.com#g' /etc/apt/sources.list
```

### 六、高级调试与优化

### 1. 性能调优参数

```bash
# 服务端优化（/etc/nfs.conf）
[nfsd]
threads=16  # 工作线程数=CPU核心数*2

# 客户端优化（挂载参数）
bg,rsize=1048576,wsize=1048576,actimeo=60
```

### 2. 安全增强

```bash
# 启用Kerberos认证（服务端）：
sec=krb5p:krb5i:krb5

# 客户端挂载：
sudo mount -t nfs4 -o sec=krb5p server:/export /mnt
```

------

## 七、典型故障案例库

### 案例

#### **案例1：挂载时报错"NFS Server not responding"**

```bash
# 排查步骤：
1. ping服务器IP（检查网络连通性）
2. rpcinfo -p 192.168.1.100（确认RPC服务状态）
3. tcpdump -i eth0 port 2049（抓包分析）
4. 检查服务端/var/log/messages日志

# 解决方案：
- 调整timeo参数：mount -o timeo=150 ...
- 检查服务端nfsd线程：ps aux | grep nfsd
```

#### 案例2：客户端写入文件属主变为nobody

```bash
# 原因分析：
服务端exports未正确配置anonuid

# 修复步骤：
1. 服务端创建统一用户：
   sudo groupadd -g 2000 nfsusers
   sudo useradd -u 2000 -g 2000 nfsuser
2. 修改/etc/exports：
   /data/nfs_shared *(rw,sync,all_squash,anonuid=2000,anongid=2000)
3. sudo exportfs -arv
```

#### 案例3：卸载时出现"device is busy"

```bash
# 强制卸载方法：
sudo umount -lf /mnt/nfs

# 查找占用进程：
sudo lsof +D /mnt/nfs
sudo fuser -vm /mnt/nfs
```

#### 案例4：传输速度异常缓慢

```bash
# 优化方案：
1. 确认使用TCP协议：mount -o proto=tcp ...
2. 调整读写块大小：rsize=1048576,wsize=1048576
3. 关闭访问时间记录：noatime,nodiratime
4. 服务端启用jumbo frames（需网络设备支持）
```

------

## 八、监控与维护

### 1. 实时监控命令

```bash
# I/O统计：
nfsiostat 2  # 每2秒刷新

# 连接状态：
netstat -tulpn | grep -E "2049|111"

# RPC调试：
rpcinfo -p 192.168.1.100
```

### 2. 日志分析要点

```bash
# 服务端关键日志路径：
/var/log/messages（CentOS/麒麟）
/var/log/syslog（Ubuntu/统信）

# 常见日志关键词：
- "RETURNING ERRNO 13" → 权限问题
- "NFSD: starting 10-second grace period" → 服务重启
- "failed to register" → RPC注册失败
```

------

## 九、灾备方案设计

### 1. 高可用架构

```bash
# 方案1：DRBD+NFS
主备节点通过DRBD同步数据，VIP漂移实现故障转移

# 方案2：GlusterFS分布式存储
构建复制卷，消除单点故障

# 方案3：NFS-Ganesha
支持多活集群的NFS服务器实现
```

### 2. 数据一致性保障

```bash
1. 强制同步写入：mount -o sync
2. 启用文件锁机制：rpc.lockd
3. 定期快照：LVM/ZFS快照
```

------

## 十、安全加固清单

1. 禁止使用NFSv3及以下版本
2. 限定exports访问范围（IP/CIDR）
3. 定期审计exports权限配置
4. 启用TLS加密（通过stunnel或nfs-over-tls）
5. 配置IDS规则检测异常访问
6. 使用MAC策略（SELinux/apparmor）