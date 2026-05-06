# 基于MinIO客户端的备份

## 下载并安装MinIO客户端

```shell
cd /usr/local/src
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
cp mc /usr/sbin/
```

2. 设置minio别名

```shell
mc alias set ${source_minio_nickName} http://${source_minio_ip}:9000 ${source_minio_username} ${source_minio_password}

# 设置以后可以查看
mc alias list
```

3. 执行备份
 
- 备份某个桶 
```shell
# 备份某个桶
mc cp --recursive ${source_minio_nickName}/bucket-demo/	/data/backup/minio/bucket-demo/
```
> 注意：
> ${source_minio_nickName}/bucket-demo/ 以“/”结尾时只会备份对应桶下的文件，不会备份桶名。不以“/”结尾时将会连同桶名一起备份。

- 备份所有桶
```shell
mc cp --recursive ${source_minio_nickName}	/data/minio/backup
```

4. 备份脚本

```bash
#!/bin/bash

bakDir="/data/backup/minio"
timeSp=`date "+%Y%m%d"`
minioNickName="minio_local"

if [ -d ${bakDir}/minio_${timeSp} ];then
    echo "The backup path:${bakDir}/minio_${timeSp}  already exists"
    exit 0
else
    mkdir -p ${bakDir}/minio_${timeSp}
    mc cp --recursive ${minioNickName} ${bakDir}/minio_${timeSp} >>/dev/null
    [[ $? -eq 0 ]] && echo "backup success" || echo "backup failed"
fi
```