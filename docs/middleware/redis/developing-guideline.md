Redis 开发规范
===============================

## 一、概述

### 0x01.Redis官网规范

Redis keys are binary safe, this means that you can use any binary sequence as a key, from a string like "foo" to the content of a JPEG file. The empty string is also a valid key.

https://redis.io/docs/data-types/tutorial/

### 0x02.阿里云Redis开发运维规范

云数据库Redis拥有极强的性能，阿里云结合多年的运维经验，从业务部署、Key的设计、SDK、命令、运维管理等维度展示云数据库Redis开发运维规范，为您设计高效的业务系统提供参考，帮助您充分发挥Redis的能力。

https://help.aliyun.com/document_detail/251467.html


## 二、Key设计规范

:::warning 提醒
key命名需具有可读性以及可管理性，不该使用含义不清的key以及特别长的key名
:::

### 0x01.命名风格

- 以英文字母开头，命名中只能出现小写字母、数字、英文中横线`(-)`、和英文半角冒号`(:)`

- 不要包含特殊字符，如下划线、空格、换行、单双引号以及其他转义字符

- 多个单词的拼接在Redis官网中推荐使用英文中横线`(-)`或英文点号`(.)`，团队约定<font color=green>**使用英文中横线`(-)`**</font>，<font color=red>**禁用英文点号`(.)`**</font>，

### 0x02.命名规范

- 项目名`:`业务系统名`:`业务模块名`:`业务逻辑含义（表名）`:`用于区分 key 的字段（主键列名）`:`主键值
- 项目名`:`业务系统名`:`业务模块名`:`主键值
- 项目名`:`业务系统名`:`主键值
- 。。。。。。

:::tip 业务逻辑含义
- 不同业务逻辑含义使用英文半角冒号`(:)`分割
- 同一业务逻辑含义段的单词之间使用英文中横线`(-)`分割，用来表示一个完整的语义
:::

### 0x03.示例

- project:file-srv:multipart-ct
- project:file-srv:upload-id:a282465782586417152
- project:activity:answer:1
- project:activity:wechat-jsapi-ticket
- project:activity:wechat-access-token




