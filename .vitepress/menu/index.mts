import backendMenu from "./backend/backend";
import databaseMenu from "./database/database";
import devopsBaseMenu from "./devops/base";
import devopsCicdMenu from "./devops/cicd";
import devopsContainerMenu from "./devops/container";
import devopsMonitoringMenu from "./devops/monitoring";
import middlewareMenu from "./middleware/middleware";
import troubleshootingMenu from "./troubleshooting/troubleshooting";

const createSidebar = () => {
  return {
    "/docs/backend/": backendMenu,
    "/docs/database/": databaseMenu,
    "/docs/devops/base/": devopsBaseMenu,
    "/docs/devops/cicd/": devopsCicdMenu,
    "/docs/devops/container/": devopsContainerMenu,
    "/docs/devops/monitoring/": devopsMonitoringMenu,
    "/docs/middleware/": middlewareMenu,
    "/docs/troubleshooting/": troubleshootingMenu,
  };
};

export default createSidebar;
