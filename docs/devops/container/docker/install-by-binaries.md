# 从二进制文件安装Docker

https://docs.docker.com/engine/release-notes

由于 Docker 官方未提供对欧拉（openEuler）及麒麟（Kylin）操作系统的直接支持，约定采用二进制文件安装方式。

截止2025年8月17日，Docker 28.3.* 系列最新稳定版为 28.3.3。<font color="red"><b>[每次安装需到官网查看 Docker 28.3 系列的最新版。](https://download.docker.com/linux/static/stable/x86_64/)</b></font>

:::tip
- 所有源码包下载到 /usr/local/src 中
- 通过操作系统的原生包管理工具来统一管理 Docker 的安装部署及后续升级维护。
:::

## 1.先决条件

- A 64-bit installation
- Version 3.10 or higher of the Linux kernel. The latest version of the kernel available for your platform is recommended.
- iptables version 1.4 or higher
- git version 1.7 or higher
- A ps executable, usually provided by procps or a similar package.
- [XZ Utils](https://tukaani.org/xz/) 4.9 or higher

https://docs.docker.com/engine/install/binaries/#prerequisites

## 2.安装静态二进制文件

### 0x01.下载并解压

```bash
cd /usr/local/src
wget https://download.docker.com/linux/static/stable/x86_64/docker-28.3.3.tgz
tar -zxvf docker-28.3.3.tgz
```

### 0x02.移动到可执行目录

关闭可能存在的docker服务
```bash
systemctl stop docker

```

复制
```bash
\cp docker/* /usr/bin/
```

## 3.创建配置文件

```bash
mkdir -p /etc/docker
```

```bash
vim /etc/docker/daemon.json
```

添加以下内容
::: tabs
=== 非办公局域网
```json
{
  "registry-mirrors": [
    "https://docker.actima.top",
    "https://docker.m.daocloud.io",
    "https://docker.aityp.com",
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ],
  "data-root": "/data/docker",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "1G",
    "max-file": "3"
  }
}
```
---
=== 办公局域网
```json
{
  "registry-mirrors": [
    "http://10.1.0.149:5000",
    "https://docker.actima.top",
    "https://docker.m.daocloud.io",
    "https://docker.aityp.com",
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ],
  "data-root": "/data/docker",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "1G",
    "max-file": "3"
  }
}
```
---
:::

:::tip 关键参数解释
- registry-mirrors - 镜像拉取加速器
- data-root - 数据存储路径（默认值：/var/lib/docker）
- log-driver - 日志的存储方式（默认值：json-file）
- log-opts.max-size - 单个日志文件的最大大小
- log-opts.max-file - 保留的日志文件数量
:::

## 4.使用Systemd管理进程

### 0x01.编辑service文件

```bash
vim /etc/systemd/system/docker.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.servicea
Wants=network-online.target
[Service]
Type=notify
# the default is not to use systemd for cgroups because the delegate issues still
# exists and systemd currently does not support the cgroup feature set required
# for containers run by docker
ExecStart=/usr/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
# Uncomment TasksMax if your systemd version supports it.
# Only systemd 226 and above support this version.
#TasksMax=infinity
TimeoutStartSec=0
# set delegate yes so that systemd does not reset the cgroups of docker containers
Delegate=yes
# kill only the docker process, not all processes in the cgroup
KillMode=process
# restart the docker process if it exits prematurely
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s
[Install]
WantedBy=multi-user.target
```

### 0x02.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x03.启动并设置开机自启

```bash
systemctl enable docker --now
```

:::tip systemd
```bash
systemctl status docker  #查看服务
systemctl start docker   #启动服务
systemctl stop docker    #停止服务
systemctl restart docker #重启服务
systemctl enable docker  #开启开机自启服务
systemctl disable docker #关闭开机自启服务
```
:::

## 5.常用命令

https://www.runoob.com/docker/docker-command-manual.html

### 0x01.查看版本号

```bash
docker version
```

### 0x02.拉取镜像

```bash
docker pull <镜像名称>
```

### 0x03.生成镜像文件

以 rancher2.12.1 为例
```bash
docker pull rancher/rancher:v2.12.1
docker save -o /usr/local/src/rancher-image-1.21.1.tar rancher/rancher:v2.12.1
```

### 0x04.删除本地镜像

```bash
docker rmi  <镜像名称>
```

## 附件1.参考资料

- https://docs.docker.com/engine/install/binaries/
