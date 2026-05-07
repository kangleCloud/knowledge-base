# Keepalived介绍

Keepalived 是以 VRRP 协议为实现基础的，VRRP 全称 Virtual Router Redundancy Protocol，即虚拟路由冗余协议。

虚拟路由冗余协议，可以认为是实现路由器高可用的协议，即将N台提供相同功能的路由器组成一个路由器组，这个组里面有一个 master 和多个 backup，master 上面有一个对外提供服务的 VIP(Virtual IP Address)（该路由器所在局域网内其他机器的默认路由为该 vip），master 会发组播，当 backup 收不到 vrrp 包时就认为 master 宕掉了，这时就需要根据 VRRP 的优先级来选举一个 backup 当 master。这样的话就可以保证路由器的高可用了。

## 集群架构示意图

:::tip 相关术语
- DS (Director Server)，指的是前端负载均衡器节点
- RS (Real Server)，后端真实的工作服务器
- VIP (Virtual IP)，虚拟的 IP 地址，向外部直接面向用户请求，作为用户请求的目标的 IP 地址
:::

基于 Keepalived 的 Nginx 集群架构示意图（使用Keepalived实现高可用，使用Nginx实现负载均衡）
```vim
                              |
             +----------------+-----------------+
             |                |                 |
172.17.13.120|---------VIP:172.17.13.252    ----|172.17.13.123
    +--------+---------+                +--------+---------+
    | 	    DS1        |                |       DS2        |
    | Nginx+Keepalived |                | Nginx+Keepalived |
    +-------+----------+                +--------+---------+
             |			      |                 |
             +----------------+-----------------+
                              |
  +------------+              |               +------------+
  |     RS1    |172.17.13.142 |  172.17.13.173|     RS2    |
  | Web Server +--------------+---------------+ Web Server |
  +------------+                              +------------+

```

## 配置文件块说明

一个功能比较完整的常用的 keepalived 配置文件，主要包含以下三块：全局定义块、VRRP 实例定义块、虚拟服务器定义块。

> 全局定义块是必须配置项；如果 Keepalived 只用来做 HA，则虚拟服务器是可选配置。

```vim
! Configuration File for keepalived

# 全局定义块
global_defs {
   ...
}

#VRRP 脚本定义块
vrrp_script chk_nginx {
    ...
}

#VRRP 实例定义块
vrrp_instance VI_1 {
   ...
}

# 虚拟服务器定义块
virtual_server 192.168.200.100 443 {
   ...
}
```

## 配置文件参数说明

基于 Keepalived 的 Nginx 主节点配置示例
```bash
! configuration File for keepalived #此行是注释

global_defs {
    router_id Nginx-1-11
}

vrrp_script chk_nginx {
    script "/usr/local/keepalived2.2/scripts/check-nginx.sh"
    interval 2
    fall 2
    rise 1
}

vrrp_instance VI_1 {
    state MASTER
    interface eth1
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
    # 防止两节点的上联交换机禁用了组播，采用 vrrp 单播通告的方式
    unicast_src_ip 192.168.33.11
    unicast_peer {
        192.168.33.12
    }
    track_script {
       chk_nginx
    }
}
```

:::tip global_defs 块说明
- router_id - 节点唯一标识，通常为 hostname，<font color="red">主备节点不可以相同</font>。
:::

------ >>>>>> 此处为分割线 <<<<<< ------

:::tip vrrp_script chk_nginx 块说明
- script - 指定shell脚本位置
- interval - shell脚本的执行间隔（单位：秒）
- fall - 健康检查后，把服务器从成功标记为失败的次数
- rise - 健康检查后，把服务器从失败标记为成功的次数
:::

------ >>>>>> 此处为分割线 <<<<<< ------

:::tip vrrp_instance VI_1 块说明
- state - 角色状态，主节点配置为MASTER，备节点为BACKUP。
- interface - vip 绑定的网卡名称，可通过`ip addr`查看，如 eth0、ens33、enp0s3（virtualbox）。
- virtual_router_id - 虚拟路由 ID 标识，取值范围为 1-255，<font color="red">主备服务器配置中相同实例的 ID 必须一致，且不应与同一局域网内的其他 Keepalived 集群配置相同</font>。
- priority - 实例优先级，<font color="red">master 节点配置应大于 backup 节点</font>。
- advert_int - 节点间的通信间隔（单位：秒）。
- authentication - 节点间的通信认证机制，有明文及加密两种认证方式，使用默认的示例即可。
- virtual_ipaddress - 虚拟IP地址，可以配置多个IP，每个IP占一行。
- unicast_src_ip - 发送单播的源 IP（本节点 IP 地址）
- unicast_peer - 发送单播的对端IP （对端节点 IP 地址）
- track_script - 追踪 vrrp_script 块中定义的脚本
:::

## Keepalived选举策略

首先，每个节点有一个初始优先级，由配置文件中的 priority 配置项指定，MASTER 节点的 priority 应比 BAKCUP 高。运行过程中 keepalived 根据 vrrp_script 的 weight 设定，增加或减小节点优先级。规则如下：

1. weight 值为正时，脚本检测成功时 ”weight” 值会加到 ”priority” 上，检测失败时不加
- 主失败: 主priority < 备priority+weight之和时会切换
- 主成功: 主priority+weight之和 > 备priority+weight之和时,主依然为主,即不发生切换

2. weight 为负数时，脚本检测成功时 ”weight” 不影响 ”priority”，检测失败时，Master 节点的权值将是 “priority“ 值与 “weight” 值之差
- 主失败: 主priotity-abs(weight) < 备priority时会发生切换
- 主成功: 主priority > 备priority 不切换

3. 当两个节点的优先级相同时，以节点发送 VRRP 通告的 IP 作为比较对象，IP 较大者为 MASTER。

:::warning
主从的优先级初始值 priority 和变化量 weight 设置非常关键，配错的话会导致无法进行主从切换。比如，当 MASTER 初始值定得太高，即使 script 脚本执行失败，也比 BACKUP 的 priority + weight 大，就没法进行 VIP 漂移了。另外，当网络中不支持多播(例如某些云环境)，或者出现网络分区的情况，keepalived BACKUP 节点收不到 MASTER 的 VRRP 通告，就会出现脑裂（split brain）现象，此时集群中会存在多个 MASTE R节点。<font color="red">所以 priority 和 weight 值的设定应遵循：abs(MASTER priority - BAKCUP priority) < abs(weight)。</font>
:::

**参照以上说明，约定 keepalived 的配置文件中参数设置如下：**
- 主节点：state 为 MASTER，priority 为 100
- 备节点：state 为 BACKUP，priority 为 90

## Keepalived.service示例

```vim
[Unit]
Description=LVS and VRRP High Availability Monitor
After=network-online.target syslog.target
Wants=network-online.target
Documentation=man:keepalived(8)
Documentation=man:keepalived.conf(5)
Documentation=man:genhash(1)
Documentation=https://keepalived.org

[Service]
Type=forking
PIDFile=/run/keepalived.pid
KillMode=process
EnvironmentFile=-/usr/local/keepalived2.2/etc/sysconfig/keepalived
ExecStart=/usr/local/keepalived2.2/sbin/keepalived  $KEEPALIVED_OPTIONS
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```