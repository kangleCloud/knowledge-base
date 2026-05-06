# 常用操作语句

## 创建数据库
```SQL
CREATE DATABASE IF NOT EXISTS database_name;
```

## 删除数据库
```SQL
DROP DATABASE IF EXISTS database_name;
```

## 使用数据库
```SQL
USE database_name;
```

## 创建表
### 0x01.创建普通表
```SQL
CREATE TABLE IF NOT EXISTS database_name.table_name (
  created_date DATE,
  action_id STRING,
  action_type STRING,
  content_url STRING,
  content_name STRING,
  content_index STRING,
  content_area STRING,
  page_title STRING,
  pv BIGINT,
  uv BIGINT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
STORED AS ORC
```

### 0x02.创建外部表
```shell
# 创建文件路径
/home/hadoop/hadoop-3.3.6/bin/hdfs dfs -mkdir /user/hive/warehouse/database_name.db/table_name
# 导入数据
/home/hadoop/hadoop-3.3.6/bin/hdfs dfs -put user_tag.csv /user/hive/warehouse/database_name.db/table_name
```

```SQL
CREATE EXTERNAL TABLE IF NOT EXISTS database_name.table_name (
  id BIGINT,
  idcard STRING,
  salt STRING,
  idcard_type TINYINT,
  mobile STRING,
  szd_uid STRING,
  sex TINYINT,
  birth_year INT
)  
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
STORED AS TEXTFILE
LOCATION 'hdfs://hadoop-m-1:9820/user/hive/warehouse/database_name.db/table_name';
```

### 0x03.创建分区表
```SQL
CREATE EXTERNAL TABLE IF NOT EXISTS database_name.table_name (
  id INT,
  created_at INT,
  created_date DATE,
  app_version STRING,
  country STRING,
  province STRING,
  city STRING,
  district STRING,
  address STRING,
  coord_type INT
)
PARTITIONED BY (days_month BIGINT)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
STORED AS ORC
LOCATION 'hdfs://hadoop-m-1:9820/user/hive/warehouse/database_name.db/table_name';
```

## 修改表
### 0x01.增加分区
```SQL
ALTER TABLE database_name.table_name ADD IF NOT EXISTS PARTITION(days_month=202411);
```

### 0x02.重命名表
```SQL
ALTER TABLE table_name RENAME TO new_table_name;
```

## 删除表
```SQL
DROP TABLE IF EXISTS table_name;
```

## 将查询数据插入表
```SQL
INSERT INTO board_stat.app_action_log_click (created_date,action_id,action_type,page_title,pv,uv)
SELECT          
  created_date,
  action_id,
  action_type,
  page_title,
  COUNT(*) AS pv,
  COUNT(DISTINCT device_id) AS uv
FROM
  szd_stat.app_action_log WHERE action_type = 'click' AND days_month=202410 GROUP BY created_date,action_id,action_type,page_title;
```

## 参考资料
- https://cwiki.apache.org/confluence/display/Hive/LanguageManual
- https://blog.csdn.net/aeluwl2038/article/details/102250683 