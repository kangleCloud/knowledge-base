# MinIO四节点分布式部署

MinIO Download：https://min.io/download#/linux

MinIO Download Page：https://dl.min.io/server/minio/release/linux-amd64/

MinIO 中国加速镜像站：https://dl.minio.org.cn/server/minio/release/linux-amd64/

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 源码安装时应安装到 /usr/local 中，因 MinIO 以年月日为版本标识，约定以软件名及其发布的年月命名，如minio2504
- 本文默认 4 个节点 IP 依次为 `10.15.33.19`、`10.15.33.20`、`10.15.33.21`、`10.15.33.22`
:::

## 一、先决条件

### 0x01.规划节点 IP

本文约定 MinIO 集群的 4 个节点 IP 如下：

- `10.15.33.19`
- `10.15.33.20`
- `10.15.33.21`
- `10.15.33.22`

在支持 MinIO 顺序展开语法的配置项中，可统一写为：

```bash
10.15.33.{19...22}
```

:::warning
本文采用顺序 IP 写法。如果磁盘路径命名不规则，则不要套用范围展开，而应直接把实际路径逐项写入 `MINIO_VOLUMES`。
:::

### 0x02.确认网络、端口和时间同步

- 所有节点之间必须具备双向网络访问能力。
- 4 个节点的 MinIO 服务端口必须保持一致，本文约定 S3 API 使用 `9000`、控制台使用 `9001`。
- 若启用了防火墙，需放行 `9000/tcp` 和 `9001/tcp`。
- 所有节点必须同步到同一时间源，避免节点间时间漂移。

```bash
firewall-cmd --permanent --zone=public --add-port=9000/tcp
firewall-cmd --permanent --zone=public --add-port=9001/tcp
firewall-cmd --reload
```

```bash
timedatectl status
```

:::tip
MinIO 官方建议在集群前增加负载均衡器或反向代理，且使用 `least_conn` 等最少连接算法分发请求。
:::

### 0x03.规划数据盘

- 使用本地直连数据盘，不使用 NFS、NAS、SAN 等共享存储。
- 数据盘建议使用 `xfs` 文件系统。
- 同一个集群中的数据盘类型、容量尽量保持一致。
- 数据盘在首次启动 MinIO 前应保持空目录。
- 提供给 MinIO 的数据目录必须由 MinIO 独占使用，不允许手工删改底层对象文件。

### 0x04.创建minio用户

```bash
groupadd minio
useradd -g minio minio -s /sbin/nologin
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

```bash
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

先写入公共配置，`MINIO_VOLUMES` 在后续按具体拓扑补充：

```vim
# 设置控制台的账号及密码
MINIO_ROOT_USER=myminioadmin
MINIO_ROOT_PASSWORD=<password>

# 设置控制台对外访问地址，需替换为实际 VIP 或域名，并与 Nginx 代理入口保持一致
#MINIO_BROWSER_REDIRECT_URL="https://minio-admin.internal-domain.com"

# 设置9000为文件访问端口，9001为内嵌控制台页面访问端口
MINIO_OPTS="--address :9000 --console-address :9001"
```

:::tip
4 个节点上的 `minio.conf` 内容应保持一致，只需根据本文选择的磁盘拓扑填写对应的 `MINIO_VOLUMES`。
:::

## 三、使用Systemd管理进程

:::warning
- minio.service 执行文件需构建在 `/etc/systemd/system` 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.编辑 minio.service 内容

```bash
vim /etc/systemd/system/minio.service
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

### 0x02.重新加载systemctl配置文件

```bash
systemctl daemon-reload
```

## 四、四节点单盘部署

### 0x01.在每个节点创建数据目录

```bash
mkdir -p /data/minio
chown -R minio:minio /data/minio
```

### 0x02.写入单盘场景的 minio.conf

在 4 个节点的 `/usr/local/minio2504/minio.conf` 中统一写入以下内容：

```vim
MINIO_ROOT_USER=myminioadmin
MINIO_ROOT_PASSWORD=<password>

MINIO_VOLUMES="http://10.15.33.{19...22}:9000/data/minio"

#MINIO_BROWSER_REDIRECT_URL="https://minio-admin.internal-domain.com"

MINIO_OPTS="--address :9000 --console-address :9001"
```

:::tip
单盘场景下，4 个节点共提供 4 个存储路径，`MINIO_VOLUMES` 采用一行顺序展开表达式即可。
:::

### 0x03.设置开机自启并启动

在 4 个节点上执行：

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

启动完成后，任一节点的 `systemctl status minio` 输出中都应能看到 `S3-API` 与 `Console` 地址。

## 五、四节点双盘部署

### 0x01.在每个节点创建数据目录

```bash
mkdir -p /data1/minio /data2/minio
chown -R minio:minio /data1/minio /data2/minio
```

### 0x02.写入双盘场景的 minio.conf

在 4 个节点的 `/usr/local/minio2504/minio.conf` 中统一写入以下内容：

```vim
MINIO_ROOT_USER=myminioadmin
MINIO_ROOT_PASSWORD=<password>

MINIO_VOLUMES="http://10.15.33.{19...22}:9000/data{1...2}/minio"

#MINIO_BROWSER_REDIRECT_URL="https://minio-admin.internal-domain.com"

MINIO_OPTS="--address :9000 --console-address :9001"
```

:::warning
如果现网挂载命名不是顺序形式，例如 `/data/minio` 和 `/data2/minio`，则不要套用 `/data{1...2}/minio` 的写法，而应直接把实际路径逐项写入 `MINIO_VOLUMES`。
:::

示例：

```vim
MINIO_VOLUMES="http://10.15.33.19:9000/data/minio http://10.15.33.19:9000/data2/minio http://10.15.33.20:9000/data/minio http://10.15.33.20:9000/data2/minio http://10.15.33.21:9000/data/minio http://10.15.33.21:9000/data2/minio http://10.15.33.22:9000/data/minio http://10.15.33.22:9000/data2/minio"
```

### 0x03.设置开机自启并启动

在 4 个节点上执行：

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

## 六、配置Nginx转发

:::tip
- 此配置应放在代理服务器或负载均衡器所在主机上，而不是 MinIO 节点本机
- 本文采用 API 与控制台分域名的方式对外暴露
- 本文对外访问示例统一按 HTTPS 编写，证书路径请替换为生产环境实际值
- `oss.internal-domain.com` 和 `minio-admin.internal-domain.com` 仅为占位示例，部署时需替换为实际 VIP 或域名
- MinIO 官方推荐使用 `least_conn` 等最少连接算法分发客户端请求
:::

### 0x01.配置 upstream

```vim
upstream minio_s3 {
    least_conn;
    server 10.15.33.19:9000;
    server 10.15.33.20:9000;
    server 10.15.33.21:9000;
    server 10.15.33.22:9000;
}

upstream minio_console {
    least_conn;
    server 10.15.33.19:9001;
    server 10.15.33.20:9001;
    server 10.15.33.21:9001;
    server 10.15.33.22:9001;
}
```

### 0x02.服务器 S3 API

:::warning
S3 API 签名计算算法不支持通过子路径代理 MinIO 服务器 API，因此不允许使用 `https://oss.internal-domain.com/s3/` 这类访问方式。`oss.internal-domain.com` 需替换为实际 VIP 或域名。
:::

```vim
server {
    listen 443 ssl http2;
    server_name oss.internal-domain.com;

    ssl_certificate      /usr/local/nginx{version}/conf/cert/oss.internal-domain.com.pem;
    ssl_certificate_key  /usr/local/nginx{version}/conf/cert/oss.internal-domain.com.key;

    ignore_invalid_headers off;
    client_max_body_size 0;
    proxy_buffering off;
    proxy_request_buffering off;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        chunked_transfer_encoding off;
        proxy_pass http://minio_s3;
    }
}
```

### 0x03.无独立 OSS 域名时的团队兼容方案

:::warning
该方案仅适用于没有独立 `oss.*` 域名、但已有业务域名可复用 `/oss/` 路由的场景。这是团队兼容方案，不是 MinIO 官方推荐方案，仅用于对象访问、下载、预览等 `/bucket/object` 路径，不承诺完整 S3 API 能力。
:::

:::tip
- 外部访问示例：`https://业务域名/oss/<bucket-name>/<object-key>`
- `request url host` 固定使用 `10.15.33.19:9000`
- `/oss/` 兼容方案仅针对对象访问路径，不等价于把完整 S3 API 挂到子路径上
:::

```vim
location ^~ /oss/ {
    rewrite ^/oss/(.*)$ /$1 break;

    proxy_set_header Host 10.15.33.19:9000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_connect_timeout 300;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    chunked_transfer_encoding off;
    proxy_pass http://minio_s3;
}
```

:::warning
该兼容入口不要用于 `mc`、服务端 SDK endpoint、桶管理接口、预签名上传或其他完整 S3 API 场景。上传、预签名、桶操作仍应使用直连 API 地址或独立 API 域名。
:::

### 0x04.控制台的 Web GUI

:::warning
控制台与 S3 API 必须使用不同域名，且 `MINIO_BROWSER_REDIRECT_URL` 必须与控制台的对外访问地址保持一致。`minio-admin.internal-domain.com` 需替换为实际 VIP 或域名。
:::

```vim
server {
    listen 443 ssl http2;
    server_name minio-admin.internal-domain.com;

    ssl_certificate      /usr/local/nginx{version}/conf/cert/minio-admin.internal-domain.com.pem;
    ssl_certificate_key  /usr/local/nginx{version}/conf/cert/minio-admin.internal-domain.com.key;

    ignore_invalid_headers off;
    client_max_body_size 0;
    proxy_buffering off;
    proxy_request_buffering off;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-NginX-Proxy true;
        real_ip_header X-Real-IP;

        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        chunked_transfer_encoding off;
        proxy_pass http://minio_console/;
    }
}
```

## 七、访问路径

### 0x01.节点直连地址

- 任一节点的 S3 API：`http://10.15.33.19:9000`
- 任一节点的控制台：`http://10.15.33.19:9001`

其余节点按同样规律替换 IP 即可：

- `http://10.15.33.20:9000`
- `http://10.15.33.21:9000`
- `http://10.15.33.22:9000`
- `http://10.15.33.20:9001`
- `http://10.15.33.21:9001`
- `http://10.15.33.22:9001`

### 0x02.对外访问入口

以下域名仅为占位示例，部署时需替换为实际 VIP 或域名：

- S3 API 对外入口：`https://oss.internal-domain.com`
- 控制台对外入口：`https://minio-admin.internal-domain.com`

### 0x03.业务域名 /oss 路由访问示例

- 对象访问示例：`https://业务域名/oss/<bucket-name>/<object-key>`
- 请求 `Host` 固定示例：`10.15.33.19:9000`

:::tip
这是对象访问兼容入口，不是 MinIO 标准 S3 API 根入口。请勿把 `https://业务域名/oss` 用作 `mc` 或服务端 SDK 的 endpoint。
:::

### 0x04.桶和对象访问示例

- 桶根路径：`https://oss.internal-domain.com/<bucket-name>/`
- 对象路径：`https://oss.internal-domain.com/<bucket-name>/<object-key>`

:::tip
如果应用系统需要生成预签名上传或下载地址，建议统一使用 S3 API 的对外入口域名，不要混用控制台域名。
:::

## 八、常用命令与验证

### 0x01.查看 MinIO 版本号

```bash
/usr/local/minio2504/bin/minio -v
```

### 0x02.查看服务状态

```bash
systemctl status minio
```

### 0x03.查看实时日志

```bash
journalctl -f -u minio
```

### 0x04.登录控制台验证

通过浏览器访问：

```text
https://minio-admin.internal-domain.com
```

使用 `MINIO_ROOT_USER` 和 `MINIO_ROOT_PASSWORD` 登录后，可在页面中确认节点与磁盘状态。若实际环境未使用该域名，请替换为真实 VIP 或域名。

### 0x05.使用 mc 验证 API 访问

```bash
mc alias set minio-cluster https://oss.internal-domain.com myminioadmin <password>
mc alias list
mc ls minio-cluster
```

其中 `https://oss.internal-domain.com` 需替换为实际对外 VIP 或域名。

如果当前环境使用自签名证书，可按需改为：

```bash
mc alias set --insecure minio-cluster https://oss.internal-domain.com myminioadmin <password>
```

### 0x06./oss 兼容入口使用限制

:::warning
- 不要把 `https://业务域名/oss` 用作 `mc alias set` 的目标地址
- 不要把 `https://业务域名/oss` 用作服务端 MinIO SDK 的 `endpoint`
- `MINIO_BROWSER_REDIRECT_URL` 继续保持控制台域名逻辑，不与 `/oss` 兼容入口混用
- `/oss` 路由仅用于对象访问、下载、预览，不覆盖桶操作、管理接口和完整 S3 API
:::

## 参考资料

- [安装和部署 MinIO](https://min-io.cn/docs/minio/linux/operations/installation.html)
- [部署 MinIO：多节点多驱动器](https://min-io.cn/docs/minio/linux/operations/install-deploy-manage/deploy-minio-multi-node-multi-drive.html)
- [为 MinIO 服务器配置 NGINX 代理](https://min-io.cn/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html)
- [MinIO 控制台设置](https://min-io.cn/docs/minio/linux/reference/minio-server/settings/console.html)
