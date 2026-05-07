## 前置检查

- 服务器架构
    - arm64
    - x86_64
- <font color="red">服务器横向 SSH 是否联通</font>
- 防火墙开放状态
- 物理磁盘是否挂载
- 所有密码为复杂密码

## 网络关系

- 服务器是否允许出网
  - 临时开放
    - 全部放开
  - 长期开放
    - 应用服务器
        - 后端需要请求的第三方接口
        - 业务的跨网段请求
        - 互联网访问前端应用
    - 运维服务器
        - 到自建的 Squid 服务器或其他正向服务器

## 初始化部分

- 虚拟机管理平台设置为高可用选项
- 修改为国内源
- 时钟同步
- 防火墙
    - 关闭防火墙
    - 放开特定端口并限制 IP 访问
- 关闭 SeLinux
- 升级 OpenSSL
    - 版本确定
- 升级 OpenSSH
    - <font color="red">升级后可能导致堡垒机部分功能不可用</font>
    - 9.8p1 版本及以上
    - 禁用特定算法，修复 CVE-2002-20001 漏洞
- 配置文件最大打开数
- 配置内核和网络参数
- 测试硬件是否符合要求
    - 硬盘是否为 SSD
- 配置 LVM 磁盘

## 应用安装部分

### 代理服务器

- Nginx
    - 版本确定
    - Lua 模块
- Keepalived
    - 是否可以由硬件支持
- Logrotate
    - 切割方式
        - 按日期
        - 按大小
- Ansible&nbsp;<font color="red">SSH&nbsp;联通时</font>
    - Ansible 的 Hosts 文件配置
- Rsync&nbsp;<font color="red">SSH&nbsp;联通时</font>
- 脚本内容
    - 用于 Nginx 访问控制的 Lua 脚本
    - 文件同步脚本&nbsp;<font color="red">SSH&nbsp;联通时</font>

### Web 应用服务器

- Nginx
  - 版本确定
- Java
    - jdk1.8（写入系统变量）
    - jdk11 或者更高（绝对路径使用）
- Supervisord
  - web 控制台
- Ansible&nbsp;<font color="red">SSH&nbsp;联通时</font>
    - Ansible 的 Hosts 文件配置
- Rsync&nbsp;<font color="red">SSH&nbsp;联通时</font>
- NFS 或其他存储
  - Upload 目录与 Jar 包配置在同一台服务器上
- Logrotate
    - 切割方式
        - 按时间
        - 按大小
- 脚本内容
    - 文件同步脚本&nbsp;<font color="red">SSH&nbsp;联通时</font>
    - 半自动发布脚本（临时）&nbsp;<font color="red">当&nbsp;Jenkins&nbsp;不可用时</font>

### 数据库服务器

- Mysql
    - 版本
    - 架构
        - 单点
        - 双主双从
        - MGR 集群
    - 备份策略
        - MysqlDump
        - XtraBackup
- Keepalived
    - VIP 确定
- MongoDB
  - 版本

### 中间件服务器

- Redis
    - 架构
        - 单点
        - 集群
- RabbitMQ
    - 架构
        - 单点
        - 集群
    - <font color="red">与 erlang 版本对应</font>
- MinIO
    - 备份策略
- NacOS
- 脚本内容
    - MinIO 备份脚本

### 监控服务器

- Prometheus
- Grafana
- 监控平台
    - 版本
    - 采集端与服务端角色
    - Agent / Exporter 版本
    - <font color="red">监控存储与业务数据库分离</font>
- Php
    - 版本
    - 编译时禁用特定参数解决中文乱码
- ELK
    - <font color="red">版本完全一致，包括小版本号</font>

### 运维服务器

::: danger 说明事项
当且仅当服务器横向 SSH 联通时使用
:::

- Jenkins
    - Git 配置
    - 配置 SSH Keygen
    - 插件配置
- 脚本内容
    - Jenkins 远程执行的脚本
- NVM
    - Nodejs 版本
    - Pnpm 版本（具体指定）
    - Nodejs 仓库配置
- Java
    - Jdk1.8（与业务 jdk 版本一致）
    - Jdk11（绝对路径使用，仅 Jenkins 运行使用，不参与业务）
- Maven
    - 修改仓库
- Ansible
    - Ansible 的 Hosts 文件配置
    - 配置免密执行 sudo
- Squid 代理配置或其他正向代理配置

### K8S 服务器

- Kubernetes
    - 版本
    - <font color="red">root 用户安装</font>
- Kubesphere
    - 版本
    - <font color="red">root 用户安装</font>
- Docker
    - 版本
    - <font color="red">root 用户安装</font>
- Harbor
- Helm
- Docker 代理配置

### 跳板机

- Windows （RDP 协议）
  - 堡垒机配置
    - RDP 协议
  - 服务器配置
    - Navicat
    - Firefox or Chrome
- Linux （vnc 协议）
  - 堡垒机配置
    - VNC 协议
  - 服务器配置
    - VNC
    - Navicat
    - Firefox or Chrome

### 其他事项

- <font color="red">Squid 源服务器配置白名单</font>
- 上传文件的 MD5 或 Hash 检查
- 备份文件
    - 保存周期
    - MD5 或 Hash 生成
    - <font color="red">移动后的 MD5 或 Hash 检查</font>
