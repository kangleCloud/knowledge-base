# MinIO单节点单驱动部署

MinIO Download：https://min.io/download#/linux

MinIO Download Page：https://dl.min.io/server/minio/release/linux-amd64/

MinIO 中国加速镜像站：https://dl.minio.org.cn/server/minio/release/linux-amd64/

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，因 MinIO 以年月日为版本标识，约定以软件名及其发布的年月命名，如minio2504
  :::

## 一、先决条件

### 0x01.创建minio用户

```bash
groupadd minio
useradd -g minio minio -s /sbin/nologin
```

### 0x02.创建数据目录

```bash
mkdir -p /data/minio
chown minio:minio /data/minio
```

## 二、二进制包安装

:::warning
MinIO 官方已对社区版的 Web 控制台进行简化。2025年4月22日版本（RELEASE.2025-04-22T19-12-33Z）是最后一个保留完整控制台功能的版本，而自2025年5月24日版本起，控制台功能开始大幅精简。因此，约定将 MinIO 的版本锁定在<font color="red">2025年4月22日版本（minio.RELEASE.2025-04-22T22-12-26Z）</font>，以确保控制台功能完整可用。
[Implemented AGPL MinIO Object Browser simplified Console](https://github.com/minio/object-browser/pull/3509)
:::

### 0x01.下载二进制文件

```bash
cd /usr/local/src
wget https://dl.minio.org.cn/server/minio/release/linux-amd64/archive/minio.RELEASE.2025-04-22T22-12-26Z
```

:::tip
软件包下载比较慢的情况下，可下载团队软件库中对应的安装包。命令示例：`wget <Software Download Link> -O <Software Package Name>`。
:::

### 0x02.复制 MinIO 到安装目录
```
mkdir -p /usr/local/minio2504/bin
cp -r /usr/local/src/minio.RELEASE.2025-04-22T22-12-26Z \
    /usr/local/minio2504/bin/minio
chmod +x /usr/local/minio2504/bin/minio
```

### 0x03.创建环境变量文件

```bash
vim -p /usr/local/minio2504/minio.conf
```

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`#`、`?`、`=`、`%`、`/`、`\`。
:::

写入以下内容

```vim
# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.
# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.
# Omit to use the default values 'minioadmin:minioadmin'.
# MinIO recommends setting non-default values as a best practice, regardless of environment
# 设置控制台的账号及密码
MINIO_ROOT_USER=myminioadmin
MINIO_ROOT_PASSWORD=<password>

# MINIO_VOLUMES sets the storage volume or path to use for the MinIO server.
MINIO_VOLUMES="/data/minio"

# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server
# MinIO assumes your network control plane can correctly resolve this hostname to the local machine
# Uncomment the following line and replace the value with the correct hostname for the local machine and port for the MinIO server (9000 by default).
#MINIO_SERVER_URL="http://minio.example.net:9000"

# 设置9000为文件访问端口，9001为内嵌控制台页面访问端口
MINIO_OPTS="--address :9000  --console-address :9001"
```

参考：https://min.io/docs/minio/linux/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#create-the-environment-variable-file

## 三、使用Systemd管理进程

:::warning
- redis.service执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
  :::

### 0x01.编辑 minio.service 内容

```bash
vim  /etc/systemd/system/minio.service
```

添加如下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/minio2504/bin/minio

[Service]
WorkingDirectory=/usr/local/minio2504

User=minio
Group=minio

EnvironmentFile=-/usr/local/minio2504/minio.conf
ExecStartPre=/bin/bash -c "if [ -z \"${MINIO_VOLUMES}\" ]; then echo \"Variable MINIO_VOLUMES not set in minio.conf\"; exit 1; fi"
ExecStart=/usr/local/minio2504/bin/minio server $MINIO_OPTS $MINIO_VOLUMES

# Let systemd restart this service always
Restart=always

# Specifies the maximum file descriptor number that can be opened by this process
LimitNOFILE=65536

# Specifies the maximum number of threads this process can create
TasksMax=infinity

# Disable timeout logic and wait until process is stopped
TimeoutStopSec=infinity
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
```

参考：https://min.io/docs/minio/linux/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id4

### 0x02.重新加载systemctl配置文件

```bash
systemctl daemon-reload
```

### 0x03.设置开机自启并启动
```bash
systemctl enable minio --now
```

### 0x04.确认服务是否正常运行

```bash
systemctl status minio
```
```bash
journalctl -f -u minio
```

:::tip Systemctl指令
```bash
systemctl status minio  #查看服务
systemctl start minio   #启动服务
systemctl stop minio    #停止服务
systemctl restart minio #重启服务
systemctl enable minio  #开启开机自启服务
systemctl disable minio #关闭开机自启服务
```

通过`systemctl status minio`命令可以知晓 S3-API、Console 地址
:::

## 四、配置Nginx转发

:::tip
- 此配置是被配置在代理服务器上而不是 MinIO 服务器上
- 如果域名资源不够，访问域名可借用业务域名加路径的方式，约定如下：https://{sub_domain}.internal-domain.com/upload
- 配置示例仅为参考示例，具体配置应该根据生产的实际情况进行配置
  :::

### 0x01.服务器 S3 API

:::warning
[S3 API签名计算算法不支持通过代理方案来托管 MinIO 服务器 API 的情况，例如 example.net/s3/](https://www.minio.org.cn/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html)

团队规定，nginx反向代理不针对桶放行，以配合隐私图片上传时的签名。
:::

```vim
server {
    listen 80;
    server_name oss.internal-domain.com;

    proxy_headers_hash_max_size 51200;
    proxy_headers_hash_bucket_size 6400;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    location / {
        proxy_pass http://${MINIO_SERVER}:9000;
        add_header Cache-Control no-cache;

        include /usr/local/nginx{version}/conf/cors.configure;
        include /usr/local/nginx{version}/conf/cors_options.configure;
        include /usr/local/nginx{version}/conf/forbidden.conf;
    }
}
```

:::tip
`include /usr/local/nginx1.28/conf/*;` 的配置可参照 Nginx 跨域以及禁止访问场景相关配置。
:::

:::warning javascript 文件中文乱码问题

Nginx 的 charset_types 参数默认支持的 JS Content-Type 为 `application/javascript`。

通过 MinIO 控制台上传的 JS 文件，其 Content-Type 默认为 `application/x-javascript`。

<b>约定在反向代理 MinIO 服务的 Nginx Location 块中加入`charset utf-8; charset_types *;`解决中文乱码问题</b>。

补充：通过修改 Js 文件的 Encoding 为 UTF-8 With Bom 也可以解决，但考虑存在合并 js 文件场景下会导致浏览器 JS 错误的风险，还在试用阶段。

Nginx：[Until version 1.5.4, “application/x-javascript” was used as the default MIME type instead of “application/javascript”.](https://nginx.org/en/docs/http/ngx_http_charset_module.html) (Nginx 1.5.4 released at 27 Aug 2013.)
:::

### 0x02.控制台的 Web GUI

:::warning
虽然 MinIO 控制台可以通过子路径的方式进行配置访问，考虑到后期维护以及安全等因素，约定将 API 和 控制台分离，<font color="red">不允许使用同一个域名</font>。
:::

```vim
server {
    listen 80;
    server_name minio-admin.internal-domain.com;

    location / {
        proxy_pass http://${MINIO_SERVER}:9001;
        proxy_headers_hash_max_size 51200;
        proxy_headers_hash_bucket_size 6400;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 五、常用命令

1.查看 MinIO 版本号
```bash
/usr/local/minio2504/bin/minio -v
```

## 附录一、团队使用过的版本

- [minio.RELEASE.2024-05-28T17-19-04Z](https://dl.minio.org.cn/server/minio/release/linux-amd64/archive/minio.RELEASE.2024-05-28T17-19-04Z)
- [minio.RELEASE.2023-09-04T19-57-37Z](https://dl.minio.org.cn/server/minio/release/linux-amd64/archive/minio.RELEASE.2023-09-04T19-57-37Z)
- [minio.RELEASE.2022-05-04T07-45-27Z](https://dl.minio.org.cn/server/minio/release/linux-amd64/archive/minio.RELEASE.2022-05-04T07-45-27Z)

## 附录二、docker-compose搭建

:::danger 密码说明
密码长度需不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`#`、`?`、`=`、`%`、`/`、`\`。
:::

```yaml
version: '3'
services:
  minio:
    image: minio/minio:RELEASE.2024-06-11T03-13-30Z
    container_name: minio
    ports:
      - 9080:9080
      - 9090:9090
    volumes:
      - /data/docker/minio/data:/data
      - /data/docker/minio/config:/root/.minio
    environment:
      MINIO_ROOT_USER: "myminioadmin"
      MINIO_ROOT_PASSWORD: "<password>"
    command: server --console-address :9080 --address :9090 /data
    restart: always
    privileged: true
```

## 附录三、参考资料

- [MinIO对象存储 Linux](https://minio.org.cn/docs/minio/linux/index.html)
- [单节点单硬盘部署MinIO](https://minio.org.cn/docs/minio/linux/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html)
- [MinIO服务器命令介绍](https://minio.org.cn/docs/minio/linux/reference/minio-server/minio-server.html)
- [Nginx服务器反向代理MinIO配置](https://minio.org.cn/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html)
