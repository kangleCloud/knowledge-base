# 基础运维

## 适用场景

面向服务器初始化、系统服务管理、Web 服务、进程托管、镜像仓库与基础存储运维。

## 推荐阅读

- [系统初始化](/docs/devops/base/server-os/initialization.md)
- [防火墙配置](/docs/devops/base/server-os/firewalld.md)
- [Systemd 介绍](/docs/devops/base/server-os/systemd.md)
- [Nginx 安装](/docs/devops/base/nginx/install.md)
- [Squid 正向代理部署](/docs/devops/base/squid/install.md)
- [Supervisor 安装](/docs/devops/base/supervisor/supervisor-install.md)
- [Harbor 安装](/docs/devops/base/harbor/install.md)
- [NFS 安装与维护](/docs/devops/base/nfs/install.md)
- [LVM 基础操作](/docs/devops/base/linux/lvm.md)
- [LVM 动态扩容](/docs/devops/base/linux/lvm-extend.md)

## 子主题清单

- 服务器系统：初始化、防火墙、系统优化、OpenSSL/OpenSSH、Systemd、Alternatives
- Web 服务：Nginx 安装、配置、负载均衡、平滑升级、Lua 模块、PHP-FPM 集成、Squid 正向代理
- 运行时与工具：JDK、Maven、Node.js、Python、Git、Go、Logrotate
- 服务治理与存储：Supervisor、Harbor、Ansible、NFS、LVM 基础操作、LVM 动态扩容

## 代表文档入口

- 初始化与基线：`server-os/initialization.md`、`server-os/optimization.md`
- 服务管理：`server-os/systemd.md`、`supervisor/supervisor-config.md`
- 站点与代理：[Nginx 基础配置](/docs/devops/base/nginx/configuration.md)、[Nginx 负载均衡](/docs/devops/base/nginx/upstream.md)、[Squid 正向代理部署](/docs/devops/base/squid/install.md)
- 存储与仓库：`harbor/install.md`、`nfs/install.md`、`linux/lvm.md`、`linux/lvm-extend.md`

## 注意事项

- 基础运维类文档需要写清适用系统、前置条件、验证命令和回滚方案。
- 运行时安装文档保留在本分类中，但业务应用接入说明应优先归入 `backend/`。
