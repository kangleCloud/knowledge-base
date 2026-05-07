const backendMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "后端知识库概览",
        link: "/docs/backend/",
      },
    ],
  },
  {
    text: "Java 基础",
    collapsed: false,
    items: [
      {
        text: "初识 JVM",
        link: "/docs/backend/java/jvm/base.md",
      },
      {
        text: "Spring Boot Bean 生命周期",
        link: "/docs/backend/java/framework/spring/springboot-life-cycle.md",
      },
    ],
  },
  {
    text: "框架与组件",
    collapsed: false,
    items: [
      {
        text: "MyBatis 及衍生框架",
        link: "/docs/backend/java/framework/mybatis/mybatis.md",
      },
      {
        text: "Spring Boot 常用注解",
        link: "/docs/backend/java/framework/spring/springboot-annotation.md",
      },
      {
        text: "Spring Boot 安全指南",
        link: "/docs/backend/java/springboot/security.md",
      },
      {
        text: "Spring Boot Excel 示例",
        link: "/docs/backend/java/springboot/excel.md",
      },
    ],
  },
  {
    text: "中间件接入",
    collapsed: true,
    items: [
      {
        text: "Redis 基础",
        link: "/docs/backend/java/middleware/redis/redis.md",
      },
      {
        text: "Redisson",
        link: "/docs/backend/java/middleware/redis/redisson.md",
      },
      {
        text: "MinIO 工具类",
        link: "/docs/backend/java/middleware/minio/minio-util.md",
      },
      {
        text: "Sentinel 基础",
        link: "/docs/backend/java/middleware/sentinel/base.md",
      },
    ],
  },
  {
    text: "规范与工具",
    collapsed: true,
    items: [
      {
        text: "日志规范",
        link: "/docs/backend/java/logguide.md",
      },
      {
        text: "编码规范",
        link: "/docs/backend/java/styleguide.md",
      },
      {
        text: "JDK 工具包",
        link: "/docs/backend/java/javahelper/jdk-utils.md",
      },
      {
        text: "Spring 工具包",
        link: "/docs/backend/java/javahelper/spring-utils.md",
      },
      {
        text: "第三方工具包",
        link: "/docs/backend/java/javahelper/thirdlib-utils.md",
      },
      {
        text: "自建工具包",
        link: "/docs/backend/java/javahelper/selfbuild-utils.md",
      },
    ],
  },
  {
    text: "开发实践",
    collapsed: true,
    items: [
      {
        text: "分布式锁实现",
        link: "/docs/backend/practice/distributed-locks.md",
      },
      {
        text: "高并发设计方案",
        link: "/docs/backend/practice/high-performance-server-design-patterns.md",
      },
      {
        text: "Spring Web 请求校验注解",
        link: "/docs/backend/practice/spring-web-request-valid-annotation.md",
      },
      {
        text: "RabbitMQ 使用规约",
        link: "/docs/backend/practice/rabbitmq-usage-protocol.md",
      },
      {
        text: "OpenResty 灰度发布模块",
        link: "/docs/backend/practice/openresty-gray.md",
      },
    ],
  },
];

export default backendMenu;
