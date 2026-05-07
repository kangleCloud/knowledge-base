> **版本号：v1.0**

> **适用范围：** 公司所有基于 Spring Boot 的消息队列开发项目


> **作者:** 陆文敏

> **编写目的：**

- > 规范 RabbitMQ 的使用方式

- > 统一项目中 vhost、Exchange、Queue、RoutingKey 的命名规则

- > 提高可维护性与可追踪性

- > 确保延迟队列、消息可靠性机制正确实现

## **一、基础设计规范**

### **1. vhost 命名规则**

| **环境** | **命名示例** | **说明**      |
| -------- | ------------ | ------------- |
| 测试环境 | rcbt-test    | $项目名-$环境 |
| 预生产   | rcbt-pre     | $项目名-$环境 |
| 生产环境 | rcbt-prod    | $项目名-$环境 |

> ✅ **说明：**

> 每个项目环境独立 vhost，确保消息隔离，方便权限管理与监控。

### **2. Exchange 命名规范**

| **类型**     | **命名示例**               | **说明**         |
| ------------ | -------------------------- | ---------------- |
| 业务主交换机 | youth.apply.exchange       | 对应业务领域命名 |
| 延迟交换机   | youth.apply.delay.exchange | 对应延迟处理场景 |
| 死信交换机   | youth.apply.dlx.exchange   | 用于处理异常消息 |

> ✅ 命名结构建议：{业务}.{模块}.{用途}.exchange

> 如：rcbt.user.register.exchange

### **3. Queue 命名规范**

| **类型** | **命名示例**                 | **说明**               |
| -------- | ---------------------------- | ---------------------- |
| 业务队列 | youth.apply.auto.check.queue | 正常消费队列           |
| 延迟队列 | youth.apply.delay.queue      | 延迟消息处理           |
| 死信队列 | youth.apply.dlx.queue        | 消费失败重试或入库分析 |

> ✅ 建议结构：{业务}.{模块}.{用途}.queue

### **4. RoutingKey 命名规范**

| **类型** | **命名示例**                 | **说明**       |
| -------- | ---------------------------- | -------------- |
| 业务路由 | youth.apply.auto.check       | topic 模式常用 |
| 延迟路由 | youth.apply.auto.check.delay | 延迟消息绑定   |
| 死信路由 | youth.apply.auto.check.dlx   | 死信绑定使用   |

> ✅ 建议结构：{业务}.{模块}.{用途}

## **二、Exchange 类型与使用场景**

| **类型**            | **描述**           | **使用场景**         | **示例**             |
| ------------------- | ------------------ | -------------------- | -------------------- |
| **direct**          | 精确路由匹配       | 点对点通信           | 用户注册消息         |
| **topic**           | 通配符路由匹配     | 模块解耦、灵活订阅   | 不同模块消费同类事件 |
| **fanout**          | 广播消息           | 系统级广播、通知推送 | 刷新缓存、配置更新   |
| **headers**         | 基于 header 的路由 | 特殊控制场景         | 少用                 |
| **delayed**（插件） | 支持消息延迟       | 定时任务、延时审核   | 消息延迟触发处理     |

> ⚙️ **建议默认使用 topic 类型**，结合延迟插件完成绝大多数业务。

## **三、Spring Boot 集成规范**

### **1. 依赖配置**

```xml
<dependency>
    <groupId>org.springframework.amqp</groupId>
    <artifactId>spring-rabbit</artifactId>
</dependency>
```

### **2. 基础配置（**application.yml**）**

```yaml
spring:
  rabbitmq:
    host: mq.xxx.internal
    port: 5672
    username: rcbt_user
    password: <PASSWORD>
    virtual-host: rcbt-test
```

## **四、消息发送工具类**

```java
@Component
@Slf4j
public class RabbitMqUtil {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /** 普通消息发送 **/
    public void sendMessage(String message, String exchange, String routeKey) {
        if (StringUtils.isEmpty(message)) {
            throw new ServiceException(ResultCode.MESSAGE_QUEUE_FAILED);
        }
        String messageId = UUID.randomUUID().toString();
        log.info("消息入队列 message id:{}, exchange:{}, routeKey:{}, message:{}",
                messageId, exchange, routeKey, message);
        CorrelationData correlationData = new CorrelationData(messageId);
        rabbitTemplate.convertAndSend(exchange, routeKey, message, correlationData);
    }

    /** 延迟消息发送 **/
    public void sendTtlMessage(String message, String exchange, String routeKey, Integer delaySeconds) {
        if (StringUtils.isEmpty(message)) {
            throw new ServiceException(ResultCode.MESSAGE_QUEUE_FAILED);
        }
        String messageId = UUID.randomUUID().toString();
        log.info("消息入延迟队列 message id:{}, exchange:{}, routeKey:{}, delay:{}, message:{}",
                messageId, exchange, routeKey, delaySeconds, message);
        CorrelationData correlationData = new CorrelationData(messageId);
        rabbitTemplate.convertAndSend(exchange, routeKey, message, msg -> {
            msg.getMessageProperties().setDelay(delaySeconds * 1000);
            return msg;
        }, correlationData);
    }
}
```

## **五、消费者使用规范**

```
@RabbitListener(bindings = @QueueBinding(
        value = @Queue(value = QueueConstant.YOUTH_APPLY_AUTO_CHECK_QUEUE, durable = "true"),
        exchange = @Exchange(name = QueueConstant.YOUTH_APPLY_AUTO_CHECK_EXCHANGE, 
                             type = "topic", 
                             ignoreDeclarationExceptions = "true", 
                             delayed = "true"),
        key = QueueConstant.YOUTH_APPLY_AUTO_CHECK_ROUTE_KEY
), concurrency = "1")
@RabbitHandler
public void autoCheck(String message) {
    try {
        log.info("青年人才-申请记录自动审核接收消息：{}", message);
        youthTalentApplicationService.autoCheck(message);
    } catch (Exception e) {
        log.warn("青年人才-申请记录自动处理消息失败，失败信息：{}，消息：{}", e.getMessage(), message);
        // TODO: 可添加重试或死信队列逻辑
    }
}
```

> ✅ 建议：

- > **并发数**根据业务场景设置（默认 1，防止重复消费）

- > 异常需记录日志并考虑重试或死信策略

- > 队列命名统一从 QueueConstant 常量中引用

## **🧱 结构概览**

Spring AMQP 提供了层次化注解结构来**一次性声明并绑定**队列、交换机、路由键：

| **注解**        | **作用**                       |
| --------------- | ------------------------------ |
| @RabbitListener | 声明一个消费者监听器           |
| @QueueBinding   | 声明队列与交换机之间的绑定关系 |
| @Queue          | 声明队列属性                   |
| @Exchange       | 声明交换机属性                 |

## **🔍 参数逐一说明**

### **1️⃣** **@RabbitListener(bindings = …)**

> 作用：声明一个监听器容器，绑定一个或多个 @QueueBinding。

**核心功能：**

- 让 Spring 自动创建消息监听容器；
- 当有消息进入绑定的队列时，自动调用被注解的方法；
- 支持并发消费、手动确认、消息转换等特性。

**常见属性：**

| **属性**    | **类型**        | **说明**                                        |
| ----------- | --------------- | ----------------------------------------------- |
| bindings    | @QueueBinding[] | 队列绑定配置                                    |
| concurrency | String          | 并发消费者数量，例如 "1-5" 表示最少1个、最大5个 |
| ackMode     | AcknowledgeMode | 手动确认(MANUAL)、自动确认(AUTO)等              |

### **2️⃣** **@QueueBinding**

> 作用：定义一个绑定关系，连接一个队列 (@Queue) 和一个交换机 (@Exchange)，并指定路由键。

**常见属性：**

| **属性** | **类型**  | **说明**               |
| -------- | --------- | ---------------------- |
| value    | @Queue    | 绑定的队列定义         |
| exchange | @Exchange | 绑定的交换机定义       |
| key      | String[]  | 绑定路由键，可以是多个 |

### **3️⃣** **@Queue**

| **属性**   | **类型**             | **说明**                                            |
| ---------- | -------------------- | --------------------------------------------------- |
| value      | String               | 队列名称                                            |
| durable    | String（或 boolean） | 是否持久化队列。true 表示 RabbitMQ 重启后队列仍存在 |
| exclusive  | String               | 是否为排他队列，只能被当前连接使用                  |
| autoDelete | String               | 当没有消费者时是否自动删除                          |
| arguments  | Argument[]           | 队列附加参数（如TTL、死信队列、最大长度等）         |

### **4️⃣** **@Exchange**

> 定义交换机的基础属性。

| **属性**                    | **类型** | **说明**                                                     |
| --------------------------- | -------- | ------------------------------------------------------------ |
| name                        | String   | 交换机名称                                                   |
| type                        | String   | 交换机类型，常见取值如下： - "direct"：路由键精确匹配 - "topic"：支持通配符匹配 - "fanout"：广播模式，忽略路由键 - "headers"：按消息头属性匹配 |
| durable                     | String   | 是否持久化交换机                                             |
| autoDelete                  | String   | 是否自动删除                                                 |
| ignoreDeclarationExceptions | String   | 若声明已存在则忽略异常（防止启动时重复声明报错）             |
| delayed                     | String   | 是否启用 **延迟消息插件支持**（x-delayed-message 类型交换机） |

📘 含义说明：

- type = "topic"

  → 采用 **主题路由**，支持通配符（如 "user.*"、"order.#"）；

- ignoreDeclarationExceptions = "true"

  → 若交换机已存在，不会因声明冲突导致启动失败；

- delayed = "true"

  → 启用延迟队列功能，要求安装 RabbitMQ 的 **延迟消息插件**。

### **5️⃣** **key**

> 定义当前绑定的路由键（routing key）。

在 topic 类型交换机中：

- "order.*" 表示匹配一层；
- "order.#" 表示匹配任意层；
- "order.create" 表示精确匹配。

## **🧠 组合逻辑总结**

| **角色**              | **含义**               | **本例对应**                     |
| --------------------- | ---------------------- | -------------------------------- |
| Exchange（交换机）    | 消息的分发中心         | YOUTH_APPLY_AUTO_CHECK_EXCHANGE  |
| Queue（队列）         | 消息的存储通道         | YOUTH_APPLY_AUTO_CHECK_QUEUE     |
| Routing Key（路由键） | 决定消息投递路径       | YOUTH_APPLY_AUTO_CHECK_ROUTE_KEY |
| Binding               | 队列与交换机的连接关系 | @QueueBinding 声明               |

消息流动路径如下：

```
生产者 → 交换机 → (根据 routeKey 匹配) → 队列 → 消费者(@RabbitListener)
```

## **🧩 总结性理解**

这段注解配置的功能：

- 声明了一个 **持久化队列**；
- 声明了一个 **支持延迟消息的 topic 交换机**；
- 使用指定的 **路由键** 进行绑定；
- 定义了一个 **消费者方法**，当有匹配消息时自动触发。



## **六、延迟队列插件（x-delayed-message）**

### **1. 插件安装（由运维支持）**

RabbitMQ 插件路径：

```
rabbitmq_delayed_message_exchange
```

## **七、开发实践建议**

| **场景**               | **推荐模型**   | **说明**     |
| ---------------------- | -------------- | ------------ |
| 用户注册、下单、发票   | direct / topic | 精准路由     |
| 异步任务（通知、日志） | topic          | 模块解耦     |
| 延迟任务（订单超时）   | delayed plugin | 延时触发     |
| 广播通知（缓存刷新）   | fanout         | 所有服务接收 |
| 异常消息（重试）       | 死信队列       | 持久化分析   |

## **八、总结**

✅ **RabbitMQ 使用准则核心要点：**

1. 命名清晰、结构化
2. 业务逻辑与 MQ 解耦
3. 延迟消息统一用插件方案
4. 消费幂等与错误处理完整
5. 结合日志追踪与监控，确保消息链可追溯
