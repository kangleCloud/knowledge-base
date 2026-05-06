const devopsCicdMenu = [
  {
    text: "Jenkins 与 CI/CD",
    collapsed: false,
    items: [
      {
        text: "Jenkins 安装",
        link: "/docs/devops/cicd/jenkins-install.md",
      },
      {
        text: "K8S 集群内集成 Jenkins",
        link: "/docs/devops/cicd/k8s-jenkins-install.md",
      },
      {
        text: "Jenkins 连接 K8S 配置",
        link: "/docs/devops/cicd/k8s-jenkins-config.md",
      },
      {
        text: "Jenkins K8S 工作流",
        link: "/docs/devops/base/jenkins/k8s/workflow.md",
      },
    ],
  },
  {
    text: "交付与部署",
    collapsed: true,
    items: [
      {
        text: "基本部署流程",
        link: "/docs/devops/cicd/deploy/deploy-base.md",
      },
      {
        text: "Java 项目部署",
        link: "/docs/devops/cicd/deploy/deploy-java.md",
      },
      {
        text: "Vue 项目部署",
        link: "/docs/devops/cicd/deploy/deploy-vue.md",
      },
    ],
  },
  {
    text: "质量平台",
    collapsed: true,
    items: [
      {
        text: "SonarQube 安装",
        link: "/docs/devops/cicd/sonarqube-install.md",
      },
    ],
  },
];

export default devopsCicdMenu;
