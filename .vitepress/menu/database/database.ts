const databaseMenu = [
  {
    text: "Overview",
    collapsed: false,
    items: [
      {
        text: "数据库知识库概览",
        link: "/docs/database/",
      },
    ],
  },
  {
    text: "MySQL 基础与规范",
    collapsed: false,
    items: [
      {
        text: "MySQL 8.0 安装部署",
        link: "/docs/database/mysql/install-mysql8.0.md",
      },
      {
        text: "MySQL 8.0 基础操作",
        link: "/docs/database/mysql/base-mysql8.0.md",
      },
      {
        text: "MySQL SQL 高级语句",
        link: "/docs/database/mysql/advanced-sql-in-mysql.md",
      },
      {
        text: "MySQL 基本设计规范",
        link: "/docs/database/mysql/basic-specification.md",
      },
      {
        text: "库表规约",
        link: "/docs/database/mysql/db-table-specification.md",
      },
      {
        text: "SQL 开发规范",
        link: "/docs/database/mysql/sql-develop-specification.md",
      },
      {
        text: "DDL 常用示例",
        link: "/docs/database/mysql/data-definition-language.md",
      },
      {
        text: "MySQL 8.0 系统变量说明",
        link: "/docs/database/mysql/system-variable-for-mysql8.0.md",
      },
      {
        text: "MySQL 5.7 系统变量说明",
        link: "/docs/database/mysql/system-variable-for-mysql5.7.md",
      },
    ],
  },
  {
    text: "MySQL 集群与备份",
    collapsed: true,
    items: [
      {
        text: "MySQL 组复制集群",
        link: "/docs/database/mysql/mgr.md",
      },
      {
        text: "MySQL 双主双从集群",
        link: "/docs/database/mysql/mmss.md",
      },
      {
        text: "Percona XtraBackup 8.0",
        link: "/docs/database/mysql/percona-xtrabackup-8.0.md",
      },
      {
        text: "Percona XtraBackup 2.4",
        link: "/docs/database/mysql/percona-xtrabackup-2.4.md",
      },
    ],
  },
  {
    text: "MongoDB",
    collapsed: true,
    items: [
      {
        text: "安装 MongoDB 7.0",
        link: "/docs/database/mongodb/install-mongodb-7.0.md",
      },
      {
        text: "安装 MongoDB 6.0",
        link: "/docs/database/mongodb/install-mongodb-6.0.md",
      },
    ],
  },
  {
    text: "达梦数据库",
    collapsed: true,
    items: [
      {
        text: "达梦数据库基础操作",
        link: "/docs/database/dameng/base.md",
      },
      {
        text: "达梦数据库使用说明",
        link: "/docs/database/dameng/shuoming-dameng.md",
      },
    ],
  },
  {
    text: "Hive",
    collapsed: true,
    items: [
      {
        text: "Hive 常用 SQL",
        link: "/docs/database/hive/sql.md",
      },
    ],
  },
];

export default databaseMenu;
