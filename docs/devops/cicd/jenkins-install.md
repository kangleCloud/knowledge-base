# 安装 Jenkins

- [LTS Changelog](https://www.jenkins.io/changelog-stable/)

:::warning 约定
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 jenkins2.424
- 数据目录默认放置在/data/jenkins下。
:::

## 安装

:::tip
 - 可通过官方[LTS Changelog](https://www.jenkins.io/changelog-stable/)、[清华源](https://mirrors.tuna.tsinghua.edu.cn/jenkins/redhat/)、[华为云软件源](https://repo.huaweicloud.com/jenkins/redhat/)、[阿里云软件源](https://mirrors.aliyun.com/jenkins/redhat/)多方确认最新版本。
:::

**下载rpm包**
```bash
cd /usr/local/src
wget https://mirrors.tuna.tsinghua.edu.cn/jenkins/redhat/jenkins-2.424-1.1.noarch.rpm --no-check-certificate
```

**安装**
```bash
rpm -ivh /usr/local/src/jenkins-2.424-1.1.noarch.rpm
```


## 配置

**调整启动配置**

:::tip
前提：启动最新版Jenkins需要使用JDK11，请提前[安装JDK11](../base/java/install-jdk.md)
:::

编辑/usr/lib/systemd/system/jenkins.service文件，并根据以下配置进行修改：

```bash
#修改端口，默认8080
Environment="JENKINS_PORT=8080"
#修改java路径
Environment="JAVA_HOME=/usr/local/jdk11"

#修改用户，防止发布代码包时出现权限问题，默认jenkins
User=root
Group=root

# 修改jenkins默认jenkins_home地址
Environment="JENKINS_HOME=/data/jenkins"
WorkingDirectory=/data/jenkins

#添加禁用跨站请求伪造保护功能配置
Environment="JAVA_OPTS=-Djava.awt.headless=true -Dorg.apache.commons.jelly.tags.fmt.timeZone=Asia/Shanghai -Xms256m -Xmx512m -XX:PermSize=512M -Dhudson.security.csrf.GlobalCrumbIssuerConfiguration.DISABLE_CSRF_PROTECTION=true"
```

重新加载jenkins.service配置
```bash
systemctl daemon-reload
```

## 目录配置

**创建数据目录**
```bash
mkdir -p /data/jenkins
```

## 启动

**启动jenkins**
```bash
systemctl start jenkins.service
```

## 安装插件

推荐安装以下插件：

中文显示插件：Locale plugin、Localization: Chinese (Simplified)；

gitlab相关插件：GitLab、Gitlab Authentication、GitLab Logo、Gitlab Hook、Git Parameter；

界面显示相关插件：Blue Ocean；

角色管理相关插件：Role-based Authorization Strategy；

pipline相关插件：Pipeline: Stage View Plugin、Build Pipeline；

版本号相关插件：Version Number；


## Q&A

1. 输入初始密码之后web页面提示“该Jenkins实例似乎已离线”
    - 问题原因：Jenkins在连接插件仓库时会尝试先访问`https://www.google.com/`以保证网络畅通，由于国内无法访问谷歌，就会显示该提示。
    - 解决办法：编辑`/etc/hosts`文件，配置一条`127.0.0.1 www.google.com`即可。

2. 插件下载速度慢怎么办？
    - 问题原因：Jenkins默认插件仓库为`https://updates.jenkins.io/update-center.json`，该地址为Jenkins官方地址，国内访问较慢。
    - 解决办法：进入`/data/jenkins`数据目录，修改`/data/jenkins/hudson.model.UpdateCenter.xml`文件内容，将`https://updates.jenkins.io/update-center.json`替换为`http://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json`即可。
