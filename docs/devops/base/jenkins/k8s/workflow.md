# Jenkins Pipeline 配置文件注释

## 顶层结构
- `pipeline`：定义 Jenkins Pipeline 的主结构。
- `agent`：指定 Pipeline 的执行环境，这里使用 Kubernetes。
- `environment`：定义全局环境变量，供 Pipeline 中的各个阶段使用。
- `stages`：定义 Pipeline 的多个阶段，每个阶段包含特定的任务。

---

## agent 块
- `kubernetes`：指定使用 Kubernetes 作为执行环境。
  - `yaml`：定义 Kubernetes Pod 的 YAML 配置。
    - `containers`：定义 Pod 中的容器。
      - `name`：容器名称。
      - `image`：容器镜像。
      - `command` 和 `tty`：保持容器处于运行状态。
      - `volumeMounts`：挂载 Maven 缓存目录。
    - `volumes`：定义 Pod 的卷。
      - `hostPath`：将主机路径挂载到容器中，用于 Maven 缓存。

---

## environment 块
- `KUBECONFIG_CREDENTIAL_ID`：Kubernetes 配置的凭据 ID。
- `REGISTRY`：Docker 镜像仓库地址。
- `REGISTRY_NAMESPACE`：镜像仓库的命名空间。
- `APP_NAME`：应用名称。
- `PROFILES_ACTIVE`：Spring Boot 的激活配置文件。

---

## stages 块
### 1. `clone code` 阶段
- `agent none`：不使用默认的 Kubernetes Agent。
- `steps`：定义具体的步骤。
  - `container('base')`：在名为 `base` 的容器中执行。
  - `sh`：更改文件权限。
  - `git`：从 GitLab 拉取代码。

### 2. `package` 阶段
- `agent none`：不使用默认的 Kubernetes Agent。
- `when`：条件判断，仅当环境变量 `METHOD` 为 `deploy` 时执行。
- `steps`：定义具体的步骤。
  - `container('maven-jdk8')`：在名为 `maven-jdk8` 的容器中执行。
  - `sh`：修改 Maven 配置文件，添加阿里云 Maven 镜像源。
  - `sh`：执行 Maven 打包命令。

### 3. `build & push` 阶段
- `agent none`：不使用默认的 Kubernetes Agent。
- `when`：条件判断，仅当环境变量 `METHOD` 为 `deploy` 时执行。
- `environment`：定义阶段内的环境变量。
  - `JAR_NAME`：通过 Shell 脚本获取打包生成的 JAR 文件名称。
- `steps`：定义具体的步骤。
  - `container('base')`：在名为 `base` 的容器中执行。
  - `dir`：切换到目标目录。
  - `sh`：生成 Dockerfile 文件。
  - `sh`：构建 Docker 镜像。
  - `withCredentials`：使用 Docker 仓库的凭据登录并推送镜像。

### 4. `deploy to k8s` 阶段
- `agent none`：不使用默认的 Kubernetes Agent。
- `when`：条件判断，仅当环境变量 `METHOD` 为 `deploy` 时执行。
- `environment`：定义阶段内的环境变量。
  - `VERSION_NUMBER`：版本号，使用 Jenkins 的构建号。
  - `JAR_NAME`：通过 Shell 脚本获取打包生成的 JAR 文件名称。
- `steps`：定义具体的步骤。
  - `container('base')`：在名为 `base` 的容器中执行。
  - `withKubeConfig`：使用 Kubernetes 配置文件执行命令。
    - `sh`：通过 `envsubst` 替换变量并应用 Kubernetes 的 Deployment 和 Service 配置。
```bash
pipeline {
  agent {
    kubernetes {
      //cloud 'kubernetes'
      inheritFrom 'base maven'
      yaml """
spec:
  containers:
  - name: maven-jdk8
    image: maven:3.6.3-openjdk-8-slim
    command: ['cat']
    tty: true
    volumeMounts:
    - name: maven-cache
      mountPath: /root/.m2
  volumes:
  - name: maven-cache
    hostPath:
      path: /data/jenkins/jenkins_maven_cache
"""
    }
  }

  environment {
    KUBECONFIG_CREDENTIAL_ID = "63709dee-48c3-46ef-b7f4-4e2a0bd360da"
    REGISTRY = "10.1.0.123:3380"
    REGISTRY_NAMESPACE = "dykunshan"
    APP_NAME = "dykunshan-java-mini-activity"
    PROFILES_ACTIVE = "test"
  }

  stages {
    stage('clone code') {
      agent none
      steps {
        container('base') {
          sh 'chown 1000.1000 -R ./'
          git(url: 'https://git.example.com/dykunshan-backend/java-mini-activity.git', credentialsId: 'gitlab-credential', branch: "test", changelog: true, poll: false)
        }
      }
    }

    stage('package') {
      agent none
      when {
        environment name: 'METHOD', value: 'deploy'
      }
      steps {
        container('maven-jdk8') {
          sh 'sed -i "/<\\/mirrors>/i\\    <mirror>\\n      <id>alimaven<\\/id>\\n      <name>aliyun maven<\\/name>\\n      <url>http:\\/\\/maven.aliyun.com\\/nexus\\/content\\/groups\\/public\\/<\\/url>\\n      <mirrorOf>central<\\/mirrorOf>\\n    <\\/mirror>" /usr/share/maven/conf/settings.xml'
          sh '''
          mvn -version
          mvn clean package -pl ${MODULE_NAME} -am
          '''
        }
      }
    }

    stage('build & push') {
      agent none
      when {
        environment name: 'METHOD', value: 'deploy'
      }
      environment {
        JAR_NAME = "${sh(script: 'cd ${MODULE_NAME}/target && ls *.jar', returnStdout:true).trim()}"
      }
      steps {
        container('base') {
          dir("${MODULE_NAME}/target") {
            sh '''
            cat >Dockerfile << EOF
FROM busybox

COPY ${JAR_NAME} /code/
EOF
            cat Dockerfile
            '''
            sh 'docker build -f Dockerfile -t ${REGISTRY}/${REGISTRY_NAMESPACE}/${APP_NAME}-${MODULE_NAME}:${BUILD_NUMBER} .'
            withCredentials([usernamePassword(credentialsId : 'harbor-credential' ,passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,)]) {
              sh 'echo "${DOCKER_PASSWORD}" | docker login ${REGISTRY} -u "${DOCKER_USERNAME}" --password-stdin'
              sh 'docker push ${REGISTRY}/${REGISTRY_NAMESPACE}/${APP_NAME}-${MODULE_NAME}:${BUILD_NUMBER}'
            }
          }
        }
      }
    }

    stage('deploy to k8s') {
      agent none
      when {
        environment name: 'METHOD', value: 'deploy'
      }
      environment {
        VERSION_NUMBER = "${BUILD_NUMBER}"
        JAR_NAME = "${sh(script: 'cd ${MODULE_NAME}/target && ls *.jar', returnStdout:true).trim()}"
      }
      steps {
        container ('base') {
            withKubeConfig([credentialsId: "${env.KUBECONFIG_CREDENTIAL_ID}", serverUrl: 'https://kubernetes.default']) {
            sh 'envsubst < k8s/deployment.yaml | kubectl apply -f -'
            sh 'envsubst < k8s/service.yaml | kubectl apply -f -'
          }
        }
      }
    }
  }
}
```
