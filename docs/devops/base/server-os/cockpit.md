# cockpit安装与使用

#### 1. 安装

##### 	CentOS 8与euler默认已安装Cockpit，直接启动服务即可：

```bash
systemctl start cockpit
systemctl enable --now cockpit.socket
```

##### 	CentOS 7上如果要使用Cockpit的话，需要自行安装，并开放对应服务:

```bash
# 安装
yum install cockpit
# 开放服务
firewall-cmd --permanent --zone=public --add-service=cockpit
# 重新加载防护墙
firewall-cmd --reload
```

​	如需修改运行端口，只需要修改`/etc/systemd/system/cockpit.socket`文件，将`ListenStream`修改为所需端口即可：

```bash
[Unit]
Description=Cockpit Web Service Socket
Documentation=man:cockpit-ws(8)
Wants=cockpit-motd.service

[Socket]
ListenStream=8848
ExecStartPost=-/usr/share/cockpit/motd/update-motd '' localhost
ExecStartPost=-/bin/ln -snf active.motd /run/cockpit/motd
ExecStopPost=-/bin/ln -snf /usr/share/cockpit/motd/inactive.motd /run/cockpit/motd

[Install]
WantedBy=sockets.target
```

#### 2. 使用

内网访问`http://ip-address:port`即可进入管理页面，用户名密码为系统用户（例如root用户）：

![image-20230207142027479](https://chv.yorkzz.com:443/images/2023/02/07/image-20230207142027479.png)