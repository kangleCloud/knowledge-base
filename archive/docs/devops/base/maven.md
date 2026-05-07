# Maven 安装及配置

Apache Maven是一个软件项目管理和理解工具。Maven基于项目对象模型(POM)的概念，可以从一个中心信息段管理项目的构建、报告和文档。

- 官网下载地址：https://archive.apache.org/dist/maven/maven-3
- 清华大学开源软件镜像站：https://mirrors.tuna.tsinghua.edu.cn/apache/maven/maven-3
- Maven Releases History：https://maven.apache.org/docs/history.html#maven-3-9-x

:::tip 约定
- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 apache-maven-3.9
- 截止2026年1月24日，Maven 3.9.x+ 系列最新版本为 v3.9.12
:::

## 1.下载tar包并安装

```bash
cd /usr/local/src
wget https://mirrors.2500city.com/devops/Maven/apache-maven-3.9.12-bin.tar.gz
tar -zxvf apache-maven-3.9.12-bin.tar.gz
cp -r /usr/local/src/apache-maven-3.9.12 /usr/local/apache-maven-3.9
```

## 2.添加环境变量

```bash
echo 'export PATH=$PATH:/usr/local/apache-maven-3.9/bin' >> /etc/profile
source /etc/profile
```

## 3.修改镜像地址

```bash
vim /usr/local/apache-maven-3.9/conf/settings.xml
```

修改配置文件中`mirror`块
```xml
    <mirror>
      <id>aliyunmaven</id>
      <mirrorOf>*</mirrorOf>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
```


## 4.常用命令

### 0x01.查看mvn版本

```bash
mvn -v
```

:::tip 输出如下内容
```md
Apache Maven 3.9.12 (848fbb4bf2d427b72bdb2471c22fced7ebd9a7a1)
Maven home: /usr/local/apache-maven-3.9
Java version: 1.8.0_461, vendor: Oracle Corporation, runtime: /usr/local/jdk8/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "linux", version: "5.10.0-136.95.0.176.oe2203sp1.x86_64", arch: "amd64", family: "unix"
```
:::

## 附录1.参考资料

- https://developer.aliyun.com/mvn/guide