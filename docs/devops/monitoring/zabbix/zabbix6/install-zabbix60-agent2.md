# Zabbix6.0 Agent2 安装及配置

Agent 与 Server 需要使用同一个主次版本号，下载地址参照<a href="/docs/devops/monitoring/zabbix/quickstart.html#下载" target="_blank">
Zabbix 快速入门中的下载</a>

:::tip 约定

- 源码包统一放置于 /usr/local/src 目录
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 zabbix6.0
- 目前团队正在使用的版本是 v6.0.21，约定存量系统新安装的 Agent 版本为 v6.0.21。

:::

## 安装必要的库

```bash
yum install -y curl curl-devel \
    libxml2-devel \
    libevent-devel \
    net-snmp-devel \
    mysql-devel
```

## 创建Zabbix用户

```bash
groupadd zabbix
useradd -g zabbix -M -s /sbin/nologin zabbix
```

## 下载并解压源码包

```bash
cd /usr/local/src
wget https://cdn.zabbix.com/zabbix/sources/stable/6.0/zabbix-6.0.21.tar.gz
tar -xf zabbix-6.0.21.tar.gz
```

## 编译安装

```bash
cd /usr/local/src/zabbix-6.0.21

./configure --prefix=/usr/local/zabbix6.0 \
    --enable-agent2 \
    --with-mysql --with-net-snmp \
    --with-libxml2 --with-ssh2 \
    --with-openipmi --with-zlib --with-libpthread \
    --with-libevent --with-openssl --with-ldap \
    --with-libcurl --with-libpcre\
    --enable-ipv6

make install
```

## 修改配置文件

```bash
vim /usr/local/zabbix6.0/etc/zabbix_agentd2.conf
```

```vim
# 被动模式下的 Server 或 Proxy 地址
# 目前团队使用的都是主动模式，此处固定为：127.0.0.1
Server=127.0.0.1

# 主动模式下的 Server 或 Proxy 地址
ServerActive={Zabbix server IP}:10051

# 设置为本机的ip地址
Hostname={Zabbix Agentd Hostname}

# 超时时间（单位秒）
Timeout=5

# 开启 include
Include=/usr/local/zabbix6.0/etc/zabbix_agent2.d/*.conf
```

## 使用Systemd管理进程

<font color="red">systemctl 方式不可以与其他方式混用</font>

:::tip
主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

1. 在 /etc/systemd/system 目录下面新建一个 zabbix-agent2.service 文件。

    ```bash
    touch /etc/systemd/system/zabbix-agent2.service
    ```

2. 编辑 zabbix-agent2.service 内容

    ```toml
    [Unit]
    Description=Zabbix Agent2
    After=network.target
    
    [Service]
    Type=forking
    PIDFile=/tmp/zabbix_agent2.pid
    Environment="CONFFILE=/usr/local/zabbix6.0/etc/zabbix_agent2.conf"
    ExecStart=/usr/local/zabbix6.0/sbin/zabbix_agent2 -c $CONFFILE
    ExecStop=/bin/kill -SIGTERM $MAINPID
    RestartSec=5
    
    Restart=on-failure
    KillMode=control-group
    TimeoutSec=0
    
    [Install]
    WantedBy=multi-user.target
    ```

   :::warning

    - PidFile 的配置参考 zabbix_agentd.conf 文件

    ```bash
    ### Option: PidFile
    #       Name of PID file.
    #
    # Mandatory: no
    # Default:
    # PidFile=/tmp/zabbix_agentd.pid    //[!code --]
    PidFile=/tmp/zabbix_agentd.pid      //[!code ++]
    ```

   :::

3. 重新加载 systemctl 配置

    ```bash
    systemctl daemon-reload
    ```
   
4. 停止运行中的 zabbix_agent2 启动的进程
    
    ```bash
    ps -ef | grep "zabbix_agent2" | grep -v grep | awk '{print $2}'
    ```

5. 启动 zabbix_agent2 并配置自启
    
    ```bash
    systemctl enable zabbix-agent2
    systemctl start zabbix-agent2
    ```

------------------------------ >>>>>> 此处为分割线 <<<<<< ------------------------------

:::tip Systemctl 指令

```bash
systemctl start zabbix-agent2    #启动服务
systemctl status zabbix-agent2   #查看状态
systemctl stop zabbix-agent2     #停止服务
systemctl enable zabbix-agent2   #开启开机自启服务
systemctl disable zabbix-agent2  #关闭开机自启服务
```

:::

## 编译安装常见问题

- **configure: error: newly created file is older than distributed files!**
  :::tip
  执行如下命令（结尾的`;`是必须的）将所有文件设置为当前时间

  ```bash
  find . -name "*" -exec touch '{}' \;
  ```

  :::

- **error: ‘for’ loop initial declarations are only allowed in C99 mode**

  :::tip
  在./configure之前设置一个环境变量即可编译通过

    ```bash
    export CFLAGS="-std=gnu99"
    ```

  :::

## 参考资料

- https://www.zabbix.com/documentation/6.0/zh/manual/installation/install