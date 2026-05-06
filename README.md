# knowledge-base

`knowledge-base` 已整理为面向运维与后端团队的知识库，主站点内容收口为五大类：

- `docs/backend/`：后端开发、框架、接入与实践
- `docs/database/`：数据库安装、规范、备份与集群
- `docs/middleware/`：中间件部署、配置与使用规约
- `docs/devops/`：主机、容器、CI/CD、监控与系统运维
- `docs/troubleshooting/`：故障排查、恢复验证与回滚方案

历史保留内容放在 `archive/`，默认不进入站点导航。

## 本地运行

```bash
npm install
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## 维护约定

- 新文档优先放入上述五大类，不再新增平行一级分类。
- 涉及密码、Token、AccessKey、SecretKey、API Key、SSH 密码等内容必须使用占位符。
- 无法确认是否仍需在线公开、但可能有历史价值的文档，优先放入 `archive/`。
