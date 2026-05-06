# Jenkins 构建JAVA项目流程

## 大致发布流程

- 若`$METHOD`为`deploy`：

  - 在Jenkins服务器本地创建`deploy_tmp`目录，用于保存本次打包的新模块；
 
  - 使用ansible在web服务器创建`releases`下的构建目录以及`content`发布目录；

  - 若`$MODULE_NAME`为`all`:

    - 打包编译所有模块(这一步需要跟开发确定打包编译的命令)

    - 将所有模块打包后生成的`target`目录下的jar包复制至`deploy_tmp`下

    - 循环所有web服务器：

      - 使用ansible将`deploy_tmp`下的项目目录同步至web服务器`releases`下新的构建目录内。

      - 使用ansible将web服务器`content`内的发布目录软链至`releases`下新的构建目录。

      - 使用ansible执行`supervisorctl`命令重启所有本项目的的包

      - 请求`probe`接口，检查服务是否启动完成

      - 进入下一循环

  - 若`$MODULE_NAME`非`all`:

    - 打包编译指定模块(这一步需要跟开发确定打包编译的命令)

    - 将打包后生成的`target`目录下的jar包复制至`deploy_tmp`下

    - 循环所有web服务器：

      - 使用ansible将`deploy_tmp`下的项目目录同步至web服务器`releases`下新的构建目录内。

      - 使用ansible将web服务器`content`内的发布目录软链至`releases`下新的构建目录。

      - 使用ansible执行`supervisorctl`命令重启本次发布的的包

      - 请求`probe`接口，检查服务是否启动完成

      - 进入下一循环

- 若`$METHOD`为`rollback`：

  - 循环所有web服务器：

    - 使用ansible将`content`下的发布目录重新软链至`releases`下的`$ROLLBACK_VERSION`目录。

    - 使用ansible执行`supervisorctl`命令重启所有本项目的的包

    - 请求`probe`接口，检查服务是否启动完成

    - 进入下一循环


## 测试环境示例

```bash
#!/bin/bash -ile

SERVER="10.1.0.252"  # 由于生产环境需要轮询此变量梯次重启服务，故此变量不能写ansible hosts分组名。
DIR='/data'

if [[ $METHOD == "deploy" ]]; then
  ansible ${SERVER} -m file -a "path=${DIR}/releases/${JOB_NAME}/${MODULE_NAME} state=directory" -u nginx
  ansible ${SERVER} -m file -a "path=${DIR}/content/${JOB_NAME} state=directory" -u nginx
  mkdir -p ../deploy_tmp/${JOB_NAME}

  mvn clean package -pl ${MODULE_NAME} -am -Dmaven.test.skip=true
  echo "编译完成"

  /bin/cp -rf ./${MODULE_NAME}/target/*.jar ../deploy_tmp/${JOB_NAME}/${MODULE_NAME}.jar

  echo "开始同步目录至应用服务器"
  ansible ${SERVER} -m synchronize -a "src=../deploy_tmp/${JOB_NAME}/${MODULE_NAME}.jar dest=${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${BUILD_DISPLAY_NAME}.jar delete=yes archive=no recursive=yes" -u nginx
  ansible ${SERVER} -m file -a "src=${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${BUILD_DISPLAY_NAME}.jar dest=${DIR}/content/${JOB_NAME}/${MODULE_NAME}.jar state=link" -u nginx
  ansible ${SERVER} -m shell -a "sudo supervisorctl restart ${JOB_NAME}_${MODULE_NAME}" -u nginx
  echo "应用重启完成"

  sed -i '1,7!d' .${JOB_NAME}.env
  echo "${BUILD_DISPLAY_NAME}\ ${SERVER}\ ${MODULE_NAME}" >> .${JOB_NAME}.env
  ansible ${SERVER} -m script -a "chdir=${DIR}/releases/${JOB_NAME}/${MODULE_NAME} /data/jenkins/scripts/clean_old_build.sh" -u nginx
  
elif [[ $METHOD == "rollback" ]]; then
  echo "准备回滚..."
  SERVER=`cat .${JOB_NAME}.env |grep ${ROLLBACK_VERSION} |awk -F "=" '{print $2}'`
  MODULE_NAME=`cat .${JOB_NAME}.env |grep ${ROLLBACK_VERSION} |awk -F "=" '{print $3}'`

  ansible ${SERVER} -m shell -a "if [[ -f ${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${BUILD_DISPLAY_NAME}.jar ]];then ln -sfn ${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${BUILD_DISPLAY_NAME}.jar ${DIR}/content/${JOB_NAME}/${MODULE_NAME}.jar && echo "已回滚至版本${ROLLBACK_VERSION}";else echo '回滚的版本不存在！' && exit 0;fi" -u nginx
  ansible ${SERVER} -m shell -a "sudo supervisorctl restart ${JOB_NAME}_${MODULE_NAME}" -u nginx
  echo "应用回滚完成"
fi
```


## 生产环境示例

生产环境相较于测试环境的不同主要是添加了应用梯次重启及探针接口状态检查功能。

```bash
#!/bin/bash -ilex

SERVER="10.1.0.104,10.1.0.252"  # 由于生产环境需要轮询此变量梯次重启服务，故此变量不能写ansible hosts分组名。
DIR='/data'


if [[ $METHOD == "deploy" ]]; then
  ansible ${SERVER} -m file -a "path=${DIR}/releases/${JOB_NAME}/${MODULE_NAME} state=directory" -u nginx
  ansible ${SERVER} -m file -a "path=${DIR}/content/${JOB_NAME} state=directory" -u nginx 
  mkdir -p ../deploy_tmp/${JOB_NAME}

  mvn clean package -pl ${MODULE_NAME} -am -Dmaven.test.skip=true
  echo "编译完成"

  /bin/cp -rf ./${MODULE_NAME}/target/*.jar ../deploy_tmp/${JOB_NAME}/${MODULE_NAME}.jar

  echo "开始同步目录至应用服务器"
  for server in ${SERVER//,/ }
  do
    ansible ${server} -m synchronize -a "src=../deploy_tmp/${JOB_NAME}/${MODULE_NAME}.jar dest=${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${BUILD_DISPLAY_NAME}.jar compress=yes delete=yes recursive=yes dirs=yes archive=no" -u nginx
    ansible ${server} -m file -a "src=${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${BUILD_DISPLAY_NAME}.jar dest=${DIR}/content/${JOB_NAME}/${MODULE_NAME}.jar state=link" -u nginx
    ansible ${server} -m shell -a "sudo supervisorctl restart ${JOB_NAME}_${MODULE_NAME}" -u nginx
    sleep 10s
    i=1
    while [ $i -le 6 ]
    do
      case ${MODULE_NAME} in
        "sjfy-app") json=`curl  -s http://${server}:9901/api/probe || echo "0"`;;
        "sjfy-admin") json=`curl  -s http://${server}:9902/admin/api/probe || echo "0"`;;
        "sjfy-consumer") json="success";;
      esac
      if [ $json == "success" ]; then
        echo "${server}\'s ${MODULE_NAME} 重启完成.";break
      fi
      sleep 5s
      let i++
    done
    if [ $i -gt 5 ]; then
      echo "${server}\'s ${MODULE_NAME} 重启失败.";exit 1
    fi
  done
  echo "应用重启完成"

  touch .${JOB_NAME}.env
  sed -i '1,14!d' ./.${JOB_NAME}.env
  echo "${BUILD_DISPLAY_NAME}\ ${SERVER}" >> ./.${JOB_NAME}.env
  ansible ${SERVER} -m script -a "chdir=${DIR}/releases/${JOB_NAME}/${MODULE_NAME} /data/jenkins/scripts/clean_old_build.sh" -u nginx
  
elif [[ $METHOD == "rollback" ]]; then
  echo "准备回滚..."
  SERVER=`cat ./.${JOB_NAME}.env |grep ${ROLLBACK_VERSION} |awk -F "=" '{print $2}'`
  MODULE_NAME=`cat .${JOB_NAME}.env |grep ${ROLLBACK_VERSION} |awk -F "=" '{print $3}'`
  for server in ${SERVER//,/ }
  do
    ansible ${server} -m shell -a "if [[ -f ${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${ROLLBACK_VERSION}.jar ]];then ln -sfn ${DIR}/releases/${JOB_NAME}/${MODULE_NAME}/${MODULE_NAME}_${ROLLBACK_VERSION}.jar ${DIR}/content/${JOB_NAME}/${MODULE_NAME}.jar;else echo '回滚的版本不存在！';fi" -u nginx
    ansible ${server} -m shell -a "supervisorctl restart ${JOB_NAME}_${MODULE_NAME}" -u nginx
  sleep 30s
  i=1
  while [ $i -le 6 ]
  do
    case ${MODULE_NAME} in
      "sjfy-app") json=`curl  -s http://${server}:9901/api/probe || echo "0"`;;
      "sjfy-admin") json=`curl  -s http://${server}:9902/admin/api/probe || echo "0"`;;
      "sjfy-consumer") json="success";;
    esac
    if [ $json == "success" ]; then
      echo "${server}\'s ${MODULE_NAME} 回滚完成.";break
    fi
    sleep 5s
    let i++
  done
  if [ $i -gt 5 ]; then
    echo "${server}\'s ${MODULE_NAME} 回滚失败.";exit 1
  fi
  done
fi
```