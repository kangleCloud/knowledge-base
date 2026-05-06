# RabbitMQ介绍

RabbitMQ是一套开源（MPL）的消息队列服务软件，是由 LShift 提供的一个 Advanced Message Queuing Protocol (AMQP) 的开源实现，由以高性能、健壮以及可伸缩性出名的 Erlang 写成。

[Team RabbitMQ stopped supporting CentOS 7 in May 2022.](https://blog.rabbitmq.com/posts/2022/04/centos-7-support-discontinued/)

## 1.RabbitMQ RPM EL7 Series

在 <a href="https://packagecloud.io/" target="_blank">packagecloud</a> 中可以检索到的 el7 系列最新的 rpm 包名为 <a href="" target="_blank">rabbitmq-server-3.10.0-1.el7.noarch.rpm</a>，如果需要以 RPM 包的方式安装 RabbitMQ，参照 <a href="https://rabbitmq.com/which-erlang.html" target="_blank">RabbitMQ Erlang Version Requirements</a> 后，可使用 Erlang 24.3 系列作为 RabbitMQ 的 Erlang 依赖包。

## 2.Erlang

截止2023年5月，Zero dependency Erlang/OTP 最新版本为 v25.3.2。

:::tip CentOS 7 has Reached End-of-Life
Erlang 27.2.0, 26.2.5.6 and 25.3.2.16 include one-off CentOS 7 packages statically linked against OpenSSL 1.1.x.

Regular CentOS 7 and Amazon Linux 2 builds were produced up to Erlang 23.3.4.18. They are dynamically linked against OpenSSL 1.0.

https://github.com/rabbitmq/erlang-rpm?tab=readme-ov-file#centos-7-has-reached-end-of-life
:::

el9 RPM 包需要 OpenSSL v3 的支持，但是将 OpenSSL 升级至 v3.0.8 后仍未解决如下问题（原因未找到 😭😭😭）

:::danger 在 openEuler22.03 系统上执行`rpm -ivh erlang-25.3.2-1.el8.x86_64.rpm`失败，错误信息如下
- libcrypto.so.3()(64bit) is needed by erlang-25.3.2-1.el9.x86_64
- libcrypto.so.3(OPENSSL_3.0.0)(64bit) is needed by erlang-25.3.2-1.el9.x86_64
- libstdc++.so.6(GLIBCXX_3.4.29)(64bit) is needed by erlang-25.3.2-1.el9.x86_64
:::

系统升级 OpenSSL v3 后，不但没有解决安装过程中的问题，还会导致其他软件（如Zabbix5.4_proxy）安装失败，所以**约定使用 el8 RPM 包**。

[Zero dependency Erlang/OTP 25.3.2 packages](https://github.com/rabbitmq/erlang-rpm/releases/tag/v25.3.2) 中有很多 rpm 包，如果在 Centos7 操作系统安装，就选择 el7 RPM 包；如果在 OpenEuler 22.03 操作系统上安装，<a href="/docs/middleware/rabbitmq/install-3.11.html#二、在openeuler上安装erlang" target="_blank">就选择 el8 RPM 包</a>。