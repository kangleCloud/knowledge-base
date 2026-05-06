# Zabbix 监控 Java 项目关键字

## zabbix 设置

在 `zabbix_agentd.conf.d` 目录下新建 conf 配置文件

```shell
vim errlog.conf
```

写入下面内容

```vim
UserParameter=Errorlog.Info[*],/usr/local/zabbix5.4/scripts/java_error_log_monitor.sh $1
```

## 脚本设置

在 /usr/local/zabbix5.4/scripts 目录下新建 `java_error_log_monitor.sh`，写入下面内容

```shell
#!/bin/bash
#
#--------------- 注释 -----------------
#
# Author: ChinaCICI
# Date: 2023/10/19
# Description: Zabbix Java Log Monitor
#
#--------------------------------------
#

function java_error_log_check() {
    [ ! -f ${TMPFILE} ] && touch ${TMPFILE} && chmod 777 ${TMPFILE}
    
    if [ -s ${ERRLOGFILE} ]; then
        # 使用grep查找包含"ERROR"的行，截取每行的上下20行，并将结果输出到TMPFILE
                # grep --line-buffered -A 20 -B 20 "ERROR" ${ERRLOGFILE} > ${TMPFILE}
                line_number=$(grep -n "【ERROR】" ${ERRLOGFILE} | tail -n 1 | cut -d ":" -f 1)
    
        if [ -n "$line_number" ]; then
            start_line=$((line_number > 20 ? line_number - 20 : 1))
            end_line=$((line_number + 20))
        
            # 从日志文件中提取指定范围的行，并写入到新文件中
            sed -n "${start_line},${end_line}p" ${ERRLOGFILE} > ${TMPFILE}
        fi
    fi

    cat ${TMPFILE}
}

case $1 in
    '[项目名称1]')
        ERRLOGFILE=[需要查找的目录位置]
        TMPFILE=/tmp/[项目名称].log.tmp
        java_error_log_check
    ;;
esac  
```
