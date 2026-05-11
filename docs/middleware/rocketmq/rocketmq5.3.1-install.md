# Rocketmq 5.3.1 单节点安装部署

- [官方文档](https://rocketmq.apache.org/zh/docs/quickStart/01quickstart/)

## RocketMQ安装

### 下载安装包
![RocketMQ下载](/public/docs/middleware/rocketmq/rocketmq5.3.1-download.png)
::: tip
- 服务器提前安装JDK8及以上版本，建议JDK8，JDK11，JDK17。
:::

```bash
    cd /usr/local/src
    wget https://archive.apache.org/dist/rocketmq/5.3.1/rocketmq-all-5.3.1-bin-release.zip
    unzip rocketmq-all-5.3.1-bin-release.zip
    cp -r rocketmq-all-5.3.1-bin-release /usr/local/rocketmq5.3
````

### 修改虚拟机内存

::: tip
- RocketMQ 5.3 及以上版本需要JDK8及以上版本支持，建议JDK8，JDK11，JDK17；
- RocketMQ 默认的虚拟机内存较大，启动 Broker 或者 NameServer 可能会因为内存不足而导致失败，需要根据实际情况修改修改Broker和NameServer的虚拟机内存。
:::

::: tabs

=== runbroker.sh

```bash
    cd /usr/local/rocketmq5.3/bin
    vim runbroker.sh
```

```shell
    # 大概位于103行左右
    JAVA_OPT="${JAVA_OPT} -server -Xms2g -Xmx2g"
```

=== runserver.sh

```bash
    cd /usr/local/rocketmq5.3/bin
    vim runserver.sh
```

```shell
    # 大概位于89行左右
    JAVA_OPT="${JAVA_OPT} -server -Xms2g -Xmx2g -Xmn1g -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```

:::

### 启动RocketMQ
```bash
    cd /usr/local/rocketmq5.3/bin
    # 启动NameServer
    sh mqnamesrv
    # 后台启动
    nohup sh mqnamesrv &
    # 查看日志
    tail -f ~/logs/rocketmqlogs/namesrv.log
    
    # 启动Broker
    sh mqbroker -n 127.0.0.1:9876 
    # 后台启动
    nohup sh mqbroker -n localhost:9876 &
    #指定配置文件启动
    nohup sh mqbroker -c /usr/local/rocketmq5.3/conf/broker.conf
    # 查看日志
    tail -f ~/logs/rocketmqlogs/broker.log
````

### 关闭RocketMQ
```bash
    cd /usr/local/rocketmq5.3/bin
    # 关闭NameServer
    sh mqshutdown namesrv
    # 关闭Broker
    sh mqshutdown broker
````

### 查看RocketMQ 是否注册成功
```bash
    sh mqadmin clusterList -n 172.17.143.220:9876
````


### 使用Systemd管理进程

#### rocketmq-namesrv.service
```bash
    vim /etc/systemd/system/rocketmq-namesrv.service
```

```vim
[Unit]
Description=RocketMQ Name Server
After=network.target syslog.target

[Service]
Type=simple
WorkingDirectory=/usr/local/rocketmq5.3
Environment=JAVA_HOME=/usr/local/jdk8
Environment="PATH=/usr/local/jdk8/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
ExecStart=/usr/local/rocketmq5.3/bin/mqnamesrv
ExecStop=/usr/local/rocketmq5.3/bin/mqshutdown namesrv
Restart=always
RestartSec=5
LimitNOFILE=65536
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
    # 重新加载配置文件```
    systemctl daemon-reload
    # 设置开机启动
    systemctl enable rocketmq-namesrv
    # 启动服务
    systemctl start rocketmq-namesrv
    # 查看服务状态
    systemctl status rocketmq-namesrv
    # 停止服务
    systemctl stop rocketmq-namesrv
    # 重启服务
    systemctl restart rocketmq-namesrv
```
`
#### broker.conf和rocketmq-broker.service

##### broker.conf

```vim
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.


#所属集群名字
brokerClusterName=DefaultCluster

#broker名字，注意此处不同的配置文件填写的不一样，如果在broker-a.properties使用:broker-a,
#在broker-b.properties使用:broker-b
brokerName=broker-a

#0 表示Master，>0 表示Slave
brokerId=0

#nameServer地址，分号分割
#namesrvAddr=rocketmq-nameserver1:9876;rocketmq-nameserver2:9876
namesrvAddr=192.168.1.41:9876

#启动IP,如果 docker 报 com.alibaba.rocketmq.remoting.exception.RemotingConnectException: connect to <192.168.0.120:10909> failed
# 解决方式1 加上一句producer.setVipChannelEnabled(false);，解决方式2 brokerIP1 设置宿主机IP，不要使用docker 内部IP
brokerIP1=192.168.1.41

#在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums=4

#是否允许 Broker 自动创建Topic，建议线下开启，线上关闭 ！！！这里仔细看是false，false，false
#原因下篇博客见~ 哈哈哈哈
autoCreateTopicEnable=true

#是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true

#Broker 对外服务的监听端口
listenPort=10911

#删除文件时间点，默认凌晨4点
deleteWhen=04

#文件保留时间，默认48小时
fileReservedTime=120

#commitLog每个文件的大小默认1G
mapedFileSizeCommitLog=1073741824

#ConsumeQueue每个文件默认存30W条，根据业务情况调整
mapedFileSizeConsumeQueue=300000

#destroyMapedFileIntervalForcibly=120000
#redeleteHangedFileInterval=120000
#检测物理文件磁盘空间
diskMaxUsedSpaceRatio=88
#存储路径
#storePathRootDir=/home/ztztdata/rocketmq-all-4.1.0-incubating/store
#commitLog 存储路径
#storePathCommitLog=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/commitlog
#消费队列存储
#storePathConsumeQueue=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/consumequeue
#消息索引存储路径
#storePathIndex=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/index
#checkpoint 文件存储路径
#storeCheckpoint=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/checkpoint
#abort 文件存储路径
#abortFile=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/abort
#限制的消息大小
maxMessageSize=4194304

#flushCommitLogLeastPages=4
#flushConsumeQueueLeastPages=2
#flushCommitLogThoroughInterval=10000
#flushConsumeQueueThoroughInterval=60000

#Broker 的角色
#- ASYNC_MASTER 异步复制Master
#- SYNC_MASTER 同步双写Master
#- SLAVE
brokerRole=ASYNC_MASTER

#刷盘方式
#- ASYNC_FLUSH 异步刷盘
#- SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH

#发消息线程池数量
#sendMessageThreadPoolNums=128
#拉消息线程池数量
#pullMessageThreadPoolNums=128
```
##### rocketmq-broker.service
```bash
    vim /etc/systemd/system/rocketmq-namesrv.service
```

```vim
[Unit]
Description=RocketMQ Broker Server
After=network.target syslog.target

[Service]
Type=simple
WorkingDirectory=/usr/local/rocketmq5.3
Environment=JAVA_HOME=/usr/local/jdk8
Environment="PATH=/usr/local/jdk8/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
ExecStart=/usr/local/rocketmq5.3/bin/mqbroker -c /usr/local/rocketmq5.3/conf/broker.conf
ExecStop=/usr/local/rocketmq5.3/bin/mqshutdown broker
Restart=always
RestartSec=5
LimitNOFILE=65536
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
    # 重新加载配置文件```
    systemctl daemon-reload
    # 设置开机启动
    systemctl enable rocketmq-broker
    # 启动服务
    systemctl start rocketmq-broker
    # 查看服务状态
    systemctl status rocketmq-broker
    # 停止服务
    systemctl stop rocketmq-broker
    # 重启服务
    systemctl restart rocketmq-broker
```

### 安装RocketMQ Dashboard

#### 本地下载RocketMQ Dashboard2.1.0
::: tip 
- RocketMQ Dashboard 2.1.0 版本支持 RocketMQ 5.3.0 及以上版本
- RocketMQ Dashboard 2.1.0 版本需要 JDK11 及以上版本支持，建议 JDK11，JDK17
:::

![RocketMQ Dashboard下载](/public/docs/middleware/rocketmq/rocketmq-dashboard-2-download.png)

- [官方下载地址](https://archive.apache.org/dist/rocketmq/rocketmq-dashboard/2.1.0/)

##### 修改配置文件

```yaml
    server:
      port: 8180

    rocketmq:
      config:
        namesrv-addr: 172.17.143.220:9876
        dataPath: /tmp/rocketmq-console/data
        loginRequired: true 
    
```
##### 本地maven打包
```bash
     # 打包成功后在 target 目录下生成 rocketmq-dashboard-2.1.0.jar
     mvn clean package -Dmaven.test.skip=true
````
##### 配置用户权限文件
```bash
    mkdir -p /tmp/rocketmq-console/data
    vim /tmp/rocketmq-console/data/users.properties
```

```properties
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# This file supports hot change, any change will be auto-reloaded without Dashboard restarting.
# Format: a user per line, username=password[,N] #N is optional, 0 (Normal User); 1 (Admin)
# Define Admin
#super=admin,1
admin=PK4hFQm87NGMJwd3C2
# Define Users
#user1=user
#user2=user
```
##### 服务器启动脚本
```bash
    vim run-dashboard.sh
```

```shell
    #!/bin/bash
    
    # ============================================
    # RocketMQ Dashboard 管理脚本
    # ============================================
    
    # Java执行路径
    JAVA_BIN="/usr/local/jdk17/bin/java"
    # Jar包路径
    JAR_PATH="/data/rocketmq/rocketmq-dashboard-2.1.0.jar"
    # nohup输出日志
    LOG_FILE="./nohup.out"
    # JVM参数
    JAVA_OPTS="-Xms256M -Xmx256M -Dcom.rocketmq.sendMessageWithVIPChannel=false -Drocketmq.config.loginRequired=true"
    
    
    # 获取进程ID
    get_pid() {
        PID=$(ps -ef | grep "$JAR_PATH" | grep -v grep | awk '{print $2}')
    }
    
    # 启动服务
    start() {
        get_pid
        if [ -n "$PID" ]; then
            echo "服务已在运行 (PID: $PID)"
        else
            echo "启动服务..."
            nohup $JAVA_BIN $JAVA_OPTS -jar $JAR_PATH > $LOG_FILE 2>&1 &
            sleep 5
            get_pid
            if [ -n "$PID" ]; then
                echo "服务启动成功 (PID: $PID)"
            else
                echo "服务启动失败，请查看日志 $LOG_FILE"
            fi
        fi
    }
    
    # 停止服务
    stop() {
        get_pid
        if [ -n "$PID" ]; then
            echo "停止服务 (PID: $PID)..."
            kill -15 $PID
            sleep 5
            get_pid
            if [ -n "$PID" ]; then
                echo "强制杀掉服务 (PID: $PID)"
                kill -9 $PID
            else
                echo "服务已停止"
            fi
        else
            echo "服务未运行"
        fi
    }
    
    # 重启服务
    restart() {
        stop
        start
    }
    
    # 状态检查
    status() {
        get_pid
        if [ -n "$PID" ]; then
            echo "服务正在运行 (PID: $PID)"
        else
            echo "服务未运行"
        fi
    }
    
    # 主逻辑
    case "$1" in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        *)
            echo "用法: $0 {start|stop|restart|status}"
            exit 1
            ;;
    esac
```
```bash
    # 赋予执行权限
    chmod +x run-dashboard.sh
    # 启动服务
    ./run-dashboard.sh start
    # 停止服务
    ./run-dashboard.sh stop
    # 重启服务
    ./run-dashboard.sh restart
    # 查看服务状态
    ./run-dashboard.sh status
```

