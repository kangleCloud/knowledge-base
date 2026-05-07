# NFS服务的搭建与配置

NFS（Network File System）的核心功能是通过网络连接，使不同客户端能够访问共享的文件系统，从而实现文件资源共享。

https://sourceforge.net/projects/nfs/

:::tip yum安装的版本说明
- CentOS Linux release 7.9.2009 (Core) - nfs-utils-1.3.0
- openEuler release 22.03 (LTS-SP3) -  nfs-utils-2.5.4
- openEuler release 24.03 (LTS-SP1) - nfs-utils-2.6.3
- Kylin Linux Advanced Server release V10 (Halberd) - nfs-utils-2.5.1
:::

## 1.安装NFS服务

### 0x01.yum install

```bash
yum install nfs-utils
```

### 0x02.查看版本

```bash
rpm -qi nfs-utils | grep Version
```

:::tip openEuler2203输出如下信息
Version     : 2.5.4
:::

### 0x03.启动服务

```bash
systemctl enable nfs-server --now
```

## 2.服务端配置

### 0x01.创建共享目录

```bash
mkdir -p /data/storage/shared
chmod 777 -R /data/storage/shared
```

### 0x02.NFS共享配置

```bash
cat > /etc/exports << EOF
/data/storage/shared 192.168.33.0/24(rw,no_subtree_check,no_all_squash,sync)
EOF
```

:::tip
192.168.33.0 是网络地址
:::

### 0x03.重新加载配置

```bash
exportfs -arv
```

## 3.客服端挂载测试

### 0x01.服务端重载NFS

```bash
systemctl reload nfs-server
```

### 0x02.创建挂载目录

```bash
mkdir -p /data/storage/nfs
```

### 0x03.挂载目录

```bash
mount -t nfs <NFS Server IP>:/data/storage/shared /data/storage/nfs
```

### 0x04.查看挂载

```bash
df -Th
```

:::tip 输出如下内容
192.168.33.20:/data/storage/shared nfs4       49G  4.8G   45G  10% /data/storage/nfs
:::

### 0x05.设置重启自动挂载

```bash
cat << EOF | sudo tee -a /etc/fstab
<NFS Server IP>:/data/storage/shared /data/storage/nfs nfs defaults 0 0
EOF
```

## 附录1

### 0x01.卸载目录

```bash
umount -lf /data/storage/nfs
```

### 0x02.参考资料

- https://www.cnblogs.com/huaxiayuyi/p/16922116.html



