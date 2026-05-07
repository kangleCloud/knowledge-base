# SQL 开发规范

> 大部分内容摘录自阿里巴巴 Java 开发手册

关键字总是大写，如 SELECT 和 WHERE。

最好使用关键字的全称而不是简写，用 ABSOLUTE 而不用 ABS。

## 一、COUNT的使用

- <font color="red">不要使用 COUNT(列名) 或 COUNT(常量) 来替代 COUNT(`*`)</font>，COUNT(`*`) 是 SQL92 定义的标准统计行数的语法，跟数据库无关，跟 NULL 和非 NULL 无关。
:::warning 说明
COUNT(*) 会统计值为 NULL 的行，而 COUNT(列名) 不会统计此列为 NULL 值的行
:::

- COUNT(DISTINCT col) 计算该列除 NULL 之外的不重复行数，注意 COUNT(DISTINCT col1 , col2) 如果其中一列全为 NULL，那么即使另一列有不同的值，也返回为 0

- 当某一列的值全是 NULL 时，COUNT(col) 的返回结果为 0；但 SUM(col) 的返回结果为 NULL，因此使用 SUM() 时需注意 NPE(Null Pointer Exception) 问题。
:::tip
可以使用如下方式来避免 SUM 的 NPE(Null Pointer Exception) 问题：SELECT IFNULL(SUM(column) , 0) FROM table;
:::

## 二、其他补充

- 不得使用外键与级联，一切外键概念必须在应用层解决。
:::tip 说明
（概念解释）学生表中的 student_id 是主键，那么成绩表中的 student_id 则为外键。如果更新学生表中的 student_id，同时触发成绩表中的 student_id 更新，即为级联更新。外键与级联更新适用于单机低并发，不适合分布式、高并发集群；级联更新是强阻塞，存在数据库更新风暴的风险；外键影响数据库的插入速度。
:::

- 禁止使用存储过程，存储过程难以调试和扩展，更没有移植性。

- 数据订正（特别是删除或修改记录操作）时，要先 SELECT，避免出现误删除的情况，确认无误才能执行更新语句。

- IN 操作能避免则避免，若实在避免不了，需要仔细评估 IN 后边的集合元素数量，控制在 1000 个之内。

- TRUNCATE TABLE 比 DELETE 速度快，且使用的系统和事务日志资源少，但 TRUNCATE 无事务且不触发 trigger，有可能造成事故，<font color="red">故禁止在开发代码中使用此语句。</font>

## 三、参考资料

- [Alibaba Java Coding Guidelines](https://github.com/alibaba/p3c)
- [SQL样式指南](https://www.sqlstyle.guide/zh/)