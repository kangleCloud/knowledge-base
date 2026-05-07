# 自建工具包

公司封装的工具包
## IO工具

操作流的相关工具 org.apache.commons.io.IOUtils

### 流转字节

```java
//流转为字节
try (InputStream inputStream = file.getInputStream()) {
    byte[] bytes = IOUtils.toByteArray(inputStream);
    //流的数据保留后可以进行其他特定操作
} catch (Exception e) {
    log.warn("错误信息:", e);
}
```

### 流转字符串

```java
//读取文件内容，将流转为字符串
File f = new File(filename);
InputStream in = new FileInputStream(f);
System.out.println(IOUtils.toString(in));
```

### 复制流输出

```java
//复制流输出，将input输入流直接复制到输出流
File file1 = new File(fileName1);
File file2 = new File(fileName2);
InputStream inputStream2 = new  FileInputStream(file2);
OutputStream outputStream1 = new FileOutputStream(file1);
IOUtils.copy(inputStream2, outputStream1);
```

### 关闭流

```java
//关闭流使用IO工具的closeQuietly(),可以不需要流的null值判断，节省代码
IOUtils.closeQuietly(in);
```

## 文件工具

文件操作工具类，org.apache.commons.io.FileUtils，开发中使用单包封装的FileUtils工具

### 删除文件

```
File file = new File("D://1.txt");
FileUtils.delete(file);
```

### 移动文件

```
File srcfile = new File("D://1.txt");
File destfile = new File("D://2.txt");
FileUtils.moveFile(srcfile, destfile);
```

### 创建目录

```
File dir = new File("D://test/a");
FileUtils.forceMkdir(dir);
```

## 字符串工具

字符串工具使用频次较多，单包中整合了扩展的org.apache.commons.lang3.StringUtils，使用字符串工具可以有效的避免空指针，长度越界问题

### 字符串格式化工具

```java
//字符串格式化工具
String format = StringUtils.format("this is {} and {}", "a", "b");
System.out.println("格式化的字符串" + format);
```

### 字符串判空

```java
//判空
String value = "  ";
Boolean isBlank = StringUtils.isBlank(value);
System.out.println("isBlank判空结果:" + isBlank);
Boolean isEmpty = org.apache.commons.lang3.StringUtils.isEmpty(value);
System.out.println("isEmpty判空结果:" + isEmpty);
//打印结果
//isBlank判空结果:true
//isEmpty判空结果:false
//直接使用单包的判空，两个结果是相同的
```

## 反射工具

整合代码架构的时候使用较多，org.springframework.util.ReflectionUtils。建议使用单包中封装的ReflectUtils工具

### 方法反射

```java
public void reflect(T t) {
    String name = ReflectUtils.invokeMethod(t, "getName", new Class[]{String.class}, new Object[]{"dog"});
    System.out.println("反射工具获取到的值：" + name);
}
```

## Spring工具

使用单包中封装的Spring工具获取bean

### 获取bean

```java
T t = SpringUtils.getBean("t");
String name = t.getName();
System.out.println("spring工具获取的name值:" + name);
```

### Servlet工具

单包中封装，在任意位置获取servlet请求

```
HttpServletRequest request = ServletUtils.getRequest();
```

### IP工具

获取ip值，兼容k8s集群，单包内封装，可配合ServletUtils使用

```
String ip = IpUtils.getIpAddr(request)
```

## 日期工具

常用日期工具，单包中集成，直接调用。

### 当天零点时间戳

```
// 获取当天开始时间的零点时间戳
Long todayZero = DateUtils.getTodayZeroTs();
```

### 指定时间零点时间戳

```
// 获取指定时间的零点时间戳
Long dayZero = DateUtils.getTodayZeroTs();
```

### 指定月份第一天

```
//获取指定月份的第一天
Long monthTs = 1673429006L;
Long beginMonthZero = DateUtils.getBeginMonthZero(monthTs);
```

### 日期所在周的第一天

```java
//获取指定日期所在周的第一天零点时间戳
Long weekTs = 1673429006L;
Long beginWeekZero = DateUtils.getWeekStartTs(weekTs);
```

### 时间戳转字符串

```
//时间戳转换为字符串
Long nowTime = System.currentTimeMillis()；
String datetime = DateUtils.timestamp2DateTime(nowTime, "yyyy-MM-dd HH:mm:ss");
```

## 身份证工具

身份证真实性校验，单包中集成，直接调用。兼容旧版15位的身份证号验证。

### 校验身份证号有效性

```java
String idcard = "xxxxx";
if (IdCardsUtils.check(idcard)) {
  return true;
}
```

### 获取身份证生日

```java
String birthDay = IdCardsUtils.getBirthday(idcard);
System.out.println("生日：" + birthDay);
```

### 获取身份证性别

```java
String sex = IdCardsUtils.getSex(idcard);
System.out.println("性别：" + sex);
```

## 随机工具

获取指定位数的随机字符串和随机数值，单包中集成，直接调用。

### 获取指定范围的随机数

```java
RandomUtils.randomInt(1,100);
```

### 获取随机数值

```java
RandomUtils.randomInt();
```

### 字母和数字随机串

```java
//获取大小写字母和数字混合的字符串，并指定长度
RandomUtils.randomString(16);
```

## 加解密工具

加解密工具，单包中集成，可以直接调用。其他则使用spring自带工具DigestUtils。

### sha256

使用示例：

```java
// sha（安全哈希算法） 加密
String sha256Hex = DigestUtils.sha256Hex("123");
System.out.println("sha256加密后：" + sha256Hex);
```

### md5加密

```java
String originData = "md5 test data";
String md5 = MD5Util.md5Hex(originData);
//或直接使用DigestUtils工具，DigestUtils.md5DigestAsHex(message.getBytes());
System.out.println("md5加密数据：" + md5);
```

### AES加解密

Aes直接调用单包中工具

```java
// Base64编码
// AES加密 - ECB模式
String encryptEcb = AesUtils.encryptByEcbMode(data, key);
System.out.println("AES加密数据-ECB模式: " + encryptEcb);

// AES解密 - ECB模式
String decryptEcb = AesUtils.decryptByEcbMode(data, key);
System.out.println("AES解密数据-ECB模式: " + decryptEcb);

// AES加密 - CBC模式
String encryptCbc = AesUtils.encryptByCbcMode(data, key, iv);
System.out.println("AES加密数据-CBC模式: " + encryptCbc);

// AES解密 - CBC模式
String decryptCbc = AesUtils.decryptByCbcMode(data, key, iv);
System.out.println("AES解密数据-CBC模式: " + decryptCbc);

// 使用Hex方式，防止传输中转码问题
// AES加密 - CBC模式
String encryptCbcHex = AesUtils.encryptByCbcModeHex(data, key, iv);
System.out.println("AES加密数据-CBC模式: " + encryptCbcHex);

// AES解密 - CBC模式
String decryptCbc = AesUtils.decryptByCbcModeHex(data, key, iv);
System.out.println("AES解密数据-CBC模式: " + decryptCbc);

// AES加密 - ECB模式
String encryptEcbHex = AesUtils.encryptByEcbModeHex(data, key);
System.out.println("AES加密数据-ECB模式: " + encryptEcbHex);

// AES解密 - ECB模式
String decryptEcb = AesUtils.decryptByEcbModeHex(data, key);
System.out.println("AES解密数据-ECB模式: " + decryptEcb);
```

### Sm4加解密

Sm4直接调用单包中工具
```java
// Sm4加密 - ECB模式
String encryptEcb = Sm4Util.encryptByEcbMode(secretKey, paramStr);
System.out.println("Sm4加密-ECB模式: " + encryptEcb);

// Sm4解密 - ECB模式
String decryptEcb = Sm4Util.decryptByEcbMode(secretKey, cipherText);
System.out.println("Sm4解密-ECB模式: " + decryptEcb);

// Sm4加密 - CBC模式
String encryptCbc = Sm4Util.encryptByCbcMode(secretKey, iv, paramStr);
System.out.println("Sm4加密-CBC模式: " + encryptCbc);

// Sm4解密 - CBC模式
String decryptCbc = Sm4Util.decryptByCbcMode(secretKey, iv, cipherText);
System.out.println("Sm4解密-CBC模式: " + decryptCbc);
```