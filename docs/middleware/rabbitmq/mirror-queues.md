# RabbitMQ镜像集群的搭建及配置

该文档参照[RabbitMQ 3.13 经典队列镜像](https://www.rabbitmq.com/docs/3.13/ha)编写，[<font color="red">RabbitMQ 经典队列镜像自 2021 年起已被弃用</font>](https://www.rabbitmq.com/blog/2021/08/21/4.0-deprecation-announcements)，[<font color="red">并在RabbitMQ 4.0.x 版本中完全移除</font>](https://github.com/rabbitmq/rabbitmq-server/pull/9815)。

- 操作系统：openEuler release 22.03 (LTS-SP1)
- RabbitMQ：v3.11 或 v3.12 或 v3.13
  

:::danger
修改 RabbitMQ 镜像集群的主机名会导致节点通信中断、集群分裂和镜像队列同步问题，**约定禁止在业务上线后更改主机名**。
:::

## 1.准备工作

准备三台主机，并按统一的服务器标识命名规范配置主机名。

| IP | 主机名(HOSTNAME) | 节点 | 备注
| -- | -- | -- | --
| 10.1.0.41 | Middleware-1-41 | 节点一 | --
| 10.1.0.42 | Middleware-1-42 | 节点二 | --
| 10.1.0.43 | Middleware-1-43 | 节点三 | --

修改 HOSTNAME
```bash
hostnamectl set-hostname $HOSTNAME
```
```
systemctl restart systemd-hostnamed
```

参照<a href="/docs/middleware/rabbitmq/install-3.11.html" target="_blank">单节点RabbitMQ3.11安装文档</a>分别在各节点上安装 RabbitMQ 服务。需要注意的是，在后续配置镜像集群时，会清除节点的所有数据和配置。因此，在初始安装阶段，<font color="red">请勿创建任何管理员账户</font>，待集群配置完成后再进行相关用户管理操作。

## 2.Hostname Resolution

### 0x01.节点一

配置 /etc/hosts
```bash
cat >>/etc/hosts <<EOF
10.1.0.41 Middleware-1-41
10.1.0.42 Middleware-2-42
10.1.0.43 Middleware-3-43
EOF
```

重启 RabbitMQ
```bash
systemctl restart rabbitmq-server.service
```

### 0x02.节点二

配置 /etc/hosts
```bash
cat >>/etc/hosts <<EOF
10.1.0.41 Middleware-1-41
10.1.0.42 Middleware-2-42
10.1.0.43 Middleware-3-43
EOF
```

重启 RabbitMQ
```bash
systemctl restart rabbitmq-server.service
```

### 0x03.节点三

配置 /etc/hosts
```bash
cat >>/etc/hosts <<EOF
10.1.0.41 Middleware-1-41
10.1.0.42 Middleware-2-42
10.1.0.43 Middleware-3-43
EOF
```

重启 RabbitMQ
```bash
systemctl restart rabbitmq-server.service
```

## 3.Cookie复制

### 0x01.节点二同步.erlang.cookie

将节点一的`.erlang.cookie`拉取到本地
```bash
scp root@10.1.0.41:/var/lib/rabbitmq/.erlang.cookie /var/lib/rabbitmq/
```

将 CLI tools 使用的 .erlang.cookie 保持一致
```bash
\cp /var/lib/rabbitmq/.erlang.cookie ~/
```

重启服务
```bash
systemctl restart rabbitmq-server
```

### 0x02.节点三同步.erlang.cookie

将节点一的`.erlang.cookie`拉取到本地
```bash
scp root@10.1.0.41:/var/lib/rabbitmq/.erlang.cookie /var/lib/rabbitmq/
```

将 CLI tools 使用的 .erlang.cookie 保持一致
```bash
\cp /var/lib/rabbitmq/.erlang.cookie ~/
```

重启服务
```bash
systemctl restart rabbitmq-server
```

## 4.创建集群

[为了将集群中的三个节点连接起来，需要让其中两个节点加入第三个节点的集群。在此之前，两个新加入的成员都必须重置。](https://www.rabbitmq.com/docs/3.13/clustering#creating)

:::warning
在执行`rabbitmqctl join_cluster rabbit@Middleware-1-41`命令前，必须确保目标集群节点（rabbit@Middleware-1-41）的 RabbitMQ 服务处于正常运行状态。
:::

:::tip
打印当前节点的 Node name：`rabbitmqctl status | grep name`
:::

### 0x01.重置节点一

在节点一（rabbit@Middleware-1-41）中执行
```bash
rabbitmqctl stop_app && rabbitmqctl reset && rabbitmqctl start_app
```

### 0x02.节点二加入集群

在节点二（rabbit@Middleware-2-42）中执行
```bash
rabbitmqctl stop_app && rabbitmqctl reset \
  && rabbitmqctl join_cluster rabbit@Middleware-1-41 \
  && rabbitmqctl start_app
```

### 0x03.节点三加入集群

在节点三（rabbit@Middleware-3-43）中执行
```bash
rabbitmqctl stop_app && rabbitmqctl reset \
  && rabbitmqctl join_cluster rabbit@Middleware-1-41 \
  && rabbitmqctl start_app
```

### 0x04.新建或重建管理员账户

https://www.rabbitmq.com/docs/man/rabbitmqctl.8#User_Management

`rabbitmqctl reset`命令会彻底重置 RabbitMQ 节点，删除所有持久化数据，包括用户权限、虚拟主机、队列、交换器等信息。执行该命令后，原有的管理员账户将被清除，需要重新创建。在集群环境下，管理员账户可以在任意节点创建，创建后会自动同步到集群中的其他节点。

新增管理员
:::danger 密码说明
密码长度不少于12位的随机字符串，且必须包含大小写字母、数字及特殊符号。约定特殊符号不包含`!`。
:::
```bash
rabbitmqctl add_user admin <password>
```

设置管理员角色
```bash
rabbitmqctl set_user_tags admin administrator
```

为管理员用户进行添加 /（vhost）中所有资源的配置、写、读权限
```bash
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

## 5.设置队列镜像策略

### 0x01.命令行

任意节点执行

```bash
rabbitmqctl set_policy ha-all "^" '{"ha-mode":"all","ha-sync-mode":"automatic"}'
```

:::tip
- `ha-all`：策略名称，表示这是一个将所有队列设置为高可用的策略。
- `"ha-mode":"all"`：高可用模式，表示队列将被镜像到集群中的所有节点。
- `"ha-sync-mode":"automatic"`：镜像队列的同步模式，新加入的镜像会自动同步现有队列的内容。
:::

### 0x02.Management UI

在Web控制台中配置队列镜像策略，图中红框标识的策略是通过命令行方式创建的。

## 6.验证集群

### 0x01.命令行

在任意节点执行

```bash
rabbitmqctl cluster_status
```

### 0x02.Management UI

浏览器访问任意节点的 Management UI（地址示例：http://{$IP}:15672/）

新建一个测试队列，查看详情

## 7.附录

### 0x01.Erlang Cookie

[RabbitMQ 节点和 CLI 工具（例如rabbitmqctl）使用 Cookie 来确定它们是否允许彼此通信。两个节点要能够通信，必须拥有相同的共享密钥，称为 Erlang Cookie。](https://www.rabbitmq.com/docs/3.13/clustering#erlang-cookie)

[在 UNIX 系统上，Cookie 通常位于/var/lib/rabbitmq/.erlang.cookie（由服务器使用）和$HOME/.erlang.cookie（由 CLI 工具使用）。](https://www.rabbitmq.com/docs/3.13/clustering#linux-macos-bsd)

:::warning
服务器与 CLI 工具使用的 .erlang.cookie 要保持一致。
:::


如下命令可以打印 Erlang Cookie 文件的绝对路径，但是并没有找到相应的文件，<font color="red">原因未知</font>。
```bash
erl
```

```Erlang Shell
io:format("Cookie path: ~s~n", [filename:absname(".erlang.cookie")]).

```

:::tip 输出如下内容
Cookie path: /usr/local/rabbitmq_server3.11/var/lib/rabbitmq/mnesia/.erlang.cookie

ok
::: 

### 0x02.参考资料

- https://www.rabbitmq.com/docs/3.13/ha
- https://www.rabbitmq.com/docs/3.13/clustering
- https://blog.csdn.net/ory001/article/details/121537963
- https://blog.csdn.net/suixinfeixiangfei/article/details/133563551
- https://www.cnblogs.com/zhoutuo/p/18720135
- https://developer.aliyun.com/article/988115
