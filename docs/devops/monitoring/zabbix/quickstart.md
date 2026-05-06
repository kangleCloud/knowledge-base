# 概述

https://www.zabbix.com/documentation/current/zh/manual/introduction/about

:::tip
- 为减轻 Zabbix Server 服务器的压力，约定采用 Zabbix agentd 的主动模式。因此，需将模板中所有监控项的类型从<font color="red">“Zabbix客户端”</font>调整为<font color="red">“Zabbix客户端（主动式）”</font>。
:::

## 下载

Zabbix 源码包中已经包含了 Server, Proxy, Agent, GUI。

- Zabbix Cloud Images and Appliances：https://cdn.zabbix.com/
- Zabbix LTS：https://www.zabbix.com/cn/download_sources
- Zabbix Stable：https://cdn.zabbix.com/zabbix/sources/stable/
- Zabbix Oldstable：https://cdn.zabbix.com/zabbix/sources/oldstable/

## Agent

https://www.zabbix.com/documentation/current/zh/manual/concepts/agent

:::tip
Zabbix Agent 的工作模式分为主动和被动模式，默认情况下二种模式共存。二种模式对于数据的采集方式是所有不同的，简单可以概述为以下过程：
- 被动模式：Zabbix Server 向 Zabbix Agent 的 10050 端口（默认）发起请求，获取监控数据。
- 主动模式：Zabbix Agent 向 Zabbix Server 的 10051 端口（默认）发起请求，提交监控数据。
:::

## Agent2

https://www.zabbix.com/documentation/current/zh/manual/concepts/agent2

## 代理

https://www.zabbix.com/documentation/current/zh/manual/concepts/proxy

<font color="red"><b>Zabbix proxy 需要使用独立的数据库。</b></font>

## 模板

https://www.zabbix.com/documentation/current/zh/manual/config/templates

## 监控项

https://www.zabbix.com/documentation/current/zh/manual/config/items

## 触发器

当接收的值超出触发器的规定时，就被认为是故障，如果超出后再次符合，就被认为是正常。

无论是故障发生（问题状态：问题）还是故障恢复（问题状态：已解决）都会显示在问题的面板中，如果需要将故障发生和恢复进行邮件或微信、钉钉等报警，需要结合“Trigger actions”功能。

https://www.zabbix.com/documentation/current/zh/manual/config/triggers

## 动作

### 0x01.Trigger actions

- 操作

```md
主题：【{项目名}故障报警：{HOST.NAME}】{TRIGGER.NAME}
消息：
  告警主机：{HOST.NAME} / {HOST.HOST}
  告警名称：{TRIGGER.NAME}
  告警等级：{TRIGGER.SEVERITY}
  告警时间：{EVENT.DATE} {EVENT.TIME}
  当前值：{ITEM.NAME} = {ITEM.LASTVALUE}  
  事件ID：{EVENT.ID}
```

- 恢复操作

```md
主题：【{项目名}故障恢复：{HOST.NAME}】{TRIGGER.NAME}
消息：
  告警主机：{HOST.NAME} / {HOST.HOST}
  告警名称：{TRIGGER.NAME}
  告警等级：{TRIGGER.SEVERITY}
  告警时间：{EVENT.DATE} {EVENT.TIME}
  当前值：{ITEM.NAME} = {ITEM.LASTVALUE}  
  事件ID：{EVENT.ID}
```
