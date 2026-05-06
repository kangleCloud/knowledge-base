# Percona XtraBackup 8.0

[Percona XtraBackup 8.0 does not support making backups of databases created in versions prior to 8.0 of MySQL, Percona Server for MySQL or Percona XtraDB Cluster. As the changes that MySQL 8.0 introduced in data dictionaries, redo log and undo log are incompatible with previous versions, it is currently impossible for Percona XtraBackup 8.0 to also support versions prior to 8.0.](https://docs.percona.com/percona-xtrabackup/8.0/index.html#limitations)

<font color="red">使用 xtrabackup8.0.*（*表示最新的补丁版本）备份 Mysql8.0 或更高的版本。</font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 xtrabackup8.0
:::

## 一、先决条件

### 0x01.安装依赖

```bash
yum -y install perl-Digest-MD5 perl-DBD-MySQL
```

## 二、 基于二进制包安装

### 0x01.下载并解压安装包

截止2023年7月，xtraBackup8.0 的最新稳定版为 v8.0.33

:::tip 下载
➤ [Xtrabackup Software Downloads](https://www.percona.com/downloads)
:::

```bash
cd /usr/local/src
wget https://downloads.percona.com/downloads/Percona-XtraBackup-8.0/Percona-XtraBackup-8.0.33-28/binary/tarball/percona-xtrabackup-8.0.33-28-Linux-x86_64.glibc2.17.tar.gz?_gl=1*rxhph9*_gcl_au*MTY2MzM0MDk2Mi4xNjg3MTUzNDY2

mv percona-xtrabackup-8.0.33-28-Linux-x86_64.glibc2.17.tar.gz?_gl=1*rxhph9*_gcl_au*MTY2MzM0MDk2Mi4xNjg3MTUzNDY2 percona-xtrabackup-8.0.33-28-Linux-x86_64.glibc2.17.tar.gz
tar zxf percona-xtrabackup-8.0.33-28-Linux-x86_64.glibc2.17.tar.gz
mv percona-xtrabackup-8.0.33-28-Linux-x86_64.glibc2.17 /usr/local/xtrabackup8.0
```

### 0x02. 建立软链
   
```bash
ln -sf /usr/local/xtrabackup8.0/bin/* /usr/bin/
```

### 0x03. 测试安装

```bash
xtrabackup --version

# 输出
2023-08-17T16:10:59.040940+08:00 0 [Note] [MY-011825] [Xtrabackup] recognized server arguments: --server-id=1 --datadir=/data/mysql --log_bin=ON 
xtrabackup version 8.0.33-28 based on MySQL server 8.0.33 Linux (x86_64) (revision id: b3a3c3dd)
```

## 三、全量备份-常规备份

### 0x01. 创建备份存放目录
```bash
mkdir -p /data/mysql_backup
```

### 0x02. 手动创建备份

> **注：**`socket`文件需要根据MySQL8.0 配置文件所配置的`socket`选项配置。

```bash
xtrabackup --backup --user=root --password='<PASSWORD>' --socket=/tmp/mysql.sock --target-dir=/data/mysql_backup/$(date +%Y-%m-%d_%H-%M-%S)
```

### 0x03. 配置定时任务

> **注：** 此计划任务会在完成一次备份之后删除30天之前的备份

```bash
00 01 * * * xtrabackup --backup --user=root --password='<PASSWORD>' --socket=/tmp/mysql.sock --target-dir=/data/mysql_backup && find /data/mysql_backup/$(date +%Y-%m-%d_%H-%M-%S) -mtime +30 -exec rm -rf {} \;
```
## 四、全量备份-压缩备份

### 0x01. 创建备份存放目录
```bash
mkdir -p /data/mysql_backup
```

### 0x02. 创建备份脚本

`vim mysql_compressBack.sh`
```bash
#!/bin/bash

###########################################
#                                         #
# 此脚本仅用于mysql8 数据库备份、压缩及清理  #
#                                         # 
###########################################

# 数据库连接信息
DB_USER="${Username}"
DB_PASSWORD="${Password}"
DB_HOST="${Host}"
DB_SOCKET="${Socket}"


# 备份目录信息
BAK_DIR="${Path}"

# 保留日期
SAVE_DAY=30

# 输出日志
OUT_LOG="/root/innobak.log"

check_status(){

    local statu=$1
    local proc_name=$2

    if [ $statu -eq 0 ];then
        echo "${proc_name}成功 " >> ${OUT_LOG}
    else
        echo "${proc_name}失败,请检查 " >> ${OUT_LOG}
    fi
}

echo "`date +'%Y-%m-%d_%H-%M-%S'`：开始备份" >> ${OUT_LOG}
# 执行备份
xtrabackup --backup --user=${DB_USER} --password=${DB_PASSWORD} --socket=${DB_SOCKET} --target-dir=${BAK_DIR}/$(date +%Y-%m-%d_%H-%M-%S)
check_status "$?" "backup"

# 执行压缩
file_name=`ls -lrth ${BAK_DIR} | tail -n 1 | awk '{print $NF}'`
cd ${BAK_DIR} && tar -zcvf ${BAK_DIR}/${file_name}.tar.gz ${file_name} && rm -rf ${BAK_DIR}/${file_name}
check_status "$?" "compress"

# 清除超过${SAVE_DAY}天备份文件
file_num=`find ${BAK_DIR} -type f -name "*.tar.gz" -mtime +${SAVE_DAY} | wc -l`
if [ ${file_num} -gt 0 ];then
    find ${BAK_DIR} -type f -name "*.tar.gz" -mtime +${SAVE_DAY} -exec rm {}\;
    check_status "$?" "clean"
else
    echo "未找到超过${SAVE_DAY}天的备份文件" >> ${OUT_LOG}
fi
echo "`date +'%Y-%m-%d_%H-%M-%S'`：结束备份" >> ${OUT_LOG}
```

> **注：**`socket`文件需要根据MySQL8.0 配置文件所配置的`socket`选项配置。

### 0x03. 配置定时任务

> **注：** 此计划任务会在完成一次备份之后删除30天之前的备份

```bash
00 01 * * * sh /scripts/mysql_compressBack.sh 2>&1 >/dev/null
```

## 五、增量备份

> 增量备份需要在全量备份的基础上进行，故备份前请先进行一次全量备份。

### 0x01. 创建备份存放目录

```bash
mkdir -p /data/mysql_backup/increases
```

### 0x02. 手动创建全量备份

```bash
xtrabackup --backup --user=root --password='<PASSWORD>' --socket=/tmp/mysql.sock --target-dir=/data/mysql_backup/$(date +%Y-%m-%d_%H-%M-%S)
```

### 0x03. 开始增量备份

> **注：**`socket`文件需要根据MySQL8.0 配置文件所配置的`socket`选项配置。
>
> **注：** 请修改`incremental-basedir`的路径，即上一次增量或全量备份的目录

```bash
xtrabackup --backup --user=root --password='<PASSWORD>' --socket=/tmp/mysql.sock --incremental-basedir=/data/mysql_backup/2023-08-18_16-49-22 --target-dir=/data/mysql_backup/increases/$(date +%Y-%m-%d_%H-%M-%S)
```

### 0x04. 开始增量备份（压缩备份）

> **注：**`socket`文件需要根据MySQL8.0 配置文件所配置的`socket`选项配置。
>
> **注：** 请修改`incremental-basedir`的路径，即上一次增量或全量备份的目录

`vim mysql_incr_compressBack.sh`
```bash
#!/bin/bash

###########################################
#                                         #
# 此脚本仅用于mysql8 数据库备份、压缩       #
#                                         # 
###########################################

# 数据库连接信息
DB_USER="${Username}"
DB_PASSWORD="${Password}"
DB_HOST="${Host}"
DB_SOCKET="${Socket}"


# 备份目录信息
BAK_BASE_DIR="/data/mysql_backup/mysql_backup/${全量备份文件}"
BAK_INCR_DIR="/data/mysql_backup/mysql_incr_backup"


# 输出日志
OUT_LOG="/root/innobak.log"

check_status(){

    local statu=$1
    local proc_name=$2

    if [ $statu -eq 0 ];then
        echo "${proc_name}成功 " >> ${OUT_LOG}
    else
        echo "${proc_name}失败,请检查 " >> ${OUT_LOG}
    fi
}

echo "`date +'%Y-%m-%d_%H-%M-%S'`：开始备份" >> ${OUT_LOG}
# 执行备份
xtrabackup --backup --user=${DB_USER} --password=${DB_PASSWORD} --socket=${DB_SOCKET} --incremental-basedir=${BAK_BASE_DIR} --target-dir=${BAK_INCR_DIR}/$(date +%Y-%m-%d_%H-%M-%S)
check_status "$?" "backup"

# 执行压缩
file_name=`ls -lrth ${BAK_INCR_DIR} | tail -n 1 | awk '{print $NF}'`
cd ${BAK_INCR_DIR} && tar -zcvf ${BAK_INCR_DIR}/${file_name}.tar.gz ${file_name} && rm -rf ${BAK_INCR_DIR}/${file_name}
check_status "$?" "compress"

echo "`date +'%Y-%m-%d_%H-%M-%S'`：结束备份" >> ${OUT_LOG}
```

## 六、全量备份恢复

> 全量备份恢复需要先将备份的事日志应用到备份，才能进行还原操作
> 
> 如果备份文件为*.tar.gz请先解压再进行恢复

### 0x01. 应用事务日志

```bash
xtrabackup --prepare --target-dir=/data/mysql_backup/2023-08-18_16-49-22
```

待输出`[Xtrabackup] completed OK!`之后即可进行后续操作。

### 0x02. 恢复备份

这一步有两种方法：

**法1：** 直接`cp`备份文件至MySQL数据data目录：

   ```bash
   # 备份原数据库数据目录
   mv /data/mysql /data/mysql_bak
   
   # 恢复备份
   cp /data/mysql_backup/2023-08-18_16-49-22 /data/mysql
   ```

**法2：** 使用`--copy-back`选项恢复备份

   ```bash
   # 备份原数据库数据目录
   mv /data/mysql /data/mysql_bak
   
   # 恢复备份，恢复前必须保证数据目录不存在或为空
   xtrabackup --copy-back --target-dir=/data/mysql_backup/2023-08-18_16-49-22
   ```

## 七、增量备份恢复

> 增量备份恢复需要先将全量备份的事务日志应用到备份，然后将之后每一次增量备份的事务日志逐次应用到该全量备份，之后才能进行还原操作

### 0x01. 应用事务日志

> 假设此次需要恢复的增量备份为`increase_2`，它之前还有`increase_1`以及全量备份`2023-08-18_16-49-22`，各备份之间关系为`2023-08-18_16-49-22`-->`increase_1`-->`increase_2`
>
> 将增量备份的事务日志应用到全量之后，该全量备份将包含叠加的所有备份，如果该全量备份有需要，请在应用事务日志前备份该全量备份。

```bash
# 为全量备份应用事务日志
xtrabackup --prepare --apply-log-only --target-dir=/data/mysql_backup/2023-08-18_16-49-22

# 将第一次增量备份应用到全量备份
xtrabackup --prepare --apply-log-only --target-dir=/data/mysql_backup/2023-08-18_16-49-22 --incremental-dir=/data/mysql_backup/increases/increase_1

# 将第二次增量备份应用到全量备份
xtrabackup --prepare --apply-log-only --target-dir=/data/mysql_backup/2023-08-18_16-49-22 --incremental-dir=/data/mysql_backup/increases/increase_2
```

### 0x02. 恢复备份

这一步有两种方法：

**法1：** 直接`cp`备份文件至MySQL数据data目录：

   ```bash
   # 备份原数据库数据目录
   mv /data/mysql /data/mysql_bak
   
   # 恢复备份
   cp /data/mysql_backup/2023-08-18_16-49-22 /data/mysql
   ```

**法2：** 使用`--copy-back`选项恢复备份

   ```bash
   # 备份原数据库数据目录
   mv /data/mysql /data/mysql_bak
   
   # 恢复备份，恢复前必须保证数据目录不存在或为空
   xtrabackup --copy-back --target-dir=/data/mysql_backup/2023-08-18_16-49-22
   ```
