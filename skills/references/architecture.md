<!-- skills/references/architecture.md -->

> 本文档为 AI Agent 提供项目的整体架构、分层设计和关键数据流说明。
> Agent 在新增模块、跨层修改、或理解前端↔后端交互时，应参考本文档以保持架构一致性。

# 项目架构与数据流

## 整体架构


浏览器 (Vue 3 + Vite)
    ↕ HTTP/Axios
Express 后端 (Node.js)
    ↕ 参数化查询 (mysql2/promise)
MySQL 8.0 数据库


## 前端分层

- **Views (页面级)**：路由对应的顶层组件，组装业务模块。
- **Components (可复用组件)**：论坛帖子、网盘文件、用户信息等。
- **Stores (Pinia)**：全局状态管理，包括用户登录态、网盘当前数据、封禁状态等。
- **API Layer**：Axios 实例封装在 `src/api/request.js`，拦截器自动携带 JWT、处理 401 退出。
- **Utils**：纯函数工具库（密码校验、下载文件等）。
- **Styles**：全局 CSS 变量和组件基础类，组件内使用 `<style scoped>` 补充特定样式。

## 后端分层

- **Routes**：定义 API 路径，挂载中间件和控制器。
- **Middlewares**：认证（authMiddleware）、错误处理、文件上传、活跃时间更新。
- **Controllers**：解析请求参数，调用 Service 层，返回 JSON。
- **Services**：封装数据库查询，全部使用参数化查询。
- **Utils**：JWT 签发验证、密码哈希、分页工具、中文编码转换。

## 关键数据流

### 帖子列表加载
1. 前端访问 `/forum/:slug/posts?page=1&pageSize=10&sortBy=time`
2. 后端权限校验 → Service 查询 `posts` 表，JOIN `users` 获取作者信息
3. 使用分页工具 `paginate()` 返回 `{ data, total, page, pageSize, totalPages }`
4. 前端渲染帖子卡片 + 分页组件

### 评论与回复加载
1. 帖子详情页请求 `/forum/:slug/posts/:postId`
2. 前端单独请求评论 `/forum/:slug/posts/:postId/comments?page=1`
3. 每条评论再请求回复 `/forum/comments/:commentId/replies?page=1`
4. 前端递归构建二级回复树，限制嵌套深度为2

### 封禁检查
1. 用户登录后，路由守卫调用 `/user/me/bans` 获取封禁状态
2. 存入 `userStore.bans`
3. 各组件（发帖、评论、网盘）通过 `computed` 检查 `bans` 控制 UI
4. 后端对应接口也做二次校验
