# Docker Installation and Usage on Linux By yum

## Linux上Docker部署及使用

### 一、环境准备

>- CentOS 7.9
>- Docker 26.1.4
>- docker-compose 1.18.0

### 二、卸载已有docker

```bash
yum remove -y docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
```

或者

```bash
sudo yum remove docker \
docker-common \
container-selinux \
docker-selinux \
docker-engine
```

> 卸载docker后,/var/lib/docker/目录下会保留原Docker的镜像,网络,存储卷等文件. 如果需要全新安装Docker,需要删除/var/lib/docker/目录
>
> ```bash
> rm -rf /var/lib/docker/
> ```

### 三、安装docker

#### 3.1 配置docker yum源

```bash
# 查看是否已安装了docker，未安装则查询不出结果
yum list installed | grep docker
# 使用yum安装yum-utils工具包
yum install -y yum-utils
# 设置国内的阿里云镜像仓库
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

配置docker镜像源地址：

```bash
tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://1nj0zren.mirror.aliyuncs.com",
        "https://docker.mirrors.ustc.edu.cn",
        "http://f1361db2.m.daocloud.io",
        "https://registry.docker-cn.com"
    ]
}
EOF

systemctl daemon-reload
```

#### 3.2 安装docker及其常用命令

##### 安装docker

```bash
# 查看所有可用的docker版本:
yum list docker-ce --showduplicates | sort -r

yum -y install  docker-ce-26.1.4-1.el7

docker version

# 安装docker命令补全工具：
yum install -y bash-completion

```

##### docker服务

```bash
# 查看docker服务状态
systemctl status docker
# 启动docker服务
systemctl start docker
# 重启docker服务
systemctl restart docker
# 停止docker服务
systemctl stop doceker
# 开机docker开机自启
systemctl enable docker
# 关闭docker开机自启
systemctl disable docker
```

##### docker常用命令

```bash
# 查找应用
docker search rabbitmq
# 拉取镜像
docker pull rabbitmq
# 查看镜像
docker images
# 删除镜像
docker rmi [IMAGE ID]
#查看启动的容器
docker ps -a
# 启动docker
docker start [IMAGE]/[name]
# 停止docker
docker stop [IMAGE]/[name]
# 删除docker
docker rm [IMAGE]/[name]
# 查看日志
docker logs [name]
# 进入docker容器
docker exec -it [容器id或容器名] /bin/bash
# 退出容器到宿主机：
exit
# 修改镜像名称
docker tag 原镜像名称 新镜像名称
docker inspect [容器id或容器名]
# docker登录
docker login -u admin -p '<PASSWORD>' 192.168.3.12:6007
# docker退出
docker logout 192.168.3.12:6007
```

###### docker update

```bash
# 更新启动方式
docker update [容器名] --restart=no/on-failure/always
# 更新容器分配内存
docker update [容器名] -m 3g  --memory-swap -1
docker run  -e TZ="Asia/Shanghai" -p 8090:8090 -d --name ch ch/ch
```

###### docker创建和启动

```bash
docker run \
-d \
--name rabbitmq \
-p 5672:5672 \
-p 15672:15672 \
-m 2g \
--memory-swap -1 \
-v $(pwd)/data:/var/lib/rabbitmq \
--hostname myRabbit \
-e RABBITMQ_DEFAULT_VHOST=my_vhost  \
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=admin \
[IMAGE ID]

$(pwd)是docker支持的指定当前目录的方法

-d：后台运行容器
--name：指定容器名
-p：端口映射。（运行之后必须与机器的端口进行映射，否则访问不到）
-v：映射目录或文件，本地目录:容器目录
--hostname：主机名（RabbitMQ的一个重要注意事项是它根据所谓的 “节点名称” 存储数据，默认为主机名）
-e：指定环境变量。（RABBITMQ_DEFAULT_VHOST：默认虚拟机名；RBBITQ_DEFAULT_USER：默认的用户名；RABBITMQ_DEFAULT_PASS：认用户名密码）
--restart=always	容器重启策略(重启docker时，自动启动相关容器)
--privileged=true，以特权方式启动容器，解决报错问题（Permission denied）
```

> [!NOTE]
>
> --restart
>
> - no，默认策略，在容器退出时不重启容器
> - on-failure，在容器非正常退出时（退出状态非0），才会重启容器
> - on-failure:3，在容器非正常退出时重启容器，最多重启3次
> - always，在容器退出时总是重启容器
> - unless-stopped，在容器退出时总是重启容器，但是不考虑在Docker守护进程启动时就已经停止了的容器

#### 3.3 镜像推送到harbor

- SOURCE_IMAGE 原来的镜像名称

- REPOSITORY 现在的镜像名称

  ```bash
  # 镜像下载
  docker pull nginx:1.21.3
  
  # 在项目中标记镜像
  docker tag SOURCE_IMAGE[:TAG] 192.168.3.12:6007/test/REPOSITORY[:TAG]
  docker tag nginx:1.21.3 192.168.3.12:6007/test/nginx:v1.21.9
  
  # 推送镜像到harbor
  docker push 192.168.3.12:6007/test/REPOSITORY[:TAG]
  docker push 192.168.3.12:6001/test/nginx:v1.21.9
  ```

  
