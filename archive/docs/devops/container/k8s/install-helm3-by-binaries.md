# 从二进制文件安装Helm3

https://github.com/helm/helm/releases

[Helm 是查找、分享和使用软件构建 K8S 的最优方式。](https://helm.sh/zh/)<font color="red">⚠</font>中文文档的更新有滞后。

有关 Helm 与各版本 K8S 的兼容性矩阵，请参考 Helm 项目提供的[官方版本支持策略文档](https://helm.sh/docs/topics/version_skew/#supported-version-skew)。

截止2025年9月7日，Helm v3.18.x 最新稳定版为 v3.18.3。

[<font color="red">每次安装需下载 Helm v3.18.x 的最新版。</font>](https://github.com/helm/helm/releases)

:::tip
- 所有源码包下载到 /usr/local/src 中
:::

## 1.先决条件

- 1. 一个 Kubernetes 集群
- 2. 确定你安装版本的安全配置
- 3. 安装和配置Helm

https://helm.sh/docs/intro/quickstart/#prerequisites

## 2.安装静态二进制文件

### 0x01.下载并解压

```bash
cd /usr/local/src
wget https://get.helm.sh/c6-linux-amd64.tar.gz
mkdir helm-v3.18.6-linux-amd64 \
  && tar -zxvf helm-v3.18.6-linux-amd64.tar.gz -C ./helm-v3.18.6-linux-amd64
```

### 0x02.移动到可执行程序

```bash
mkdir -p /usr/local/helm-3.18/bin
```

```bash
\cp /usr/local/src/helm-v3.18.6-linux-amd64/linux-amd64/helm \
  /usr/local/helm-3.18/bin
```

### 0x03.添加环境变量

```bash
echo 'export PATH=/usr/local/helm-3.18/bin:$PATH' >> /etc/profile
source /etc/profile
```

### 0x04.验证是否生效

```bash
helm help
```

## 附件1.参考资料

- https://helm.sh/zh/docs/intro/install/
- https://helm.sh/zh/docs/helm/helm/
