# DataX安装

## 一、简介
DataX 是一个异构数据源离线同步工具，致力于实现包括关系型数据库(MySQL、Oracle等)、HDFS、Hive、ODPS、HBase、FTP等各种异构数据源之间稳定高效的数据同步功能。

## 二、安装
### 0x01.环境要求
- Linux
- JDK(1.8以上，推荐1.8)
- Python(2或3都可以)
- Apache Maven 3.x (Compile DataX)

### 0x02.安装方式1 - 直接下载DataX工具包（推荐）
下载后解压至本地某个目录，进入bin目录，即可运行同步作业
```bash
cd /usr/local/src
wget https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202309/datax.tar.gz
tar -xzvf datax.tar.gz -C /usr/local/datax
```
自检脚本
```bash
python /usr/local/datax/bin/datax.py /usr/local/datax/job/job.json
```

### 0x02.安装方式2 - 下载DataX源码，自己编译
下载DataX源码
```bash
cd /usr/local/src
git clone git@github.com:alibaba/DataX.git
```

通过maven打包
```bash
cd {DataX_source_code_home}
mvn -U clean package assembly:assembly -Dmaven.test.skip=true
```

打包成功，日志显示如下：  
```bash
[INFO] BUILD SUCCESS
[INFO] -----------------------------------------------------------------
[INFO] Total time: 08:12 min
[INFO] Finished at: 2015-12-13T16:26:48+08:00
[INFO] Final Memory: 133M/960M
[INFO] -----------------------------------------------------------------
```
打包成功后的DataX包位于 {DataX_source_code_home}/target/datax/datax/ ，结构如下：  
```bash
$ cd {DataX_source_code_home}
$ ls ./target/datax/datax/
bin		conf		job		lib		log		log_perf	plugin		script		tmp
```

## 三、示例 从mysql读取数据并写入到Hive中
app_action_log_mysql2hive.json
```json
{
    "job": {
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
                        "column": [
                            "id",
							"created_at",
							"created_date",
							"action_id",
							"action_type",
							"action_time",
							"action_value",
							"action_status",
							"control_id",
							"page_url",
							"page_title",
							"page_info",
							"referrer",
							"session_id",
							"startup_id",
							"scroll_rate",
							"user_id",
							"view_time",
							"device_id"
                        ],
                        "connection": [
                            {
                                "jdbcUrl": [
                                    "jdbc:mysql://192.167.103.3:3306/szd_stat?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=GMT%2B8"
                                ],
                                "table": [
                                    "app_action_log_${days_month}"
                                ]
                            }
                        ],
                        "password": "xxxxxxxxxxxxx",
                        "username": "xxxxxxxxxxxxx",
                        "where": "id > ${id}"
                    }
                },
                "writer": {
                    "name": "hdfswriter",
                    "parameter": {
                        "column": [
                          {"name": "id", "type": "INT"},
						  {"name": "created_at", "type": "INT"},
						  {"name": "created_date", "type": "DATE"},
						  {"name": "action_id", "type": "STRING"},
						  {"name": "action_type", "type": "STRING"},
						  {"name": "action_time", "type": "STRING"},
						  {"name": "action_value", "type": "STRING"},
						  {"name": "action_status", "type": "STRING"},
						  {"name": "control_id", "type": "STRING"},
						  {"name": "page_url", "type": "STRING"},
						  {"name": "page_title", "type": "STRING"},
						  {"name": "page_info", "type": "STRING"},
						  {"name": "referrer", "type": "STRING"},
						  {"name": "session_id", "type": "STRING"},
						  {"name": "startup_id", "type": "STRING"},
						  {"name": "scroll_rate", "type": "STRING"},
						  {"name": "user_id", "type": "STRING"},
						  {"name": "view_time", "type": "STRING"},
						  {"name": "device_id", "type": "STRING"}
                        ],
                        "compress": "SNAPPY",
                        "defaultFS": "hdfs://192.168.150.75:9820",
                        "fieldDelimiter": "\t",
                        "fileName": "part-",
                        "fileType": "orc",
                        "path": "/user/hive/warehouse/szd_stat.db/app_action_log",
                        "writeMode": "append"
                    }
                }
            }
        ],
        "setting": {
            "speed": {
                "channel": "3"
            }
        }
    }
}
```
执行命令
```bash
python /usr/local/datax/bin/datax.py  -p"-Ddays_month=202410 -Did=100284130" /usr/local/datax/job/app_action_log_mysql2hive.json
```

## 四、参考资料
- https://github.com/alibaba/DataX
- https://github.com/alibaba/DataX/blob/master/userGuid.md
- https://blog.csdn.net/tototuzuoquan/article/details/102601515


