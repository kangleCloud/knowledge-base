# Jenkins 构建VUE项目流程

VUE项目分为单模块和多模块的项目，两者发布流程大体相同，不同的点在于多模块项目需要能够支持打包单独的一个模块，这个时候就需要基本发布流程
中的`$MODULE_NAME`参数起作用。

## 大致发布流程

若项目为单模块项目，可跳过对`$MODULE_NAME`的判断，直接进行打包

- 若`$METHOD`为`deploy`：

  - 在Jenkins服务器本地创建`deploy_tmp`目录，用于保存本次打包的新模块；
 
  - 使用ansible在web服务器创建`releases`下的构建目录以及`content`发布目录；

  - 若`$MODULE_NAME`为`all`:

    - 打包编译所有模块(这一步需要跟开发确定node版本以及打包编译的命令)

    - 将打包后生成的`dist`复制至`deploy_tmp`下
  - 若`$MODULE_NAME`非`all`:

    - 打包编译指定模块(这一步需要跟开发确定node版本以及打包编译的命令)

    - 将打包后生成的`dist`复制至`deploy_tmp`下

  - 使用ansible将`deploy_tmp`下的项目目录同步至web服务器`releases`下新的构建目录内。

  - 使用ansible将web服务器`content`内的发布目录软链至`releases`下新的构建目录。

- 若`$METHOD`为`rollback`：
  - 使用ansible将`content`下的发布目录重新软链至`releases`下的`$ROLLBACK_VERSION`目录。


## 分模块打包示例

```bash
#!/bin/bash -ile
SERVER="10.1.0.104,10.1.0.252"
DIR='/data'

if [[ $METHOD == "deploy" ]]; then
    ansible ${SERVER} -m file -a "path=${DIR}/releases/${JOB_NAME}/dist/${MODULE_NAME} state=directory" -u nginx
    ansible ${SERVER} -m file -a "path=${DIR}/content/${JOB_NAME}/dist state=directory" -u nginx
    mkdir -p ../deploy_tmp/${JOB_NAME}

    nvm use v16.14.0
    pnpm install
    pnpm run build ${MODULE_NAME}
    echo "打包完成"
    
    /bin/cp -rf ./dist/${MODULE_NAME} ../deploy_tmp/${JOB_NAME}/dist/
    /bin/cp -rf ./dist/js ../deploy_tmp/${JOB_NAME}/dist/
    /bin/cp -rf ./dist/image ../deploy_tmp/${JOB_NAME}/dist/

    ansible ${SERVER} -m synchronize -a "src=../deploy_tmp/${JOB_NAME}/dist/${MODULE_NAME}/ dest=${DIR}/releases/${JOB_NAME}/dist/${MODULE_NAME}/${BUILD_DISPLAY_NAME} compress=yes recursive=yes dirs=yes archive=no" -u nginx
    ansible ${SERVER} -m file -a "src=${DIR}/releases/${JOB_NAME}/dist/${MODULE_NAME}/${BUILD_DISPLAY_NAME} dest=${DIR}/content/${JOB_NAME}/dist/${MODULE_NAME} state=link" -u nginx
    echo "目录同步完成"

    ansible ${SERVER} -m script -a "chdir=${DIR}/releases/${JOB_NAME}/dist/${MODULE_NAME} /data/jenkins/scripts/clean_old_build.sh" -u nginx
  
elif [[ $METHOD == "rollback" ]]; then
    echo "准备回滚..."
    ansible ${SERVER} -m shell -a "if [[ -d ${DIR}/releases/${JOB_NAME}/dist/${MODULE_NAME}/${ROLLBACK_VERSION} ]];then ln -sfn ${DIR}/releases/${JOB_NAME}/dist/${MODULE_NAME}/${ROLLBACK_VERSION} ${DIR}/content/${JOB_NAME}/dist/${MODULE_NAME} && echo "已回滚至版本${ROLLBACK_VERSION}";else echo '回滚的版本不存在！';fi" -u nginx
fi
```


## 不区分模块打包示例

```bash
#!/bin/bash -ile
SERVER="10.1.0.104,10.1.0.252"
DIR='/data'

if [[ $METHOD == "deploy" ]]; then
    ansible ${SERVER} -m file -a "path=${DIR}/releases/${JOB_NAME}/dist state=directory" -u nginx
    ansible ${SERVER} -m file -a "path=${DIR}/content/${JOB_NAME} state=directory" -u nginx

    nvm use v16.14.0
    pnpm install
    pnpm run build
    echo "打包完成"

    ansible ${SERVER} -m synchronize -a "src=./dist/ dest=${DIR}/releases/${JOB_NAME}/dist_${BUILD_DISPLAY_NAME} compress=yes recursive=yes dirs=yes archive=no" -u nginx
    ansible ${SERVER} -m file -a "src=${DIR}/releases/${JOB_NAME}/dist_${BUILD_DISPLAY_NAME} dest=${DIR}/content/${JOB_NAME}/dist state=link" -u nginx
    echo "目录同步完成"

    ansible ${SERVER} -m script -a "chdir=${DIR}/releases/${JOB_NAME} /data/jenkins/scripts/clean_old_build.sh" -u nginx
  
elif [[ $METHOD == "rollback" ]]; then
    echo "准备回滚..."
    ansible ${SERVER} -m shell -a "if [[ -d ${DIR}/releases/${JOB_NAME}/dist_${ROLLBACK_VERSION} ]];then ln -sfn ${DIR}/releases/${JOB_NAME}/dist_${ROLLBACK_VERSION} ${DIR}/content/${JOB_NAME}/dist && echo "已回滚至版本${ROLLBACK_VERSION}";else echo '回滚的版本不存在！';fi" -u nginx
fi
```

## 发布后刷新七牛云脚本

刷新七牛云脚本：

该脚本需放置在jenkins_home目录下的scripts内。同时Jenkins服务器需要安装`pyhton3`并安装`qiniu`库。

执行方法：python3 /data/jenkins/scripts/refresh_qiniu.py `需刷新的文件路径或目录路径`。

例子：`python3 /data/jenkins/scripts/refresh_cdn.py https://szd-life-activity-fs-cdn.2500city.com/activity/${MODULE_NAME}/`

```shell
# -*- coding: utf-8 -*-
# flake8: noqa

import qiniu
import sys

url = sys.argv[1]

# 账户ak，sk
ak = '<ACCESS_KEY>'  # 替换成 Qiniu 账号的 AccessKey.
sk = '<SECRET_KEY>'  # 替换成 Qiniu 账号的 SecretKey.

auth = qiniu.Auth(ak, sk)
cdn_manager = qiniu.CdnManager(auth)

# 刷新链接
refresh_url_result = cdn_manager.refresh_urls(url)
print(refresh_url_result)
```
