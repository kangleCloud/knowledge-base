# 基于KeepAlived的高可用

本文以实现 Nginx 服务高可用为例，对 Keepalived 的基础配置进行说明。

本文所述的配置方法同样适用于实现 HAProxy、MySQL、MinIO 等服务的高可用。

:::tip
截止2023年6月，团队约定使用的是 Keppalived 版本为：2.2.*（*为最新的补丁版本）
:::

## 环境准备

节点信息：

| master       | backup       |
| ------------ | ------------ |
| 192.168.0.11 | 192.168.0.12 |

## 先决条件

- <a href="/docs/devops/base/nginx/install.html" target="_blank">Nginx 的安装</a>
- <a href="/docs/middleware/keepalived/install-keepalived2.2.html" target="_blank">Keepalived2.2 的安装</a>

## 配置Master节点

1. 安装服务活性检测软件

```shell
yum -y install psmisc
```

2. 创建 Nginx 检测脚本

```bash
mkdir -pv /usr/local/keepalived2.2/scripts
touch /usr/local/keepalived2.2/scripts/check-nginx.sh
chmod +x /usr/local/keepalived2.2/scripts/check-nginx.sh
```

`check-nginx.sh` 脚本中的内容如下：

```bash
#!/bin/bash

# 若 nginx 进程不存在，则停止 keepalived 服务
killall -0 nginx &>/dev/null

if [ $? -ne 0 ];then    # 判断上一条指令的状态码，若状态码为0则服务存活，否则服务未启动
    systemctl start nginx
    killall -0 nginx &>/dev/null
    if [ $? -ne 0 ];then
        exit 1
    fi
fi
```

2. 编辑 MASTER 节点 Keepalived 配置文件

```bash
vim /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
```

内容如下：

```vim
! Configuration File for keepalived

vrrp_script chk_nginx {
    script "/usr/local/keepalived2.2/scripts/check-nginx.sh"
    interval 2
    fall 2
    rise 1
    weight -20
}

vrrp_instance VI_1 {
    state MASTER
    interface ens33
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.0.250
    }
    # 防止主备节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
    unicast_src_ip 192.168.0.11 #本机 IP 地址
    unicast_peer {
        192.168.0.12 #对端节点 IP 地址
    }
    # 追踪 vrrp_script 块中定义的脚本
    track_script {
       chk_nginx
    }
}
```

<a href="/docs/middleware/keepalived/introduction.html#配置文件参数说明" target="_blank">配置文件参数说明</a>

## 配置Backup节点

1. 安装服务活性检测软件

```shell
yum -y install psmisc
```

2. 创建 Nginx 检测脚本

```bash
mkdir -pv /usr/local/keepalived2.2/scripts
touch /usr/local/keepalived2.2/scripts/check-nginx.sh
chmod +x /usr/local/keepalived2.2/scripts/check-nginx.sh
```

`check-nginx.sh` 脚本中的内容如下：

```bash
#!/bin/bash

# 若 nginx 进程不存在，则停止 keepalived 服务
killall -0 nginx &>/dev/null

if [ $? -ne 0 ];then    # 判断上一条指令的状态码，若状态码为0则服务存活，否则服务未启动
    systemctl start nginx
    killall -0 nginx &>/dev/null
    if [ $? -ne 0 ];then
        exit 1
    fi
fi
```

2. 编辑 BACKUP 节点 Keepalived 配置文件

```bash
vim /usr/local/keepalived2.2/etc/keepalived/keepalived.conf
```

内容如下：

```vim
! Configuration File for keepalived

vrrp_script chk_nginx {
    script "/usr/local/keepalived2.2/scripts/check-nginx.sh"
    interval 2
    fall 2
    rise 1
    weight -20
}

vrrp_instance VI_1 {
    state BACKUP
    interface ens33
    virtual_router_id 51
    priority 90
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.0.250
    }
    # 防止主备节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
    unicast_src_ip 192.168.0.12 #本机 IP 地址
    unicast_peer {
        192.168.0.11 #对端节点 IP 地址
    }
    # 追踪 vrrp_script 块中定义的脚本
    track_script {
       chk_nginx
    }
}
```

<a href="/docs/middleware/keepalived/introduction.html#配置文件参数说明" target="_blank">配置文件参数说明</a>

## 启动Keepalived服务

在 Nginx 服务启动完成的前提下，先启动 master 节点的 Keepalived 服务，待 vip 成功创建后（可通过使用`hostname -I`命令查看），再启动 backup 节点的 Keepalived 服务。

启动命令为：

```bash
systemctl start keepalived
```

## 参考资料

- https://zhuanlan.zhihu.com/p/116920694