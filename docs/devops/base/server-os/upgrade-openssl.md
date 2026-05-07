# 升级OpenSSL

- OpenSSL Downloads：https://www.openssl.org/source/
- OpenSSL Releases On Github：https://github.com/openssl/openssl/releases
- Old 1.1.1 Releases：https://openssl-library.org/source/old/1.1.1/index.html

## 一、升级OpenSSL到1.1.1*

截止2024年10月22日，OpenSSL 1.1.1* 系列最新稳定版本为1.1.1w，发布于2023年9月11日。

:::tip 默认版本
- CentOS Linux release 7.9.2009 (Core) - OpenSSL 1.0.2k-fips  26 Jan 2017
- openEuler release 22.03 (LTS-SP1) - OpenSSL 1.1.1m  14 Dec 2021
- openEuler release 24.03 (LTS-SP1) - OpenSSL 3.0.12 24 Oct 2023 (Library: OpenSSL 3.0.12 24 Oct 2023)
- Kylin Linux Advanced Server release V10 (Lance) - OpenSSL 1.1.1f  31 Mar 2020
  :::

### 0x01.安装依赖

```bash
yum -y install perl
```

### 0x02.下载源码并解压

```bash
cd /usr/local/src
wget https://github.com/openssl/openssl/releases/download/OpenSSL_1_1_1w/openssl-1.1.1w.tar.gz
tar -zxvf openssl-1.1.1w.tar.gz
```

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

### 0x03.编译安装

```bash
cd /usr/local/src/openssl-1.1.1w
./config --prefix=/usr/local/openssl1.1 no-zlib
make && make install
```

### 0x04.配置环境变量

```bash
mv /usr/bin/openssl /usr/bin/openssl.bak
mv /usr/include/openssl /usr/include/openssl.bak

ln -s /usr/local/openssl1.1/bin/openssl /usr/bin/openssl
ln -s /usr/local/openssl1.1/include/openssl /usr/include/openssl
ln -s /usr/local/openssl1.1/lib/libssl.so.1.1 /usr/local/lib64/libssl.so
```

### 0x05.添加动态链接库的路径

查看配置文件是否已添加路径
```bash
cat /etc/ld.so.conf
```

如果没有则添加（多次添加会重复）
```
echo '/usr/local/openssl1.1/lib' >> /etc/ld.so.conf
ldconfig -v
```

### 0x06.验证是否安装成功

```bash
openssl version
```

:::tip 输出如下内容
OpenSSL 1.1.1w  11 Sep 2023 (Library: OpenSSL 1.1.1m  14 Dec 2021)
:::

## 二、升级OpenSSL到v3

<b><font color="red">升级需谨慎，目前暂无实际场景需要进行 v3 版本的升级。</font></b>

:::warning
部分旧版运维组件不支持 OpenSSL v3，升级前必须逐项确认依赖兼容性。
:::

截止2023年5月，最新稳定版为：v3.0.8

:::tip
The latest stable version is the 3.1 series supported until 14th March 2025. Also available is the 3.0 series which is a Long Term Support (LTS) version and is supported until 7th September 2026. The previous LTS version (the 1.1.1 series) is also available and is supported until 11th September 2023. https://www.openssl.org/source/
:::

### 0x01.安装依赖

```bash
yum install -y perl
```

### 0x02.下载最新版本

```bash
cd /usr/local/src
wget https://github.com/openssl/openssl/releases/download/openssl-3.0.8/openssl-3.0.8.tar.gz
tar -zxvf openssl-3.0.8.tar.gz
```

### 0x03.编译安装

`make && make install`执行时间比较长

```bash
cd /usr/local/src/openssl-3.0.8
./config --prefix=/usr/local/openssl3.0 no-zlib
make && make install
```

### 0x04.配置环境变量
```bash
# 备份老版本的 openssl（有可能不存在）
mv /usr/bin/openssl /usr/bin/openssl.bak
mv /usr/include/openssl /usr/include/openssl.bak

# 配置新版本的openssl
ln -s /usr/local/openssl3.0/bin/openssl /usr/bin/openssl
ln -s /usr/local/openssl3.0/include/openssl /usr/include/openssl

# 配置库文件目录
echo "/usr/local/openssl3.0/lib" >> /etc/ld.so.conf
ldconfig -v
```

### 0x05.检查验证
```bash
openssl version

# 输出如下内容
OpenSSL 3.0.8 7 Feb 2023 (Library: OpenSSL 3.0.8 7 Feb 2023)
```

### 0x06.可能出现的问题

- libssl.so.3 文件不存在

:::danger 错误描述
openssl:error while loading shared libraries: libssl.so.3: cannot open shared object file: No such file or directory
:::

:::tip 解决办法
```bash
ln -s /usr/local/openssl3.0/lib64/libssl.so.3 /usr/lib64/libssl.so.3
ln -s /usr/local/openssl3.0/lib64/libcrypto.so.3 /usr/lib64/libcrypto.so.3
```
:::

- 缺少 IPC/Cmd.pm 模块

:::danger 错误描述
Can't locate IPC/Cmd.pm in @INC (@INC contains: /usr/local/src/openssl-3.0.8/util/perl /usr/local/lib64/perl5 /usr/local/share/perl5 /usr/lib64/perl5/vendor_perl /usr/share/perl5/vendor_perl /usr/lib64/perl5 /usr/share/perl5 . /usr/local/src/openssl-3.0.8/external/perl/Text-Template-1.56/lib) at /usr/local/src/openssl-3.0.8/util/perl/OpenSSL/config.pm line 19.
BEGIN failed--compilation aborted at /usr/local/src/openssl-3.0.8/util/perl/OpenSSL/config.pm line 19.
Compilation failed in require at /usr/local/src/openssl-3.0.8/Configure line 23.
BEGIN failed--compilation aborted at /usr/local/src/openssl-3.0.8/Configure line 23.
:::

:::tip 解决办法

安装 perl-CPAN
```shell
 yum install -y perl-CPAN
```

进入perl shell
```shell
perl -MCPAN -e shell
```

进入perl shell 后执行步骤 1 ：输入yes
```vim
CPAN.pm requires configuration, but most of it can be done automaticallyIf you answer 'no' below, you will enter an interactive dialog for eachconfiquration option instead .
Would you like to configure as much as possible automatically? [yes] yes
<install help>
warning: You do not have write permission for Perl library directories
```

进入perl shell 后执行步骤 2 ：输入manual
```vim
warning: You do not have write permission for Perl library directories.
To install modules, you need to configure a local Perl library directory orescalate your privileges.. CPAN can help you by bootstrapping' the local::libmodule or by configuring itself to use 'sudo' (if available). You may alsoresolve this problem manually if you need to customize your setup.
what approach do you want?(choose ilocal::lib', "sudo' or 'manual')
  [local::lib] manual
Autoconfigured everything but 'urllist'.
```

进入perl shell 后执行步骤 3 ：输入yes
```vim
would you like me to automatically choose some CPAN mirror
ites for you? (This means connecting to the Internet) [yes] yes
trying to fetch a mirror list from the Internet
Fetching with HTTP::Tiny:ttp: //www.perl.org/CPAN/MIRRORED .BY
```

进入perl shell 后执行步骤 4 ：输入install IPC/Cmd.pm
```vim
You can re-run configuration any time with 'o conf init' in the CPAN shellerminal does not support AddHistory.
cpan shell --CPAN exploration and modules installation (vl.9800)Enter "h' for help .

cpan[1]> install IPC/Cmd.pm
Fetching with HTTP::Tiny:
```
:::
