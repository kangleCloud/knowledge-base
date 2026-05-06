# Linux常用命令

Linux 命令搜索：https://wangchujiang.com/linux-command/

Linux 命令大全：https://www.runoob.com/linux/linux-command-manual.html

Bash 脚本教程：https://wangdoc.com/bash/intro

## 文件管理

- 查找目录下的所有文件中是否含有某个字符串

```bash
find ./ -depth | xargs grep -ri "字符串" -l
```

- 统计文本的行数

```bash
find ./ -iname "*.log"  -type f | xargs wc -l
```

## 文档编辑

- 查找目录下的所有文件中是否含有某个字符串

```bash
grep -r "字符串" *
```

## 文件传输

- 将本地文件传输到远程服务器

```bash
scp -r -P 22 [文件名或文件夹] [用户名@地址]:[远端目录]
```

- 将远端文件拉取到本地

```bash
scp [用户名@地址]:[文件名] [本地目录] 
```

## 磁盘管理

- 显示文件系统的磁盘使用情况统计（可读的格式）

```bash
df -h
```

- 显示当前目录及文件的大小并按照兆（M）排序

```bash
du -sh * | sort -rn
```


- 统计当前目录下的文件数

```bash
ls -l | grep '^-' | wc -l
```

## 网络通信

- 查看系统的网络连接状态

```bash
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

- 查看端口号是否存在

```bash
netstat -nlp | grep 端口号
```

## 系统管理

- 批量删除某个进程

```bash
ps -ef | grep "进程名" | grep -v grep | awk '{print $2}' | xargs kill -9
```

## 系统设置

- 修改主机名
```bash
hostnamectl set-hostname [主机名]
systemctl restart systemd-hostnamed
```

## 备份压缩

- 压缩并打包

```bash
tar -zcvf [压缩包名] [要压缩的文件或目录]
```

- 解压缩

```bash
tar -zxvf [压缩包名]
```
  
## 设备管理

- 查看磁盘信息

```bash
fdisk -l
lsblk
```

##  其他

- 查看是否加入开机启动项

```bash
systemctl list-unit-files
```

- 获取服务器本地出网IP

```bash
curl cip.cc
curl ipinfo.io
curl ip.cn 
curl cip.cc
curl ifconfig.me
curl myip.ipip.net
```

- 查看Linux服务器是否是虚拟机

```bash
dmidecode -s system-product-name
```

```bash
lscpu
```
