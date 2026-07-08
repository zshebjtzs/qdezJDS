<!-- skills/scripts/dev.md -->

> 本文档为 AI Agent 提供常用开发命令的速查信息，包括启动、构建、数据库操作、版本控制等。
> Agent 在提供可执行命令时，应参考本文档中的格式，并在必要时提醒用户替换为实际路径。

# 常用开发命令

> ⚠️ 如果提示 `mysql 不是内部或外部命令`，说明 MySQL 的 bin 目录未加入系统 PATH。
> 请先 `cd` 到 MySQL 安装目录的 `bin` 文件夹，再用 `.\mysql -u root -p` 连接。

## 启动服务

```bash
# 前端（项目根目录）
npm run dev            # 默认 http://localhost:5173

# 后端（server 目录）
cd server && node app.js   # 默认 http://localhost:3001
```

## 构建

```bash
npm run build         # 生产构建，输出到 dist/
```

## 数据库操作

```bash
# 登录 MySQL
mysql -u root -p

# 导入初始化脚本（全新环境）
mysql -u root -p qdez_JDS_db < server/db/init.sql

# 查看表结构
DESCRIBE users;

# 清空所有业务数据（保留表结构）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE posts;
TRUNCATE TABLE comments;
TRUNCATE TABLE replies;
TRUNCATE TABLE files;
TRUNCATE TABLE post_views;
TRUNCATE TABLE moderators;
TRUNCATE TABLE bans;
SET FOREIGN_KEY_CHECKS = 1;
```

## 版本控制

```bash
git status                     # 查看变更
git add . && git commit -m "描述"  # 提交
git log --oneline -5           # 最近提交
git reset --soft <commit>      # 回退提交但保留文件
```

## API 测试

使用 VS Code 的 REST Client 插件，打开 `test-api.http`，点击每个请求上方的 “Send Request”。
