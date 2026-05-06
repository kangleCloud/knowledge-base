# 升级OpenSSH

- OpenSSH Downloads：https://www.openssh.com/portable.html
- OpenSSH Releases On Github：https://github.com/openssh/openssh-portable/tags
- 阿里云镜像站：https://mirrors.aliyun.com/pub/OpenBSD/OpenSSH/portable/

:::tip 操作系统版本与其默认的OpenSSH版本

- CentOS Linux release 7.9.2009 (Core) - OpenSSH_7.4p1, OpenSSL 1.0.2k-fips 26 Jan 2017
- Kylin Linux Advanced Server release V10 (Halberd) - OpenSSH_8.2p1, OpenSSL 1.1.1f 31 Mar 2020
- openEuler release 22.03 (LTS-SP1) - OpenSSH_8.8p1 OpenSSL 1.1.1m 14 Dec 2021
- openEuler release 24.03 (LTS-SP1) - OpenSSH_9.6p1, OpenSSL 3.0.12 24 Oct 2023
  :::

截止2025年08月02日，OpenSSH 最新稳定版为 openssh-10.0p2.tar.gz，<font color="red">
每次安装需到官网或镜像站下载最新版。</font>

## 1.开启telnet

:::warning
OpenSSH 在升级过程中可能会出现远程连接中断,当 SSH 中断时可通过`telnet`命令连接服务器进行升级
:::

### 0x01.安装telnet&xinetd

```shell
yum -y install xinetd telnet-server
```

### 0x02.启动telnet&xinetd

```bash
systemctl enable xinetd --now
```

```bash
systemctl enable telnet.socket --now
```

### 0x03.验证Telnet是否已开启

```shell
ss -nltp | grep :23
```

:::tip 输出如下内容
LISTEN 0 4096               *:23               *:*    users:(("systemd",pid=1,fd=26))  
:::

::: tip

- 如通过外部主机测试，可在命令行终端执行`telnet $IP [端口]`命令，验证目标服务的连通性（需确保防火墙已放行对应端口）。
- 当测试 Telnet 连接时，若发现能够建立连接但认证失败，可以通过检查系统安全日志 /var/log/secure 来进行故障排查和分析。
  :::

## 2.安装依赖包

### 0x01.Yum安装依赖

```shell
yum -y install gcc gcc-c++ glibc \
    make autoconf pcre-devel pam-devel zlib zlib-devel
```

### 0x02.升级OpenSSL

所有运行 OpenSSL 1.1.1.*
版本的系统都需升级至该系列的最新版本，以获取最新的安全补丁和功能更新。具体升级方法请参考<a href="/docs/devops/base/server-os/upgrade-openssl.html" target="_blank">
升级 OpenSSL</a>。

## 3.编译安装

### 0x01.备份配置文件

```shell
mv /etc/ssh /etc/ssh.bak_$(date "+%Y%m%d")
mv /etc/pam.d/sshd /etc/pam.d/sshd.bak_$(date "+%Y%m%d")
```

### 0x02.下载源码并解压

```shell
cd /usr/local/src
wget https://mirrors.aliyun.com/pub/OpenBSD/OpenSSH/portable/openssh-10.0p2.tar.gz
tar -zxvf openssh-10.0p2.tar.gz
```

### 0x03.编译安装

:::warning
OpenSSL 的安装路径因服务器环境而异（要求 OpenSSL 版本不低于 1.1.1w）。
:::

::: tabs
=== 已编译升级OpenSSL
采用`--without-openssl-header-check`选项来跳过 OpenSSL 头文件检测，尚未发现更优的替代方案。

```bash
cd /usr/local/src/openssh-10.0p1
./configure --prefix=/usr/local/openssh10.0 \
    --sysconfdir=/etc/ssh \
    --with-ssl-dir=/usr/local/openssl1.1 \
    --with-zlib --with-pam \
    --without-openssl-header-check
make && make install
```

---

=== 未编译升级OpenSSL

```bash
cd /usr/local/src/openssh-10.0p1
./configure --prefix=/usr/local/openssh10.0 \
    --sysconfdir=/etc/ssh \
    --with-zlib --with-pam
make && make install
```

---
:::

### 0x04.修改配置文件

```bash
cat >> /etc/ssh/sshd_config << EOF
UseDNS no
PermitRootLogin yes
PubkeyAuthentication yes
PasswordAuthentication yes
X11Forwarding yes
X11UseLocalhost no
XAuthLocation /usr/bin/xauth
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,ecdh-sha2-nistp256,ecdh-sha2-nistp384,ecdh-sha2-nistp521
EOF
```

### 0x05.备份可执行文件

```bash
mv /usr/bin/ssh /usr/bin/ssh.bak_$(date "+%Y%m%d")
mv /usr/sbin/sshd /usr/sbin/sshd.bak_$(date "+%Y%m%d")
mv /usr/bin/ssh-keygen /usr/bin/ssh-keygen.bak_$(date "+%Y%m%d")
```

### 0x06.配置新版本执行文件

```bash
ln -s /usr/local/openssh10.0/bin/ssh /usr/bin/ssh
ln -s /usr/local/openssh10.0/bin/ssh-keygen /usr/bin/ssh-keygen 
ln -s /usr/local/openssh10.0/sbin/sshd /usr/sbin/sshd
```

## 4.使用SysV运行

### 0x01.备份service文件

```bash
mv /etc/systemd/system/sshd.service \
    /etc/systemd/system/sshd.service.bak_$(date "+%Y%m%d")
mv /usr/lib/systemd/system/sshd.service \
    /usr/lib/systemd/system/sshd.service.bak_$(date "+%Y%m%d")
```

### 0x02.配置新版本启动脚本

```bash
\cp -f /usr/local/src/openssh-10.0p1/contrib/redhat/sshd.init /etc/init.d/sshd
```

```bash
\cp -f /usr/local/src/openssh-10.0p1/contrib/redhat/sshd.pam /etc/pam.d/sshd
```

```bash
chmod +x /etc/init.d/sshd
```

### 0x03.重载systemd单元文件

```bash
systemctl daemon-reload
```

### 0x04.启动服务

:::warning
通过 SysV 方式构建的 sshd，不能通过 `systemctl enable --now sshd` 启动服务并配置开机自启。
:::

关闭正在运行的服务

```bash
/etc/init.d/sshd stop
```

启动服务

```bash
systemctl start sshd
```

查看服务状态

```bash
systemctl status sshd
```

### 0x05.配置开机自启

设置开机自启

```bash
systemctl enable sshd
```

查看开机自启是否已生效

```bash
systemctl is-enabled sshd
```

:::tip 输出如下内容

```vim
sshd.service is not a native service, redirecting to systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install is-enabled sshd
enabled
```

:::

### 0x06.查看版本

```shell
ssh -V
```

:::tip 输出如下内容
OpenSSH_10.0p2, OpenSSL 1.1.1m 14 Dec 2021
:::

### 0x04.关闭Telnet

```bash
systemctl stop xinetd.service
systemctl disable xinetd.service
```

```bash
systemctl stop telnet.socket
systemctl disable telnet.socket
```

## 附录1.参考资料

- https://developer.aliyun.com/article/1647604
- https://blog.csdn.net/qq_51920683/article/details/146235938


