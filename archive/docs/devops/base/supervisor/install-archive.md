# 安装supervisord（已存档）

Supervisord ChangeLog: http://supervisord.org/changes.html

Supervisord Installing: http://supervisord.org/installing.html#installing

:::tip 约定
- 所有源码包下载到 /usr/local/src 中
- 每次安装都使用最新稳定版
- 添加 EPEL 后，执行命令`yum info supervisor` 发现版本为 3.4.0，不允许使用 yum 安装
- 为了便于后期维护，启用 [include] 块, 通过`files`指令加载应用程序配置（支持模糊匹配）
- <font color="red">安装完成后，需要<a href="/middleware/supervisord/webui.html" target="_blank">开启Web控制台（单机版）</a></font>
:::

## 使用Python2安装（centos7）

1、安装必要的库依赖
```bash
yum -y install python-setuptools
```

2、下载源码包并解压
```bash
cd /usr/local/src
# 当前最新稳定版为 4.2.5（截止2023年5月）
wget https://codeload.github.com/Supervisor/supervisor/tar.gz/refs/tags/4.2.5 -O supervisor-4.2.5.tar.gz
tar -zxvf supervisor-4.2.5.tar.gz
```

3、安装
```
cd /usr/local/src/supervisor-4.2.5
python setup.py install
```

:::tip 节选一段安装过程
```vim
creating /usr/lib/python2.7/site-packages/supervisor-4.2.5-py2.7.egg
Extracting supervisor-4.2.5-py2.7.egg to /usr/lib/python2.7/site-packages
Adding supervisor 4.2.5 to easy-install.pth file
Installing echo_supervisord_conf script to /usr/bin
Installing pidproxy script to /usr/bin
Installing supervisorctl script to /usr/bin
Installing supervisord script to /usr/bin

Installed /usr/lib/python2.7/site-packages/supervisor-4.2.5-py2.7.egg
Processing dependencies for supervisor==4.2.5
Searching for setuptools==0.9.8
Best match: setuptools 0.9.8
Adding setuptools 0.9.8 to easy-install.pth file
Installing easy_install script to /usr/bin
Installing easy_install-2.7 script to /usr/bin

Using /usr/lib/python2.7/site-packages
Finished processing dependencies for supervisor==4.2.5
```
:::

4、验证是否安装成功

```bash
supervisord --version

# 输出内容如下
4.2.5
```

**安装成功后，需要新建配置文件，之后再运行 Supervisor。**

## 使用Pip3安装（centos7）

pip3 安装 supervisor

>pip3 为 python3 的包管理器，关于 python3 的安装详见：<a href="/devops/python/install.html#安装python3" target="_blank">源码编译安装 Python3</a>

```bash
pip3 install supervisor
```

配置环境变量

> 安装后的执行文件会默认安装在 pip3 的执行文件目录（同 python3的执行文件目录），执行文件包括但不限于`python3`、`pip3`、`supervisord`、`supervisorctl`。

```bash
# 添加搜索路径到配置文件
echo 'PATH=$PATH:/usr/local/python3.11/bin
export PATH' >> /etc/profile

# 刷新环境变量
source /etc/profile
```

验证是否安装成功
```bash
supervisord --version

# 输出内容如下
4.2.5
```

**安装成功后，需要新建配置文件，之后再运行 Supervisor。**

## 使用Pip3安装（openEuler22.03）

openEuler 22.03-LTS版本开始，停止支持和维护Python 2，仅支持Python 3。摘录自：https://docs.openeuler.org/zh/docs/22.03_LTS_SP1/docs/Releasenotes/%E7%94%A8%E6%88%B7%E9%A1%BB%E7%9F%A5.html

安装 pip3
> pip3 为 python3 的包管理器
```bash
yum - y install  python3-pip

# 验证pip
pip3 -V
# 输出内容如下
pip 21.3.1 from /usr/lib/python3.9/site-packages/pip (python 3.9)
```

pip3 安装 supervisor
```bash
pip3 install supervisor
```

验证是否安装成功
```bash
supervisord --version

# 输出内容如下
4.2.5
```

supervisor 安装完成后的执行文件默认在 /usr/local/bin 中，执行文件包括但不限于 `supervisord`、`supervisorctl`、`echo_supervisord_conf`。

**安装成功后，需要新建配置文件，之后再运行 Supervisor。**


## 使用Pip安装（待完善）

安装 `pip`，参照源码编译安装 Python2 中的<a href="/devops/python/install-python2-on-openeuler.html">`pip` 安装</a>

## 新建配置文件（EL7 && Python2）

环境：Centos7.9、Python2（系统自带）

:::tip
在未新建配置文件的前提下，执行`supervisord`命令，会出现如下错误提示：Error: No config file found at default paths (/usr/etc/supervisord.conf, /usr/supervisord.conf, supervisord.conf, etc/supervisord.conf, /etc/supervisord.conf, /etc/supervisor/supervisord.conf); use the -c option to specify a config file at a different path，参照错误信息，约定将配置文件生成在 /usr/etc 中。
:::

创建需要的文件目录
```bash
mkdir -pv /usr/etc/supervisord.d
mkdir -pv /var/log/supervisord
```

生成配置文件
```bash
/usr/bin/echo_supervisord_conf > /usr/etc/supervisord.conf
```
:::tip
也可以从源码中拷贝配置文件，路径为：/usr/local/src/supervisor-4.2.5/supervisor/skel/sample.conf
:::

编辑配置文件
```bash
vim /usr/etc/supervisord.conf
```

修改如下配置项
```vim
# 设置日志文件目录
logfile=/var/log/supervisord/supervisord.log

# 启用 include（顺序不能更换）
[include]
files = supervisord.d/*/*.conf supervisord.d/*.conf
```

## 新建配置文件（EL7 && Pip3）

环境：Centos7.9、Python3（源码编译安装）、Pip3（通过 Python3 的安装自动安装）

创建需要的文件目录
```bash
mkdir -pv /usr/local/python3.11/etc
mkdir -pv /usr/local/python3.11/etc/supervisord.d
mkdir -pv /var/log/supervisord
```

生成配置文件
```bash
/usr/local/python3.11/bin/echo_supervisord_conf > /usr/local/python3.11/etc/supervisord.conf
```

编辑配置文件
```bash
vim /usr/local/python3.11/etc/supervisord.conf
```

修改如下配置项
```vim
# 设置日志文件目录
logfile=/var/log/supervisord/supervisord.log

# 启用 include（顺序不能更换）
[include]
files = supervisord.d/*/*.conf supervisord.d/*.conf
```

## 新建配置文件（openEuler && Pip3）

环境：openEuler22.03、Python3（系统自带）、Pip3（yum 安装）

:::tip
在未新建配置文件的前提下，执行`supervisord`命令，会出现如下错误提示：Error: No config file found at default paths (/usr/local/etc/supervisord.conf, /usr/local/supervisord.conf, supervisord.conf, etc/supervisord.conf, /etc/supervisord.conf, /etc/supervisor/supervisord.conf); use the -c option to specify a config file at a different path，参照错误信息，约定将配置文件生成在 /usr/local/etc 中。
:::

创建需要的文件目录
```bash
mkdir -pv /usr/local/etc/supervisord.d
mkdir -pv /var/log/supervisord
```

生成配置文件
```bash
/usr/local/bin/echo_supervisord_conf > /usr/local/etc/supervisord.conf
```

编辑配置文件
```bash
vim /usr/local/etc/supervisord.conf
```

修改如下配置项
```vim
# 设置日志文件目录
logfile=/var/log/supervisord/supervisord.log

# 启用 include（顺序不能更换）
[include]
files = supervisord.d/*/*.conf supervisord.d/*.conf
```

## 使用Systemd管理进程

:::tip 约定
- supervisord.service 执行文件需构建在 /etc/systemd/system 目录下
- 主机操作系统（如物理机或虚拟机）使用，不推荐在容器中使用
:::

1. 在 /etc/systemd/system 目录下面新建一个 supervisord.service 文件，并赋予可执行的权限。

```bash
touch /etc/systemd/system/supervisord.service
chmod +x /etc/systemd/system/supervisord.service
```

2. 创建 supervisord.service
```bash
vim  /etc/systemd/system/supervisord.service
```

写入以下内容

> 配置文件中不支持在每行命令的后面添加注释

```vim
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
Type=forking
ExecStart=/usr/bin/supervisord -c /usr/etc/supervisord.conf
ExecStop=/usr/bin/supervisorctl $OPTIONS shutdown
ExecReload=/usr/bin/supervisorctl $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```

:::tip 官方 centos-systemd-etcs 示例
```vim
# supervisord service for systemd (CentOS 7.0+)
# by ET-CS (https://github.com/ET-CS)
[Unit]
Description=Supervisor daemon

[Service]
Type=forking
ExecStart=/usr/bin/supervisord
ExecStop=/usr/bin/supervisorctl $OPTIONS shutdown
ExecReload=/usr/bin/supervisorctl $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```
来源地址：https://github.com/Supervisor/initscripts/blob/main/centos-systemd-etcs
:::

3. 重新加载 systemctl 配置
```bash
systemctl daemon-reload
```

4. 停止运行中的 supervisord 进程
```bash
ps -ef | grep "supervisord" | grep -v grep | awk '{print $2}' | xargs kill -9
```

5. 启动 supervisord 进程
```bash
systemctl status supervisord
```

:::tip Systemctl指令
```bash
systemctl status supervisord  #查看服务
systemctl start supervisord   #启动服务
systemctl stop supervisord    #停止服务
systemctl reload supervisord  #重新加载配置
systemctl enable supervisord  #开启开机自启服务
systemctl disable supervisord #关闭开机自启服务
```
:::

:::warning
- Centos7 上使用 Python2 安装 Supervisor，启动文件在 /usr/bin 目录下，配置文件在 /usr/etc 目录下。
- Centos7 上使用 Pip3 安装 Supervisor，启动文件在 /usr/local/python3.11/bin 目录下，配置文件在 /usr/local/python3.11 目录下。
- openEuler22.03 上使用 Pip3 安装 Supervisor，启动文件在 /usr/local/bin 目录下，配置文件在 /usr/local/etc 目录下。
- 尽管执行文件会在相关目录检索配置文件，但是为了便于后期维护，约定在 supervisord.service 中明确加载的配置文件路径（如：-c /usr/etc/supervisord.conf）。
:::

## Supervisorctl常用命令

在控制台执行`/usr/bin/supervisorctl`进入命令行，输入`help`可以查看支持的命令；也可以直接通过 shell 命令操作，如`supervisorctl status`，`supervisorctl restart`。

```bash
/usr/bin/supervisorctl

supervisor>help

# 输出如下内容
default commands (type help <topic>):
=====================================
add    exit      open  reload  restart   start   tail
avail  fg        pid   remove  shutdown  status  update
clear  maintail  quit  reread  signal    stop    version
```

常用命令如下：
- status                  #查看所有程序状态
- stop {programe_name}    #关闭指定的程序
- start {programe_name}   #启动指定的程序
- restart {programe_name} #重启指定的程序
- reload {programe_name}  #重新载入配置文件并重启指定的程序

注：start、restart、stop 都不会载入最新的配置文

## 使用rc.local方式实现开机自启

> 前提：<a href="/devops/server-os/index.html#启用rc-local服务" target="_blank">启用rc.local服务</a>

修改rc.local文件

```bash
vim /etc/rc.d/rc.local
```

在文件末尾添加如下内容
```vim
/usr/bin/supervisord -c /usr/etc/supervisord.conf
```

## 常见错误

- 使用 pip3 安装时可能会出现ssl错误
```bash
[root@5c10190d6b17 src]# pip3 install supervisor
WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.
WARNING: Retrying (Retry(total=4, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError("Can't connect to HTTPS URL because the SSL module is not available.")': /simple/supervisor/
WARNING: Retrying (Retry(total=3, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError("Can't connect to HTTPS URL because the SSL module is not available.")': /simple/supervisor/
WARNING: Retrying (Retry(total=2, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError("Can't connect to HTTPS URL because the SSL module is not available.")': /simple/supervisor/
WARNING: Retrying (Retry(total=1, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError("Can't connect to HTTPS URL because the SSL module is not available.")': /simple/supervisor/
WARNING: Retrying (Retry(total=0, connect=None, read=None, redirect=None, status=None)) after connection broken by 'SSLError("Can't connect to HTTPS URL because the SSL module is not available.")': /simple/supervisor/
Could not fetch URL https://pypi.org/simple/supervisor/: There was a problem confirming the ssl certificate: HTTPSConnectionPool(host='pypi.org', port=443): Max retries exceeded with url: /simple/supervisor/ (Caused by SSLError("Can't connect to HTTPS URL because the SSL module is not available.")) - skipping
ERROR: Could not find a version that satisfies the requirement supervisor (from versions: none)
ERROR: No matching distribution found for supervisor
WARNING: pip is configured with locations that require TLS/SSL, however the ssl module in Python is not available.
Could not fetch URL https://pypi.org/simple/pip/: There was a problem confirming the ssl certificate: HTTPSConnectionPool(host='pypi.org', port=443): Max retries exceeded with url: /simple/pip/ (Caused by SSLError("Can't connect to HTTPS URL because the SSL module is not available.")) - skipping
WARNING: There was an error checking the latest version of pip.
```

升级 openssl 并重新编译安装 python3，详见：<a href="/devops/python/install.html" target="_blank">源码编译安装 Python</a>

## 参考资料

- http://supervisord.org/
- https://zhuanlan.zhihu.com/p/136966142
- https://blog.csdn.net/weixin_42156097/article/details/107470533