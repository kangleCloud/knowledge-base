# Squid 正向代理服务器搭建

> 本文档适用于在 Linux 服务器上通过系统包方式部署 Squid 正向代理服务，支持 `HTTP` 与 `HTTPS CONNECT` 代理。
>
> 说明：本文档不涉及透明代理、反向代理或 `SSL Bump`；生产环境默认采用“白名单放行 + 默认拒绝”的安全配置思路。

## 一、部署规划

### 1.1 架构说明

单台服务器部署一个 Squid 实例：

- 服务名称：`squid`
- 监听端口：`3128`
- 配置文件：`/etc/squid/squid.conf`
- 白名单文件：`/etc/squid/conf.d/allow_ip`
- 可选认证文件：`/etc/squid/passwd/htpasswd`
- 现场已有说明文件：`/etc/squid/conf.d/hosts`（本方案默认不使用）

示例规划如下：

| 项目 | 示例值 | 说明 |
|---|---|---|
| 主机名 | squid-proxy-01 | Squid 代理服务器主机名 |
| 服务器 IP | 192.168.10.20 | Squid 所在服务器 IP |
| 代理端口 | 3128 | 客户端连接端口 |
| 白名单文件 | /etc/squid/conf.d/allow_ip | 一行一个 `IP` 或 `CIDR` |
| 现场已有文件 | /etc/squid/conf.d/hosts | 当前仅说明存在，不纳入本方案主线 |
| 日志目录 | /var/log/squid | 访问日志、缓存日志目录 |
| 缓存目录 | /var/spool/squid | Squid 缓存目录 |

> 实际部署时请将示例 IP、主机名和路径按生产环境实际情况替换。

### 1.2 系统要求

支持以下常见发行版：

- `CentOS 7/8`
- `RHEL 7/8/9`
- `Rocky Linux / AlmaLinux`
- `Ubuntu 18.04+`
- `Debian 10+`

建议最低资源：

- `1 vCPU`
- `1 GB RAM`
- `10 GB` 可用磁盘空间

### 1.3 安全原则

生产环境建议遵循以下原则：

- 默认拒绝所有来源访问
- 仅放行白名单中的客户端 `IP` 或网段
- 优先使用 `/etc/squid/conf.d/allow_ip` 管理来源地址，不在 `squid.conf` 中堆叠多条 `acl src`
- 如需进一步增强安全性，可叠加用户名密码认证
- 仅向可信网络开放 `3128` 端口，不建议对公网完全开放

### 1.4 端口放行

需要放行以下端口：

| 端口 | 协议 | 用途 |
|---:|---|---|
| 3128 | TCP | Squid 正向代理服务端口 |

建议仅允许业务服务器、办公出口地址或指定内网网段访问该端口。

## 二、环境准备

以下操作在 Squid 服务器上执行。

### 2.1 设置主机名解析

建议先确认主机名已正确设置，避免 `visible_hostname` 与系统识别不一致。

```bash
hostnamectl set-hostname squid-proxy-01
hostnamectl
```

如有需要，可补充系统 `/etc/hosts`：

```bash
vim /etc/hosts
```

追加示例：

```text
192.168.10.20 squid-proxy-01
```

### 2.2 检查时间同步

代理服务器建议保持时间同步，便于日志排障和审计。

```bash
timedatectl
```

如未启用时间同步，可按发行版实际情况启用 `chronyd` 或 `systemd-timesyncd`。

### 2.3 确认防火墙和安全组策略

部署前请确认：

- 操作系统防火墙允许 `3128/TCP`
- 云服务器安全组允许可信来源访问 `3128/TCP`
- 上游网络未阻断服务器对外访问 `80/443`

如需统一维护防火墙规则，可参照 [防火墙配置](/docs/devops/base/server-os/firewalld.md)。

## 三、安装 Squid

以下操作在 Squid 服务器上执行。

### 3.1 CentOS / RHEL / Rocky / AlmaLinux 安装

```bash
yum update -y
yum install squid -y
```

如果系统使用 `dnf`，也可执行：

```bash
dnf install squid -y
```

### 3.2 Ubuntu / Debian 安装

```bash
apt update -y
apt install squid -y
```

### 3.3 验证安装结果

```bash
squid -v
rpm -qa | grep squid
dpkg -l | grep squid
```

> `rpm` 与 `dpkg` 二选一执行即可，按实际发行版选择。

### 3.4 备份原始配置文件

```bash
cp /etc/squid/squid.conf /etc/squid/squid.conf.backup
```

### 3.5 创建白名单和认证目录

```bash
mkdir -p /etc/squid/conf.d
mkdir -p /etc/squid/passwd
touch /etc/squid/conf.d/allow_ip
```

设置权限：

```bash
chown root:root /etc/squid/conf.d/allow_ip
chmod 600 /etc/squid/conf.d/allow_ip
chmod 755 /etc/squid/passwd
```

说明：

- `/etc/squid/conf.d/allow_ip` 是本方案使用的来源白名单文件
- 现场环境中如已存在 `/etc/squid/conf.d/hosts`，本方案默认不将其作为目标域名白名单或配置片段加载文件使用

## 四、核心配置

### 4.1 编辑主配置文件

```bash
vim /etc/squid/squid.conf
```

写入以下推荐内容：

```vim
# 监听端口
http_port 0.0.0.0:3128

# 主机名，避免启动告警
visible_hostname squid-proxy-01

# 允许 CONNECT 的目标端口
acl SSL_ports port 443
acl SSL_ports port 563

# 允许访问的常见目标端口
acl Safe_ports port 80
acl Safe_ports port 21
acl Safe_ports port 443
acl Safe_ports port 70
acl Safe_ports port 210
acl Safe_ports port 280
acl Safe_ports port 488
acl Safe_ports port 591
acl Safe_ports port 777
acl Safe_ports port 1025-65535

# 管理接口与本地访问
acl manager proto cache_object
acl localhost src 127.0.0.1/32 ::1

# CONNECT 方法
acl CONNECT method CONNECT

# 从外部文件加载允许访问的客户端 IP / 网段
acl allowed_clients src "/etc/squid/conf.d/allow_ip"

# 访问控制顺序
http_access deny !Safe_ports
http_access deny CONNECT !SSL_ports
http_access allow localhost manager
http_access deny manager
http_access allow localhost
http_access allow allowed_clients
http_access deny all

# 缓存与日志
cache_dir ufs /var/spool/squid 100 16 256
cache_mem 128 MB
access_log /var/log/squid/access.log
cache_log /var/log/squid/cache.log

# 超时设置
forward_timeout 30 seconds
connect_timeout 30 seconds
read_timeout 30 seconds
request_timeout 30 seconds
```

说明：

- `http_port 0.0.0.0:3128` 表示监听所有网卡的 `3128` 端口。
- `/etc/squid/conf.d/allow_ip` 作为外部白名单文件，便于后续增删来源地址，不必反复修改主配置。
- `http_access` 顺序很重要，建议保持文档中的安全顺序。
- `http_access deny all` 必须保留，避免意外放开代理访问。
- 现场已有 `/etc/squid/conf.d/hosts` 时，本方案仍不默认引用该文件。

### 4.2 配置 allow_ip 白名单文件

```bash
vim /etc/squid/conf.d/allow_ip
```

写入示例内容：

```text
192.168.10.11
192.168.10.12
192.168.20.0/24
10.10.0.0/16
```

说明：

- 每行一个来源 `IP` 或 `CIDR`
- 不要写 `acl` 关键字
- 建议只保留真实需要放行的地址

> 修改 `/etc/squid/conf.d/allow_ip` 后，执行 `squid -k reconfigure` 或 `systemctl reload squid` 使配置生效。

### 4.3 初始化缓存目录

首次部署或修改 `cache_dir` 后，建议执行：

```bash
squid -z
```

如目录权限异常，可执行：

```bash
chown -R squid:squid /var/spool/squid
chown -R squid:squid /var/log/squid
```

### 4.4 校验配置文件语法

```bash
squid -k parse
```

如果命令无报错并直接返回，表示配置语法正确。

## 五、启动与服务管理

系统包安装通常已自带 `systemd` 服务，无需手工编写 `service` 文件。如需补充服务管理基础，可参照 [Systemd 介绍](/docs/devops/base/server-os/systemd.md)。

### 5.1 启动服务

```bash
systemctl enable squid --now
systemctl status squid
```

### 5.2 常用管理命令

```bash
systemctl start squid
systemctl stop squid
systemctl restart squid
systemctl reload squid
systemctl status squid
```

也可以使用 Squid 自带命令重载配置：

```bash
squid -k reconfigure
```

### 5.3 开放操作系统防火墙端口

`firewalld` 示例：

```bash
firewall-cmd --zone=public --add-port=3128/tcp --permanent
firewall-cmd --reload
firewall-cmd --list-ports
```

`ufw` 示例：

```bash
ufw allow 3128/tcp
ufw status
```

> 如使用云服务器，还需要同步放通云控制台安全组。基于 `firewalld` 的统一规则维护可参照 [防火墙配置](/docs/devops/base/server-os/firewalld.md)。

## 六、可选增强配置：基础认证

如果仅使用白名单仍不能满足安全要求，可叠加用户名密码认证。

### 6.1 安装认证工具

`CentOS / RHEL`：

```bash
yum install httpd-tools -y
```

`Ubuntu / Debian`：

```bash
apt install apache2-utils -y
```

### 6.2 创建密码文件

```bash
htpasswd -c /etc/squid/passwd/htpasswd proxyuser
```

如需新增第二个用户：

```bash
htpasswd /etc/squid/passwd/htpasswd proxyuser2
```

设置权限：

```bash
chown root:squid /etc/squid/passwd/htpasswd
chmod 640 /etc/squid/passwd/htpasswd
```

### 6.3 在 squid.conf 中启用基础认证

常见认证 helper 路径如下：

- `CentOS / RHEL` 常见路径：`/usr/lib64/squid/basic_ncsa_auth`
- `Ubuntu / Debian` 常见路径：`/usr/lib/squid/basic_ncsa_auth`

启用前建议先确认实际路径：

```bash
find /usr -name basic_ncsa_auth 2>/dev/null
```

在 `squid.conf` 中增加以下内容：

```vim
auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/passwd/htpasswd
auth_param basic children 5
auth_param basic realm Squid Proxy Authentication
auth_param basic credentialsttl 2 hours

acl auth_users proxy_auth REQUIRED
```

### 6.4 调整访问控制顺序

如果启用认证，建议将原有访问控制调整为同时满足“白名单 + 认证”：

```vim
http_access deny !Safe_ports
http_access deny CONNECT !SSL_ports
http_access allow localhost manager
http_access deny manager
http_access allow localhost
http_access allow allowed_clients auth_users
http_access deny all
```

说明：

- `allowed_clients` 用于限制来源地址
- `auth_users` 用于要求客户端提供合法账号密码
- 两者同时出现时，表示同时满足才允许访问

修改完成后执行：

```bash
squid -k parse
systemctl restart squid
```

## 七、部署验证

### 7.1 检查服务状态

```bash
systemctl status squid
```

### 7.2 检查端口监听

```bash
ss -lntp | grep 3128
```

正常情况下应看到服务监听在 `0.0.0.0:3128` 或指定网卡地址上。

### 7.3 HTTP 代理测试

```bash
curl -x http://192.168.10.20:3128 http://httpbin.org/ip
```

### 7.4 HTTPS CONNECT 代理测试

```bash
curl -x http://192.168.10.20:3128 https://httpbin.org/ip
```

### 7.5 启用认证后的测试

```bash
curl -x http://proxyuser:YourPassword@192.168.10.20:3128 https://httpbin.org/ip
```

### 7.6 白名单验证

重点验证以下两类场景：

- 白名单内主机通过代理访问成功
- 非白名单主机访问被拒绝

### 7.7 日志验证

```bash
tail -f /var/log/squid/access.log
tail -f /var/log/squid/cache.log
```

正常情况下：

- `access.log` 能看到客户端访问记录
- `cache.log` 无明显语法错误、启动失败或 ACL 相关报错

## 八、日志与日常运维

### 8.1 常见运维命令

```bash
squid -k parse
squid -k reconfigure
squid -k rotate
systemctl restart squid
systemctl reload squid
```

### 8.2 日志轮转

如系统未自动处理 Squid 日志轮转，可参考以下 `logrotate` 配置：

```bash
vim /etc/logrotate.d/squid
```

写入示例：

```text
/var/log/squid/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    sharedscripts
    postrotate
        /usr/sbin/squid -k rotate
    endscript
}
```

### 8.3 白名单变更流程

推荐变更方式：

1. 先修改 `/etc/squid/conf.d/allow_ip`
2. 再执行 `squid -k parse`
3. 最后执行 `squid -k reconfigure`

这样可以避免直接重启服务导致已有连接中断。

## 九、常见问题排查

### 9.1 `squid -k parse` 报错

处理思路：

- 检查 `squid.conf` 中是否有拼写错误
- 检查 `http_access` 顺序是否写错
- 检查 `/etc/squid/conf.d/allow_ip` 中是否出现非法地址格式
- 检查认证 helper 路径是否正确

### 9.2 客户端连接超时

检查以下内容：

```bash
systemctl status squid
ss -lntp | grep 3128
firewall-cmd --list-ports
ufw status
```

同时确认：

- 服务器本机防火墙已放行 `3128`
- 云安全组已放行可信来源
- 客户端到代理服务器网络可达

### 9.3 白名单未生效

优先检查：

- `/etc/squid/conf.d/allow_ip` 是否一行一个 `IP` 或 `CIDR`
- 是否误写成 `acl allowed_clients src ...`
- 修改后是否执行了 `squid -k reconfigure`
- 客户端真实出口 IP 是否与预期一致

### 9.4 认证失败

检查以下内容：

- `htpasswd` 文件路径是否正确
- `basic_ncsa_auth` 路径是否正确
- `htpasswd` 文件权限是否允许 Squid 读取
- 浏览器或 `curl` 是否正确携带代理认证信息

### 9.5 服务启动失败

查看日志：

```bash
journalctl -u squid -n 100 --no-pager
tail -n 100 /var/log/squid/cache.log
```

常见原因：

- 缓存目录权限错误
- 配置文件语法错误
- 监听端口被占用
- `visible_hostname` 未正确设置

## 十、安全建议

- 生产环境不要使用 `http_access allow all`
- 优先通过 `/etc/squid/conf.d/allow_ip` 收敛允许访问的来源地址
- 对公网暴露时建议叠加基础认证
- 定期检查 `access.log`，防止代理被滥用
- 定期升级 Squid 软件包，修复安全漏洞
- 仅开放必要端口，不开放无关管理接口

## 十一、参考资料

官方资料：

- Squid 官网：https://www.squid-cache.org/
- Squid 官方安装说明：https://wiki.squid-cache.org/SquidFaq/InstallingSquid
- Squid `acl` 指令文档：https://www.squid-cache.org/Doc/config/acl/
- Squid `http_access` 指令文档：https://www.squid-cache.org/Doc/config/http_access/
- Squid `auth_param` 指令文档：https://www.squid-cache.org/Doc/config/auth_param/

社区参考：

- CSDN《linux安装Squid》：https://blog.csdn.net/weixin_65685799/article/details/157993529
- CSDN《squid搭建https代理服务器 无需https证书 并实现浏览器代理功能》：https://blog.csdn.net/qq_35609508/article/details/144384639
