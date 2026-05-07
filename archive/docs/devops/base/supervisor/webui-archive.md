# Web控制台（单机版）

打开 webui 功能后，可以远程通过浏览器监控进程状态和日志。

配置说明：http://supervisord.org/configuration.html#inet-http-server-section-values

## 配置文件地址

没有找到通过命令查出加载配置文件的地址，只能参照安装文档中的“配置文件”块。

## 启用HttpServer

:::warning
如果需要支持外网访问，采用 Nginx 代理的方式出网，同时启用账号与密码控制访问。
:::

编辑使用 Python2 方式安装 Supervisord 的配置文件
> Note：使用 Pip3 方式安装 Supervisord 的配置文件在 /usr/local/python3.11/etc 目录中。
```bash
vim /usr/etc/supervisord.conf
```

修改 inet_http_server 块的配置（默认使用 9001 端口提供服务）

```vim
[inet_http_server]          ; inet (TCP) server disabled by default
port=*:9001                 ; ip_address:port specifier, *:port for all iface
;username=user              ; default is no username (open server)
;password=123               ; default is no password (open server)
```

## 重新启动Supervisord

详细的配置及操作参考 Superviosrd 安装文档

```bash
systemctl restart supervisord
```
