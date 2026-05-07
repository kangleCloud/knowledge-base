# Jenkins 基本部署流程

## 构建名

**命名规范**：项目名(有缩写就使用缩写)-代码包名

## 描述
**规范**：项目名 - 代码包功能名 - 代码包名

## 丢弃旧的构建(Discard old builds)

**策略**：Log Rotation

**保持构建的天数**：
    测试环境：7
    生产环境：180

**保持构建的最大个数**：
    测试环境：7
    生产环境：14

## 参数化构建(This project is parameterized)

项目参数默认包含以下几项：

**TITLE(标题)**：参数类型为字符参数(String Parameter)，默认值为空，描述：请填写本次发布的发起者、更新内容等。

**METHOD(操作)**：参数类型为选项参数(Choice Parameter)，选项：deploy、rollback，描述：选择本次是正常发布操作还是进行回滚操作。

**MODULE_NAME(模块名)**：参数类型为选项参数(Choice Parameter)，描述：请选择本次需要发布的模块。

**ROLLBACK_VERSION(回滚版本号)**：参数类型为字符参数(String Parameter)，默认值为空，描述：当选择rollback时填写本次需要回滚的版本。

## 源码管理

默认选择`Git`方式

**Repository URL(代码仓地址)**：推荐填写https地址。

**Credentials(认证证书)**：需要在Jenkins中手动添加凭据，凭据类型为`Username with password`，用户名、密码必须为拉取代码专用的`deploy`账号，账号具体信息可查询wiki。

**Branches to build(构建分支)**：测试环境为`*/test`，生产环境为`*/master`。

## 构建环境

### Create a formatted version number(创建格式化版本号)：

用于按照日期时间-发布操作格式化每个构建名，需要提前安装`Version number`插件

**Environment Variable Name**：BUILD_VERSION

**Version Number Format String**：`${BUILD_DATE_FORMATTED, "yyyyMMdd-HHmmss"}_${METHOD}`

勾选 `Build Display Name Use the formatted version number for build display name.`

## 构建步骤

根据每个项目编写构建脚本，详情可查看各分类下的构建步骤。

旧构建清理脚本：

该脚本需放置在jenkins_home目录下的scripts内。

```shell
#!/bin/sh

function clean_old_build_stage(){
    total=`ls | wc -l` #取出当前项目总构建数量

    if [ ${total} -gt 5 ]; then #只对总构建数量超过10个的项目进行操作
        del_appnum=`expr ${total} - 5` #判断需要删除的构建数量
        del_applist=`ls -tr | head -${del_appnum}` #列出需要删除的构建的列表
        echo -e "以下发布将被删除：\n ${del_applist}"
        sudo rm -rf ${del_applist}
    fi
}

clean_old_build_stage
```

使用方法：
在每次完成content软链之后最后使用ansible远程执行脚本，命令`ansible ${SERVER} -m script -a "chdir=${DIR}/releases/${JOB_NAME} /data/jenkins/scripts/clean_old_build.sh" -u nginx`