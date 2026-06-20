<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Node.js-22.14-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</p>

# 青岛二中机电社网站 (qdezJDS2026)

> 全栈社团管理平台 · 用户认证 · 内部/公开论坛 · 部门共享网盘

**语言**：[中文](./README.md) | [English](./README.en.md)

---

## 📖 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
  - [前置要求](#前置要求)
  - [安装与配置](#安装与配置)
  - [启动开发服务](#启动开发服务)
- [测试账号与注册](#测试账号与注册)
- [API 文档](#api-文档)
- [数据库设计](#数据库设计)
- [部署](#部署)
- [安全注意事项](#安全注意事项)
- [贡献](#贡献)
- [许可证](#许可证)
- [致谢](#致谢)

---

## 项目简介

本项目为青岛二中机电社量身打造，是一个集 **对外宣传、内部交流、资源共享** 于一体的全栈网站。  
采用 **Vue 3 + Node.js + MySQL** 技术栈，主要功能包括：

- 用户系统：JWT 认证，支持三种角色（内部成员、外部访客、管理员）
- 双论坛：内部论坛（仅成员可见）与公开论坛（所有人可浏览，登录后发帖）
- 网盘：私有网盘（个人存储）与公共网盘（按部门分区，本部门上传、跨部门下载）
- 管理员面板：全站权限管理

项目在开发中采用 **Vibecoding** 模式，结合 `deepseek-v4pro` API 辅助代码生成，并集成成熟开源组件（如 Vditor）以保证渲染稳定性。

---

## 功能特性

| 模块       | 子功能                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| **用户系统** | 注册（管理员创建）、登录、JWT 令牌签发、角色权限（`internal` / `external` / `admin`）        |
| **论坛**     | 内部论坛（仅 `internal` / `admin` 可见）、公开论坛（所有访客可浏览，登录后可发帖）、管理员删帖 |
| **网盘**     | 私有网盘（个人专属）、公共网盘（按 `art` / `mech` / `soft` 部门分区，本部门上传，其他部门可下载） |
| **管理员**   | 全站权限：上传至任意部门、删除任意文件、管理所有帖子                                         |

---

## 技术栈

### 前端

| 分类         | 技术                                             |
| ------------ | ------------------------------------------------ |
| 核心框架     | Vue 3 (Composition API)                          |
| 构建工具     | Vite                                             |
| 状态管理     | Pinia                                            |
| 路由         | Vue Router（含路由守卫）                         |
| HTTP 客户端  | Axios                                            |
| UI 样式      | 自定义 CSS（无第三方 UI 框架）                   |
| Markdown 渲染| Vditor（论坛帖子渲染）                           |

### 后端

| 分类         | 技术                                             |
| ------------ | ------------------------------------------------ |
| 运行时       | Node.js v22.19+                                  |
| Web 框架     | Express                                          |
| 数据库       | MySQL 8.0 + `mysql2/promise`                     |
| 认证         | JWT + bcryptjs                                   |
| 文件上传     | Multer                                           |
| 日志         | Morgan                                           |
| 安全         | Helmet, CORS                                     |

---

## 项目结构


qdezJDS/
├── index.html                 # Vue 入口 HTML
├── package.json               # 前端依赖
├── vite.config.js             # Vite 配置（含 API 代理）
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── src/
│   ├── api/                   # Axios 请求封装（auth, forum, cloud）
│   ├── components/            # 可复用组件（布局、网盘子组件等）
│   ├── views/                 # 页面级组件（首页、登录、论坛、网盘等）
│   ├── router/                # 路由配置 + 导航守卫
│   ├── stores/                # Pinia 状态管理（user, cloud）
│   ├── utils/                 # 工具函数（下载等）
│   └── main.js                # 应用入口
├── server/                    # 后端源码
│   ├── app.js                 # 应用入口，Express 初始化
│   ├── config/                # 配置文件（数据库连接、路径等）
│   ├── controllers/           # 控制器（auth, forum, cloud）
│   ├── services/              # 服务层（数据库操作封装）
│   ├── middlewares/           # 中间件（认证、错误处理、上传）
│   ├── routes/                # 路由定义
│   ├── utils/                 # 工具函数（JWT、bcrypt、编码）
│   ├── db/                    # 数据库初始化 SQL 脚本
│   └── uploads/               # 文件存储目录（自动创建）
└── .gitignore


---

## 快速开始

### 前置要求

- **Node.js** ≥ 22.19（推荐 24.x）
- **MySQL** ≥ 8.0
- **npm** 或 pnpm

### 安装与配置

1. **克隆仓库**

   ```bash
   git clone https://github.com/zshebjtzs/qdezJDS.git
   cd qdezJDS
   ```

2. **安装依赖**

   ```bash
   # 前端（根目录）
   npm install

   # 后端
   cd server
   npm install
   ```

3. **配置数据库**

   - 新建 MySQL 数据库，例如 `qdez_JDS_db`，字符集选择 `utf8mb4`。
   - 导入表结构：

     ```bash
     mysql -u root -p qdez_JDS_db < server/db/init_mysql.sql
     ```

   - 在 `server/` 目录下创建 `.env` 文件（可复制 `.env.example` 并修改）：

     ```env
     PORT=3001
     JWT_SECRET=your_super_secret_key_please_change
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_db_password
     DB_NAME=qdez_JDS_db
     ```

     > ⚠️ 请务必将 `JWT_SECRET` 和 `DB_PASSWORD` 修改为强密码。

### 启动开发服务

需要同时运行前端和后端：

```bash
# 终端 1：启动后端（在 server 目录下）
node app.js

# 终端 2：启动前端开发服务器（在项目根目录下）
npm run dev
```

成功启动后，在浏览器访问 `http://localhost:5173` 即可查看网站。  
前端开发服务器会自动代理 API 请求到后端（`http://localhost:3001`）。

---

## 测试账号与注册

本项目 **不提供公开注册页面**，账号由管理员通过以下方式创建：

### 方式一：使用 REST 客户端（推荐）

项目根目录提供 `test-api.http` 文件（可用 VS Code REST Client 插件运行），示例请求：

```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "department": "art",
  "role": "admin"
}
```

### 方式二：直接操作数据库

手动向 `users` 表插入数据，注意密码必须使用 `bcrypt` 哈希。

### 预置测试账号（若执行过初始化脚本）

| 用户名     | 密码       | 部门   | 角色       |
| ---------- | ---------- | ------ | ---------- |
| `testuser1`| `123456`   | `art`  | `internal` |
| `admin`    | `admin123` | `art`  | `admin`    |

> 建议生产环境立即删除或修改这些默认账号。

---

## API 文档

### 基础地址

- 开发环境：`http://localhost:3001/api`

### 认证模块

| 方法 | 路径                  | 说明                                 | 权限   |
| ---- | --------------------- | ------------------------------------ | ------ |
| POST | `/api/auth/register`  | 注册新用户                           | 管理员 |
| POST | `/api/auth/login`     | 用户登录，返回 JWT 令牌与用户信息     | 公开   |

**登录请求示例：**

```json
{
  "username": "testuser1",
  "password": "123456"
}
```

**登录响应示例：**

```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "username": "testuser1",
    "department": "art",
    "role": "internal"
  }
}
```

后续请求需在 Header 中携带：`Authorization: Bearer <token>`

### 论坛模块

| 方法   | 路径                  | 说明                                         | 权限                |
| ------ | --------------------- | -------------------------------------------- | ------------------- |
| GET    | `/api/forum/posts`    | 获取所有帖子（含公开和当前用户可见的内部帖） | 公开（部分内容受限）|
| POST   | `/api/forum/posts`    | 发布新帖子                                   | 登录用户            |
| DELETE | `/api/forum/posts/:id`| 删除帖子                                     | 管理员或帖主        |

**发帖请求体：**

```json
{
  "title": "帖子标题",
  "content": "Markdown 内容",
  "forumType": "public"
}
```

`forumType` 可选值：`public`（公开论坛）或 `internal`（内部论坛，仅成员可见）。

### 网盘模块

**私有网盘**

| 方法 | 路径                  | 说明                         | 权限     |
| ---- | --------------------- | ---------------------------- | -------- |
| GET  | `/api/cloud/private`  | 获取当前用户的私有文件列表   | 登录用户 |
| POST | `/api/cloud/private`  | 上传私有文件（`type=private`）| 登录用户 |
| DELETE | `/api/cloud/private/:filename` | 删除私有文件 | 文件所有者 |

**公共网盘**

| 方法 | 路径                             | 说明                                           | 权限               |
| ---- | -------------------------------- | ---------------------------------------------- | ------------------ |
| GET  | `/api/cloud/public/:department`  | 获取指定部门的公共文件列表                     | 内部成员           |
| POST | `/api/cloud/public`              | 上传公共文件（需提供 `type=public, department`）| 本部门或管理员     |
| DELETE | `/api/cloud/public/:department/:filename` | 删除公共文件                         | 本部门上传者或管理员 |

**上传文件请求格式：** `multipart/form-data`，字段包括：

- `file`：文件本体
- `type`：`private` 或 `public`
- `department`（公共文件必填）：`art`、`mech` 或 `soft`

> 所有文件上传大小限制为 50MB（可在 `server/middlewares/upload.js` 调整）。

---

## 数据库设计

### 用户表 `users`

| 字段        | 类型          | 说明                             |
| ----------- | ------------- | -------------------------------- |
| id          | INT (PK, AI)  | 用户 ID                          |
| username    | VARCHAR(50)   | 用户名（唯一）                   |
| password    | VARCHAR(255)  | bcrypt 加密后的密码              |
| department  | ENUM('art','mech','soft') | 所属部门（内部成员必填） |
| role        | ENUM('internal','external','admin') | 用户角色               |
| created_at  | TIMESTAMP     | 注册时间                         |

### 帖子表 `posts`

| 字段       | 类型          | 说明                         |
| ---------- | ------------- | ---------------------------- |
| id         | INT (PK, AI)  | 帖子 ID                      |
| title      | VARCHAR(200)  | 标题                         |
| content    | TEXT          | Markdown 内容                |
| forum_type | ENUM('public','internal') | 论坛类型     |
| author_id  | INT (FK)      | 作者用户 ID                  |
| created_at | TIMESTAMP     | 发布时间                     |

### 文件记录表 `files`

| 字段        | 类型          | 说明                                 |
| ----------- | ------------- | ------------------------------------ |
| id          | INT (PK, AI)  | 文件 ID                              |
| filename    | VARCHAR(255)  | 存储文件名（UUID 生成）              |
| originalname| VARCHAR(255)  | 原始文件名                           |
| type        | ENUM('private','public') | 文件类型                 |
| department  | ENUM('art','mech','soft') | 所属部门（公共文件）     |
| uploader_id | INT (FK)      | 上传者 ID                            |
| size        | BIGINT        | 文件大小（字节）                     |
| created_at  | TIMESTAMP     | 上传时间                             |

完整建表语句请查看 `server/db/init_mysql.sql`。

---

## 部署

### 生产环境构建

1. **构建前端**

   ```bash
   npm run build
   ```

   构建产物输出到 `dist/` 目录。

2. **后端部署**

   - 确保 `.env` 中配置了生产环境的安全参数（强 JWT 密钥、HTTPS 等）。
   - 建议使用 `pm2` 守护后端进程：

     ```bash
     npm install -g pm2
     pm2 start server/app.js --name qdez-backend
     ```

3. **静态文件托管**

   可将 `dist/` 目录部署到 Nginx 等 Web 服务器，并配置反向代理将 `/api` 请求转发至后端。

### 环境变量参考（生产环境）


NODE_ENV=production
PORT=3001
JWT_SECRET=production_grade_secret_key
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=qdez_JDS_db


> 务必启用 HTTPS 并设置安全的 Cookie 策略。

---

## 安全注意事项

- **JWT 密钥**：使用随机生成的强密钥，长度不低于 32 字符。
- **数据库凭证**：通过 `.env` 管理，切勿提交至版本库。
- **HTTPS**：生产环境强制使用，防止令牌泄露。
- **文件上传**：限制类型与大小，服务端校验文件格式，防范恶意文件。
- **权限控制**：前端路由守卫 + 后端中间件双重验证，确保 `external` 用户无法访问受限接口。
- **依赖更新**：定期升级依赖以修复已知漏洞。

---

## 贡献

欢迎任何形式的贡献！请遵循以下流程：

1. Fork 本仓库
2. 创建你的功能分支：`git checkout -b feature/amazing-feature`
3. 提交你的更改：`git commit -m '添加某个精彩功能'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 发起 Pull Request

所有贡献均基于 MIT 许可证。

---

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

© 2026 青岛二中机电社

---

## 致谢

- 感谢开源社区提供的杰出项目：Vue, Express, MySQL, Vditor 等。
- 项目架构参考了 GitHub 上优秀的全栈模板。
- 开发过程中借助 `deepseek-v4pro` API 提升编码效率。
