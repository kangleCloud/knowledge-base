# 源码编译安装 git

## 一、Git安装
:::tip
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 git2
:::

### 0x01.安装依赖
在编译 Git 之前，需要安装一些必要的依赖包。使用以下命令安装：
```bash
yum update
yum install -y wget curl build-essential libssl-dev libcurl4-gnutls-dev libexpat1-dev gettext
```

### 0x02.下载 Git 源码

访问 [Git 官网](https://github.com/git/git/tags) 获取最新版本的下载链接。

使用 wget 下载源码包到 /usr/local/src 目录：
```bash
cd /usr/local/src
wget https://github.com/git/git/archive/refs/tags/v2.48.1.tar.gz
```

注意： 请将 v2.48.1 替换为最新版本号。(当前最新版本为v2.48.1)


### 0x03.解压源码包
使用 tar 命令解压下载的源码包：

```bash
tar -zxvf v2.48.1.tar.gz
```

### 0x04.编译和安装
进入解压后的源码目录，并执行以下命令进行编译和安装：

```bash
cd git-2.48.1
make prefix=/usr/local/git2.48 all
make prefix=/usr/local/git2.48 install
```

### 0x05.配置环境变量
为了方便使用 Git，需要将 Git 的可执行文件路径添加到系统的 PATH 环境变量中。

编辑 /etc/profile 文件：
```bash
vim /etc/profile
```

在文件末尾添加以下内容：
```bash
export PATH=/usr/local/git2.48/bin:$PATH
```

保存并退出编辑器。

使配置生效：
```bash
source /etc/profile
```

### 0x06.验证安装
执行以下命令验证 Git 是否安装成功：

```bash
git --version
```
如果输出 Git 版本信息，则说明安装成功。

## 二、参考资料
- [Git 官网](https://git-scm.com/)
- [Git 源码仓库](https://github.com/git/git)