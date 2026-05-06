# Java编码规范
> 内容摘录自阿里巴巴Java开发手册

## 命名风格
1. 【强制】代码中的命名均不能以下划线或美元符号开始，也不能以下划线或美元符号结束。
    :::warning 说明
    反例：_name / __name / $Object / name_ / name$ / Object$
    :::

2. 【强制】方法名、参数名、成员变量、局部变量都统一使用 lowerCamelCase 风格，必须遵从驼峰形式。
    :::warning 说明
    正例： localValue / getHttpMessage() / inputUserId
    :::

3. 【强制】类名使用 UpperCamelCase 风格，必须遵从驼峰形式，但以下情形例外：DO / BO / DTO / VO / AO
    :::warning 说明
    正例：MarcoPolo / UserDO / XmlService / TcpUdpDeal / TaPromotion  
    反例：macroPolo / UserDo / XMLService / TCPUDPDeal / TAPromotion
    :::

4. 【强制】代码中的命名严禁使用拼音与英文混合的方式，更不允许直接使用中文的方式。
    :::warning 说明
    正确的英文拼写和语法可以让阅读者易于理解，避免歧义。注意，即使纯拼音命名方式也要避免采用  
    正例：alibaba / taobao / youku / hangzhou 等国际通用的名称，可视同英文。  
    反例：DaZhePromotion [打折] / getPingfenByName() [评分] / int 某变量 = 3  
    :::

5. 【强制】常量命名全部大写，单词间用下划线隔开，力求语义表达完整清楚，不要嫌名字长。
    :::warning 说明
    正例：MAX_STOCK_COUNT  
    反例：MAX_COUNT  
    :::

6. 【强制】包名统一使用小写，点分隔符之间有且仅有一个自然语义的英语单词。包名统一使用单数形式，但是类名如果有复数含义，类名可以使用复数形式。
    :::warning 说明
    正例： 应用工具类包名为 com.alibaba.open.util、类名为 MessageUtils（此规则参考spring的框架结构）
    :::

7. 【强制】抽象类命名使用Abstract或Base开头；异常类命名使用Exception结尾；测试类命名以它要测试的类的名称开始，以Test结尾。

8. 【强制】中括号是数组类型的一部分，数组定义如下：String[] args;
    :::warning 说明
    反例：使用 String args[]的方式来定义
    :::

## 常量定义
1. 【强制】不允许任何魔法值（即未经定义的常量）直接出现在代码中。
    :::warning 说明
    反例：String key = "Id#taobao_" + tradeId;  
         cache.put(key, value);
    :::

2. 【强制】long 或者 Long 初始赋值时，使用大写的 L，不能是小写的 l，小写容易跟数字 1 混淆，造成误解。
    :::warning 说明
    Long a = 2l; 写的是数字的 21，还是 Long 型的 2?
    :::

3. 【强制】不要使用一个常量类维护所有常量，按常量功能进行归类，分开维护。
    :::warning 说明
    大而全的常量类，非得使用查找功能才能定位到修改的常量，不利于理解和维护。  
    正例：缓存相关常量放在类 CacheConsts 下；系统配置相关常量放在类 ConfigConsts 下。
    :::

## 代码格式
1.  【强制】大括号的使用约定。如果是大括号内为空，则简洁地写成{}即可，不需要换行；如果是非空代码块则：
    - 左大括号前不换行。
    - 左大括号后换行。
    - 右大括号前换行。
    - 右大括号后还有 else 等代码则不换行；表示终止的右大括号后必须换行。

2. 【强制】 左小括号和字符之间不出现空格；同样，右小括号和字符之间也不出现空格。
    :::warning 说明
    反例：if (空格 a == b 空格)
    :::

3. 【强制】if/for/while/switch/do 等保留字与括号之间都必须加空格。

4. 【强制】任何二目、三目运算符的左右两边都需要加一个空格。
    :::warning 说明
    运算符包括赋值运算符=、逻辑运算符&&、加减乘除符号等。
    :::

5. 【强制】采用 4 个空格缩进，禁止使用 tab 字符。
    :::warning 说明
    如果使用tab缩进，必须设置1个tab为4个空格。IDEA设置tab为4个空格时，请勿勾选Use tab character；  
    而在eclipse中，必须勾选 insert spaces for tabs。
    :::

6. 【强制】注释的双斜线与注释内容之间有且仅有一个空格。
    :::warning 说明
    正例：// 注释内容，注意在//和注释内容之间有一个空格。
    :::

7. 【强制】单行字符数限制不超过120个，超出需要换行，换行时遵循如下原则：
    - 第二行相对第一行缩进 4 个空格，从第三行开始，不再继续缩进，参考示例。
    - 运算符与下文一起换行。
    - 方法调用的点符号与下文一起换行。
    - 方法调用时，多个参数，需要换行时，在逗号后进行。
    - 在括号前不要换行，见反例。
    :::warning 说明
    正例：
    ```java
    StringBuffer sb = new StringBuffer();   
    // 超过 120 个字符的情况下，换行缩进 4 个空格，点号和方法名称一起换行  
    sb.append("zi").append("xin")...   
        .append("huang")...   
        .append("huang")...   
        .append("huang");  
    ```
    反例：
            StringBuffer sb = new StringBuffer();   
            // 超过 120 个字符的情况下，不要在括号前换行  
            sb.append("zi").append("xin")...append   
            ("huang");   
            // 参数很多的方法调用可能超过 120 个字符，不要在逗号前换行  
            method(args1, args2, args3, ...   
            , argsX);  
    :::

8.  【强制】方法参数在定义和传入时，多个参数逗号后边必须加空格。
    :::warning 说明
    正例：下例中实参的"a",后边必须要有一个空格。
    method("a", "b", "c");
    :::

9. 【强制】IDE的text file encoding设置为UTF-8; IDE中文件的换行符使用Unix格式，不要使用Windows格式。

10. 【推荐】没有必要增加若干空格来使某一行的字符与上一行对应位置的字符对齐。
    :::warning 说明
    正例：
        int a = 3;   
        long b = 4L;   
        float c = 5F;   
        StringBuffer sb = new StringBuffer();   
        增加sb这个变量，如果需要对齐，则给 a、b、c都要增加几个空格，在变量比较多的情况下，是一种累赘的事情。  
    :::

## OOP规约
1. 【强制】避免通过一个类的对象引用访问此类的静态变量或静态方法，无谓增加编译器解析成本，直接用类名来访问即可。

2. 【强制】所有的覆写方法，必须加@Override注解。
    :::warning 说明
    getObject()与 get0bject()的问题。一个是字母的O，一个是数字的0，加@Override可以准确判断是否覆盖成功。  
    另外，如果在抽象类中对方法签名进行修改，其实现类会马上编译报错。
    :::

3. 【强制】相同参数类型，相同业务含义，才可以使用Java的可变参数，避免使用Object。
    :::warning 说明
    可变参数必须放置在参数列表的最后。（提倡同学们尽量不用可变参数编程）  
    正例：public User getUsers(String type, Integer... ids) {...}
    :::

4. 【强制】Object的equals方法容易抛空指针异常，应使用常量或确定有值的对象来调用equals。
    :::warning 说明
    正例："test".equals(object);  
    反例：object.equals("test");  
    说明：推荐使用 java.util.Objects#equals（JDK7 引入的工具类）  
    :::

5. 【强制】所有的相同类型的包装类对象之间值的比较，全部使用equals方法比较。
    :::warning 说明
    对于Integer var = ?在-128至127范围内的赋值，Integer对象是在  
    IntegerCache.cache 产生，会复用已有对象，这个区间内的Integer值可以直接使用==进行  
    判断，但是这个区间之外的所有数据，都会在堆上产生，并不会复用已有对象，这是一个大坑，  
    推荐使用 equals 方法进行判断。  
    :::

## 控制语句
1. 【强制】在一个 switch 块内，每个 case 要么通过 break/return 等来终止，要么注释说明程
序将继续执行到哪一个 case 为止；在一个 switch 块内，都必须包含一个 default 语句并且
放在最后，即使它什么代码也没有。

2. 【强制】在 if/else/for/while/do 语句中必须使用大括号。
:::warning 说明
反例：if (condition) statements;  
即使只有一行代码，也要采用大括号的编码方式。
::: 

3. 【推荐】表达异常的分支时，少用if-else方式，这种方式可以改写成：
:::warning 说明
if (condition) {   
    ...   
    return obj;   
}   
// 接着写 else 的业务逻辑代码;  

如果非得使用if()...else if()...else...方式表达逻辑,避免后续代码维护困难，请勿超过3层。 
::: 

4. 【推荐】除常用方法（如getXxx/isXxx）等外，不要在条件判断中执行其它复杂的语句，将复
杂逻辑判断的结果赋值给一个有意义的布尔变量名，以提高可读性。
    :::warning 说明
    很多if语句内的逻辑相当复杂，阅读者需要分析条件表达式的最终结果，才能明确什么  
    样的条件执行什么样的语句，那么，如果阅读者分析逻辑表达式错误呢？  
    正例：  
    // 伪代码如下  
    final boolean existed = (file.open(fileName, "w") != null) && (...) || (...);  
    if (existed) {  
        ...  
    }   
    反例：  
    if ((file.open(fileName, "w") != null) && (...) || (...)) {  
        ...  
    }  
    :::

5. 【推荐】循环体中的语句要考量性能，以下操作尽量移至循环体外处理，如定义对象、变量、
获取数据库连接，进行不必要的try-catch操作（这个try-catch是否可以移至循环体外）

## 注释规约
1. 【强制】类、类属性、类方法的注释必须使用Javadoc规范，使用/**内容*/格式，不得使用
// xxx 方式

2. 【强制】所有的抽象方法（包括接口中的方法）必须要用Javadoc注释、除了返回值、参数、异常说明外，
    还必须指出该方法做什么事情，实现什么功能。

3. 【强制】所有的类都必须添加创建者和创建日期。
:::warning 说明
在设置模板时，注意 IDEA 的@author 为`${USER}`，而 eclipse 的@author 为`${user}`，大小写有区别，而日期
的设置统一为 yyyy/MM/dd 的格式。  

正例：
```java
/**
*
* @author yangguanbao
* @date 2021/11/26
*
**/
```
:::

4. 【强制】方法内部单行注释，在被注释语句上方另起一行，使用//注释。方法内部多行注释
使用/* */注释，注意与代码对齐。

5. 【强制】所有的枚举类型字段必须要有注释，说明每个数据项的用途。

## 日期时间
1. 【强制】日期格式化时，传入 pattern 中表示年份统一使用小写的 y。
说明：日期格式化时，yyyy 表示当天所在的年，而大写的 YYYY 代表是 week in which year（JDK7 之后引入的概念），
意思是当天所在的周属于的年份，一周从周日开始，周六结束，只要本周跨年，返回的 YYYY 就是下一年。
:::warning 说明
正例：表示日期和时间的格式如下所示：
new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")

反例：某程序员因使用 YYYY/MM/dd 进行日期格式化，2017/12/31 执行结果为 2018/12/31，造成线上故障。
:::

2. 【强制】在日期格式中分清楚大写的 M 和小写的 m，大写的 H 和小写的 h 分别指代的意义。
:::warning 说明
日期格式中的这两对字母表意如下：  
1）表示月份是大写的 M  
2）表示分钟则是小写的 m  
3）24 小时制的是大写的 H  
4）12 小时制的则是小写的 h  
:::

3. 【强制】获取当前毫秒数：System.currentTimeMillis()；而不是 new Date().getTime()。  
:::warning 说明
获取纳秒级时间，则使用 System.nanoTime 的方式。在 JDK8 中，针对统计时间等场景，推荐使用 Instant 类。
:::

4. 【强制】不允许在程序任何地方中使用：1）java.sql.Date 2）java.sql.Time 3）java.sql.Timestamp。
:::warning 说明
第1个不记录时间，getHours() 抛出异常；第2个不记录日期，getYear() 抛出异常；第3个在构造方法
super((time / 1000) * 1000)，在 Timestamp 属性 fastTime 和 nanos 分别存储秒和纳秒信息。  
反例：java.util.Date.after(Date) 进行时间比较时，当入参是 java.sql.Timestamp 时，会触发 JDK BUG（JDK9 已修
复），可能导致比较时的意外结果。
:::

5. 【强制】禁止在程序中写死一年为 365 天，避免在公历闰年时出现日期转换错误或程序逻辑错误。
:::warning 说明
正例：
// 获取今年的天数  
int daysOfThisYear = LocalDate.now().lengthOfYear();  
// 获取指定某年的天数  
LocalDate.of(2011, 1, 1).lengthOfYear();  

反例：  
// 第一种情况：在闰年 366 天时，出现数组越界异常  
int[] dayArray = new int[365];  
// 第二种情况：一年有效期的会员制，2020年1月26日注册，硬编码 365 返回的却是2021年1月25日  
Calendar calendar = Calendar.getInstance();  
calendar.set(2020, 1, 26);  
calendar.add(Calendar.DATE, 365);  
:::

## 集合处理
1. 【强制】关于 hashCode 和 equals 的处理，遵循如下规则：
:::warning 说明
1）只要覆写 equals，就必须覆写 hashCode。  
2）因为 Set 存储的是不重复的对象，依据 hashCode 和 equals 进行判断，所以 Set 存储的对象必须覆写这两种方法。  
3）如果自定义对象作为 Map 的键，那么必须覆写 hashCode 和 equals。  
String 因为覆写了 hashCode 和 equals 方法，所以可以愉快地将 String 对象作为 key 来使用。  
:::

2. 【强制】判断所有集合内部的元素是否为空，使用 isEmpty() 方法，而不是 size() == 0 的方式。 
:::warning 说明
在某些集合中，前者的时间复杂度为 O(1)，而且可读性更好。  
正例：
```java
Map<String, Object> map = new HashMap<>(16);  
if (map.isEmpty()) {  
    System.out.println("no element in this map.");  
}  
```
:::

3. 【强制】在使用 java.util.stream.Collectors 类的 toMap() 方法转为 Map 集合时，一定要使用参数类型
为 BinaryOperator，参数名为 mergeFunction 的方法，否则当出现相同 key 时会抛出
IllegalStateException 异常。
:::warning 说明
参数 mergeFunction 的作用是当出现 key 重复时，自定义对 value 的处理策略。  

正例：
```java
List<Pair<String, Double>> pairArrayList = new ArrayList<>(3);  
pairArrayList.add(new Pair<>("version", 12.10));  
pairArrayList.add(new Pair<>("version", 12.19));  
pairArrayList.add(new Pair<>("version", 6.28));  
// 生成的 map 集合中只有一个键值对：{version=6.28}  
Map<String, Double> map = pairArrayList.stream()  
    .collect(Collectors.toMap(Pair::getKey, Pair::getValue, (v1, v2) -> v2));  
```
反例：
```java
String[] departments = new String[]{"RDC", "RDC", "KKB"};  
// 抛出 IllegalStateException 异常  
Map<Integer, String> map = Arrays.stream(departments)  
    .collect(Collectors.toMap(String::hashCode, str -> str));  
```
:::

4. 【强制】在使用 java.util.stream.Collectors 类的 toMap() 方法转为 Map 集合时，一定要注意当 value
为 null 时会抛 NPE 异常。
:::warning 说明
在 java.util.HashMap 的 merge 方法里会进行如下的判断：  
if (value == null || remappingFunction == null)  
    throw new NullPointerException();  

反例：  
```java
List<Pair<String, Double>> pairArrayList = new ArrayList<>(2);  
pairArrayList.add(new Pair<>("version1", 8.3));     
pairArrayList.add(new Pair<>("version2", null));    
// 抛出 NullPointerException 异常   
Map<String, Double> map = pairArrayList.stream()    
    .collect(Collectors.toMap(Pair::getKey, Pair::getValue, (v1, v2) -> v2))    
```
:::

5. 【强制】ArrayList 的 subList 结果不可强转成 ArrayList，否则会抛出 ClassCastException 异常：
java.util.RandomAccessSubList cannot be cast to java.util.ArrayList。
:::warning 说明
subList() 返回的是 ArrayList 的内部类 SubList，并不是 ArrayList 本身，而是 ArrayList 的一个视图，对于
SubList 的所有操作最终会反映到原列表上。
:::

6. 【强制】使用 Map 的方法 keySet() / values() / entrySet() 返回集合对象时，不可以对其进行添加元素
操作，否则会抛出 UnsupportedOperationException 异常。

7. 【强制】Collections 类返回的对象，如：emptyList() / singletonList() 等都是 immutable list，不可
对其进行添加或者删除元素的操作。
:::warning 说明
反例：如果查询无结果，返回 Collections.emptyList() 空集合对象，调用方一旦在返回的集合中进行了添加元素的操
作，就会触发 UnsupportedOperationException 异常。
:::

8. 【强制】在 subList 场景中，高度注意对父集合元素的增加或删除，均会导致子列表的遍历、增加、删除产生 ConcurrentModificationException 异常。
:::warning 说明
抽查表明，90% 的程序员对此知识点都有错误的认知。
:::

9. 【强制】使用集合转数组的方法，必须使用集合的 toArray(T[] array)，传入的是类型完全一致、长度为0的空数组。
:::warning 说明
反例：直接使用 toArray 无参方法存在问题，此方法返回值只能是 Object[]类，若强转其它类型数组将出现
ClassCastException 错误。  

正例：  
```java
List<String> list = new ArrayList<>(2); 
list.add("guan");
list.add("bao");
String[] array = list.toArray(new String[0]);  
``` 
说明：使用 toArray 带参方法，数组空间大小的 length：    
1）等于 0，动态创建与 size 相同的数组，性能最好。   
2）大于 0 但小于 size，重新创建大小等于 size 的数组，增加 GC 负担。 
3）等于 size，在高并发情况下，数组创建完成之后，size 正在变大的情况下，负面影响与 2 相同。  
4）大于 size，空间浪费，且在 size 处插入 null 值，存在 NPE 隐患。   
:::

10. 【强制】使用 Collection 接口任何实现类的addAll()方法时，要对输入的集合参数进行NPE判断。
:::warning 说明
在 ArrayList#addAll 方法的第一行代码即 Object[] a = c.toArray()；其中 c 为输入集合参数，如果为 null，
则直接抛出异常。
:::

11. 【强制】使用工具类 Arrays.asList() 把数组转换成集合时，不能使用其修改集合相关的方法，它的 add
/ remove / clear 方法会抛出 UnsupportedOperationException 异常。
:::warning 说明
asList 的返回对象是一个 Arrays 内部类，并没有实现集合的修改方法。Arrays.asList 体现的是适配器模式，只
是转换接口，后台的数据仍是数组。
```java
String[] str = new String[]{ "yang", "guan", "bao" };
List list = Arrays.asList(str);
```
第一种情况：list.add("yangguanbao"); 运行时异常。   
第二种情况：str[0] = "change"; list 中的元素也会随之修改，反之亦然。    
:::

12. 【强制】泛型通配符<? extends T>来接收返回的数据，此写法的泛型集合不能使用 add 方法，
而<? super T>不能使用 get 方法，两者在接口调用赋值的场景中容易出错。
:::warning 说明
扩展说一下 PECS(Producer Extends Consumer Super) 原则，即频繁往外读取内容的，适合用<? extends T>，经常往里插入的，适合用<? super T>
:::

13. 【强制】在无泛型限制定义的集合赋值给泛型限制的集合时，在使用集合元素时，需要进行instanceof 判断，避免抛出 ClassCastException 异常。
:::warning 说明
毕竟泛型是在 JDK5 后才出现，考虑到向前兼容，编译器是允许非泛型集合与泛型集合互相赋值。  

反例：
```java
    List<String> generics = null;
    List notGenerics = new ArrayList(10);
    notGenerics.add(new Object());
    notGenerics.add(new Integer(1));
    generics = notGenerics;
    // 此处抛出 ClassCastException 异常
    String string = generics.get(0);
```
:::

14. 【强制】不要在 foreach 循环里进行元素的 remove / add 操作。remove 元素请使用 iterator 方式，如果并发操作，需要对 iterator 对象加锁。
:::warning 说明
正例：
```java
List<String> list = new ArrayList<>();
list.add("1");
list.add("2");
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String item = iterator.next();
    if (删除元素的条件) {
        iterator.remove();
    }
}
```

反例：
```java
for (String item : list) {
    if ("1".equals(item)) {
        list.remove(item);
    }
}
// 反例中的执行结果肯定会出乎大家的意料，那么试一下把“1”换成“2”会是同样的结果吗？
```
:::

## 并发处理
1. 【强制】获取单例对象需要保证线程安全，其中的方法也要保证线程安全。
:::warning 说明
资源驱动类、工具类、单例工厂类都需要注意。
:::

2. 【强制】创建线程或线程池时请指定有意义的线程名称，方便出错时回溯。
:::warning 说明
正例：自定义线程工厂，并且根据外部特征进行分组，比如，来自同一机房的调用，把机房编号赋值给whatFeatureOfGroup

```java
public class UserThreadFactory implements ThreadFactory {
    private final String namePrefix;
    private final AtomicInteger nextId = new AtomicInteger(1);
    // 定义线程组名称，在利用 jstack 来排查问题时，非常有帮助
    UserThreadFactory(String whatFeatureOfGroup) {
        namePrefix = "FromUserThreadFactory's" + whatFeatureOfGroup + "-Worker-";
    }
    @Override
    public Thread newThread(Runnable task) {
        String name = namePrefix + nextId.getAndIncrement();
        Thread thread = new Thread(null, task, name, 0, false);
        System.out.println(thread.getName());
        return thread;
    }
}
```
:::

3. 【强制】线程资源必须通过线程池提供，不允许在应用中自行显式创建线程。
:::warning 说明
线程池的好处是减少在创建和销毁线程上所消耗的时间以及系统资源的开销，解决资源不足的问题。如果不使用线程池，有可能造成系统创建大量同类线程而导致消耗完内存或者“过度切换”的问题。
:::

4. 【强制】线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这样的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。
:::warning 说明
Executors 返回的线程池对象的弊端如下：  
1）FixedThreadPool 和 SingleThreadPool：  
允许的请求队列长度为 Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM。  
2）CachedThreadPool：  
允许的创建线程数量为 Integer.MAX_VALUE，可能会创建大量的线程，从而导致 OOM。  
3）ScheduledThreadPool：  
允许的请求队列长度为 Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM。  
:::

5. 【强制】SimpleDateFormat 是线程不安全的类，一般不要定义为 static 变量，如果定义为 static，必须加锁，或者使用 DateUtils 工具类。
:::warning 说明
正例：注意线程安全，使用 DateUtils。亦推荐如下处理：  

```java
private static final ThreadLocal<DateFormat> dateStyle = new ThreadLocal<DateFormat>() {
    @Override
    protected DateFormat initialValue() {
        return new SimpleDateFormat("yyyy-MM-dd");
    }
};
```
如果是JDK8的应用，可以使用 Instant 代替 Date，LocalDateTime 代替 Calendar，DateTimeFormatter 代替
SimpleDateFormat，官方给出的解释：simple beautiful strong immutable thread-safe。
:::

6. 【强制】必须回收自定义的 ThreadLocal 变量记录的当前线程的值，尤其在线程池场景下，线程经常会被复用，如果不清理自定义的 ThreadLocal 变量，可能会影响后续业务逻辑和造成内存泄露等问题。尽量在代码中使用 try-finally 块进行回收。
:::warning 说明
正例：

```java
objectThreadLocal.set(userInfo);
try {
    // ...
} finally {
    objectThreadLocal.remove();
}
```
:::

7. 【强制】高并发时，同步调用应该去考量锁的性能损耗。能用无锁数据结构，就不要用锁；能锁区块，就不要锁整个方法体；能用对象锁，就不要用类锁。
:::warning 说明
尽可能使加锁的代码块工作量尽可能的小，避免在锁代码块中调用 RPC 方法。
:::

8. 【强制】对多个资源、数据库表、对象同时加锁时，需要保持一致的加锁顺序，否则可能会造成死锁。
:::warning 说明
线程一需要对表 A、B、C 依次全部加锁后才可以进行更新操作，那么线程二的加锁顺序也必须是 A、B、C，否则可能出现死锁。
:::

9. 【强制】在使用阻塞等待获取锁的方式中，必须在 try 代码块之外，并且在加锁方法与 try 代码块之间没有任何可能抛出异常的方法调用，避免加锁成功后，在 finally 中无法解锁。
:::warning 说明
说明一：在 lock 方法与 try 代码块之间的方法调用抛出异常，无法解锁，造成其它线程无法成功获取锁。  
说明二：如果 lock 方法在 try 代码块之内，可能由于其它方法抛出异常，导致在 finally 代码块中，unlock 对未加锁的对象解锁，它会调用 AQS 的 tryRelease 方法（取决于具体实现类），抛出 IllegalMonitorStateException 异常。  
说明三：在 Lock 对象的 lock 方法实现中可能抛出 unchecked 异常，产生的后果与说明二相同。  

正例：
```java
Lock lock = new XxxLock();
// ...
lock.lock();
try {
    doSomething();
    doOthers();
} finally {
    lock.unlock();
}
```

反例：
```java
Lock lock = new XxxLock();
// ...
try {
    // 如果此处抛出异常，则直接执行 finally 代码块
    doSomething();
    // 无论加锁是否成功，finally 代码块都会执行
    lock.lock();
    doOthers();
} finally {
    lock.unlock();
}   
```
:::

10. 【强制】在使用尝试机制来获取锁的方式中，进入业务代码块之前，必须先判断当前线程是否持有锁。锁的释放规则与锁的阻塞等待方式相同。
:::warning 说明
Lock 对象的 unlock 方法在执行时，它会调用 AQS 的 tryRelease 方法（取决于具体实现类），如果当前线程不持有锁，则抛出 IllegalMonitorStateException 异常。

正例：
```java
Lock lock = new XxxLock();
// ...
boolean isLocked = lock.tryLock();
if (isLocked) {
    try {
        doSomething();
        doOthers();
    } finally {
        lock.unlock();
    }
}
```
:::

11. 【强制】并发修改同一记录时，避免更新丢失，需要加锁。要么在应用层加锁，要么在缓存加锁，要么在数据库层使用乐观锁，使用 version 作为更新依据。
:::warning 说明
如果每次访问冲突概率小于 20%，推荐使用乐观锁，否则使用悲观锁。乐观锁的重试次数不得小于 3 次。
:::

12. 【强制】多线程并行处理定时任务时，Timer 运行多个 TimeTask 时，只要其中之一没有捕获抛出的异常，其它任务便会自动终止运行，使用 ScheduledExecutorService 则没有这个问题。


## sonar规则
1. AtomicInteger, AtomicLong继承自Number类，但它们与Integer和Long有本质的区别，应该以不同的方式处理。
AtomicInteger和AtomicLong设计用于支持在单个变量上进行无锁、线程安全的编程。因此，一个AtomicInteger实例只会与自身“相等”。
正确的做法应该是通过调用.get()方法获取其值，然后对这些值进行比较。
这同样适用于所有原子型、类似原始类型的包装类：AtomicInteger, AtomicLong, 和 AtomicBoolean。

非合规代码示例
```java
AtomicInteger aInt1 = new AtomicInteger(0);
AtomicInteger aInt2 = new AtomicInteger(0);

if (aInt1.equals(aInt2)) { ... }  // 非合规
```

合规代码示例
```java
AtomicInteger aInt1 = new AtomicInteger(0);
AtomicInteger aInt2 = new AtomicInteger(0);

if (aInt1.get() == aInt2.get()) { ... }  // 合规
```

2. 使用操作符对（如=+, =- 或 =!）而非预期的反转单个操作符（如+=, -= 或 !=）在编译和运行时不会引发错误，但却会导致结果与预期不符。
当=+, =-, 或 =!这样的操作符对被使用，并且两个操作符间没有空格，但在操作符对后至少有一个空白字符时，这条规则会提示问题的存在。

非合规代码示例
```java
int target = -5;
int num = 3;

target =- num;  // 不遵守规范；target = -3。这真的是你的本意吗？
target =+ num; // 不遵守规范；target = 3
```

合规代码示例
```java
int target = -5;
int num = 3;

target = -num;  // 遵守规范；明确表示赋值为num的负数，意图清晰
target += num;  // 遵守规范；target的值将增加num的值
```

