# 安装 go 语言

- [Go 中文网](https://go.p2hp.com/doc/install)
- [Go 官方文档](https://go.dev/dl/)

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 go1.21
:::

## 基于tar.gz包安装

1. 下载

    :::tip
    
    - 官网下载地址：https://go.dev/dl/
    - 截止2023年9月，go 最新稳定版为 1.21
      
    :::

    ```bash
    cd /usr/local/src
    wget https://go.dev/dl/go1.21.1.linux-amd64.tar.gz
    ```

2. 解压文件并移动至 /usr/local 目录

    ```bash
    tar zxf go1.21.1.linux-amd64.tar.gz
    mv go /usr/local/go1.21
    ```

3. 添加环境变量

    ```bash
    echo 'PATH=$PATH:/usr/local/go1.21/bin
    export PATH' >> /etc/profile
    ```

   刷新环境变量

    ```bash
    source /etc/profile
    ```

4. 验证是否安装成功

    ```bash
    go version
    
    # 输出如下内容
    go version go1.21.1 linux/amd64
    ```

## 参考资料

- [Go 中文网](https://go.p2hp.com/doc/install)