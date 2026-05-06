# Percona XtraBackup 2.4

[Percona XtraBackup 2.4 does not support making backups of databases created in MySQL 8.0 or higher, Percona Server for MySQL 8.0 or higher, or Percona XtraDB Cluster 8.0 or higher. Install Percona XtraBackup 8.0 to make backups for these versions.](https://docs.percona.com/percona-xtrabackup/2.4/release-notes/2.4/2.4.29.html)

<font color="red">使用 xtrabackup2.4.*（*表示最新的补丁版本）备份 Mysql5.7 或者更低的版本。</font>

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 xtrabackup2.4。
:::

## 一、先决条件

### 0x01.安装依赖
```bash
yum -y install perl-Digest-MD5 perl-DBD-MySQL
```

## 二、 基于二进制包安装

### 0x01.下载并解压安装包

截止2023年12月，MxtraBackup2.4 最新稳定版为 v2.4.28

:::tip 下载
➤ [Xtrabackup Software Downloads](https://www.percona.com/downloads)
:::

```bash
cd /usr/local/src
wget https://downloads.percona.com/downloads/Percona-XtraBackup-2.4/Percona-XtraBackup-2.4.28/binary/tarball/percona-xtrabackup-2.4.28-Linux-x86_64.glibc2.17.tar.gz

tar xvf percona-xtrabackup-2.4.28-Linux-x86_64.glibc2.17.tar.gz
mv percona-xtrabackup-2.4.28-Linux-x86_64.glibc2.17 /usr/local/xtrabackup2.4
```

### 0x02. 建立软链
   
```bash
ln -s /usr/local/xtrabackup2.4/bin/innobackupex /usr/sbin/
```

### 0x03. 测试安装

```bash
innobackupex --version

# 输出
xtrabackup: recognized server arguments: --server-id=1 --datadir=/data/mysql --log_bin=my-binlog
innobackupex version 2.4.28 Linux (x86_64) (revision id: 44a8f7b)
```

## 三、全量备份-常规备份
### 0x01. 创建备份存放目录
```bash
mkdir -p /data/mysql_backup/mysql_full_backup
```

### 0x02. 手动创建备份

> **注：**`socket`文件需要根据MySQL5.7 配置文件所配置的`socket`选项配置。同时--socket必须放在参数中的第一位，否则会报错

```bash
innobackupex --socket=/tmp/mysql.sock --user=root --password='<PASSWORD>' /data/mysql_backup/mysql_full_backup
```
> 2.4的innobackupex会自动以时间命名目录，格式如下$(date +%Y-%m-%d_%H-%M-%S)，因此不需要指定。

### 0x03. 配置定时任务

> **注：** 此计划任务会在完成一次备份之后删除30天之前的备份

```bash
00 01 * * * innobackupex --socket=/tmp/mysql.sock --user=root --password='<PASSWORD>' /data/mysql_backup/mysql_full_backup && find /data/mysql_backup/mysql_full_backup/$(date +%Y-%m-%d_%H-%M-%S) -mtime +30 -exec rm -rf {} \;
```

## 三、全量备份-压缩备份
### 0x01. 创建备份存放目录
```bash
mkdir -p /data/mysql_backup/mysql_full_backup
```
### 0x02. 创建备份脚本
`vim mysql_compressBack.sh`
```bash
#!/bin/bash

###########################################
#                                         #
# 此脚本仅用于mysql5.7数据库备份、压缩及清理 #
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
innobackupex --socket=${DB_SOCKET} --user=${DB_USER} --password=${DB_PASSWORD} ${BAK_DIR}
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

### 0x03. 配置定时任务
```bash
00 01 * * * sh /scripts/mysql_compressBack.sh 2>&1 >/dev/null
```

## 四、增量备份

> 增量备份需要在全量备份的基础上进行，故备份前请先进行一次全量备份。

### 0x01. 创建备份存放目录

```bash
# 存放首次全量备份文件的路径
mkdir -p /data/mysql_backup/mysql_base_backup

# 存放增量备份文件的路径
mkdir -p /data/mysql_backup/mysql_incr_backup
```

### 0x02. 手动创建全量备份

```bash
innobackupex innobackupex --socket=/tmp/mysql.sock --user=root --password='<PASSWORD>' /data/mysql_backup/mysql_base_backup
```

### 0x03. 开始增量备份

> **注：**`socket`文件需要根据MySQL5.7 配置文件所配置的`socket`选项配置。
>
> **注：** 请修改`incremental-basedir`的路径，即上一次增量或全量备份的目录

```bash
innobackupex --socket=/tmp/mysql.sock --user=root --password='<PASSWORD>' --incremental-basedir=/data/mysql_backup/mysql_base_backup/2023-12-08_16-17-30 --incremental /data/mysql_backup/mysql_incr_backup
```

### 0x04. 开始增量备份(压缩备份)
`vim mysql_incr_compressBack.sh`
```bash
#!/bin/bash

###########################################
#                                         #
# 此脚本仅用于mysql5.7数据库备份及压缩      #
#                                         # 
###########################################

# 数据库连接信息
DB_USER="root"
DB_PASSWORD="<PASSWORD>"
DB_HOST="192.168.91.130"
DB_SOCKET="/tmp/mysql.sock"


# 备份目录信息
BAK_BASE_DIR="/data/mysql_backup/mysql_base_backup/${全量备份文件}"
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
innobackupex --socket=${DB_SOCKET} --user=${DB_USER} --password=${DB_PASSWORD} --incremental-basedir=${BAK_BASE_DIR} --incremental ${BAK_INCR_DIR}
check_status "$?" "备份数据"

# 执行压缩
file_name=`ls -lrth ${BAK_INCR_DIR} | tail -n 1 | awk '{print $NF}'`
cd ${BAK_INCR_DIR} && tar -zcvf ${BAK_INCR_DIR}/${file_name}.tar.gz ${file_name} && rm -rf ${BAK_INCR_DIR}/${file_name}
check_status "$?" "压缩文件"

echo "`date +'%Y-%m-%d_%H-%M-%S'`：结束备份" >> ${OUT_LOG}
```

### 0x05. 配置定时任务(压缩备份)

```bash
00 01 * * * sh /scripts/mysql_incr_compressBack.sh 2>&1 >/dev/null
```

## 五、全量备份恢复

> 全量备份恢复需要先将备份的事日志应用到备份，才能进行还原操作
>
> 注意：如果备份文件是*.tar.gz 的解压之后再进行恢复

### 0x01. 应用事务日志

```bash
innobackupex --user=root --password='<PASSWORD>' --apply-log /data/mysql_backup/mysql_full_backup/2023-12-08_16-20-34
```
待输出`[Xtrabackup] completed OK!`之后即可进行后续操作。
### 0x02. 恢复备份

这一步有两种方法：

**法1：** 直接`cp`备份文件至MySQL数据data目录：

   ```bash
   # 备份原数据库数据目录
   mv /data/mysql /data/mysql_bak
   
   # 恢复备份
   cp /data/mysql_backup/mysql_full_backup/2023-08-18_16-49-22 /data/mysql
   ```

**法2：** 使用`--copy-back`选项恢复备份

   ```bash
   # 备份原数据库数据目录
   mv /data/mysql /data/mysql_bak
   
   # 恢复备份，恢复前必须保证数据目录不存在或为空
  innobackupex --defaults-file=/etc/my.cnf --copy-back /data/mysql_backup/mysql_full_backup/2023-12-08_16-20-34
   ```

## 七、增量备份恢复

> 增量备份恢复需要先将全量备份的事务日志应用到备份，然后将之后每一次增量备份的事务日志逐次应用到该全量备份，之后才能进行还原操作
>
> 如果备份文件是*.tar.gz 的解压之后再进行恢复

### 0x01. 应用事务日志

> 假设此次需要恢复的增量备份为`increase_2`，它之前还有`increase_1`以及全量备份`2023-12-08_16-17-30`，各备份之间关系为`2023-12-08_16-17-30`-->`increase_1`-->`increase_2`
>
> 将增量备份的事务日志应用到全量之后，该全量备份将包含叠加的所有备份，如果该全量备份有需要，请在应用事务日志前备份该全量备份。

```bash
# 为全量备份应用事务日志
innobackupex --apply-log --redo-only /data/mysql_backup/mysql_base_backup/2023-12-08_16-17-30

# 将第一次增量备份应用到全量备份
innobackupex --apply-log --redo-only /data/mysql_backup/mysql_base_backup/2023-12-08_16-17-30 --incremental-dir=/data/mysql_backup/mysql_increase/increase_1

# 将第二次增量备份应用到全量备份
innobackupex --apply-log --redo-only /data/mysql_backup/mysql_base_backup/2023-12-08_16-17-30 --incremental-dir=/data/mysql_backup/mysql_increase/increase_2
```

### 0x02. 恢复备份

#### 使用cp命令

```bash
# 备份原数据库数据目录
mv /data/mysql /data/mysql_bak

# 恢复备份
cp /data/mysql_backup/mysql_base_backup/2023-12-08_16-17-30 /data/mysql
```

#### 使用--copy-back参数

```bash
# 备份原数据库数据目录
mv /data/mysql /data/mysql_bak

# 恢复备份，恢复前必须保证数据目录不存在或为空
innobackupex --defaults-file=/etc/my.cnf --copy-back /data/mysql_backup/mysql_base_backup/2023-12-08_16-17-30
```

## 八、参考资料

- https://docs.percona.com/percona-xtrabackup/2.4/index.html
