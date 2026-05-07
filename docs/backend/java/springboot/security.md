# 安全指南

## 一、开启签名验证

### 0x01.引入sjfy-sign-spring-boot-starter
:::tip 
如果旧项目中没有该签名starter，需要从springboot-mybatis-plus代码仓中复制到项目的starters模块中，并且在pom中引入
:::
在旧项目的starters模块的pom.xml引入签名starter
```java
<module>sjfy-sign-spring-boot-starter</module>
```

在需要开启签名的app或者admin模块的pom.xml中引入
```java
<dependency>
    <groupId>cn.chinacici</groupId>
    <artifactId>sjfy-sign-spring-boot-starter</artifactId>
</dependency>
```

### 0x02.配置文件
在application-test.yml或者application-prod.yml中配置
```yaml
sign:
    # 开启签名验证
    open: true
    # 时间戳失效时间 单位秒
    expires: 5
    # 客户端签名秘钥 目前大部分针对H5端的签名 该参数忽略即可
    appSecret: xxxxxxxxxx
    # 白名单
    whitePaths:
      - /file/upload
      - /file/upload/part
      - /file/upload/base64
```

### 0x03.在webmvc配置签名拦截器
编辑config/AppWebMvcConfig.java
```java
/**
 * 签名拦截器
 */
@Resource
private SignInterceptor signInterceptor;

/**
 * 添加拦截器
 *
 * @param registry 拦截器注册表
 */
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(signInterceptor);
}

```