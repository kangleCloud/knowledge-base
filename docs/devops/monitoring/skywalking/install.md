# Skywalking二进制部署
最新稳定版：https://archive.apache.org/dist/skywalking/


## 安装必要的环境

1. 安装jdk

:::tip 提示

当前最新版skywalking（9.4.0需要jdk版本17或者18），安装skywalking前请先配置jdk环境

:::

2. 安装elasticsearch

:::tip 提示

约定skywalking使用的数据库为elasticsearch，安装skywalking前请先准备elasticsearch

:::

## 安装OAP服务端

1. 下载并解压安装包

```shell
cd /usr/local/src
wget https://archive.apache.org/dist/skywalking/9.4.0/apache-skywalking-apm-9.4.0.tar.gz
tar xvf apache-skywalking-apm-9.4.0.tar.gz -C /usr/local/
cd /usr/local/
mv apache-skywalking-apm-bin apache-skywalking-apm-bin9.4
```

2. 修改配置文件

`vim /usr/local/apache-skywalking-apm-bin9.4/config/application.yml`

```yaml
# 修改存储源
storage:
   # 配置后端存储为es
   selector: ${SW_STORAGE:elasticsearch}
   elasticsearch:
      namespace: ${SW_NAMESPACE:""}
      # es服务地址，配置时请替换相应内容
      clusterNodes: ${SW_STORAGE_ES_CLUSTER_NODES:es服务IP:es服务port}
      user: ${SW_ES_USER:"es用户名"}
      password: ${SW_ES_PASSWORD:"es用户密码"}
```

> 官方配置[示例](https://skywalking.apache.org/docs/main/v9.4.0/en/setup/backend/backend-storage/)

3. 启动
```shell
cd /usr/local/apache-skywalking-apm-bin9.4/bin
sh oapService.sh

# 查看端口
netstats -nltp|grep 11800
netstats -nltp|grep 12800
```
4. 停止
```shell
jps|grep OAPServerStartUp
kill -15 上条命令查出的进程号
```
## 安装UI web端
:::warning 注意

二进制安装时，UI的安装包已经包含在OAP服务包中：
:::

```shell
ls webapp
bin  config  config-examples  LICENSE  licenses  LICENSE.tpl  NOTICE  oap-libs  README.txt  tools  webapp  zipkin-LICENSE
```

**webapp即为UI安装包**

1. 修改配置文件
```yaml
serverPort: ${SW_SERVER_PORT:-8080}

# Comma seperated list of OAP addresses.
oapServices: ${SW_OAP_ADDRESS:-http://localhost:12800}

zipkinServices: ${SW_ZIPKIN_ADDRESS:-http://localhost:9412}
```
2.  启动
```shell
cd /usr/local/apache-skywalking-apm-bin9.4/bin
sh webappService.sh

# 查看端口
netstats -nltp|grep 8080
```
3. 停止
```shell
jps|grep OAPServerStartUp
kill -15 上条命令查出的进程号
```

## 安装Java-Agent

> agent部署在运行Java进程的服务器上 

1. 下载并解压安装包

```shell
cd /usr/local/src
wget https://archive.apache.org/dist/skywalking/java-agent/8.16.0/apache-skywalking-java-agent-8.16.0.tgz
tar xvf apache-skywalking-java-agent-8.16.0.tgz -C /usr/local/
cd /usr/local/
mv apache-skywalking-java-agent-8.16.0 apache-skywalking-java-agent8.16
```

2. 修改jar包启动脚本

```ini
-javaagent:/usr/local/skywalking-agent/skywalking-agent.jar -Dskywalking.agent.service_name=模块名-IP第四段 -Dskywalking.collector.backend_service=OAP服务IP:OAP服务端口（11800）
```

### 验证安装

访问web界面 

http://ip:port