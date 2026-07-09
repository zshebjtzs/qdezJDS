---
name: skills
description: 青岛二中机电社网站全栈开发技能。Vue 3 + Nodejs + MySQL 技术栈，涵盖论坛板块化评论系统、网盘分页搜索、用户权限管理、管理员面板等模块。每次修改代码时必须遵守保留原有注释、不擅自重构 script、前端计算后端运输等铁律。
---

# 青岛二中机电社网站 - AI 开发技能与铁律

> **本文件是 AI 协助本项目的最高行为准则。**
> 在每一次对话或任务开始时，AI 必须先理解并严格遵守本文件的所有条款。

---

## 1. 技术栈速览（不可变）

| 层级 | 技术 | 备注 |
|------|------|------|
| 前端框架 | Vue 3 + Vite | **组合式 API，必须使用 `<script setup>`** |
| 状态管理 | Pinia | |
| 路由 | Vue Router | 含导航守卫 |
| HTTP | Axios | 实例在 `src/api/request.js`，统一拦截 |
| 后端 | Node.js + Express | ES6 模块 (`import/export`) |
| 数据库 | MySQL 8.0 | 使用 `mysql2/promise` 连接池 |
| 认证 | JWT (`jsonwebtoken`) | 密码加密 `bcryptjs` |
| 文件上传 | Multer | |
| 编辑器 | Vditor | 已封装在 `src/markdown/editor.vue` |
| 数学公式 | KaTeX | 通过 `markdown-it-texmath` 渲染 |
| 图片处理 | sharp | 用于头像/背景图裁剪 |
| CSS 方案 | 自定义 CSS 变量 + 全局类 | 变量文件 `src/styles/variables.css` |

---

## 2. 核心设计原则（每次修改必须遵守）

### 2.1 性能原则：前端计算，后端运输
- 排序、过滤、搜索等耗性能操作，**优先在前端对已加载的数据执行**。
- 后端只负责数据 I/O（存储、分页查询），不额外消耗算力。
- **示例**：帖子列表排序最初在前端，后来改为分页，排序在后端 SQL 中完成。这是因为分页后前端无法对全量数据排序，属于必须后端做的例外情况。

### 2.2 安全原则
- **所有数据库查询必须使用参数化占位符 `?`**，严禁字符串拼接。
- 密码存储使用 `bcryptjs`，不存储明文。
- JWT 密钥放在环境变量 `JWT_SECRET` 中，绝不硬编码。
- 用户上传的文件必须校验类型和大小。
- XSS 防护：Markdown 渲染使用 `DOMPurify`，Vditor 开启 `sanitize`。
- CORS 生产环境必须指定域名，开发环境可使用默认宽松策略。

### 2.3 文件路径注释原则（新增）
- **新建任何代码文件时，第一行必须空出来，写一个注释，声明该文件的完整相对路径。**
- **示例**：新建 `server/controllers/userController.js`，文件第一行应为：
  ```javascript
  // server/controllers/userController.js
  ```
- **例外**：JSON 文件（如 `package.json`）、纯配置文件（如 `.env`）、二进制文件等无法写注释的文件除外。

### 2.4 代码修改原则（血泪教训）
1. **保留原有注释**：修改任何文件时，绝对不能删除或覆盖用户已有的注释（尤其是 `<!-- 注释 -->` 和 `// 注释`）。哪怕你觉得注释多余，也要原样保留！
2. **禁止擅自修改 script 部分**：除非你明确被要求修改逻辑，否则不要动 `<script setup>` 里的业务代码、状态管理、API 调用。如果确实需要新增逻辑（如添加计算属性），要明确指出。
3. **修改 template 时，保留原有注释**：即使是 HTML 注释，也要完整保留。
4. **CSS 修改仅限 class 和 `<style scoped>`**：不要改变 template 中的其他属性（如 `v-if`、`@click`），除非那是样式需求的一部分。
5. **提供代码的粒度**：
   - 若改动小（如几行 CSS 或一个函数），只给出修改片段，并注明所在文件和位置。
   - 若改动大（如整个组件样式重写），提供完整的 `<style scoped>` 或 `<template>`，但不要附上无修改的 `<script>`。
6. **功能完全不变原则**：修改样式或布局时，绝对不能影响任何已有功能。如果必须调整 DOM 结构，要确保所有事件绑定、条件渲染、数据传递保持原样。
7. **CSS 重构后要添加注释**：在 `<style scoped>` 顶部或关键处，用注释说明使用了哪些全局变量、复用了哪些全局类，以及设计意图（如“统一圆角为 --radius-md”）。
#### 2.4.8 同文件多处修改必须整合
- 对于**同一文件**的多处修改（如替换多个硬编码颜色、调整多个样式属性），**必须整合为一次完整的文件编辑操作**。
- 不得逐处发起多次 `Cline 需要编辑这个文件`，这会大幅增加 Token 消耗。
- **示例**：
  - ❌ 错误做法：先修改第 89 行，再修改第 126 行，再修改第 154 行……（11 次独立操作）
  - ✅ 正确做法：一次性读取文件，列出所有需要修改的位置，合并为一次编辑。
- **例外**：如果修改涉及不同的逻辑模块（如同时修改 template 和 script），可以分开两次操作，但每次操作内仍应整合该模块的所有修改。

### 2.5 不确定时必须追问（新增）
- **在将设计方案落实到代码之前，如果存在任何不确定的细节（如参数格式、字段名、路由路径、数据库表结构等），必须主动向用户提出确认问题，而不是自行臆测。**
- **示例**：如果用户说“给帖子列表加个排序”，你不应该直接假设按创建时间排序，而应该问：
  > “排序是根据创建时间、回复数量、还是浏览量？是升序还是降序？默认是哪个？是否需要前端切换按钮？”
- **例外**：用户明确说“你可以自由发挥”或“按你推荐的方案来”时，可以自行决策，但仍要在修改代码前简要说明你的方案。

### 2.6 资源存放原则（新增）
- `public/` 文件夹用于存放公共静态资源（如 `favicon.ico`），用于处理更一般化的布局，**不将其作为代码存放位置**。
- 前端的资源文件（图片、默认头像、法律文档等）放在 `src/assets/` 下。
- **示例**：默认头像路径应为 `src/assets/images/default-avatar.png`，而非 `public/default-avatar.png`。

### 2.7 `.gitignore` 保护原则（新增）
- **未经用户明确允许，绝对禁止修改 `.gitignore` 文件。**
- 该文件涉及项目安全，尤其是 `.env` 等敏感配置。被 `.gitignore` 排除的文件（如 `server/.env`、`node_modules/`）在绝大多数情况下无需修改。
- 如果确实需要添加新的忽略规则，必须先询问用户并说明原因。
- **示例**：如果新增了一个需要存储敏感信息的文件夹（如 `server/certs/`），你应该先问：
  > “我注意到新增的 `server/certs/` 目录可能包含证书文件，是否需要将其加入 `.gitignore`？”

### 2.8 命名与格式约定
- **Vue 组件名**：PascalCase（`UserInfo.vue`）
- **JavaScript 函数/变量**：camelCase（`getUserPosts`）
- **数据库字段**：snake_case（`user_id`）
- **API 响应字段**：后端必须映射为 camelCase（`userId`, `createdAt`），前端接收到的就是 camelCase。
- **CSS 类名**：kebab-case（`.post-card`），尽量复用全局类（`.btn-primary` 等）。

---

## 3. Vibecoding 开发流程（核心）

本项目采用 **Vibecoding** 模式开发，即 AI 与用户通过对话协作，用户描述需求，AI 提供设计方案和代码，用户 review 并决定是否采用。

### 3.1 标准开发步骤

每一步都必须遵守，不能跳跃：

1. **需求理解**：用户描述需求后，AI 需要用自己的话复述一遍，确认理解无误。
2. **方案设计**：AI 提出技术方案，包括涉及的文件、修改范围、可能的风险。**如果有不确定的细节，必须先追问。**
3. **确认方案**：用户对方案提出修改意见或直接批准。**只有得到用户明确确认后，才能进入下一步。**
4. **逐步实施**：AI 分步骤提供代码，每次只给出需要修改的部分（除非改动过大需要完整文件）。
5. **用户验证**：每完成一个步骤，用户测试确认无误后，再进行下一步。

### 3.2 示例：给论坛添加帖子置顶功能（模拟流程）

**步骤 1 - 需求理解**：
> 用户说：“我想让管理员能把重要帖子置顶。”
> AI 复述：“我理解是，在帖子列表里，管理员可以将某个帖子设为置顶，置顶帖始终排在最前面，并有视觉标识。对吗？”

**步骤 2 - 方案设计**：
> AI 提出：
> 1. `posts` 表新增 `is_pinned BOOLEAN DEFAULT FALSE` 字段。
> 2. 帖子列表 SQL 排序改为 `ORDER BY is_pinned DESC, created_at DESC`。
> 3. 在 `postSingle.vue` 管理栏增加“置顶/取消置顶”按钮，仅管理员/版主可见。
> 4. 前端帖子卡片上置顶帖显示 📌 标识。
> **追问**：“这个功能是对所有用户生效，还是仅影响特定板块？是否需要设置置顶有效期？”

**步骤 3 - 确认方案**：
> 用户回复：“仅特定板块，不需要有效期。”
> AI 确认后开始写代码。

**步骤 4 - 逐步实施**：
> AI 先提供 SQL 语句，再提供后端接口修改，最后给前端组件代码。每步等用户确认后再继续。

---

## 4. 项目结构速查


qdezJDS/
├── src/                       # 前端源码
│   ├── api/                   # Axios 请求封装
│   ├── assets/                # 静态资源（默认头像、法律文档等）
│   ├── components/
│   │   ├── admin/             # 管理员控制面板
│   │   ├── cloud/             # 网盘子组件
│   │   ├── common/            # 通用组件（分页器）
│   │   ├── forum/             # 论坛组件（帖子列表、详情、编辑）
│   │   ├── layout/            # 布局组件（导航栏、页脚、用户信息）
│   │   ├── legal/             # 法律文本展示
│   │   └── publicHome/        # 公共主页子组件
│   ├── markdown/              # Vditor 编辑器与安全渲染
│   ├── router/                # Vue Router
│   ├── stores/                # Pinia
│   ├── styles/                # 全局样式（变量、组件基础类、网盘公共样式）
│   ├── utils/                 # 工具函数（密码校验等）
│   ├── views/                 # 页面级组件
│   ├── App.vue
│   └── main.js
├── server/                    # 后端源码
│   ├── app.js                 # Express 入口
│   ├── config/                # 数据库连接等配置
│   ├── controllers/           # 控制器
│   ├── services/              # 服务层
│   ├── middlewares/           # 中间件（auth、error、upload、活跃时间）
│   ├── routes/                # 路由
│   ├── utils/                 # 工具（JWT、bcrypt、分页、编码）
│   ├── db/                    # 初始化 SQL 脚本
│   └── uploads/               # 文件存储目录
└── skills/                    # AI 技能文件（本文件所在）


---

## 5. 关键业务模块现状

### 5.1 用户系统
- 数据库 `users` 表已重构，增加了 `uid`（15位，U开头）、头像、背景图、简介、联系方式、主题色等字段。
- 用户可修改用户名（3天冷却），修改后保留曾用名（`previous_username`）。
- 头像和背景图上传后端用 `sharp` 裁剪，前端用 `cropperjs` 选取区域（待完善）。
- 密码修改需提供旧密码，前端校验强度（`src/utils/passwordValidator.js`）。
- 最近活跃时间通过中间件自动更新（5分钟频率限制）。

### 5.2 论坛
- 板块列表 → 帖子列表（分页，10条/页）→ 帖子详情（含评论/回复树）。
- 帖子列表支持按时间/热度排序（后端实现）。
- 评论和回复采用**二级嵌套**：评论 → 一级回复 → 二级回复。二级回复下的回复会作为新的二级回复出现在同一一级回复下，并用“回复 @xxx”标识。
- 评论和回复均分页加载（10条/页）。
- 帖子可设置 `canReply` 和 `canBrowse` 权限，管理员和版主可修改。
- 版主在管辖板块内拥有和管理员几乎相同的权限（删帖、修改权限、禁言等）。
- 禁言通过 `bans` 表实现，支持有限期（1h/1d/3d/7d/30d）和不限期。
- 管理员名字显示紫色，版主显示红色。

### 5.3 网盘
- 私有网盘（个人）和公共网盘（按部门分区）。
- 文件信息已改为**后端分页加载**（20条/页），默认按时间降序。
- 搜索功能已改为**后端搜索**，英文不区分大小写，支持多模匹配（空格分隔关键词）。
- 搜索结果的文件名会**高亮**匹配部分（后端返回高亮位置，前端渲染 `<mark>`）。
- 公共网盘上传权限：本部门内部成员或管理员；删除权限：上传者本人或管理员。

### 5.4 管理员面板
- `/admin/controller/:adminUid`，仅管理员可访问，且 uid 必须匹配。
- 包含用户管理（搜索、分页）、封禁/解封、授予/撤销版主。
- 板块禁言控制。
- 已集成极验验证码（Geetest），但**暂未启用**，等正式部署后再接入。

---

## 6. 踩过的坑与铁律总结

| # | 教训 | 正确做法 |
|---|------|----------|
| 1 | **删除用户注释** | 修改文件前先通读，所有 `//` 和 `<!-- -->` 必须原样保留 |
| 2 | **擅自重构 script** | 除非明确要求，否则只改 template 和 style |
| 3 | **后端字段映射遗漏** | 数据库 snake_case → 控制器必须映射为 camelCase |
| 4 | **破坏响应式布局** | 修改 CSS 时，媒体查询里的样式也要同步升级 |
| 5 | **修改分页数据结构** | 返回格式固定为 `{ data, total, page, pageSize, totalPages }` |
| 6 | **网盘前端搜索** | 已改为后端搜索，不要再加回前端搜索逻辑 |
| 7 | **封禁状态不实时** | 路由守卫中调用 `fetchBans()` 更新状态 |
| 8 | **提交后弹窗拦截** | 用 `isSubmitting` 标志跳过 `onBeforeRouteLeave` 检查 |
| 9 | **新建文件缺路径注释** | 第一行写 `// 文件相对路径` |
| 10 | **擅改 .gitignore** | 必须征得用户同意 |

---

## 7. 开发命令

| 命令 | 位置 | 说明 |
|------|------|------|
| `npm run dev` | 项目根目录 | 启动前端开发服务器 |
| `cd server && node app.js` | 项目根目录 | 启动后端服务 |
| `npm run build` | 项目根目录 | 构建生产版本 |
| `git log --oneline -5` | 任意 | 查看最近提交 |

---

## 8. 重要文件索引

> Agent 注意：接到开发任务后，先根据任务类型在下方找到对应模块，再打开相关文件。  
> 不要盲目全局搜索，优先查阅这里的索引。

### 8.1 全局基础

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/main.js` | 前端入口，注册 Pinia、Router、全局样式 | 调试路由/状态/样式问题时 |
| `src/App.vue` | 根组件，动态布局切换 | 修改全局布局时 |
| `server/app.js` | Express 入口，中间件注册，路由挂载 | 新增路由/中间件/修改启动端口 |
| `server/config/db.js` | MySQL 连接池配置 | 数据库连接问题时 |
| `server/config/paths.js` | 项目根目录路径工具 | 文件操作路径问题时 |
| `server/.env` | 后端环境变量（不提交 Git） | 修改端口/JWT密钥/数据库凭据 |
| `.gitignore` | Git 忽略规则 | **未经用户允许禁止修改！** |
| `src/styles/variables.css` | 全局 CSS 设计令牌（颜色、间距、圆角、阴影） | 任何样式修改前必读 |
| `src/styles/components.css` | 全局公共组件类（`.btn-primary`、`.card`、`.modal-overlay` 等） | 复用或新增全局样式时 |
| `src/styles/cloud-common.css` | 网盘私有/公共组件共享样式 | 修改网盘样式时 |
| `server/db/init.sql` | 数据库初始化脚本（含所有建表语句和默认数据） | 数据库结构变更/新建表/排查字段名 |
| `test-api.http` | API 测试用例（REST Client） | 调试接口/查看参数格式 |
| `skills/SKILL.md` | **本文件，AI 开发最高准则** | 每次对话必读 |
| `skills/references/database-schema.md` | 数据库表结构速查 | 编写 SQL 前 |
| `skills/references/api-endpoints.md` | 全部 API 端点速查 | 修改前后端接口前 |
| `skills/references/database-operations.md` | 数据库操作命令模板 | 执行数据库变更前 |
| `skills/references/common-errors.md` | 常见错误修复指南 | 遇到报错时 |

### 8.2 前端核心

#### 8.2.1 布局与导航

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/components/layout/MainLayout.vue` | 全局导航栏（含头像、用户名、角色颜色、退出） | 修改导航栏/角色颜色/用户信息显示 |
| `src/components/layout/footer.vue` | 全局页脚（使用条款、隐私政策、用户列表、权限管理入口） | 修改页脚链接 |
| `src/components/layout/userInfo.vue` | 用户信息页（双模式：自己编辑/他人查看） | 修改个人信息/头像/背景/联系方式/最近帖子 |

#### 8.2.2 论坛模块

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/views/ForumPage.vue` | 论坛根页面，板块列表 + 内外切换 | 修改板块列表/切换逻辑 |
| `src/components/forum/postList.vue` | 帖子列表（分页、排序、发帖入口、返回） | 修改帖子列表/排序/分页/发帖入口 |
| `src/components/forum/postSingle.vue` | 帖子详情（评论树、回复弹窗、权限管理、删除） | 修改评论/回复/权限/删除逻辑 |
| `src/components/forum/postEdit.vue` | 发帖页（Vditor 编辑器、Markdown 帮助、离开确认） | 修改发帖流程/编辑器配置 |
| `src/markdown/editor.vue` | Vditor 编辑器封装组件 | 修改编辑器配置/工具栏/上传 |
| `src/markdown/renderer.js` | Markdown + LaTeX 安全渲染（DOMPurify + KaTeX） | 修改渲染逻辑/安全策略 |

#### 8.2.3 网盘模块

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/views/CloudPage.vue` | 网盘根页面，选项卡切换 | 修改选项卡/封禁拦截 |
| `src/components/cloud/PrivateCloud.vue` | 私有网盘（分页、搜索、上传、下载、删除、高亮） | 修改私有网盘功能 |
| `src/components/cloud/PublicCloud.vue` | 公共网盘（部门切换、分页、搜索、上传、下载、删除、高亮） | 修改公共网盘功能 |

#### 8.2.4 用户与管理员

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/views/LoginPage.vue` | 登录页（表单、验证码预留、封禁检查） | 修改登录流程 |
| `src/components/layout/userList.vue` | 用户列表（搜索、分页） | 修改用户列表 |
| `src/components/admin/adminController.vue` | 管理员控制面板（用户管理、封禁、版主授予、板块禁言） | 修改管理员功能 |

#### 8.2.5 公共主页

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/views/HomePage.vue` | 首页（Hero 区、过期提示弹窗） | 修改首页展示/提示弹窗 |
| `src/components/publicHome/About.vue` | 社团介绍页 | 修改介绍内容 |
| `src/components/publicHome/Activity.vue` | 社团活动页 | 修改活动展示 |

#### 8.2.6 通用组件与工具

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/components/common/Pagination.vue` | 通用分页组件 | 修改分页逻辑/样式 |
| `src/stores/user.js` | 用户状态管理（登录态、封禁态、头像时间戳） | 修改用户状态/封禁检查 |
| `src/stores/cloud.js` | 网盘状态管理（私有/公共文件、分页状态） | 修改网盘数据流 |
| `src/api/request.js` | Axios 实例（拦截器、JWT 携带、401 退出） | 修改 HTTP 拦截逻辑 |
| `src/api/forum.js` | 论坛相关 API 封装 | 新增/修改论坛接口调用 |
| `src/api/cloud.js` | 网盘相关 API 封装 | 新增/修改网盘接口调用 |
| `src/api/auth.js` | 认证相关 API 封装 | 修改登录/注册接口 |
| `src/router/index.js` | 路由配置 + 导航守卫（权限检查、封禁刷新） | 新增路由/修改权限 |
| `src/utils/passwordValidator.js` | 密码强度校验 | 修改密码规则 |

#### 8.2.7 其他页面

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `src/views/NotFound.vue` | 404 页面 | 修改 404 展示 |
| `src/components/legal/legalView.vue` | 使用条款/隐私政策展示 | 修改法律文本展示 |
| `src/assets/legals/terms.md` | 使用条款原文 | 修改条款内容 |
| `src/assets/legals/privacy.md` | 隐私政策原文 | 修改隐私政策内容 |

### 8.3 后端核心

#### 8.3.1 控制器

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `server/controllers/authController.js` | 注册、登录（含极验验证） | 修改认证逻辑 |
| `server/controllers/forumController.js` | 帖子、评论、回复、板块禁言 | 修改论坛逻辑 |
| `server/controllers/cloudController.js` | 网盘文件 CRUD | 修改网盘逻辑 |
| `server/controllers/userController.js` | 个人信息、修改密码、头像/背景上传、最近帖子 | 修改用户逻辑 |
| `server/controllers/adminController.js` | 封禁/解封、版主授予/撤销、板块禁言 | 修改管理员逻辑 |

#### 8.3.2 服务层

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `server/services/forumService.js` | 帖子 CRUD、分页、排序 | 修改论坛数据库操作 |
| `server/services/commentService.js` | 评论 CRUD | 修改评论数据库操作 |
| `server/services/replyService.js` | 回复 CRUD | 修改回复数据库操作 |
| `server/services/cloudService.js` | 网盘文件 CRUD、搜索、高亮计算 | 修改网盘数据库操作 |
| `server/services/userService.js` | 用户 CRUD、活跃时间更新 | 修改用户数据库操作 |
| `server/services/adminService.js` | 封禁记录、版主管理 | 修改管理员数据库操作 |
| `server/services/moderatorService.js` | 版主查询与权限判断 | 修改版主逻辑 |

#### 8.3.3 中间件

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `server/middlewares/authMiddleware.js` | JWT 验证 + 活跃时间更新 | 修改认证逻辑 |
| `server/middlewares/errorHandler.js` | 全局错误处理 | 修改错误返回格式 |
| `server/middlewares/upload.js` | Multer 配置（网盘、头像、背景） | 修改上传限制/文件过滤 |

#### 8.3.4 路由

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `server/routes/auth.js` | 认证路由 | 新增认证接口 |
| `server/routes/forum.js` | 论坛路由 | 新增论坛接口 |
| `server/routes/cloud.js` | 网盘路由 | 新增网盘接口 |
| `server/routes/user.js` | 用户路由 | 新增用户接口 |
| `server/routes/admin.js` | 管理员路由 | 新增管理员接口 |

#### 8.3.5 工具

| 文件 | 用途 | 何时查看 |
|------|------|----------|
| `server/utils/jwt.js` | JWT 生成与验证 | 修改 Token 逻辑 |
| `server/utils/bcrypt.js` | 密码哈希与比对 | 修改密码加密逻辑 |
| `server/utils/pagination.js` | 通用分页工具 | 修改分页返回格式 |
| `server/utils/encoding.js` | 中文文件名转码 | 修改文件编码处理 |
