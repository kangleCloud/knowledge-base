# 系统初始操作

截止24年7月，市信息中心提供的操作系统有银河麒麟高级服务器操作系统V10（简称：麒麟）、统信UOS V20。目前存量业务的操作系统有
CentOS、openEuler（欧拉）以及麒麟（一般都由客户提供），约定所有新建项目使用**欧拉**或**麒麟**。

::: tip

- 以 root 或者其他有 sudo 权限的用户进行安装或更新软件包
  :::

## 一、修改hostname

## 二、更新系统并安装必备的组件

### 0x01.配置镜像源

:::tabs

=== 麒麟V10
暂无

=== openEuler22.03

```bash
mv /etc/yum.repos.d/CentOS-Base.repo \
   /etc/yum.repos.d/CentOS-Base.repo.bak
mv /etc/yum.repos.d/docker-ce.repo /etc/yum.repos.d/docker-ce.repo.bak
````

=== CentOS7
配置镜像源

```bash
# 国内镜像源
cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# EPEL
curl -o /etc/yum.repos.d/epel-7.repo http://mirrors.aliyun.com/repo/epel-7.repo

# 重新建立包信息缓存
yum clean all && yum makecache
```

:::

### 0x02.安装必要组件

```bash
yum update -y
```

```bash
yum install -y gcc gcc-c++ make perl perl-devel \
    net-tools kernel-devel openssl-devel \
    telnet ntpdate vim lsof htop iotop wget lrzsz ntp
```

```bash
yum groupinstall "Development tools" -y
```

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
set paste

set backspace=2    "设置退格键可用
set tabstop=4      "设置 tab 字符的显示宽度为4个空格的宽度
set softtabstop=4  "设置 tab 所占的列数，当输入 tab 时，设为4个空格的宽度
set shiftwidth=4

set completeopt=preview,menu  "代码补全
```

## 五、升级OpenSSL

:::tip 默认版本

- CentOS Linux release 7.9.2009 (Core) - OpenSSL 1.0.2k-fips 26 Jan 2017
- openEuler release 22.03 (LTS-SP1) - OpenSSL 1.1.1m 14 Dec 2021
- openEuler release 24.03 (LTS-SP1) - OpenSSL 3.0.12 24 Oct 2023 (Library: OpenSSL 3.0.12 24 Oct 2023)
- Kylin Linux Advanced Server release V10 (Lance) - OpenSSL 1.1.1f 31 Mar 2020
  :::

所有运行 OpenSSL 1.1.1.*
版本的系统都需升级至该系列的最新版本，以获取最新的安全补丁和功能更新。具体升级方法请参考<a href="/docs/devops/base/server-os/upgrade-openssl.html" target="_blank">
升级 OpenSSL</a>。

## 六、升级OpenSSH

详见： <a href="/docs/devops/base/server-os/upgrade-openssh.html" target="_blank">升级 OpenSSH</a>

## 七、设置最大打开文件数及进程数

详见： <a href="/docs/devops/base/server-os/optimization.html#一、设置最大打开文件数及进程数" target="_blank">设置最大打开文件数及进程数</a>

## 八、内核及网络设置

详见： <a href="/docs/devops/base/server-os/optimization.html#四、内核及网络设置" target="_blank">内核及网络设置</a>
