# Systemd Daemon (Service Management)

`systemd` is a System Management Daemon which replaces the sysvinit process to become the first process with PID = 1, which gets executed in user space during the Linux start-up process. It is a system that is designed specifically for the Linux kernel. It is now being used as a replacement of init.d to overcome shortcomings of it. It uses systemctl command to perform related operations.

`systemd` 是一个系统管理守护进程，它取代了 sysvinit 进程，成为第一个 PID = 1 的进程，在 Linux 启动过程中在用户空间执行。它是一个专门为Linux内核设计的系统。它现在被用作init.d的替代品，以克服它的不足之处。它使用systemctl命令来执行相关操作。

e.g. $ systemctl start [service-name], $ systemctl poweroff

Visit the following resources to learn more:

- [What is systemd? and its commands](https://www.geeksforgeeks.org/linux-systemd-and-its-components/)
- [init.d vs systemd](https://web.yueh.dev/learning/init-vs-systemd-what-is-an-init-daemon)
- [Why Systemd as a replacement of init.d?](https://www.tecmint.com/systemd-replaces-init-in-linux/)

## 系统管理
**1、 systemctl**

`systemctl`是 Systemd 的主命令，用于管理系统。

> ```bash
> # 重启系统
> $ sudo systemctl reboot
> 
> # 关闭系统，切断电源
> $ sudo systemctl poweroff
> 
> # CPU停止工作
> $ sudo systemctl halt
> 
> # 暂停系统
> $ sudo systemctl suspend
> 
> # 让系统进入冬眠状态
> $ sudo systemctl hibernate
> 
> # 让系统进入交互式休眠状态
> $ sudo systemctl hybrid-sleep
> 
> # 启动进入救援状态（单用户状态）
> $ sudo systemctl rescue
> ```

**2、systemd-analyze**

`systemd-analyze`命令用于查看启动耗时。

> ```bash
> # 查看启动耗时
> $ systemd-analyze                                                                                       
> 
> # 查看每个服务的启动耗时
> $ systemd-analyze blame
> 
> # 显示瀑布状的启动过程流
> $ systemd-analyze critical-chain
> 
> # 显示指定服务的启动流
> $ systemd-analyze critical-chain atd.service
> ```

**3、hostnamectl**

`hostnamectl`命令用于查看当前主机的信息。

> ```bash
> # 显示当前主机的信息
> $ hostnamectl
> 
> # 设置主机名。
> $ sudo hostnamectl set-hostname rhel7
> ```

**4、localectl**

`localectl`命令用于查看本地化设置。

> ```bash
> # 查看本地化设置
> $ localectl
> 
> # 设置本地化参数。
> $ sudo localectl set-locale LANG=en_GB.utf8
> $ sudo localectl set-keymap en_GB
> ```

**5、timedatectl**

`timedatectl`命令用于查看当前时区设置。

> ```bash
> # 查看当前时区设置
> $ timedatectl
> 
> # 显示所有可用的时区
> $ timedatectl list-timezones                                                                                   
> 
> # 设置当前时区
> $ sudo timedatectl set-timezone America/New_York
> $ sudo timedatectl set-time YYYY-MM-DD
> $ sudo timedatectl set-time HH:MM:SS
> ```

**6、loginctl**

`loginctl`命令用于查看当前登录的用户。

> ```bash
> # 列出当前session
> $ loginctl list-sessions
> 
> # 列出当前登录用户
> $ loginctl list-users
> 
> # 列出显示指定用户的信息
> $ loginctl show-user ruanyf
> ```


## Unit管理

**1、systemctl list-units**
`systemctl list-units`命令可以查看当前系统的所有 Unit 。

> ```bash
> # 列出正在运行的 Unit
> $ systemctl list-units
> 
> # 列出所有Unit，包括没有找到配置文件的或者启动失败的
> $ systemctl list-units --all
> 
> # 列出所有没有运行的 Unit
> $ systemctl list-units --all --state=inactive
> 
> # 列出所有加载失败的 Unit
> $ systemctl list-units --failed
> 
> # 列出所有正在运行的、类型为 service 的 Unit
> $ systemctl list-units --type=service
> ```

**2、systemctl status**
`systemctl status`命令用于查看系统状态和单个 Unit 的状态。

> ```bash
> # 显示系统状态
> $ systemctl status
> 
> # 显示单个 Unit 的状态
> $ sysystemctl status bluetooth.service
> 
> # 显示远程主机的某个 Unit 的状态
> $ systemctl -H root@rhel7.example.com status httpd.service
> ```

除了`status`命令，`systemctl`还提供了三个查询状态的简单方法，主要供脚本内部的判断语句使用。

> ```bash
> # 显示某个 Unit 是否正在运行
> $ systemctl is-active application.service
> 
> # 显示某个 Unit 是否处于启动失败状态
> $ systemctl is-failed application.service
> 
> # 显示某个 Unit 服务是否建立了启动链接
> $ systemctl is-enabled application.service
> ```

**3、Unit 管理**
对于用户来说，最常用的是下面这些命令，用于启动和停止 Unit（主要是 service）。

> ```bash
> # 立即启动一个服务
> $ sudo systemctl start apache.service
> 
> # 立即停止一个服务
> $ sudo systemctl stop apache.service
> 
> # 重启一个服务
> $ sudo systemctl restart apache.service
> 
> # 杀死一个服务的所有子进程
> $ sudo systemctl kill apache.service
> 
> # 重新加载一个服务的配置文件
> $ sudo systemctl reload apache.service
> 
> # 重载所有修改过的配置文件
> $ sudo systemctl daemon-reload
> 
> # 显示某个 Unit 的所有底层参数
> $ systemctl show httpd.service
> 
> # 显示某个 Unit 的指定属性的值
> $ systemctl show -p CPUShares httpd.service
> 
> # 设置某个 Unit 的指定属性
> $ sudo systemctl set-property httpd.service CPUShares=500
> ```

## Unit配置管理

**1、systemctl list-unit-files**
`systemctl list-unit-files`命令用于列出所有配置文件。

> ```bash
> # 列出所有配置文件
> $ systemctl list-unit-files
> 
> # 列出指定类型的配置文件
> $ systemctl list-unit-files --type=service
> ```

这个命令会输出一个列表。

> ```bash
> $ systemctl list-unit-files
> 
> UNIT FILE              STATE
> chronyd.service        enabled
> clamd@.service         static
> clamd@scan.service     disabled
> ```

这个列表显示每个配置文件的状态，一共有四种。

> - enabled：已建立启动链接
> - disabled：没建立启动链接
> - static：该配置文件没有`[Install]`部分（无法执行），只能作为其他配置文件的依赖
> - masked：该配置文件被禁止建立启动链接

注意，从配置文件的状态无法看出，该 Unit 是否正在运行。这必须执行前面提到的`systemctl status`命令。

> ```bash
> $ systemctl status bluetooth.service
> ```

一旦修改配置文件，就要让 System 重新加载配置文件，然后重新启动，否则修改不会生效。

> ```bash
> $ sudo systemctl daemon-reload
> $ sudo systemctl restart httpd.service
> ```


## 日志管理
Systemd 统一管理所有 Unit 的启动日志。带来的好处就是，可以只用`journalctl`一个命令，查看所有日志（内核日志和应用日志）。日志的配置文件是`/etc/systemd/journald.conf`。

`journalctl`功能强大，用法非常多。

> ```bash
> # 查看所有日志（默认情况下 ，只保存本次启动的日志）
> $ sudo journalctl
> 
> # 查看内核日志（不显示应用日志）
> $ sudo journalctl -k
> 
> # 查看系统本次启动的日志
> $ sudo journalctl -b
> $ sudo journalctl -b -0
> 
> # 查看上一次启动的日志（需更改设置）
> $ sudo journalctl -b -1
> 
> # 查看指定时间的日志
> $ sudo journalctl --since="2012-10-30 18:17:16"
> $ sudo journalctl --since "20 min ago"
> $ sudo journalctl --since yesterday
> $ sudo journalctl --since "2015-01-10" --until "2015-01-11 03:00"
> $ sudo journalctl --since 09:00 --until "1 hour ago"
> 
> # 显示尾部的最新10行日志
> $ sudo journalctl -n
> 
> # 显示尾部指定行数的日志
> $ sudo journalctl -n 20
> 
> # 实时滚动显示最新日志
> $ sudo journalctl -f
> 
> # 查看指定服务的日志
> $ sudo journalctl /usr/lib/systemd/systemd
> 
> # 查看指定进程的日志
> $ sudo journalctl _PID=1
> 
> # 查看某个路径的脚本的日志
> $ sudo journalctl /usr/bin/bash
> 
> # 查看指定用户的日志
> $ sudo journalctl _UID=33 --since today
> 
> # 查看某个 Unit 的日志
> $ sudo journalctl -u nginx.service
> $ sudo journalctl -u nginx.service --since today
> 
> # 实时滚动显示某个 Unit 的最新日志
> $ sudo journalctl -u nginx.service -f
> 
> # 合并显示多个 Unit 的日志
> $ journalctl -u nginx.service -u php-fpm.service --since today
> 
> # 查看指定优先级（及其以上级别）的日志，共有8级
> # 0: emerg
> # 1: alert
> # 2: crit
> # 3: err
> # 4: warning
> # 5: notice
> # 6: info
> # 7: debug
> $ sudo journalctl -p err -b
> 
> # 日志默认分页输出，--no-pager 改为正常的标准输出
> $ sudo journalctl --no-pager
> 
> # 以 JSON 格式（单行）输出
> $ sudo journalctl -b -u nginx.service -o json
> 
> # 以 JSON 格式（多行）输出，可读性更好
> $ sudo journalctl -b -u nginx.serviceqq
>  -o json-pretty
> 
> # 显示日志占据的硬盘空间
> $ sudo journalctl --disk-usage
> 
> # 指定日志文件占据的最大空间
> $ sudo journalctl --vacuum-size=1G
> 
> # 指定日志文件保存多久
> $ sudo journalctl --vacuum-time=1years
> ```
