# 安装 NodeJS

Previous Releases: https://nodejs.org/en/download/releases

:::tip
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 nodejs16.20
- 为了解决 NodeJS 各种版本存在不兼容现象，约定通过安装 nvm 对 node 和 npm 进行版本管理。
- <a href="/guide/notification.html#_20241224" target="_blank"><b>在自动化部署服务器中，需预安装参考版本，以确保环境一致性，并提升部署效率与系统稳定性。</b></a>
:::

<font color="red"><b>在保持 CentOS 7.9 中 GLIBC 不升级的前提下，<font color="red">Node.js 支持的最高版本为 v16.20.2</font>。如项目需求超出此版本，则服务器需安装 openEuler 22.03 或更高版本的操作系统。</b></font>

## 一、nvm 安装与使用

GitHub: https://github.com/nvm-sh/nvm

nvm allows you to quickly install and use different versions of node via the command line.

:::warning nvm is not the same thing as nvm-windows
The original nvm is a completely separate project for Mac/Linux only. nvm-windows uses an entirely different philosophy and is not just a clone of nvm. 
https://github.com/coreybutler/nvm-windows

<b>注：nvm 和 nvm-windows 的命令不可混用，当前文档中的命令均基于 Linux 环境。</b>
:::

### 0x01.下载并安装

[约定通过官方渠道下载最新稳定版本，截至2025年8月26日，nvm 的最新稳定版本为 v0.40.3。](https://github.com/nvm-sh/nvm)

:::warning
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

```bash
cd /usr/local/src
wget https://github.com/nvm-sh/nvm/archive/refs/tags/v0.40.3.tar.gz \
  -O nvm-0.40.3.tar.gz
tar -zxvf nvm-0.40.3.tar.gz
mv nvm-0.40.3 /usr/local/nvm-0.40
```

### 0x02.添加环境变量

```bash
echo "source /usr/local/nvm-0.40/nvm.sh" >> ~/.bashrc
source ~/.bashrc
```

### 0x03.预装NodeJs

```bash
nvm install 14.21.3
```

```bash
nvm install 16.20.2
```

```bash
nvm install 18.20.8
```

```bash
nvm install 20.20
```

<a href="/guide/notification.html#_20260202" target="_blank">详见20260202公告</a>

### 0x04.设置默认版本

```bash
nvm alias default <NODE VERSION>
```

### 0x05.常用命令

```bash
# List installed versions, matching a given <version> if provided
nvm ls

# Display currently activated version of Node
nvm current

# 检索出 Nodejs v18 版本下的所有可用版本
nvm ls-remote | grep v18

# Download, Install, Use the latest LTS version
nvm install --lts

# Download, Install, Use a <version>
nvm install 8.9.1

# Modify PATH to use <version>
nvm use 8.9.1

# Download, Install, Use a <version>
nvm install 12.22
```

## 二、安装pnpm

:::tip
使用 npm 进行安装前，需确保您的系统已安装 Node.js（版本至少为 v16.14）。
:::

### 0x01.使用npm安装

```bash
# 设置官方源
npm config set registry https://registry.npmjs.org/
# 安装
npm install -g pnpm
```

**注意：** 以下是各版本 pnpm 与各版本 Node.js 之间的兼容性

<table>
  <thead>
    <tr>
      <th>Node.js</th>
      <th>pnpm 5</th>
      <th>pnpm 6</th>
      <th>pnpm 7</th>
      <th>pnpm 8</th>
      <th>pnpm 9</th>
      <th>pnpm 10</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Node.js 12</td><td>✔️</td><td>✔️</td><td>❌</td><td>❌</td><td>❌</td><td>❌</td></tr>
    <tr><td>Node.js 14</td><td>✔️</td><td>✔️</td><td>✔️</td><td>❌</td><td>❌</td><td>❌</td></tr>
    <tr><td>Node.js 16</td><td>未验证</td><td>✔️</td><td>✔️</td><td>✔️</td><td>❌</td><td>❌</td></tr>
    <tr><td>Node.js 18</td><td>未验证</td><td>✔️</td><td>✔️</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
    <tr><td>Node.js 20</td><td>未验证</td><td>未验证</td><td>✔️</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
    <tr><td>Node.js 22</td><td>未验证</td><td>未验证</td><td>未验证</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
  </tbody>
</table>

pnpm兼容性：https://pnpm.io/zh/installation#%E5%85%BC%E5%AE%B9%E6%80%A7

## 三、安装yarn

```
npm -g install yarn
```

## 四、设置国内镜像源

:::tip
注：原来的 registry.npm.taobao.org 已替换为 registry.npmmirror.com
:::

### 0x01.npm

1、临时使用：

可以使用 npm 命令的 --registry 参数来临时指定镜像源。例如：
```
npm install package-name --registry=https://registry.npmmirror.com
```

2、永久设置：

要永久地将 npm 的镜像源设置为 registry.npmmirror.com，可以运行以下命令：
```
npm config set registry https://registry.npmmirror.com
```

可以通过以下命令验证设置是否成功：
```
npm config get registry
```

### 0x02.yarn

1、临时使用：

类似于 npm，可以使用 yarn 命令的 --registry 参数来临时指定镜像源。例如：
```
yarn add package-name --registry=https://registry.npmmirror.com
```

2、永久设置：

要永久地将 yarn 的镜像源设置为 registry.npmmirror.com，可以运行以下命令：
```
yarn config set registry https://registry.npmmirror.com
```

可以通过以下命令验证设置是否成功：
```
yarn config get registry
```

### 0x03.pnpm

1、临时使用：

可以使用 pnpm 命令的 --registry 参数来临时指定镜像源。例如：
```
pnpm add package-name --registry=https://registry.npmmirror.com
```

2、永久设置：

要永久地将 pnpm 的镜像源设置为 registry.npmmirror.com，可以运行以下命令：
```
pnpm config set registry https://registry.npmmirror.com
```

可以通过以下命令验证设置是否成功：
```
pnpm config get registry
```

## 五、npm常用命令

列出全局安装的 npm 包及其版本号
```bash
npm list -g --depth 0
```

## 附录一、基于tar.gz包安装NodeJS

Downloads: https://nodejs.org/en/download

:::tip
尽量使用 nvm 或 nvm-windows 管理开发、测试以及生产环境中的 NodeJS。
:::

### 0x01.下载并解压缩

截止2023年8月8日，Node的最新稳定版为 v18.17.0

```bash
cd /usr/local/src
wget https://nodejs.org/download/release/v18.17.0/node-v18.17.0-linux-x64.tar.gz
tar -zxvf node-v18.17.0-linux-x64.tar.gz
```

### 0x02.移动至 /usr/local 目录

```bash
mv /usr/local/src/node-v18.17.0-linux-x64 /usr/local/node18.17
```

### 0x03.添加环境变量

```bash
echo 'export PATH=$PATH:/usr/local/node18.17/bin' >> /etc/profile
source /etc/profile
```

### 0x04.验证是否安装成功

```bash
node -v

# 输出如下内容
v18.17.0
```

## 附录二、nvm-windows

### 0x01.设置镜像源

- 阿里云
```cmd
nvm node_mirror https://npmmirror.com/mirrors/node/
```

- 腾讯云
```cmd
nvm node_mirror http://mirrors.cloud.tencent.com/nodejs-release/
```

:::tip
设置镜像源后若仍无法下载指定版本的Node，可直接从[官网](https://nodejs.org/en/download)下载对应Windows版本，然后将其复制到nvm的node安装目录中。
:::

## 附录三、参考资料

经过多次验证，在不升级 Centos7.9 中 GLIBC 的前提下，安装高于 <b>v16.20.2</b> 的 NodeJS，执行`node -v`后，会提示如下错误（导致错误的主要原因是 Centos7.9 中的 GLIBC 版本过低）：
```bash
node: /usr/lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
node: /usr/lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)
node: /usr/lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
node: /usr/lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found (required by node)
node: /usr/lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by node)
node: /usr/lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by node)
```

:::tip
执行`ldd --version`，查看系统的 GLIBC 版本 ：
```bash
ldd (GNU libc) 2.17
Copyright (C) 2012 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
Written by Roland McGrath and Ulrich Drepper.
```
:::

- https://zhuanlan.zhihu.com/p/649296127
- https://github.com/nvm-sh/nvm
- https://github.com/coreybutler/nvm-windows
