# Firewalld防火墙

## 1、firewalld的域

- `trusted`：接受所有的连接。这是最不偏执的防火墙设置，只能用在一个完全信任的环境中，如测试实验室或网络中相互都认识的家庭网络中。
- `home`、`work`、`internal`：在这三个域中，接受大部分进来的连接。它们各自排除了预期不活跃的端口进来的流量。这三个都适合用于家庭环境中，因为在家庭环境中不会出现端口不确定的网络流量，在家庭网络中你一般可以信任其他的用户。
- `public`：用于公共区域内。这是个偏执的设置，当你不信任网络中的其他计算机时使用。只能接收选定的常见和最安全的进入连接。
- `dmz`：DMZ 表示隔离区。这个域多用于可公开访问的、位于机构的外部网络、对内网访问受限的计算机。对于个人计算机，它没什么用，但是对某类服务器来说它是个很重要的选项。
- `external`：用于外部网络，会开启伪装（你的私有网络的地址被映射到一个外网 IP 地址，并隐藏起来）。跟 DMZ 类似，仅接受经过选择的传入连接，包括 SSH。
- `block`：仅接收在本系统中初始化的网络连接。接收到的任何网络连接都会被 `icmp-host-prohibited` 信息拒绝。这个一个极度偏执的设置，对于某类服务器或处于不信任或不安全的环境中的个人计算机来说很重要。
- `drop`：接收的所有网络包都被丢弃，没有任何回复。仅能有发送出去的网络连接。比这个设置更极端的办法，唯有关闭 WiFi 和拔掉网线。

### 1.1 查看每个域的规则

**系统默认规则目录**：`/usr/lib/firewalld/zones`，可以通过此目录查看每个域的默认策略，但不建议直接修改此目录内的配置。

**自定义规则目录**：`/etc/firewalld/zones`，当需要添加或删除规则是，系统会自动将修改的配置保存至此目录，优先级高于默认规则。

```bash
cat /usr/lib/firewalld/zones/public.xml 
<?xml version="1.0" encoding="utf-8"?>
<zone>
  <short>Public</short>
  <description>For use in public areas. You do not trust the other computers on networks to not harm your computer. Only selected incoming connections are accepted.</description>
  <service name="ssh"/>
  <service name="mdns"/>
  <service name="dhcpv6-client"/>
  <forward/>
</zone>

```

可以看到public域内默认开放ssh、mdns以及dhcpv6-client服务，其余端口或IP均会阻断。

### 1.2 域管理及配置

##### 查看当前所在域

```bash
sudo firewall-cmd --get-active-zones
public
  interfaces: ens192
  
```

可以看到系统当前的网卡`ens192`所在域为`public`。

##### 修改当前所在域

```bash
sudo firewall-cmd --change-interface=ens192 --zone=public

```

## 2、策略管理

所有永久策略更改后，请执行重载命令`firewall-cmd --reload`使其生效，设置 public 的策略后，配置文件路径：/etc/firewalld/zones/public.xml  注意做好备份。

### 2.1 查看策略

1. 查询指定端口是否放开 

```bash
firewall-cmd --query-port=9191/tcp

```

2. 列出所有放开的端口

```bash
firewall-cmd --list-port

```

3. 列出所有放开的服务

```bash
firewall-cmd --list-service

```

4. 查看所有策略

```bash
#列出所有策略
firewall-cmd --list-all
#列出区域是公共的所有策略
firewall-cmd --list-all --zone public
```

### 2.2 配置端口策略

#### 所有来源均可访问

1. 开放指定端口

例：所有来源均可访问 9191 端口的 tcp 包

```bash
firewall-cmd --zone=public --add-port=9191/tcp --permanent
firewall-cmd --reload
```

2. 删除开放的端口

```bash
firewall-cmd --zone=public --remove-port=9191/tcp --permanent
firewall-cmd --reload
```

3. 开放指定服务

例：所有来源均可访问 sshd 服务的 tcp 包

```bash
firewall-cmd --zone=public --add-service=ssh/tcp --permanent
firewall-cmd --reload
```

3. 删除开放的服务

```bash
firewall-cmd --zone=public --remove-service=ssh --permanent
firewall-cmd --reload
```

#### 指定来源可访问

1. 指定来源 ip 放开端口

例：允许 110.23.123.12 来源访问 9191 端口的 tcp 包

```bash
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="110.23.123.12" port protocol="tcp" port="9191" accept"

```

2. 指定来源 ip 段，放开端口

例：允许 172.16.1.0/24 子网主机访问 9191 端口的 tcp 包

```bash
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=172.16.1.0/24 port protocol=tcp port=9191 accept' 

```

3. 指定来源 ip 段，放开端口范围

例：允许 172.16.1.0/24 子网主机访问 30001 到 30030 之间的端口上的所有 tcp 包

```bash
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=172.16.1.0/24 port protocol=tcp port=30001-30030 accept'

```

4. 指定来源 ip，放开所有端口

例：允许 172.16.4.124 访问所有端口

```bash
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="172.16.4.124" accept"

```

5. 指定来源 ip 段，放开所有端口

例：允许 172.16.1.0/24 子网主机访问所有端口

```bash
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=172.16.1.0/24 accept'

```

### 2.3 添加服务放开策略

1. 允许指定 ip 访问指定服务

例：允许 192.166.1.33 来源 ip 访问 ssh 服务

```bash
firewall-cmd --add-rich-rule="rule family="ipv4" source address="192.168.1.33" service name="ssh" accept"

```

  2. 允许指定 ip 段访问指定服务

例：允许 192.166.2.0/24 ip 段来源访问 ssh 服务

```bash
firewall-cmd --add-rich-rule="rule family="ipv4" source address="192.166.2.0/24" service name="ssh" accept"

```

### 2.4 添加端口禁止策略

  1. 指定来源 ip 禁止访问端口

例：禁止 192.168.3.12 访问 9191 端口的 tcp 包

```bash
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="192.168.3.12" port protocol="tcp" port="9191" reject"

```

2. 指定来源 ip 段，禁止访问端口

例：禁止 172.16.1.0/24 子网主机访问 9191 的端口的 tcp 包

```bash
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=172.16.1.0/24 port protocol=tcp port=9191 reject'

```

3. 指定来源 ip 段，禁止访问端口范围

例：禁止 172.16.1.0/24 子网主机访问 30001 到 30030 之间的端口上的所有 tcp 包

```bash
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=172.16.1.0/24 port protocol=tcp port=30001-30030 reject'

```

### 2.5 删除端口策略

#### 关闭已开放的端口

```bash
firewall-cmd --zone=public --remove-port=9191/tcp --permanent

```

#### 删除指定来源 ip 放开的端口


例：删除 “允许 110.23.123.12 来源访问 9191 端口” 策略

```bash
firewall-cmd --permanent --remove-rich-rule="rule family="ipv4" source address="110.23.123.12" port protocol="tcp" port="9191" accept"

```

#### 删除指定来源 ip 段，放开的端口范围


例：删除 “允许 172.16.1.0/24 子网主机访问 30001 到 30030 之间的端口上的所有 tcp 包 “策略

```bash
firewall-cmd --permanent --removerich-rule='rule family=ipv4 source address=172.16.1.0/24 port protocol=tcp port=30001-30030 accept'

```