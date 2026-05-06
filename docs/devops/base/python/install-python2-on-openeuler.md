# 在openEuler上安装Python2

[The official home of the Python Programming Language](https://www.python.org/)

[Python 2.7.18](https://www.python.org/downloads/release/python-2718/) is the last release of Python 2.（截止2023年5月）

Release Date: April 20, 2020

<font color="red">openEuler 22.03-LTS 版本开始，停止支持和维护Python 2，仅支持 Python 3。</font>（Python 核心团队已经于2020年1月停止对 Python 2的维护。2021年，openEuler 21.03 仅修复 Python 2的致命CVE。Python 2已于2020年12月31日全面停止维护。摘录自：<a href="https://docs.openeuler.org/zh/docs/22.03_LTS_SP1/docs/Releasenotes/%E7%94%A8%E6%88%B7%E9%A1%BB%E7%9F%A5.html" target="_blank">openEuler 发行说明·用户须知</a>）

:::warning 约定
- 源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 python2.7
  :::

## 安装必要的库

```bash
yum -y install gcc gcc-c++ zlib-devel
```

## 安装Python2

前提：系统默认安装的是 Python3，应用软件需要 Python2 的支持

1. 下载源代码并解压缩
```bash
cd /usr/local/src
wget https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tar.xz
tar -Jxvf Python-2.7.18.tar.xz
```
2. 编译安装
```bash
cd Python-2.7.18
./configure --prefix=/usr/local/python2.7/ --enable-optimizations
make && make install
```

3. 配置环境变量
```bash
ln -s /usr/local/python2.7/bin/python2 /usr/bin/python2
```

4. 验证 Python 是否安装成功
```bash
python2 -V

# 输出如下内容
Python 2.7.18
```

## 安装Pip

`pip`为 python2 的包管理器，使用`yum`方式安装的`pip`版本比较低，团队约定使用 get-pip.py 脚本安装。

1. 使用 get-pip 脚本安装`pip`
```bash
cd /usr/local/src

curl https://bootstrap.pypa.io/pip/2.7/get-pip.py -o get-pip.py
python2 get-pip.py
mv /usr/bin/pip /usr/bin/pip.bak
ln -s /usr/local/python2.7/bin/pip2 /usr/bin/pip
```

2. 验证 Pip 是否安装成功
```bash
pip -V

# 输出如下内容
pip 20.3.4 from /usr/local/python2.7/lib/python2.7/site-packages/pip (python 2.7)
```