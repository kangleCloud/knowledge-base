# MySQL SQL 高级语句

## 一、DML 数据操作语言

### $01.插入查询结果

- 从一个表中复制所有的列插入到另一个已存在的表中
```sql
INSERT INTO table2 SELECT * FROM table1;
```

- 只复制指定的列插入到另一个已存在的表中
```sql
INSERT INTO table2 (column_name(s)) SELECT column_name(s) FROM table1;
```

### $02.删除重复数据

查询重复的数据
```sql
SELECT column1_name, column2_name, COUNT(*) as ct FROM `table1`
GROUP BY column1_name,column2_name
HAVING ct > 1
```

删除重复数据
```sql
DELETE t1 FROM `table1` t1
INNER JOIN `table1` t2
WHERE t1.column1_name = t2.column1_name
    AND t1.column2_name = t2.column2_name
    AND t1.id < t2.id;
```

:::tip
- id 为 table1 的主键
- column1_name, column2_name 为 table1 的字段名
:::

### $03.更新主表用户的答题次数
每日答题记录
```sql
CREATE TABLE `answer_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL DEFAULT '' COMMENT '微信openid',
  `questions` text NOT NULL COMMENT '本轮题目',
  `user_answers` text NOT NULL COMMENT '用户提交的答案',
  `right_num` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '正确数量',
  `is_submit` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否提交',
  `start_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '答题开始时间',
  `end_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '答题结束时间',
  `use_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '消耗时长 秒',
  `scores` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '获得的分数',
  `created_ip` varchar(15) NOT NULL DEFAULT '' COMMENT '当前ip',
  `created_ua` varchar(500) NOT NULL COMMENT '当前ua',
  `created_daytime` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '当前日期 年月日',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建日期',
  `lat` varchar(100) NOT NULL DEFAULT '' COMMENT '维度',
  `lng` varchar(100) NOT NULL DEFAULT '' COMMENT '经度',
  `province` varchar(100) NOT NULL DEFAULT '' COMMENT '省',
  `city` varchar(100) NOT NULL DEFAULT '' COMMENT '市',
  `district` varchar(100) NOT NULL DEFAULT '' COMMENT '区',
  `township` varchar(100) NOT NULL DEFAULT '' COMMENT '街道',
  `gps_deal` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '经纬度是否处理 0不需处理 1待处理 2已处理',
  PRIMARY KEY (`id`),
  KEY `openid` (`openid`,`created_daytime`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COMMENT='每日答题记录';
```

答题参与用户
```sql
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL DEFAULT '' COMMENT '微信openid',
  `nickname` varchar(100) NOT NULL DEFAULT '' COMMENT '微信昵称',
  `submit_num` int(3) unsigned NOT NULL DEFAULT '0' COMMENT '答题次数',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`),
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COMMENT='答题参与用户';
```


```sql
UPDATE user a LEFT JOIN 
(SELECT COUNT(*) as num,openid FROM answer_log WHERE is_submit = 1 GROUP BY openid) b 
ON b.openid = a.openid SET a.submit_num = b.num WHERE b.num IS NOT NULL
```

### $04.插入或更新操作
```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...)
ON DUPLICATE KEY UPDATE
    column1 = VALUES(column1),
    column2 = VALUES(column2), ...
```
:::tip
- 表中需要有一个或多个列被定义为唯一索引，以触发这个行为
- VALUES(column_name)是一个特殊语法，表示使用原本尝试插入的值来进行更新。你也可以直接指定固定的值或表达式，比如column1 = column1 + 1来实现递增等操作
:::


## 二、DQL 数据查询语言

### $01.查询主表用户的答题次数
每日答题记录
```sql
CREATE TABLE `answer_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL DEFAULT '' COMMENT '微信openid',
  `questions` text NOT NULL COMMENT '本轮题目',
  `user_answers` text NOT NULL COMMENT '用户提交的答案',
  `right_num` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '正确数量',
  `is_submit` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否提交',
  `start_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '答题开始时间',
  `end_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '答题结束时间',
  `use_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '消耗时长 秒',
  `scores` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '获得的分数',
  `created_ip` varchar(15) NOT NULL DEFAULT '' COMMENT '当前ip',
  `created_ua` varchar(500) NOT NULL COMMENT '当前ua',
  `created_daytime` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '当前日期 年月日',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建日期',
  `lat` varchar(100) NOT NULL DEFAULT '' COMMENT '维度',
  `lng` varchar(100) NOT NULL DEFAULT '' COMMENT '经度',
  `province` varchar(100) NOT NULL DEFAULT '' COMMENT '省',
  `city` varchar(100) NOT NULL DEFAULT '' COMMENT '市',
  `district` varchar(100) NOT NULL DEFAULT '' COMMENT '区',
  `township` varchar(100) NOT NULL DEFAULT '' COMMENT '街道',
  `gps_deal` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '经纬度是否处理 0不需处理 1待处理 2已处理',
  PRIMARY KEY (`id`),
  KEY `openid` (`openid`,`created_daytime`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COMMENT='每日答题记录';
```

答题参与用户
```sql
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL DEFAULT '' COMMENT '微信openid',
  `nickname` varchar(100) NOT NULL DEFAULT '' COMMENT '微信昵称',
  `submit_num` int(3) unsigned NOT NULL DEFAULT '0' COMMENT '答题次数',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`),
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COMMENT='答题参与用户';
```

```sql
SELECT a.openid,b.num FROM user a LEFT JOIN 
(SELECT COUNT(*) as num,openid FROM answer_log WHERE is_submit = 1 GROUP BY openid) b
ON b.openid = a.openid
```
## 三、其他

### $01.临时启用通用查询日志

```sql
SET GLOBAL general_log_file = '/data/mysql/mysqld-general.log';
SET GLOBAL general_log = 'ON';
```

:::warning
启用 general_log 会记录所有 SQL 查询操作，可能导致数据库性能下降。此功能应作为诊断工具仅在必要时临时开启，问题解决后务必通过`SET GLOBAL general_log = 'OFF';`指令及时关闭，以避免持续的性能开销。
:::

:::tip
- 查看日志文件位置：`SHOW VARIABLES LIKE 'general_log%';` 
:::


