# Canal RabbitMQ QuickStart

## 1.RabbitMQ配置

- virtual host：project_name_canal
- exchange：canal.demodb.topic
- queue：canal.demodb.biz.queue
- Routing Key：canal.demodb.biz.routingkey
  
:::tip
- project_name：项目名
- demodb：数据库名
- biz：业务标识，如 news、activity、coupon 等。
:::

### 0x01.新增Virtual Host

创建名为 project_name_canal 的 virtual host。

![](/images/middleware/canal/rabbitmq-virtual-host.png)

### 0x02.新增Exchange

创建名为 canal.demodb.topic 的 exchange。

![](/images/middleware/canal/rabbitmq-exchange.png)

### 0x03.新增Queue

创建名为 canal.demodb.biz.queue 的 queue。

![](/images/middleware/canal/rabbitmq-queue.png)

### 0x04.新增Routing Key

创建名为 canal.demodb.biz.routingkey 的 Routing Key。

::: el-tabs

--- el-tab-item Exchange详情创建
![](/images/middleware/canal/rabbitmq-exchanges-routingkey.png)
---

--- el-tab-item Queue详情创建
![](/images/middleware/canal/rabbitmq-queues-routingkey.png)
---

:::

## 2.Canal Admin Guide

### 0x01.Server配置

![](/images/middleware/canal/node-servers-config.png)

修改如下配置
```yml
# tcp, kafka, rocketMQ, rabbitMQ, pulsarMQ
canal.serverMode = rabbitMQ

##################################################
######### 		    RabbitMQ	     #############
##################################################
rabbitmq.host = 10.1.0.41
rabbitmq.virtual.host = project_name_canal
rabbitmq.exchange = canal.demodb.topic
rabbitmq.username = <username>
rabbitmq.password = <password>
rabbitmq.deliveryMode = topic
rabbitmq.queue= canal.demodb.biz.queue
```

### 0x01.Instance配置

新建 biz-to-rabbitmq 实例（需载入模板）

```yml
# position info
canal.instance.master.address=10.1.0.41:3306

# username/password
canal.instance.dbUsername=canal
canal.instance.dbPassword=<password>

# mq config
canal.mq.topic=canal.demodb.biz.routingkey
```

## 3.验证

### 0x01.Management UI

删除数据库中某个表的数据，通过 RabbitMQ Web 控制台查看。

![](/images/middleware/canal/rabbitmq-queues.png)
