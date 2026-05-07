# 神通数据库7.0 安装及配置

:::warning 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 mysql8.0
- 业务开发中，团队约定使用 mysql8.0.*（*表示最新的补丁版本）
:::

## 准备规划

在安装部署前，最好制定好部署方案，包括以下内容：

1、	确定使用的操作系统root用户还是非root用户，建议使用root。

2、	确定数据库的安装主目录。

3、	确定数据库的数据文件和日志文件的存放目录。

4、	确定数据库的使用用户表空间和数据库用户名。

5、	根据实际情况计算并确认数据库的数据文件和日志文件的初始大小、扩展大小和最大大小。

## 安装

以`root`身份登陆操作系统，默认应用程序放到根目录下，程序安装到`/opt/ShenTong`，数据文件放到`/data/ShenTong/`，备份文件位置`/data/ShenTong/backup`。

```bash
# 上传神通数据库7.0的zip压缩包
cd /usr/local/src/
rz

# 解压缩
unzip ShenTong7.0.8_342.185_linux64.zip

# 赋予权限并安装
cd ShenTong7.0.8_342.185_linux64
chmod +x setup
./setup
```

安装过程

```bash
请选择语言安装
0  [x] chn
1  [ ] eng
输入选择: 
0
神通数据库简介
……
按1继续，按2退出，按3重新显示
1
神通数据库管理系统软件许可协议
……

按1接受，按2拒绝，按3重新显示
1
选择安装路径 : [/opt/ShenTong] 
/usr/local/ShenTong
------------------------------
警告!

目标目录将创建在 :
/usr/local/ShenTong
------------------------------
# 此处为字母O大写
输入O表示确定，输入C表示取消: 
O

按1继续，按2退出，按3重新显示
1
----
完整安装
----
输入Y表示是，输入N表示否: 
Y
最小安装 未选择
自定义安装 未选择
完成!

按1继续，按2退出，按3重新显示
1
您可以选择是否立即设置agent密码
0  [x] 不需要设置密码(使用默认密码)
1  [ ] 请输入agent密码
输入选择: 
0

按1继续，按2退出，按3重新显示
1
您可以选择是否注册HA服务
0  [x] 否
1  [ ] 是
输入选择: 
0

按1继续，按2退出，按3重新显示
1
------
创建快捷方式
------
输入Y表示是，输入N表示否: 
Y
---------
在桌面创建快捷方式
---------
输入Y表示是，输入N表示否: 
N
------------
创建快捷方式: 所有用户
------------
输入Y表示是，输入N表示否: 
N
您可以选择是否创建数据库
0  [x] 不需要创建数据库
1  [ ] 需要创建数据库
输入选择: 
0

按1继续，按2退出，按3重新显示
1
====
安装开始
……
安装完成
安装成功
应用程序安装在 /usr/local/shentong
[ 写入卸载程序数据 ... ]
[ 控制台安装完成 ]
```

## 添加环境变量

无需写入/etc/profile，但需要手动`source`
```bash
source /etc/profile
```

## 创建数据库

命令行输入：`oscar`进入cmd命令行

```bash
# 创建数据库
bankend> CREATE DATABASE xxxx ENCODING ' UTF-8';

# 退出
benkend> exit

# 添加配置文件
cd /usr/local/ShenTong/admin
mv oscar.conf  xxxx.conf

# 初始化数据字典表
oscar -o restrict -d xxxx

# 安装数据库实例
oscar -o install -d xxxx
```

## 启动数据库

```bash
/etc/init.d/oscardb_xxxxd start
```


## 连接数据库

数据库实例默认端口为`2003`，默认用户名密码为`sysdba/szoscar55`

示例
```bash
isql -Usysdba/szoscar55 -d xxxx -h xxx.xxx.xxx.xxx -p 2003
```