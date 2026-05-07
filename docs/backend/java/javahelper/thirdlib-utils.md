# 三方库工具包

三方常用依赖库中的工具

## JSON类解析工具

Json类解析工具主要有Fastjson、Jackson、Gson，禁用除这三者之外工具。绝大多数情况下，阿里的fastjson已经满足了所有json解析需求

**FastJson依赖引入**

```java
<dependency>
  <groupId>com.alibaba</groupId>
  <artifactId>fastjson</artifactId>
  <version>1.2.83</version>
</dependency>
```

### 对象转JSON字符串

```java
Cat cat = new Cat();
String catJson = JSON.toJSONString(cat);
```

### json字符串转对象

```java
String catJson = "{\"color\":\"black\"}";
Cat cat = JSON.parseObject(catJson, Cat.class);
```

### json字符串转Map

```java
String json = "{\"color\":\"black\"}";
Map<String, String> stringStringMap = JSONObject.parseObject(json, new TypeReference<Map<String, String>>(){});
```

## 集合工具
依赖

```java
<dependency>
   <groupId>org.apache.commons</groupId>
   <artifactId>commons-lang3</artifactId>
   <version>3.12.0</version>
</dependency>
```
**list示例**

```java
List<Integer> list1 = new ArrayList<>();
list1.add(1);
list1.add(2);
list1.add(3);
List<Integer> list2 = new ArrayList<>();
list2.add(3);
list2.add(4);
```

### 两个list交集

```java
Collection<Integer> intersection = CollectionUtils.intersection(list1, list2);
System.out.println(intersection);
//打印结果：[3]
```

### 两个list差集

```java
Collection<Integer> subtract = CollectionUtils.subtract(list1, list2);
System.out.println(subtract);
//打印结果：[1,2]
```