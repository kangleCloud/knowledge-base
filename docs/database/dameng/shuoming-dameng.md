# 达梦发现的注意事项

:::warning <font color="red">数据类型char</font>
:::warning <font color="red">在达梦数据中建议不要使用char的数据类型，为char的时候长度不够的话他会自动填充空字符串，导出查询失败</font>

:::
## 使用SQL语句插入数据
### 【语句】 
insert into 模式名.表名（字段名1，字段名2，...） values （值1，值2，...）；

### 【说明】
(值1,值2,…,值n)中的值顺序、数据类型、个数必须与表结构定义的一致；若提供的值是字符型或日期型，则必须放在单引号内。
格式1：（简化格式，不带字段名）
- 插入单条语句：
insert into 模式名.表名 values （值1，值2，...，值n）;
- 插入多条语句：
insert into 模式名.表名 values （值1，值2，...，值n）,（值1，值2，...，值n）,...;
### 【注意】
注意：不带字段名直接插入数据默认需要输入每一个字段的值，没有则用NULL填补空缺
## 用SQL语句修改数据
格式： update 模式名.表名 set 字段名1=值1，字段名2=值2，......   where 条件表达式；

### 【说明】 
- 1.更新表中的某一条或者某几条记录中的数据，需要使用where子句来指定更新记录的条件：条件成立，更新；条件不成立，不更新。
- 2.如果没有使用where子句，则会将表中所有记录的指定字段都进行更新,因此请谨慎操作;如果需要修改的就是指定字段的所有记录，可省略where子句。
- 3.修改后记得使用commit；保存记录。

### 【例1】 
- 将library模式下bookinfo表中作者是钱焕延的书名由“计算方法”改为“数值计算”
- update library.bookinfo set bookname='数值计算' where author='钱焕延';

### 【例2】
- 将library模式下bookinfo表中的图书编号为"TP312BA/52"的页数改为450，字数改为480000，版本改为第2版
- update library.bookinfo set pagecount=450,wordcount=480000,bookversion='第2版' where  Bookid='TP312BA/52';

### 【例3】
- 将library模式下user表中所有读者的密码全部更改为123
- `update library.user set password='<PASSWORD>';`

## 用SQL语句删除数据
### 【格式】
delete from 模式名.表名 where 条件表达式;

### 【说明】
- 1.删除表中的某一条或者某几条记录，需要使用WHERE子句来指定删除记录的条件：条件成立，删除；条件不成立，不删除。
- 2.如果没有使用where子句，则会将表中所有记录都删除，因此请谨慎操作。

### 【格式1】
delete from 模式名.表名 where 条件表达式;

- ### 【例1】删除library模式下表bookinfo中姓名为李四的记录
delete from library.bookinfo where author='李四';

- ### 【例2】删除library模式下表bookinfo中图书编号为"TP312BA/52"的记录
delete from library.bookinfo where bookid='TP312BA/52';

### 格式2：(无条件格式)
delete from 模式名.表名;

### 【例】删除library模式下表bookinfo中所有记录

delete from library.bookinfo;

### 格式3： (清空表)
truncate table 模式名.表名 ; 

### 【例】清空library模式下表user表中所有记录

truncate table library.user;
## select查询完整语句

主语句：

select [distinct] *|字段名1, 字段名2, 字段名3,....

from 模式名.表名

子语句：

[where 条件表达式1]

[group by 字段名 [having 条件表达式2]]

[order by 字段名 [asc|desc]]

[limit [offset,] 记录数];


## 图形化工具

![](/images/backend/dameng/1.jpg)
![](/images/backend/dameng/2.jpg)
![](/images/backend/dameng/3.jpg)
![](/images/backend/dameng/4.jpg)
![](/images/backend/dameng/5.jpg)
![](/images/backend/dameng/6.jpg)
![](/images/backend/dameng/7.jpg)
![](/images/backend/dameng/8.jpg)
![](/images/backend/dameng/9.jpg)
![](/images/backend/dameng/10.jpg)
