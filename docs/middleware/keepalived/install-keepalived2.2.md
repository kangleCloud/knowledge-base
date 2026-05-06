# Keepalived安装

稳定版下载地址：https://www.keepalived.org/download.html

截止2025年08月03日，Keepalived 2.2.* 系列最新稳定版为 v2.2.8。

:::tip 约定
- 所有源码包下载到 /usr/local/src 中。
- 源码安装时应安装到 /usr/local 中，并以软件名及主次版本号命名，如 keepalived2.2。
:::

## 1.安装必要的库

::: el-tabs

--- el-tab-item Kylin.v10|openEuler22.03
```bash
yum install libnl3-devel -y
```
---

--- el-tab-item CentOS7.9
```bash
yum install libnl-devel -y
```
---

:::

## 2.使用源码包安装

### 0x01.下载源码包并解压

```bash
cd /usr/local/src
wget https://www.keepalived.org/software/keepalived-2.2.8.tar.gz --no-check-certificate
tar -zxvf keepalived-2.2.8.tar.gz
```

### 0x02.编译并安装

```bash
cd /usr/local/src/keepalived-2.2.8
./configure --prefix=/usr/local/keepalived2.2
make && make install
```

### 0x03.验证是否安装完成

```bash
/usr/local/keepalived2.2/sbin/keepalived -v
```
:::tip 输出如下内容
Keepalived v2.2.8 (04/04,2023), git commit v2.2.7-154-g292b299e+
。。。。。。
:::

## 3.创建配置文件

### 0x01.创建主节点配置文件

> 参照 /usr/local/keepalived2.2/etc/keepalived/keepalived.conf.sample，手动在 MASTER 节点中创建配置文件。

创建并编辑配置文件
```bash
vim /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
```

MASTER 节点示例
```vim
! Configuration File for keepalived #此行是注释

global_defs {
    router_id Nginx-1-11 #参照服务器标识命名约定
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.33.200
    }
    # 防止主备节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
    unicast_src_ip 192.168.33.11 #本机 IP 地址
    unicast_peer {
        192.168.33.12 #对端节点 IP 地址
    }
}
```

### 0x02.创建备节点配置文件

> 参照 /usr/local/keepalived2.2/etc/keepalived/keepalived.conf.sample，手动在 BACKUP 节点中创建配置文件。

创建并编辑配置文件
```bash
vim /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
```

BACKUP 节点示例
```vim
! Configuration File for keepalived #此行是注释

global_defs {
    router_id Nginx-2-12 #参照服务器标识命名约定
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 90
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.33.200
    }
    # 防止主备节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
    unicast_src_ip 192.168.33.12 #本机 IP 地址
    unicast_peer {
        192.168.33.11 #对端节点 IP 地址
    }
}
```

## 4.修改日志输出位置

默认情况下，`yum`或源码安装的 Keepalived 日志都会输出到 /var/log/messages 文件中。由于 /var/log/messages 中记录了系统中其他服务的相关日志，日志内容刷新比较快，不便于观察，这里修改日志存储到 /var/log/keepalived.log 中。

`yum`安装的 Keepalived 环境变量配置在 /etc/sysconfig/keepalived，源码编译安装的 Keepalived 环境变量配置在 /usr/local/keepalived2.2/etc/sysconfig/keepalived。

### 0x01.配置日志输出信息

当前文档采用的是源码安装，故修改如下配置文件

```bash
vim /usr/local/keepalived2.2/etc/sysconfig/keepalived
```

将 KEEPALIVED_OPTIONS="-D" 修改为： KEEPALIVED_OPTIONS="-D -d -S 0" 。

### 0x02.配置日志输出位置

修改 rsyslo g配置文件，添加 keepalived 日志输出路径

```bash
vim /etc/rsyslog.conf
```

在`# ### begin forwarding rule ###`上方添加如下内容

```vim
local0.*    /var/log/keepalived.log
```

### 0x03.重启rsyslog&keepalived

```bash
systemctl restart rsyslog
systemctl restart keepalived
```

## 5.使用Systemd管理进程

:::tip 约定
- `keepalived.service`执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

### 0x01.检测service是否已生成

```bash
ll /etc/systemd/system | grep keepalived
```
:::tip 输出如下内容
-rw-r--r--. 1 root root  546 Jun 11 09:20 keepalived.service
:::

:::tip
如果没有自动生成 keepalived.service，可从源码中复制
```bash
cp /usr/local/src/keepalived-2.2.8/keepalived/keepalived.service \
   /etc/systemd/system/keepalived.service
```
:::

### 0x02.重新加载systemctl配置

```bash
systemctl daemon-reload
```

### 0x03.停止运行中的keepalived

```bash
pkill keepalived
```

### 0x04.启动并设置开机自启

```bash
systemctl enable keepalived --now
```

:::tip Systemctl指令
```bash
systemctl start keepalived    #启动服务
systemctl status keepalived   #查看状态
systemctl stop keepalived     #停止服务
systemctl restart keepalived  #重启服务
systemctl reload keepalived   #修改配置文件后重载
systemctl enable keepalived   #开启开机自启服务
systemctl disable keepalived  #关闭开机自启服务
```
:::

## 6.验证VIP漂移

1. 通过配置文件中 virtual_ipaddress 块明确 VIP 是什么
2. 执行`systemctl stop keepalived`命令
3. 通过`ip addr | grep $VIP`验证 VIP 是否漂移到了当前服务器。

:::tip
除了 `ip addr` 命令查看本机的 IP 地址，也可以通过 `hostname -I` 命令查看
:::

## 7.Keepalived常用命令

查看版本号
```
/usr/local/keepalived2.2/sbin/keepalived -v
```

## 附录1.常见错误

- 编译安装时缺失 openssl 问题，报错内容如下

错误提示：/usr/include/openssl/evp.h:538:32: error: macro "EVP_MD_CTX_new" passed 1 arguments, but takes just 0 EVP_MD_CTX *EVP_MD_CTX_new(void)

:::tip 解决方法
编译时显式配置 openssl lib 位置并重新进行编译安装
```bash
make clean
LDFLAGS="$LDFAGS -L /usr/local/openssl1.1/lib" \
    ./configure --prefix=/usr/local/keepalived2.2
make && make install
```
:::

## 附录2.参考资料

- https://zhuanlan.zhihu.com/p/143295216
- https://www.cnblogs.com/Sinte-Beuve/p/13392747.html
- https://www.cnblogs.com/rexcheny/p/10778567.html
- https://zhuanlan.zhihu.com/p/346537323
- https://zhuanlan.zhihu.com/p/143295216
- https://blog.wanhebin.com/posts/modify-the-location-of-the-keepalived-log-output/index.html