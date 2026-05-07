const containerMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "DevOps 知识库概览",
        link: "/docs/devops/",
      },
      {
        text: "容器平台分类首页",
        link: "/docs/devops/container/",
      },
    ],
  },
  {
    text: "Docker",
    collapsed: false,
    items: [
      {
        text: "二进制安装 Docker",
        link: "/docs/devops/container/docker/install-by-binaries.md",
      },
      {
        text: "YUM 安装 Docker",
        link: "/docs/devops/container/docker/install-by-yum.md",
      },
      {
        text: "安装 Docker Compose",
        link: "/docs/devops/container/docker/install-docker-compose.md",
      },
      {
        text: "Docker 常用命令",
        link: "/docs/devops/container/docker/docker-commands.md",
      },
    ],
  },
  {
    text: "Kubernetes",
    collapsed: true,
    items: [
      {
        text: "Kubernetes 基础安装",
        link: "/docs/devops/container/kubernetes/kubernetes-install/kubernetes-base-install.md",
      },
      {
        text: "kubectl 使用",
        link: "/docs/devops/container/kubernetes/kubernetes-install/kubectl.md",
      },
      {
        text: "Kubernetes 挂载 NFS",
        link: "/docs/devops/container/kubernetes/kubernetes-install/kubernetes-nfs.md",
      },
      {
        text: "Helm 3 二进制安装",
        link: "/docs/devops/container/helm/install-helm3-by-binaries.md",
      },
    ],
  },
  {
    text: "Rancher",
    collapsed: true,
    items: [
      {
        text: "脚本安装 RKE2",
        link: "/docs/devops/container/rancher/install-rke2.md",
      },
      {
        text: "Helm 安装 Rancher Server",
        link: "/docs/devops/container/rancher/install-rancher-by-helm.md",
      },
    ],
  },
];

export default containerMenu;
