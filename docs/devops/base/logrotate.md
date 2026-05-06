# Logrotate日志轮转

## 1.简介

Logrotate 是一个Linux系统内置的日志文件管理工具，主要用于自动分割、压缩旧日志文件并创建新文件，以节省磁盘空间并规范日志管理。

执行如下命令安装（如有需要）
```bash
yum -y install logrotate
```

## 2.日志轮转示例

### 0x01.Nginx

对 /var/log/nginx 目录中的日志文件（如 access.log, error.log）进行自动化轮转管理。

```bash
vim /etc/logrotate.d/nginx
```

::: el-tabs
--- el-tab-item 时间
```bash
/var/log/nginx/access.log
/var/log/nginx/error.log {
    daily
    missingok
    notifempty
    compress
    delaycompress
    rotate 180
    dateext
    sharedscripts
    postrotate
        systemctl reload nginx 2>/dev/null || true
    endscript
    create 0600 root root
}
```
---
--- el-tab-item 大小
```bash
/var/log/nginx/access.log
/var/log/nginx/error.log {
    minsize 512MB
    missingok
    notifempty
    compress
    delaycompress
    rotate 30
    dateext
    sharedscripts
    postrotate
        systemctl reload nginx 2>/dev/null || true
    endscript
    create 0600 root root
}
```
---
:::

:::tip
- 使用信号方式重载Nginx：`[ -s /run/nginx.pid ] && kill -USR1 $(cat /run/nginx.pid)`
:::

## 3.测试

```bash
logrotate -vf /etc/logrotate.d/nginx
```

## 4.常用参数说明

logrotate 采用主从配置结构以提升可管理性。其中，/etc/logrotate.conf 作为主配置文件，设定了全局性的默认参数；细节规则则模块化地分散在 /etc/logrotate.d/ 目录中，每个文件针对一个特定服务。logrotate 会自动读取并应用该目录下的所有配置，这意味着用户只需将轮转脚本置于此处，即可完成部署。

### 0x01.触发条件

::: el-tabs
--- el-tab-item 时间周期
- `daily` - 每天轮转
- `weekly` - 每周轮转  
- `monthly` - 每月轮转
- `yearly` - 每年轮转
---
--- el-tab-item 大小限制
- `size $SIZE` - 达到指定大小时轮转（如 `size 100k`, `size 10M`, `size 1G`）
- `maxsize $SIZE` - 在时间周期内达到大小时立即轮转
- `minsize $SIZE` - 在时间周期内必须达到指定大小才轮转
---

:::warning
size 会覆盖时间周期，只要文件大于指定大小就轮转。而 maxsize/minsize 是与时间周期（daily, weekly 等）结合使用的。
:::

### 0x02.文件管理

::: el-tabs
--- el-tab-item 保留策略
- `rotate $COUNT` - 保留的旧日志文件数量
- `maxage $COUNT` - 删除超过指定天数的轮转日志
---
--- el-tab-item 压缩设置
- `compress` - 启用gzip压缩
- `nocompress` - 不压缩
- `delaycompress` - 延迟压缩（下次轮转时压缩上一次的）
---
--- el-tab-item 文件处理
- `nocreate` - 不创建新文件
- `dateext` - 使用日期作为后缀
---
--- el-tab-item 文件处理
- `missingok` - 日志不存在时不报错
- `nomissingok` - 日志不存在时报错（默认）
- `ifempty` - 空文件也轮转（默认）
- `notifempty` - 空文件不轮转
---
:::

### 0x03.执行脚本

```bash
prerotate
# 轮转前执行的命令
endscript
```

```bash
postrotate
# 轮转后执行的命令
endscript
```

### 0x04.其他参数

- `sharedscripts` - 多个文件共享脚本（只运行一次）
- `nosharedscripts` - 每个文件都运行脚本（默认）

## 5.参考资料

- https://zhuanlan.zhihu.com/p/1929233281150349849
- https://www.cnblogs.com/kevingrace/p/6307298.html
- https://wangchujiang.com/linux-command/c/logrotate.html