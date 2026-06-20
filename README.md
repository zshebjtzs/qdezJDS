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

| 模块 | 子功能 |
| --- | --- |
| **用户系统** | 注册（管理员通过 API 创建）、登录、JWT 令牌鉴权；自定义头像/背景图（裁剪上传）；个人信息（联系方式、简介、主题色）；修改密码（强度校验）；用户名 3 天冷却修改，曾用名显示；管理员紫色、版主红色名称标识；最近活跃时间自动记录 |
| **论坛** | 多板块（内部/公开分区，部门事务板块）；帖子按时间和热度排序（后端分页）；Markdown + LaTeX 编辑与渲染（Vditor + KaTeX）；树形评论/回复（二级限制，@提及，嵌套缩进）；评论/回复分页加载；帖子权限控制（允许浏览/评论）；管理员/版主管理（删除帖子、修改权限、板块禁言）；用户禁言/解禁（全站或板块级）；帖子浏览量去重 |
| **网盘** | 私有/公共网盘；部门共享空间；文件上传、下载、删除；中文文件名处理；文件搜索（纯前端）；分页加载 |
| **管理员控制台** | 用户管理（查看、搜索、封禁/解封、授予/撤销版主）；板块禁言控制；封禁支持有效期限（1h/1d/3d/7d/30d 或不限期） |
| **通用** | 响应式布局；分页组件；全局 CSS 设计令牌；安全防护（Helmet、参数化查询、DOMPurify、XSS 防护）；用户列表；使用条款/隐私政策；Token 过期自动退出与封禁拦截 |

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

```
qdezJDS/
├── index.html # Vue 应用入口 HTML，定义挂载点 #app
├── package.json # 前端 npm 依赖与脚本
├── vite.config.js # Vite 构建配置（路径别名、API 代理）
├── .env.development # 开发环境变量
├── .env.production # 生产环境变量
├── .gitignore # Git 忽略规则
├── src/ # 前端源码目录
│ ├── api/ # Axios 请求封装（auth、forum、cloud、user 等）
│ ├── assets/ # 静态资源（图片、默认头像、法律文档等）
│ ├── components/ # 可复用组件
│ │ ├── admin/ # 管理员控制面板
│ │ ├── cloud/ # 网盘子组件（私有/公共）
│ │ ├── common/ # 通用组件（分页器等）
│ │ ├── forum/ # 论坛核心组件（帖子列表、详情、编辑）
│ │ ├── layout/ # 布局组件（导航栏、页脚、用户信息页）
│ │ ├── legal/ # 法律文本展示组件
│ │ └── publicHome/ # 公共主页子组件（关于、活动）
│ ├── markdown/ # Markdown 编辑器与安全渲染（Vditor、KaTeX）
│ ├── router/ # Vue Router 配置与导航守卫
│ ├── stores/ # Pinia 状态管理（用户、网盘等）
│ ├── styles/ # 全局样式（CSS 变量、组件基础类、网盘公共样式）
│ ├── utils/ # 工具函数（排序、搜索、密码校验等）
│ ├── views/ # 页面级组件（首页、登录、论坛、网盘、404）
│ ├── App.vue # 根组件，动态布局
│ └── main.js # 应用入口，注册 Pinia、Router
├── server/ # 后端源码目录
│ ├── app.js # Express 应用入口（中间件、路由挂载、启动监听）
│ ├── config/ # 配置文件（数据库连接池、路径工具）
│ ├── controllers/ # 控制器层（auth、forum、cloud、user、admin 等）
│ ├── services/ # 服务层（数据库查询封装）
│ ├── middlewares/ # 中间件（JWT 认证、错误处理、文件上传、活跃时间更新）
│ ├── routes/ # 路由定义（auth、forum、cloud、user、admin）
│ ├── utils/ # 工具函数（JWT、bcrypt、分页、编码转换等）
│ ├── db/ # 数据库初始化脚本（示例 SQL）
│ ├── uploads/ # 文件存储目录（头像、背景、网盘文件）
│ └── .env # 后端环境变量（不提交）
└── (其他配置文件等)
```

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
   - 导入表结构（含默认板块数据）：

     ```bash
     mysql -u root -p qdez_JDS_db < server/db/init.sql
     ```

     > 该脚本会创建所有业务表（用户、帖子、评论、回复、封禁记录等），并插入 10 个默认论坛板块。

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

### 认证模块

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 注册新用户 | 公开（建议仅管理员使用） |
| POST | `/api/auth/login` | 登录，返回 JWT 与用户信息 | 公开 |

### 用户模块

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/user/:uid` | 查看他人公开信息 | 登录 |
| GET | `/api/user/me/profile` | 获取自己完整信息 | 登录 |
| PATCH | `/api/user/me/username` | 修改用户名（3天冷却） | 登录 |
| PATCH | `/api/user/me/password` | 修改密码（需旧密码） | 登录 |
| PATCH | `/api/user/me/profile` | 修改个人资料 | 登录 |
| POST | `/api/user/me/avatar` | 上传头像 | 登录 |
| POST | `/api/user/me/cover` | 上传背景图 | 登录 |
| GET | `/api/user/me/bans` | 获取自己的封禁状态 | 登录 |

### 论坛模块

板块、帖子、评论、回复的接口较多，建议直接查阅 `test-api.http` 或运行时查看 Express 路由。  
主要端点包括：

- 板块列表：`GET /api/forum/categories`
- 帖子列表（分页）：`GET /api/forum/:slug/posts`
- 帖子详情：`GET /api/forum/:slug/posts/:postId`
- 发帖：`POST /api/forum/:slug/posts`
- 评论列表（分页）：`GET /api/forum/:slug/posts/:postId/comments`
- 发表评论：`POST /api/forum/:slug/posts/:postId/comments`
- 回复列表（分页）：`GET /api/forum/comments/:commentId/replies`
- 发表回复：`POST /api/forum/comments/:commentId/replies`

### 管理员模块

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/admin/users` | 用户列表（搜索、分页） | 管理员 |
| GET | `/api/admin/categories` | 板块列表 | 管理员 |
| POST | `/api/admin/ban` | 封禁用户/板块 | 管理员 |
| POST | `/api/admin/unban` | 解封用户 | 管理员 |
| POST | `/api/admin/grant-mod` | 授予版主 | 管理员 |
| POST | `/api/admin/revoke-mod` | 撤销版主 | 管理员 |

---

## 数据库设计

核心业务表已全面升级，主要包含：

- **users**：新增 UID、头像、背景图、个人简介、联系方式、主题色、密码修改冷却、活跃时间等字段。
- **posts**：新增板块关联、浏览数、可回复/可浏览权限控制字段。
- **comments**：帖子的一级评论。
- **replies**：评论的回复，支持多级嵌套（通过 parent_reply_id）。
- **bans**：封禁记录，支持发帖、网盘、账号三种类型及有效期限。
- **moderators**：版主指派记录。
- **post_views**：浏览记录，用于去重计数。
- **files**：网盘文件元信息。

完整的建表语句请参考 `server/db/init_mysql.sql`（示例文件，实际部署时需根据项目最新迁移脚本调整）。

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

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=production_grade_secret_key
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=qdez_JDS_db
```

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
