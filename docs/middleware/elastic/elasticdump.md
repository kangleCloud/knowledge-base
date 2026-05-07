# Elasticsearch 数据迁移工具

## Elastic Dump 

### 0x01.简介
Elastic Dump 是一个用于在 Elasticsearch 集群之间迁移数据的开源工具。它可以将数据从一个 Elasticsearch 索引导出到另一个索引，支持多种数据格式和传输方式。Elastic Dump 可以处理大量数据，并且支持增量迁移，适用于数据备份、恢复和集群迁移等场景。

### 0x02.安装 Elastic Dump

#### 1.通过 npm 安装
Elastic Dump 可以通过 npm（Node.js 包管理器）进行安装。确保你已经安装了 Node.js 和 npm，然后运行以下命令来安装 Elastic Dump：

```bash
npm install -g elasticdump
```
#### 2.验证安装
安装完成后，可以通过以下命令验证 Elastic Dump 是否安装成功：
```bash
elasticdump --version
```
如果显示版本号，说明安装成功。

### 0x03 通过 Docker 安装 Elastic Dump

#### 1.拉取 Elastic Dump Docker 镜像

```bash
docker pull taskrabbit/elasticsearch-dump
docker run --rm -it --network host taskrabbit/elasticsearch-dump --version
```

