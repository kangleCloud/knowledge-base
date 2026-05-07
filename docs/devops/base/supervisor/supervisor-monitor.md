# supervisor-monitor 安装

github仓库地址：<a href="https://github.com/mlazarov/supervisord-monitor" target="_blank">https://github.com/mlazarov/supervisord-monitor</a>

::: tip
如果有多个服务器，每个服务器部署一个supervisor服务，那么管理起来不方便，使用supervisor-monitor，通过简单的配置就能将所有服务器上的supervisor服务呈现在一个web界面上
:::

## 环境依赖

supervisor-monitor 是 php 编写的，需要我们具有php环境，php 环境的安装可以参考这篇文章：<a href="/docs/devops/php7/install-php73" target="_blank">Centos7下安装PHP7</a>

## 安装supervisor-monitor

```bash
cd /usr/local/
git clone https://github.com/mlazarov/supervisord-monitor.git
cd /root/supervisord-monitor/application/config
cp supervisor.php.example supervisor.php
```

修改 supervisor.php 文件

```bash
vim /usr/local/supervisord-monitor/application/config/supervisor.php
```

下面是一个例子：

```php
<?php


// Dashboard columns. 2 or 3
$config['supervisor_cols'] = 3;

// Refresh Dashboard every x seconds. 0 to disable
$config['refresh'] = 25;

// Enable or disable Alarm Sound
$config['enable_alarm'] = false;

// Show hostname after server name
$config['show_host'] = false;

$config['supervisor_servers'] = array(
        '10.1.0.35' => array(
                'url' => '10.1.0.35/RPC2',
                'port' => '9001',
                // 'username' => 'yourusername',
                // 'password' => 'yourpass'
        ),  // 这部分是supervisor服务器中的配置
        '10.1.0.60:demo-project-a' => array(
                'url' => '10.1.0.60/RPC2',
                'port' => '19001'
        ),
        '10.1.0.60:demo-project-b' => array(
                'url' => '10.1.0.60/RPC2',
                'port' => '29001'
        ),
);

// Set timeout connecting to remote supervisord RPC2 interface
$config['timeout'] = 3;

// Path to Redmine new issue url
$config['redmine_url'] = '/';

// Default Redmine assigne ID
$config['redmine_assigne_id'] = '69';
```

这是其中一个受到管理的supervisor服务器端的配置文件部分

```vim
[inet_http_server]         ; inet (TCP) server disabled by default
port=*:9001        ; ip_address:port specifier, *:port for all iface
;username=user              ; default is no username (open server)
;password=<PASSWORD>        ; default is no password (open server)
```

:::warning
使用supervisor-monitor时，port必须写成0.0.0.0，不能写成回环地址或本机ip，否则会出错。
:::

## 配置nginx进行web界面访问

```bash
vim /etc/nginx/conf.d/supervisor.conf

server {
    listen       8082 default_server;
    server_name  _;
    root         /usr/local/supervisord-monitor/public_html/;
    location / {
        index  index.php;
    }

    location /control/ {
        index  index.php;
        rewrite  /(.*)$  /index.php?$1  last;
    }

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9073;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }
}
```
