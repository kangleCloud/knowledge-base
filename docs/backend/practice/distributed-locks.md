# 分布式锁实现

### 第一部分：介绍

​        分布式锁是一种用于在分布式系统中协调多个进程或线程对共享资源的访问的机制。在实现分布式锁时，常见的两种方式是使用数据库分布式锁和基于 Redis 的分布式锁（如 Redisson）。

- **数据库分布式锁：** 使用数据库事务和锁机制，在数据库中创建专门的锁表，通过事务操作来确保锁的原子性。适用于需要跨多个业务数据的场景，但相对重量级，可能面临性能瓶颈。
- **Redisson（基于 Redis 的分布式锁）：** 利用 Redis 提供的原子性操作和内存存储，实现轻量级且高性能的分布式锁。适用于高并发、低延迟的场景，提供了更灵活的锁机制。常用于单个 Redis 实例或 Redis 集群中。

在实际项目中，常常结合使用这两种方式，以充分发挥各自的优势。通过在不同场景选择不同的分布式锁机制，可以根据业务需求平衡性能、一致性和可用性。这种组合的方式能够有效地满足复杂业务场景下的分布式锁需求，提高系统的稳定性和灵活性。



### 第二部分：单体应用锁

#### 2.1 单体应用锁

​        在讲解分布式锁之前先了解单体应用线程级别的锁，建立对并发控制的基础理解，认识在分布式环境中可能出现的并发问题。通过了解线程级别的锁，我们能够熟悉并发控制的概念、面对典型的并发问题，以及理解线程级别锁的局限性。这为在分布式系统中引入更复杂的分布式锁提供了背景和合理性，因为分布式锁的设计是为了解决跨多个节点、服务器的并发问题，以确保分布式环境中的数据一致性和并发控制。

​        单体应用中的线程级别的并发锁通常指的是在单个进程内的多个线程之间使用的锁。这类锁主要用于控制多个线程对共享资源的访问，以确保线程安全性。以下是线程级别的并发锁的一些特点和描述：

1. **锁的范围：** 线程级别的并发锁是在单个进程内的多个线程之间起作用的，用于保护共享资源。它在应用程序内部实现，不涉及跨进程或跨服务器的通信。
2. **锁的种类：** 在单体应用中，线程级别的锁可以是各种形式，例如 Java 中的内置锁（synchronized）、ReentrantLock、ReadWriteLock 等。这些锁用于控制对关键代码段或共享数据结构的访问。
3. **粒度：** 锁的粒度可以是粗粒度的，例如整个方法，也可以是细粒度的，例如针对特定的数据结构或代码块。细粒度的锁可以提高并发性，但需要注意避免死锁等问题。
4. **线程同步：** 线程级别的并发锁用于确保多个线程之间的同步。通过在关键代码段周围放置锁，可以保证同一时间只有一个线程能够进入该代码段，从而避免竞态条件和数据不一致性。
5. **锁的选择：** 在选择线程级别的锁时，需要根据具体的应用场景和需求选择合适的锁。内置锁（synchronized）适用于简单的同步场景，而 ReentrantLock 提供了更多的高级特性，如可中断锁、公平锁等。
6. **性能和开销：** 线程级别的锁在性能和开销方面相对较小，因为它们仅在单个进程内部操作。然而，在高并发环境中，要注意锁的竞争可能导致性能瓶颈。

#### 2.2  加锁机制

- **synchronized关键字：** Java中最基本的悲观锁机制，通过`synchronized`关键字可以将关键代码块或方法设为同步区域，确保同一时刻只有一个线程能够进入执行。通过将代码块或方法标记为同步区域，确保同一时刻只有一个线程能够执行。

  示例：

  ```java
  public class SynchronizedExample {
      private int sharedResource = 0;
  
      public synchronized void modifySharedResource() {
          // 同步区域，只允许一个线程进入
          sharedResource++;
      }
  }
  
  ```

  

- **ReentrantLock：** 提供了比`synchronized`更灵活的锁定方式，可以显式地加锁和解锁，支持可中断、公平性等特性，是 `java.util.concurrent` 包中提供的显式锁，相比于 `synchronized` 提供了更灵活的锁定和解锁机制。

  示例：

  ```java
  import java.util.concurrent.locks.Lock;
  import java.util.concurrent.locks.ReentrantLock;
  
  public class ReentrantLockExample {
      private int sharedResource = 0;
      private Lock lock = new ReentrantLock();
  
      public void modifySharedResource() {
          lock.lock();
          try {
              // 同步区域，只允许一个线程进入
              sharedResource++;
          } finally {
              lock.unlock();
          }
      }
  }
  
  ```

- **ReadWriteLock读写锁：** 是 `java.util.concurrent` 包中提供的读写锁，允许多个线程同时读取共享资源，但在写入时需要互斥。

  示例：

  ```java
  import java.util.concurrent.locks.ReadWriteLock;
  import java.util.concurrent.locks.ReentrantReadWriteLock;
  
  public class ReadWriteLockExample {
      private int sharedResource = 0;
      private ReadWriteLock readWriteLock = new ReentrantReadWriteLock();
  
      public void readSharedResource() {
          readWriteLock.readLock().lock();
          try {
              // 允许多个线程同时读取
              int value = sharedResource;
              System.out.println("Read: " + value);
          } finally {
              readWriteLock.readLock().unlock();
          }
      }
  
      public void modifySharedResource() {
          readWriteLock.writeLock().lock();
          try {
              // 互斥写入
              sharedResource++;
          } finally {
              readWriteLock.writeLock().unlock();
          }
      }
  }
  ```

​        在单体应用中，使用线程级别的锁是一种常见的并发控制机制，用于确保多个线程之间对共享资源的访问的安全性和有序性。通过引入线程级别的锁，可以解决并发问题，如数据不一致、竞态条件等，同时提高程序的线程安全性。了解单体应用中的锁的使用和原理，为理解分布式锁的引入提供了基础，因为分布式锁在更为复杂的分布式环境中同样致力于解决并发控制问题，但需要应对分布式系统的特殊挑战。

### 第三部分：分布式锁

​        分布式锁是一种用于在分布式系统中协调多个节点对共享资源进行访问的机制。其主要目的是确保在多个分布式节点之间实现数据的一致性和并发控制，通过提供互斥访问的能力，防止多个节点同时修改共享资源导致的问题。分布式锁的实现通常利用分布式存储系统（如Redis）或基于数据库的手段，在保证性能的同时，应对分布式系统中的挑战，如网络延迟、节点故障等，以确保安全、可靠地协调分布式环境中的并发操作。

#### 3.1 **数据库锁机制**

- **应用场景：** 在互联网项目中，常常会使用数据库的行级锁和表级锁来确保对数据库中的记录进行悲观锁控制。特别是在一些需要进行复杂事务操作的场景，例如订单支付、库存扣减等。

- **举例：** 在电商系统中，当用户下单时，可能需要同时创建订单和扣减商品库存，这时可以使用行级锁确保订单和库存的一致性。

  单个数据库实例场景示例：

  示例：

  ```java
  // OrderService.java
  package com.example.service;
  
  import com.example.mapper.OrderMapper;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.stereotype.Service;
  import org.springframework.transaction.annotation.Transactional;
  
  @Service
  public class OrderService {
  
      @Autowired
      private OrderMapper orderMapper;
  
      @Transactional
      public void createOrderAndDeductInventory(String orderId, String productId) {
          // Insert order
          orderMapper.insertOrder(orderId, productId);
          
          // Deduct inventory with check for available quantity
          int rowsAffected = orderMapper.deductInventory(productId);
  
          // Check if the update was successful
          if (rowsAffected == 0) {
              // Rollback the transaction if the inventory deduction failed
              throw new RuntimeException("Insufficient inventory. Order creation failed.");
          }
      }
  }
  
  ```

  在 `createOrderAndDeductInventory` 方法中，我添加了一个检查，如果 `deductInventory` 操作没有更新任何行（`rowsAffected` 等于 0），则抛出异常，导致事务回滚。这确保了订单创建和库存扣减的原子性，如果库存不足，订单创建将不会成功。这样可以避免在库存不足的情况下创建订单，我们也可以将库存表中quantity字段设置为unsigned，这样在执行更新语句的时候，数据库会抛出异常，然后@Transactional会自动回滚事务。

  ```java
  // OrderMapper.java
  package com.example.mapper;
  
  public interface OrderMapper {
  
      void insertOrder(String orderId, String productId);
  
      int deductInventory(String productId);
  }
  
  ```

  在这里，我将 `deductInventory` 的返回类型修改为 `int`，以便在 SQL 执行后获取影响的行数

  ```java
  <!-- OrderMapper.xml -->
  
  <mapper namespace="com.example.mapper.OrderMapper">
  
      <!-- 创建订单 -->
      <insert id="insertOrder" statementType="PREPARED" flushCache="true">
          INSERT INTO orders (order_id, product_id, quantity) VALUES (#{orderId}, #{productId}, 1)
      </insert>
  
      <!-- 扣减库存 -->
      <update id="deductInventory" statementType="PREPARED" flushCache="true">
          UPDATE inventory 
          SET quantity = quantity - 1 
          WHERE product_id = #{productId} 
              AND quantity > 0 
      </update>
  </mapper>
  
  
  ```

  ​        这个示例通过使用`@Transactional`注解来确保整个操作在一个事务中执行，从而确保数据库事务和锁机制的生效。在 MyBatis 中，`FOR UPDATE` 子句一般用于在 `SELECT` 语句中，而不是在 `UPDATE` 语句中。在 `UPDATE` 语句中，数据库会自动加锁。

  ​        对于上述的 `UPDATE` 语句，在并发环境下，数据库会自动处理加锁，确保事务的隔离性。这个语句在更新库存的时候会自动获得行级锁，其他事务在此时会被阻塞，直到当前事务提交或回滚。因此，在这个具体的场景中，不需要显式地使用 `FOR UPDATE`。

  ​        在数据库中，MySQL 在执行 UPDATE 操作时，默认会自动对涉及的行进行加锁，这被称为行级锁。因此，在上述的 SQL 语句中，由于我们没有显式指定 `FOR UPDATE`，数据库会自动使用行级锁。行级锁意味着在更新特定的行时，只有涉及到的那一行或那几行会被锁定，而其他行不会被影响，从而提高了并发性。

  ​       判断一个 SQL 语句使用了行锁还是表锁，可以查看数据库的执行计划或者使用数据库的监控工具。在 MySQL 中，你可以使用 `EXPLAIN` 命令来查看查询的执行计划，具体的锁定方式会在 `type` 列中显示。如果是 `InnoDB` 存储引擎，一般会显示为 `Using where`，表明是行级锁。

  ​       索引允许数据库引擎更有效地定位和更新特定的行，从而降低锁定的范围。总体而言，为 `UPDATE` 语句的 `WHERE` 条件建立索引是一个推荐的最佳实践，可以提高查询性能，同时减小锁的范围，降低并发操作之间的冲突。

  

#### 3.2 分布式数据库锁

- **应用场景：** 随着项目规模的扩大，常常会涉及到多个数据库节点，这时需要考虑分布式悲观锁，以确保不同节点之间的事务一致性。
- **举例：** 在微服务架构中，不同服务可能会涉及到多个数据库，通过分布式锁机制来协调不同服务之间的数据库操作，保障整体数据一致性。

分布式数据库事务是指在分布式系统中涉及多个数据库实例的事务操作。在分布式环境中，数据存储在不同的数据库节点上，因此确保事务的一致性、隔离性、持久性和原子性变得更加复杂。

分布式数据库事务的概述：

1. **事务概念：** 事务是一系列数据库操作的逻辑单元，要么全部执行成功，要么全部失败回滚。事务应该满足 ACID 特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）和持久性（Durability）。
2. **分布式系统挑战：** 在分布式环境中，多个数据库节点之间的通信和协调会引入一些挑战。网络延迟、节点故障、数据一致性等问题都需要特别关注。
3. **两阶段提交协议：** 为了保证分布式事务的一致性，通常使用两阶段提交协议（Two-Phase Commit，2PC）。该协议涉及两个主要阶段：准备阶段和提交阶段。在准备阶段，参与事务的各个节点协商是否可以提交事务；在提交阶段，各节点根据准备阶段的结果决定是否真正提交或回滚。
4. **事务管理器：** 分布式事务通常需要一个事务管理器来协调各个参与者节点的行为。事务管理器负责实施两阶段提交协议、处理超时和回滚等情况。
5. **局部事务和全局事务：** 分布式事务包含局部事务和全局事务。局部事务是指每个参与者节点上的单独事务，而全局事务是指整个分布式系统的事务。两者之间需要协调和一致性。
6. **消息驱动事务：** 一些系统采用消息队列等方式来实现分布式事务。每个事务步骤产生消息，而消息队列则负责确保消息的顺序和传递。这种模式下，系统可能会存在短暂的不一致性，但通过消息重试和幂等性设计可以缓解这个问题。
7. **分布式数据库中间件：** 有一些专门的分布式数据库中间件，如Seata、TCC（Try-Confirm-Cancel）模式等，提供了更强大的分布式事务管理能力，可以协调多个服务的事务状态。

总体而言，分布式数据库事务是一个复杂的领域，需要仔细考虑各种因素，包括性能、可用性、一致性等。在设计和实施分布式事务时，需要权衡不同的解决方案，并根据具体业务需求选择最合适的方案。

##### 3.2.1 SEATA 的分布式交易解决方案

* 示例：

  采用最常使用的Seata作为示例：
  用户购买商品的业务逻辑。整个业务逻辑由3个微服务提供支持：

  - 仓储服务：对给定的商品扣除仓储数量。
  - 订单服务：根据采购需求创建订单。
  - 帐户服务：从用户帐户中扣除余额。

![image-20231207160705163](https://user-images.githubusercontent.com/68344696/145942191-7a2d469f-94c8-4cd2-8c7e-46ad75683636.png)

* 仓储服务

```java
public interface StorageService {

    /**
     * 扣除存储数量
     */
    void deduct(String commodityCode, int count);
}
```



* 订单服务

```java
public interface OrderService {

    /**
     * 创建订单
     */
    Order create(String userId, String commodityCode, int orderCount);
}
```



* 账户服务

```java
public interface AccountService {

    /**
     * 从用户账户中借出
     */
    void debit(String userId, int money);
}
```



* 主要业务逻辑

```
public class BusinessServiceImpl implements BusinessService {

    private StorageService storageService;

    private OrderService orderService;

    /**
     * 采购
     */
    public void purchase(String userId, String commodityCode, int orderCount) {

        storageService.deduct(commodityCode, orderCount);

        orderService.create(userId, commodityCode, orderCount);
    }
}

public class OrderServiceImpl implements OrderService {

    private OrderDAO orderDAO;

    private AccountService accountService;

    public Order create(String userId, String commodityCode, int orderCount) {

        int orderMoney = calculate(commodityCode, orderCount);

        accountService.debit(userId, orderMoney);

        Order order = new Order();
        order.userId = userId;
        order.commodityCode = commodityCode;
        order.count = orderCount;
        order.money = orderMoney;

        // INSERT INTO orders ...
        return orderDAO.insert(order);
    }
}
```



![image-20231207160951417](https://seata.io/img/solution.png)



我们只需要使用一个 `@GlobalTransactional` 注解在业务方法上

```java
    @GlobalTransactional
    public void purchase(String userId, String commodityCode, int orderCount) {
        ......
    }
```



##### 步骤：

  1. 步骤 1：建立数据库

  2. 步骤 2：创建 UNDO_LOG 表

     ```sql
     -- 注意此处0.3.0+ 增加唯一索引 ux_undo_log
     CREATE TABLE `undo_log` (
       `id` bigint(20) NOT NULL AUTO_INCREMENT,
       `branch_id` bigint(20) NOT NULL,
       `xid` varchar(100) NOT NULL,
       `context` varchar(128) NOT NULL,
       `rollback_info` longblob NOT NULL,
       `log_status` int(11) NOT NULL,
       `log_created` datetime NOT NULL,
       `log_modified` datetime NOT NULL,
       `ext` varchar(100) DEFAULT NULL,
       PRIMARY KEY (`id`),
       UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
     ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
     ```

  3. 步骤 3：为示例业务创建表

     ```sql
     DROP TABLE IF EXISTS `storage_tbl`;
     CREATE TABLE `storage_tbl` (
       `id` int(11) NOT NULL AUTO_INCREMENT,
       `commodity_code` varchar(255) DEFAULT NULL,
       `count` int(11) DEFAULT 0,
       PRIMARY KEY (`id`),
       UNIQUE KEY (`commodity_code`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
     
     
     DROP TABLE IF EXISTS `order_tbl`;
     CREATE TABLE `order_tbl` (
       `id` int(11) NOT NULL AUTO_INCREMENT,
       `user_id` varchar(255) DEFAULT NULL,
       `commodity_code` varchar(255) DEFAULT NULL,
       `count` int(11) DEFAULT 0,
       `money` int(11) DEFAULT 0,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
     
     
     DROP TABLE IF EXISTS `account_tbl`;
     CREATE TABLE `account_tbl` (
       `id` int(11) NOT NULL AUTO_INCREMENT,
       `user_id` varchar(255) DEFAULT NULL,
       `money` int(11) DEFAULT 0,
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
     ```

  4. 步骤 4：启动服务

     1. 从 https://github.com/seata/seata/releases,下载服务器软件包，将其解压缩

     2. 启动服务

        ```shell
        Usage: sh seata-server.sh(for linux and mac) or cmd seata-server.bat(for windows) [options]
          Options:
            --host, -h
              The address is expose to registration center and other service can access seata-server via this ip
              Default: 0.0.0.0
            --port, -p
              The port to listen.
              Default: 8091
            --storeMode, -m
              log store mode : file、db
              Default: file
            --help
        
        e.g.
        
        sh seata-server.sh -p 8091 -h 127.0.0.1 -m file
        ```

  5. 步骤5：运行示例


* Seata AT 模式

AT 模式是 Seata 创新的一种非侵入式的分布式事务解决方案，Seata 在内部做了对数据库操作的代理层，我们使用 Seata AT 模式时，实际上用的是 Seata 自带的数据源代理 DataSourceProxy，Seata 在这层代理中加入了很多逻辑，比如插入回滚 undo_log 日志，检查全局锁等。

两阶段提交协议的演变：

- 一阶段：业务数据和回滚日志记录在同一个本地事务中提交，释放本地锁和连接资源。
- 二阶段：
  - 提交异步化，非常快速地完成。
  - 回滚通过一阶段的回滚日志进行反向补偿。

* Seata其他模式：
  * Seata TCC（不推荐）：TCC 模式是 Seata 支持的一种由业务方细粒度控制的侵入式分布式事务解决方案，是继 AT 模式后第二种支持的事务模式，优势是：TCC 完全不依赖底层数据库，能够实现跨数据库、跨应用资源管理，可以提供给业务方更细粒度的控制。劣势是：TCC 是一种侵入式的分布式事务解决方案，需要业务系统自行实现 Try，Confirm，Cancel 三个操作，对业务系统有着非常大的入侵性，设计相对复杂。适用场景是TCC 模式是高性能分布式事务解决方案，适用于核心系统等对性能有很高要求的场景。
  * Seata Saga（不推荐）：Saga模式是SEATA提供的长事务解决方案，在Saga模式中，业务流程中每个参与者都提交本地事务，当出现某一个参与者失败则补偿前面已经成功的参与者，一阶段正向服务和二阶段补偿服务都由业务开发实现。
  * Seata XA（不推荐）：XA 模式是从 1.2 版本支持的事务模式。XA 规范 是 X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准。Seata XA 模式是利用事务资源（数据库、消息服务等）对 XA 协议的支持，以 XA 协议的机制来管理分支事务的一种事务模式。



#### 3.3 **分布式锁服务**

##### 3.3.1 ZooKeeper 和 etcd

- **应用场景：** 分布式锁服务如ZooKeeper和etcd被广泛应用于互联网项目，通过这些服务可以实现分布式场景下的悲观锁。
- **举例：** 在分布式系统中，通过ZooKeeper的临时顺序节点来实现分布式锁，确保同一时刻只有一个节点能够持有锁，避免并发冲突。

##### 3.3.2 Zookeeper

示例：

1. 添加依赖

   ```xml
   <dependency>
       <groupId>org.apache.zookeeper</groupId>
       <artifactId>zookeeper</artifactId>
       <version>3.7.0</version> <!-- 使用最新版本 -->
   </dependency>
   
   ```

2. Javademo

  ```java
import org.apache.zookeeper.*;

public class DistributedLockExample {

    private static final String ZOOKEEPER_ADDRESS = "localhost:2181";
    private static final String LOCK_PATH = "/distributed-lock";

    private ZooKeeper zooKeeper;

    public DistributedLockExample() throws Exception {
        this.zooKeeper = new ZooKeeper(ZOOKEEPER_ADDRESS, 5000, null);
        // 在构造函数中创建锁节点
        createLockNode();
    }

    public void createLockNode() throws KeeperException, InterruptedException {
        try {
            zooKeeper.create(LOCK_PATH, new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
        } catch (KeeperException.NodeExistsException e) {
            // 节点已存在，说明锁已被创建
            System.out.println("Lock node already exists.");
        }
    }

    public void acquireLock() throws KeeperException, InterruptedException {
        String lockNode = zooKeeper.create(LOCK_PATH + "/lock-", new byte[0], ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);

        while (true) {
            // 获取锁节点的所有子节点
            var children = zooKeeper.getChildren(LOCK_PATH, false);

            // 找到最小的序号节点
            String smallestNode = getSmallestNode(children);

            // 如果当前节点是最小节点，则获取锁成功
            if (lockNode.endsWith(smallestNode)) {
                System.out.println("Lock acquired!");
                return;
            } else {
                // 否则，监听比当前节点序号小的节点的删除事件
                String previousNode = getPreviousNode(children, lockNode);
                zooKeeper.exists(LOCK_PATH + "/" + previousNode, new LockWatcher(lockNode));
            }
        }
    }

    public void releaseLock() throws KeeperException, InterruptedException {
        zooKeeper.close();
    }

    private String getSmallestNode(java.util.List<String> nodes) {
        nodes.sort(String::compareTo);
        return nodes.get(0);
    }

    private String getPreviousNode(java.util.List<String> nodes, String currentNode) {
        nodes.sort(String::compareTo);

        int currentIndex = nodes.indexOf(currentNode.substring(LOCK_PATH.length() + 1));
        if (currentIndex > 0) {
            return nodes.get(currentIndex - 1);
        }

        return null;
    }

    private static class LockWatcher implements Watcher {
        private final String lockNode;

        public LockWatcher(String lockNode) {
            this.lockNode = lockNode;
        }

        @Override
        public void process(WatchedEvent event) {
            if (event.getType() == Event.EventType.NodeDeleted) {
                synchronized (lockNode) {
                    lockNode.notify(); // 通知锁已释放
                }
            }
        }
    }

    public static void main(String[] args) {
        try {
            DistributedLockExample lockExample = new DistributedLockExample();
            lockExample.acquireLock();

            // 执行需要分布式锁保护的业务逻辑
            System.out.println("Executing business logic...");

            // 释放锁
            lockExample.releaseLock();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

  ```

​        示例中，我们创建了一个分布式锁，使用 ZooKeeper 的顺序临时节点实现。当一个进程想要获取锁时，它创建一个临时顺序节点，然后检查是否它是所有子节点中最小的。如果是，表示获取到了锁。如果不是，则监听前一个节点的删除事件，一旦前一个节点被删除，当前节点就获取到了锁。

在上面的示例中，ZooKeeper 的临时顺序节点确实可以保证获取锁的对象按照节点创建的顺序执行。这是因为在 ZooKeeper 中，创建临时顺序节点时，ZooKeeper 会为每个节点分配一个全局唯一的序号，并根据这个序号来排序节点。

具体来说，当一个客户端创建一个临时顺序节点时，ZooKeeper 会为这个节点分配一个递增的序号，形成类似于 `/lock/node-0000000001`、`/lock/node-0000000002` 这样的节点路径。这个序号是有意义的，可以用来表示获取锁的先后顺序。

在获取锁的逻辑中，我们通过获取所有子节点并找到最小的序号节点来判断是否获取到了锁。如果当前客户端创建的节点是最小的节点，那么它就获得了锁。

这样，ZooKeeper 的临时顺序节点机制就保证了获取锁的对象按照节点创建的顺序执行。其他客户端创建的节点序号更小的话，它们将等待直到前面的节点被删除，然后按照序号的顺序一个一个获取到锁。

需要注意的是，这里的顺序是全局的，而不是每个客户端自身的顺序。也就是说，如果客户端A创建了节点1，客户端B创建了节点2，那么并不意味着A先于B获取到锁，因为A和B所在的 ZooKeeper 节点服务器可能不同。真正的顺序是由 ZooKeeper 保证的。

尽管 ZooKeeper 是一个强大的分布式协调服务，但在某些场景下，可能会遇到一些并发局限性。以下是一些可能的局限性：

1. **性能瓶颈：** ZooKeeper 采用了领导者-追随者（Leader-Follower）的架构，其中领导者负责处理所有写请求，而追随者则用于处理读请求。这种设计可能导致领导者成为性能的瓶颈，因为所有的写请求都必须经过它。在写密集型场景下，可能会出现性能瓶颈。
2. **数据量和节点数量：** ZooKeeper 的设计初衷是用于存储小量的元数据信息，而不是大规模数据。如果在 ZooKeeper 存储了大量数据，可能会导致性能下降。同样，大量的节点数量也可能影响性能。
3. **Session过期：** ZooKeeper 使用会话（Session）来管理客户端与服务器之间的连接。如果一个客户端的会话过期，它创建的临时节点将被删除。这可能导致某些并发场景下的问题，例如临时节点被误删除。
4. **一致性保证：** ZooKeeper 提供的是强一致性，但这也意味着在写入时需要等待多数节点的确认，因此写操作可能会有一定的延迟。这对于某些对低延迟要求极高的场景可能不太适用。
5. **复杂性：** ZooKeeper 的使用有一定的复杂性，需要正确处理连接管理、重试机制、异常处理等。在一些特殊场景下，开发人员可能需要更深入地理解 ZooKeeper 的内部机制，以优化性能或解决复杂的并发问题。

虽然 ZooKeeper 有一些局限性，但在许多分布式系统中它仍然是一个可靠的工具。对于特定的使用场景，可能需要结合其他工具或采用不同的设计来应对并发局限性。例如，一些系统可能选择使用更为分散的元数据存储方案，而不仅仅依赖于 ZooKeeper。




#### 3.5 **缓存实现分布式锁**

##### 3.5.1 Redis 分布式锁

- **应用场景：** Redis作为常用的缓存数据库，其分布式锁机制被广泛用于互联网项目中，通过Redis的SETNX等原子操作来实现分布式悲观锁。
- **举例：** 在秒杀场景中，通过Redis分布式锁来控制商品的抢购行为，确保同一时刻只有一个用户能够成功秒杀。

在日常的项目中的我们一般采用Redisson作为基于redis的分布式锁。Redisson是一个基于Redis的Java驻内存数据网格（In-Memory Data Grid）和分布式锁框架。它提供了许多在分布式系统中常见的数据结构和服务，同时还实现了高级的分布式锁，使得在分布式环境中更容易地进行数据存储和同步。

* 示例：

  1. 项目中引入 Redisson 的依赖：

     ```xml
     <dependency>
         <groupId>org.redisson</groupId>
         <artifactId>redisson</artifactId>
         <version>3.17.1</version> <!-- 使用最新版本 -->
     </dependency>
     
     ```

  2. 使用 Redisson 来实现分布式锁：

  ```java
  import org.redisson.Redisson;
  import org.redisson.api.RLock;
  import org.redisson.api.RedissonClient;
  import org.redisson.config.Config;
  
  import java.util.concurrent.TimeUnit;
  
  public class RedissonDistributedLock {
  
      private static final String LOCK_KEY = "distributed_lock";
  
      private RedissonClient redissonClient;
  
      public RedissonDistributedLock() {
          Config config = new Config();
          config.useSingleServer().setAddress("redis://localhost:6379");
          redissonClient = Redisson.create(config);
      }
  
      public boolean acquireLock() {
          RLock lock = redissonClient.getLock(LOCK_KEY);
          try {
              // 尝试获取锁，最多等待10秒
              return lock.tryLock(10, TimeUnit.SECONDS);
          } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
              return false;
          }
      }
  
      public void releaseLock() {
          RLock lock = redissonClient.getLock(LOCK_KEY);
          lock.unlock();
      }
  
      public void close() {
          redissonClient.shutdown();
      }
  
      public static void main(String[] args) {
          RedissonDistributedLock distributedLock = new RedissonDistributedLock();
  
          try {
              // 尝试获取锁
              if (distributedLock.acquireLock()) {
                  System.out.println("Lock acquired! Performing critical section...");
                  // 在这里执行需要保护的关键代码
              } else {
                  System.out.println("Failed to acquire lock.");
              }
          } finally {
              // 释放锁
              distributedLock.releaseLock();
              // 关闭 Redisson 客户端
              distributedLock.close();
          }
      }
  }
  
  ```

  这个示例中使用了 Redisson 提供的 `RLock` 接口，它包含了更多的功能，如自动续租、异步操作等。在 `acquireLock` 方法中，我们使用 `tryLock` 来尝试获取锁，最多等待 10 秒。在实际生产环境中，你可以根据业务需要调整等待时间。

  这个示例也展示了合理地释放锁的方法，即在 `finally` 块中确保释放锁，以防止发生死锁。

  使用 Redisson 可以大大简化分布式锁的实现，提供了更多的功能和配置选项，使得在复杂的分布式场景中更容易管理和维护。

  Redisson 使得在 Java 应用中更容易地利用 Redis 的强大功能，特别是在分布式系统中进行数据管理和同步。其提供了丰富的 API 和一些高级功能，使得开发者能够更轻松地构建可靠和高性能的分布式应用。

##### 3.5.2 Redisson原理剖析

  核心源码：

    1. 加锁逻辑

  ```java
    <T> RFuture<T> tryLockInnerAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
        internalLockLeaseTime = unit.toMillis(leaseTime);

        return evalWriteAsync(getName(), LongCodec.INSTANCE, command,
                "if (redis.call('exists', KEYS[1]) == 0) then " +
                        "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                        "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                        "return nil; " +
                        "end; " +
                        "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                        "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                        "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                        "return nil; " +
                        "end; " +
                        "return redis.call('pttl', KEYS[1]);",
                Collections.singletonList(getName()), internalLockLeaseTime, getLockName(threadId));
    }
  ```

  

  2. 超时时间自动延长

     ```java
         protected RFuture<Boolean> renewExpirationAsync(long threadId) {
             return evalWriteAsync(getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
                     "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                             "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                             "return 1; " +
                             "end; " +
                             "return 0;",
                     Collections.singletonList(getName()),
                     internalLockLeaseTime, getLockName(threadId));
         }
     ```




### 第四部分：项目实践

在实际项目中同时使用数据库分布式锁和 Redisson（基于 Redis 的分布式锁）是一种常见的做法，可以充分发挥各自的优势，提高系统的可靠性和性能。

#### 4.1 新生大礼包

新生大礼包使用数据库作为锁和并发控制核心代码如下：

新生大礼包项目中，每个新生可以领取各种类型的卡券只能1次，每种类型下都有各种不同的卡券，每个卡券都会有数目限制。

```java
private void couponSystemReceive(CouponInfo couponInfo, CouponReceiveRequestDto receiveRequestDto) {
        //校验库存
        if (couponInfo.getLeftNum() <= 0) {
            log.warn("该卡券已经领取完毕，卡券id：{}", couponInfo.getId());
            throw new ServiceException(ResultCode.COUPON_NO_QUANTITY);
        }
        //使用数据库唯一索引的特性并发控制限制一个人领取多次
        CouponReceiveLimit couponReceiveLimit;
        if (couponInfo.getIsGroupRepel()) {
            couponReceiveLimit = couponReceiveLimitService.add(null, receiveRequestDto.getIdCard(), couponInfo.getGroupId());
        } else {
            couponReceiveLimit = couponReceiveLimitService.add(couponInfo.getId(), receiveRequestDto.getIdCard(), couponInfo.getGroupId());
        }
        try {
            //扣减库存
            couponInfoService.deductInStock(couponInfo.getId());
        } catch (Exception e) {
            log.warn("卡券中心领取失败，失败原因：{}", e.getMessage());
            // 库存扣减失败删除数据库并发控制用户记录
            couponReceiveLimitService.delete(couponReceiveLimit.getId());
            throw new ServiceException(ResultCode.COUPON_NO_QUANTITY);
        }
        // 创建用户领取记录
        OpenCollectCardRequestDto openCollectCardRequestDto = new OpenCollectCardRequestDto();
        openCollectCardRequestDto.setCouponId(Long.valueOf(couponInfo.getThirdCouponId()));
        openCollectCardRequestDto.setMobile(receiveRequestDto.getMobile());
        openCollectCardRequestDto.setOutUid(receiveRequestDto.getIdCard());
        CouponReceiveLog couponReceiveLog = baseReceiveInfo(couponInfo, receiveRequestDto);
        try {
            // 调用卡券系统领取卡券接口
            OpenCollectCardResponseDto collectCardCoupon = couponService.collectCardCoupon(openCollectCardRequestDto);
            couponReceiveLog.setCouponCode(collectCardCoupon.getCouponCode());
        } catch (Exception e) {
            //领取失败
            log.warn("卡券系统领取失败,失败原因：{}", e.getMessage());
            // 领取失败删除数据库并发控制用户记录
            couponReceiveLimitService.delete(couponReceiveLimit.getId());
            // 领取失败恢复库存
            couponInfoService.recoverInStock(couponInfo.getId());
            throw new ServiceException(ResultCode.COUPON_RECEIVE_ERROR);
        }
        couponReceiveLogService.save(couponReceiveLog);
    }
```

```xml
    <update id="deductInStock">
        update coupon_info set left_num = left_num - 1, send_num = send_num + 1
        where id = #{id} and left_num > 0
    </update>
```

```sql
CREATE TABLE `coupon_receive_limit` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `uni_sn` varchar(32) NOT NULL DEFAULT '' COMMENT '用户领取优惠券唯一编号(idcard_groupid_couponid)',
  `state` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT '状态0领取中 1领取成功',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='卡券 - 领券限制表';

CREATE TABLE `coupon_info` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `third_coupon_id` varchar(52) NOT NULL DEFAULT '' COMMENT '关联第三方券id',
  `coupon_name` varchar(128) NOT NULL DEFAULT '' COMMENT '卡券名称',
  `data_source` tinyint(4) NOT NULL DEFAULT '0' COMMENT '来源 1卡券系统 2苏式商城 3智游宝 4体育局 5银行',
  `begin_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '开始时间',
  `end_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '结束时间',
  `quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '卡券数量',
  `left_num` int(10) NOT NULL DEFAULT '0' COMMENT '剩余数量',
  `send_num` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '发放数量',
  `jump_type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否跳转 0=不跳转 1=跳转',
  `jump_url` varchar(255) NOT NULL DEFAULT '' COMMENT '领取跳转链接',
  `use_jump_url` varchar(255) NOT NULL DEFAULT '' COMMENT '使用券跳转链接',
  `note` varchar(1024) NOT NULL DEFAULT '' COMMENT '使用须知',
  `code_type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '码类型 展码方式（0：不展示；1：二维码；2：条形码；3：序列号）',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '状态 1=启用 2=停用',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否删除 1=是 0=否',
  `group_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '分组 1是园林 2是购书 3是公交 4是地铁 5是运动健身 6是数币 7演出',
  `is_group_repel` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否组内互斥',
  `coupon_type` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT '卡券类型（1: 虎丘、沧浪亭（可园） 2：拙政园、耦园 3：留园、网师园、天平山 4：狮子林、动物园、植物园 5：公交乘车券 6：地铁乘车券 7：购书优惠券 8：购书优惠券-苏式商城 9：体育场馆优惠券 10: 数币红包 11:演出）',
  `use_start_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '使用开始时间',
  `cover` varchar(255) NOT NULL DEFAULT '' COMMENT '封面图',
  `use_end_time` int(10) NOT NULL DEFAULT '0' COMMENT '使用结束时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COMMENT='卡券 - 基本信息';
```
* 步骤：
1. 首先判断卡券剩余库存

2. 使用数据库唯一索引的特性并发控制限制一个人领取多次

3. 扣减卡券库存

4. 调用第三方卡券系统领取卡券

   

#### 4.2 卡券系统

卡券系统领取接口的领取接口是使用了redis + redisson实现的并发控制，并使用异步处理数据库领取来提高并发性能。

```java
        //已经领取的数量
        String stockRedisKey = RedisCacheConstant.COUPON_TAKE_STOCK_KEY + openCollectCardRequestDto.getCouponId();
        Integer takeStock = redisCache.getCacheObject(stockRedisKey);
        if (takeStock == null) {
            takeStock = 0;
        }
        if (takeStock >= couponInfo.getQuantity()) {
            throw new ServiceException(ResultCode.COUPON_STOCK_LACK.getCode(), "库存不足");
        }

        //剩余可领取数量
        Long leftStock = couponInfo.getQuantity() - takeStock;
        if (leftStock < 1000) {
            String redisKey = RedisCacheConstant.COLLECT_CARD_COUPON_KEY + openCollectCardRequestDto.getCouponId();
            RLock rLock = redissonClient.getLock(redisKey);
            try {
                rLock.lock(5, TimeUnit.SECONDS);
                takeStock = redisCache.getCacheObject(stockRedisKey);
                takeStock = takeStock == null ? 0 : takeStock;
                leftStock = couponInfo.getQuantity() - takeStock;
                if (leftStock <= 0) {
                    throw new ServiceException(ResultCode.COUPON_STOCK_LACK.getCode(), "库存不足");
                }
                //redis incr+1
                redisCache.incrObject(stockRedisKey, 1);
                //return null;
                OpenCollectCardResponseDto openCollectCardResponseDto = saveSendLog(userId, openCollectCardRequestDto.getMobile(), couponInfo);
                //后续处理卡券库存所需要的redis list
                redisCache.setCacheRightList(RedisCacheConstant.COUPON_UPDATE_STOCK_KEY, openCollectCardRequestDto.getCouponId());
                return openCollectCardResponseDto;
            } catch (Exception e) {
                //redis incr-1
                redisCache.decrObject(stockRedisKey, 1);

                log.error("领卡异常:", e);
                if (e instanceof ServiceException) {
                    ServiceException serviceException = (ServiceException) e;
                    throw new ServiceException(serviceException.getCode(), e.getMessage());
                }
                throw new ServiceException("领取卡券异常");
            } finally {
                rLock.unlock();
            }
        } else {
            //redis incr+1
            redisCache.incrObject(stockRedisKey, 1);
            //return null;
            OpenCollectCardResponseDto openCollectCardResponseDto = saveSendLog(userId, openCollectCardRequestDto.getMobile(), couponInfo);
            //后续处理卡券库存所需要的redis list
            redisCache.setCacheRightList(RedisCacheConstant.COUPON_UPDATE_STOCK_KEY, openCollectCardRequestDto.getCouponId());
            return openCollectCardResponseDto;
        }
```

* 步骤：

1. redis查询卡券库存数目；

2. 库存数量 >= 1000时，不走redisson锁，直接扣减redis中卡券库存，然后放入redis list用于异步处理；

3. 库存数量 < 1000是，使用redisson锁，只有获取锁成功的线程可以继续处理；

4. 在继续处理时再次获取redis的库存数量做二次校验；

5. 通过校验之后扣减redis中卡券库存，然后放入redis list用于异步处理；

6. 用户领取卡券使用定时脚本来消费保存入库。

   

### 第五部分：引用

* Seata: https://seata.io/zh-cn/

* Redisson: https://redisson.org/

* Zookeeper: https://zookeeper.apache.org/