# 系统初始操作

截止24年7月，市信息中心提供的操作系统有银河麒麟高级服务器操作系统V10（简称：麒麟）、统信UOS V20。目前存量业务的操作系统有 CentOS、openEuler（欧拉）以及麒麟（一般都由客户提供），约定所有新建项目使用**欧拉**或**麒麟**。

::: tip
- 以 root 或者其他有 sudo 权限的用户进行安装或更新软件包
:::

## 一、修改hostname

参照团队统一的服务器标识命名规范设置主机名与资产标识。

## 二、更新系统并安装必备的组件

### 0x01.配置镜像源

::: tabs

=== 麒麟V10
暂无

---

=== openEuler22.03（如有需要）
```bash
mv /etc/yum.repos.d/CentOS-Base.repo \
   /etc/yum.repos.d/CentOS-Base.repo.bak
mv /etc/yum.repos.d/docker-ce.repo /etc/yum.repos.d/docker-ce.repo.bak
```

---

=== Centos7
<a href="/docs/devops/base/server-os/initialization.html#附录一、镜像源" target="_blank">配置镜像源</a>

:::

### 0x02.安装必要组件

```bash
yum update -y
```

```bash
yum install -y gcc gcc-c++ make perl perl-devel \
    net-tools kernel-devel openssl-devel \
    telnet ntpdate vim lsof htop iotop wget lrzsz ntp nfs-utils
```

```bash
yum groupinstall "Development tools" -y
```

**<font color="red">重启服务器，使新的内核版本生效</font>**

## 三、时区及时钟同步设置

### 0x01.设置时区

修改时区为东八区
```bash
timedatectl set-timezone Asia/Shanghai
```

验证设置是否成功
```bash
timedatectl list-timezones | grep Shanghai
```
:::tip 打印出如下内容
Asia/Shanghai
:::

### 0x02.配置时钟同步

手动执行时钟同步
```bash
/usr/sbin/ntpdate ntp.aliyun.com
```
:::tip 输出如下内容
21 Mar 13:13:39 ntpdate[94254]: adjust time server 203.107.6.88 offset 0.035367 sec
:::

将系统时间写入硬件
```bash
clock -w
```

添加NTP时间同步计划任务
```bash
crontab -e
```

新增如下内容
```vim
# 时钟同步
*/30 * * * * /usr/sbin/ntpdate ntp.aliyun.com
```

:::tip NTP 时钟同步常用地址：
- 阿里：ntp.aliyun.com
- 腾讯：ntp.tencent.com
- 中国教育网：edu.ntp.org.cn
- 上海交通大学：ntp.sjtu.edu.cn
- 复旦大学：ntp.fudan.edu.cn
:::

### 0x03.查看当前时间设置

通过`timedatectl`命令查看系统当前时间方面的各种状态：

```bash
timedatectl
```

:::tip 输出如下内容
```vim
               Local time: 二 2025-05-27 12:35:26 CST
           Universal time: 二 2025-05-27 04:35:26 UTC
                 RTC time: 二 2025-05-27 04:35:26
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

- Local time: 当地时间
- Universal time: 伦敦时间
- RTC time: 硬件时间
- Time zone: 时区（UTC 加 8 小时等于当前时间）
:::

## 四、配置Vim编辑器

```bash
vim ~/.vimrc
```

在.vimrc中添加配置：

```vim
syntax on        "语法高亮

set autoindent   "自动缩进
set smartindent
set expandtab    "把一个 tab 字符替换成 tabstop 选项值对应的多个空格
set showmatch

set backspace=2    "设置退格键可用
set tabstop=4      "设置 tab 字符的显示宽度为4个空格的宽度
set softtabstop=4  "设置 tab 所占的列数，当输入 tab 时，设为4个空格的宽度
set shiftwidth=4

set completeopt=preview,menu  "代码补全
```

## 五、升级OpenSSL

:::tip 默认版本
- CentOS Linux release 7.9.2009 (Core) - OpenSSL 1.0.2k-fips  26 Jan 2017
- openEuler release 22.03 (LTS-SP1) - OpenSSL 1.1.1m  14 Dec 2021
- openEuler release 24.03 (LTS-SP1) - OpenSSL 3.0.12 24 Oct 2023 (Library: OpenSSL 3.0.12 24 Oct 2023)
- Kylin Linux Advanced Server release V10 (Lance) - OpenSSL 1.1.1f  31 Mar 2020
:::

所有运行 OpenSSL 1.1.1.* 版本的系统都需升级至该系列的最新版本，以获取最新的安全补丁和功能更新。具体升级方法请参考<a href="/docs/devops/base/server-os/upgrade-openssl.html" target="_blank">升级 OpenSSL</a>。

## 六、升级OpenSSH

详见： <a href="/docs/devops/base/server-os/upgrade-openssh.html" target="_blank">升级 OpenSSH</a>

## 七、设置最大打开文件数及进程数

详见： <a href="/docs/devops/base/server-os/optimization.html#一、设置最大打开文件数及进程数" target="_blank">设置最大打开文件数及进程数</a>

## 八、内核及网络设置

详见： <a href="/docs/devops/base/server-os/optimization.html#四、内核及网络设置" target="_blank">内核及网络设置</a>

## 九、禁止 root 用户远程连接

在禁止 root 用户远程连接之前，建议创建一个普通用户并授予其 sudo 或 su 权限，以便在需要时使用该用户来管理服务器，而不是直接使用 root 用户。

以下是创建普通用户的步骤：

1. 以 root 用户身份登录到 CentOS 7 服务器。

2. 运行以下命令创建一个名为“newuser”的新用户：

   ```bash
   useradd newuser
   ```

3. 为新用户设置密码

   ```bash
   passwd newuser
   ```

4. 为新用户授予 sudo 权限，以便他可以执行需要 root 权限的命令：

   ```bash
   usermod -aG wheel newuser
   ```

5. 确认 sudo 权限已启用：

   ```bash
   usermod -aG wheel newuser
   ```

6. 以新用户身份测试连接到服务器，确保他可以登录并使用 sudo 命令：

   ```bash
   ssh newuser@<server-ip>
   sudo <some-command>
   ```

完成上述步骤后，可以禁止 root 用户远程连接并使用新创建的普通用户进行服务器管理。

要禁止 root 用户远程连接，可以按照以下步骤进行操作：

1. 使用 root 用户登录到 CentOS 7 服务器。

2. 打开 SSH 配置文件`/etc/ssh/sshd_config`，使用文本编辑器（如`vi`或`vim`）进行编辑。

3. 找到以下行：

   ```vim
   #PermitRootLogin yes
   ```

   将其改为：

   ```vim
   PermitRootLogin no
   ```

   这将禁止 root 用户远程登录。

4. 保存并关闭文件。

5. 重启 SSH 服务以使更改生效：

   ```
   systemctl restart sshd
   ```
  
这样就完成了禁止 root 用户远程连接的操作。现在，只能使用普通用户登录到 CentOS 7 服务器，并使用 sudo 或 su 命令获取 root 权限。

## 十、启用cockpit管理防火墙

**待核验**

详见： <a href="/docs/devops/base/server-os/cockpit" target="_blank">cockpit 的安装及使用</a>

## 附录一、Centos更新镜像源

### 0x01.国内镜像源

```bash
cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

### 0x02.EPEL

EPEL（Extra Packages for Enterprise Linux）是由 Fedora 社区打造，为 RHEL 及衍生发行版（如 CentOS 等）提供高质量软件包的项目。

```bash
curl -o /etc/yum.repos.d/epel-7.repo http://mirrors.aliyun.com/repo/epel-7.repo
```

### 0x03.重新建立包信息缓存

```bash
yum clean all && yum makecache
```

## 附录二、其他

### 0x01.操作系统说明

- <font color="red">从 openEuler 22.03-LTS 版本开始，停止支持和维护 Python 2，仅支持 Python 3。</font>（[Python 核心团队已经于 2020 年 1 月停止对 Python 2 的维护。2021 年，openEuler 21.03 仅修复 Python 2 的致命 CVE。Python 2 已于 2020 年 12 月 31 日全面停止维护。](https://docs.openeuler.org/zh/docs/22.03_LTS_SP1/docs/Releasenotes/%E7%94%A8%E6%88%B7%E9%A1%BB%E7%9F%A5.html)）
- CentOS 8 生命周期已于 2021 年 12 月 31 日终止，[CentOS 7 生命周期已于 2024 年 6 月 30 日终止](https://blog.centos.org/2023/04/end-dates-are-coming-for-centos-stream-8-and-centos-linux-7/)；openEuler 以年月为版本号，截止2024年7月，22年系列的最新稳定版为 22.03-LTS-SP4，[<b>团队约定使用 22.03-LTS-SP*</b>](https://docs.openeuler.org/zh/)，暂时不在生产环境中使用 24.03-LTS。

### 0x02.启用rc-local服务

:::warning
rc.local 是为了兼容而存在的，建议使用 systemd 服务替代 rc-local 服务。
:::

赋予 /etc/rc.d/rc.local 文件执行权限，系统将在启动过程中执行此文件。
```bash
chmod +x /etc/rc.d/rc.local
```
