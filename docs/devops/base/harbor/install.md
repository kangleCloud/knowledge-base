# Harbor

## Linux上Harbor部署及使用

[Harbor](https://so.csdn.net/so/search?q=Harbor&spm=1001.2101.3001.7020)是用于存储和分发Docker镜像的镜像仓库服务。

### 一、环境介绍

>- CentOS 7.9
>- Docker 26.1.4
>- docker-compose 1.18.0
>- harbor 2.13.0

>192.168.1.15（harbor所在机器）
>
>192.168.1.11（拉取harbor镜像的机器）

### 二、[安装docker/docker-compose](../../container/docker/%E5%AE%89%E8%A3%85%E6%89%8B%E5%86%8C.md)

### 三、安装Harbor

#### 1、下载

Harbor部署https访问、域名访问。在这里我们采用离线安装包的方式来安装Harbor，可以避免在线安装时网络的影响。

在页面 [Releases · goharbor/harbor · GitHub](https://github.com/goharbor/harbor/releases) ，选择最新版本 并下载：[harbor-offline-installer-v2.13.0.tgz](https://github.com/goharbor/harbor/releases/download/v2.13.0/harbor-offline-installer-v2.13.0.tgz)

```bash
cd /usr/local/src
wget https://github.com/goharbor/harbor/releases/download/v2.13.0/harbor-offline-installer-v2.13.0.tgz
tar -zxvf harbor-offline-installer-v2.14.0.tgz
```

#### 2、生成并修改配置文件

```bash
cd /usr/local/src/harbor2.13
cp harbor.yml.tmpl harbor.yml
vim harbor.yml
```

```yaml
## 改为主机ip或者域名
hostname: 127.0.0.1

## 绑定主机端口
port: 88

## admin管理员登录密码
harbor_admin_password: <PASSWORD>

## 数据卷目录
data_volume: /data/harbor

## 没有证书的话先关闭https
#https:
  # https port for harbor, default is 443
  #port: 443
  # The path of cert and key files for nginx
  #certificate: /your/certificate/path
  #private_key: /your/private/key/path
```

#### 3、创建ca证书私钥

```bash
openssl genrsa -out ca.key 4096
```

#### 4、创建服务的私钥

```bash
openssl genrsa -out lch-harbor.com.key 4096
```

```bash
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=lch-harbor.com" \
    -key lch-harbor.com.key \
    -out lch-harbor.com.csr
```

#### 5、配置DNS相关参数

```bash
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
 
[alt_names]
DNS.1=lch-harbor.com
DNS.2=lch-harbor
DNS.3=hostname
EOF
```

#### 6、配置harbor域名证书

```bash
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in lch-harbor.com.csr \
    -out lch-harbor.com.crt
```

#### 7、把证书配置到harbor和docker

```bash
cp lch-harbor.com.crt /data/cert/
cp lch-harbor.com.key /data/cert/
```

校验证书是否正常： 

```bash
openssl x509 -inform PEM -in lch-harbor.com.crt -out lch-harbor.com.cert
```

```bash
cp lch-harbor.com.cert /etc/docker/certs.d/lch-harbor.com/
cp lch-harbor.com.key /etc/docker/certs.d/lch-harbor.com/
cp ca.crt /etc/docker/certs.d/lch-harbor.com/
```

#### 8、重启docker服务

```bash
# 解决docker login 时，提示https问题
# 增加insecure-registries
vim /etc/docker/daemon.json
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
  "insecure-registries":["192.168.3.12:6007"]
}


systemctl restart docker
```

#### 9、安装

```bash
cd /usr/local/src/harbor2.13
# 在install.sh文件所在目录执行命令./install.sh即可安装Harbor，顺带安装chartmuseum以便支持chart上传：
./install.sh --with-notary --with-trivy --with-chartmuseum
# 如果安装失败，则可去掉--with-notary参数
# 停止harbor
docker-compose down -v
# 启动harbor
docker-compose up -d
```

#### 10、设置自动启动

```ini
vim /lib/systemd/system/harbor.service

[Unit]
Description=Harbor
After=docker.service systemd-networkd.service systemd-resolved.service
Requires=docker.service
Documentation=http://github.com/goharbor/harbor

[Service]
Type=simple
Restart=on-failure
RestartSec=5
ExecStart=/usr/local/bin/docker-compose -f  /home/apps/harbor/docker-compose.yml up
ExecStop=/usr/local/bin/docker-compose -f /home/apps/harbor/docker-compose.yml down

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable harbor
systemctl disable harbor
systemctl start harbor
systemctl restart harbor
systemctl stop harbor
```

#### 11、其它操作

```bash
# 停止
docker-compose stop

# 运行
docker-compose start

# 登录
docker login -u admin -p '<PASSWORD>' 192.168.3.12:6007
```

### 四、管理harbor

```bash
# linux登录docker
docker login -u admin -p '<PASSWORD>' 192.168.3.12:6007

# 拉取alpine镜像
docker pull alpine

# 给镜像打标签，注意打标签的格式为 镜像仓库名称/项目名/镜像名:版本号
docker tag docker.io/alpine:latest 192.168.3.12:6007/library/alpine:v1.1.2

# 将镜像推送至harbor
docker push 192.168.3.12:6007/library/alpine:v1.1.2
```
