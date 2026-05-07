# JDK工具包

JDK中自带的常用包中的工具

## 对象比较

### java.util.Objects

使用示例：

``` java
   // equals可以防止空指针异常
   Long a = null;
   if (Objects.equals(a, 1L)) {
     return true;
   }
```

## 字符串转List

### java.util.Arrays

使用示例：

``` java
   String str = "1,2,3";
   List<String> list = Arrays.asList(str.split(","));
```

## 时间工具

### 当前时间戳-秒

使用示例：

``` java
   // 获取当前系统时间戳, 秒级
   long nowTime = System.currentTimeMillis() / 1000
```

### 当前时间戳-秒

使用示例：

``` java
   // 获取当前系统时间戳, 秒级
   long nowTime = System.currentTimeMillis() / 1000
```

### Calendar工具

```java
  Calendar calendar = Calendar.getInstance();
  // 打印Calendar信息
  System.out.println(calendar);

  // 获取年月日-->参数是int类型,使用的指定常量值获取年月日
  int year = calendar.get(Calendar.YEAR);
  System.out.println(year);

  // 获取一年中的第几天
  int dayOfYear = calendar.get(Calendar.DAY_OF_YEAR);
  System.out.println(dayOfYear);

  // 获取月份-->从0开始获取,所以结果要加1
  int month = calendar.get(Calendar.MONTH)+1;
  System.out.println(month);

   // 获取天数
   int dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH);

   // 获取小时
   int hour1 = calendar.get(Calendar.HOUR);
   System.out.println(hour1);
```

### Base64加解密

java.util.Base64
```java
String base64 = "这是一个测试加密数据";
String encryptData = Base64.getEncoder().encodeToString(base64.getBytes("utf-8"));
System.out.println("加密数据：" + encryptData);

byte[] decryptData = Base64.getDecoder().decode(encryptData);
String originalData = new String(decryptData);
System.out.println("解密数据：" + originalData);
```
## List排序
**Collections**

### list排序

```java
List<Integer> list = new ArrayList<>();
list.add(2);
list.add(1);
list.add(3);
//升序
Collections.sort(list);
//降序
Collections.reverse(list);
```


### 当前系统名称

```java
String sysName = System.getProperty("os.name");
System.out.println("获取系统名称:" + sysName);
//打印结果：获取系统名称:Windows 11
```









