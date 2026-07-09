<!-- skills/references/api-error-codes.md -->

# API 错误码速查

> 本文档为 AI Agent 提供项目中所有 API 可能返回的错误码及其含义。
> Agent 在排查前端报错、设计错误处理逻辑时应参考本文档。

## 通用错误码

| 状态码 | 含义 | 常见触发场景 |
|--------|------|-------------|
| 400 | 请求参数错误 | 缺少必填字段、格式错误、无效的枚举值 |
| 401 | 未认证 | 未提供 Token、Token 过期或无效 |
| 403 | 无权限 | 角色不匹配、封禁中、不在管辖板块 |
| 404 | 资源不存在 | 帖子/评论/文件/用户不存在 |
| 409 | 冲突 | 用户名已存在、重复授予版主 |
| 429 | 请求过于频繁 | 用户名修改冷却期未过 |
| 500 | 服务器内部错误 | 数据库连接失败、未捕获的异常 |

## 按模块列举

### 认证模块

| 接口 | 错误码 | 错误消息 | 说明 |
|------|--------|----------|------|
| POST /auth/register | 400 | 用户名和密码不能为空 | |
| POST /auth/register | 409 | 用户名已存在 | |
| POST /auth/login | 400 | 用户名和密码不能为空 | |
| POST /auth/login | 401 | 用户名或密码错误 | |
| POST /auth/login | 403 | 账号已被禁用 | `is_active = false` |

### 用户模块

| 接口 | 错误码 | 错误消息 | 说明 |
|------|--------|----------|------|
| GET /user/:uid | 400 | 无效的用户标识 | uid 为 'me' 或 'me/profile' |
| GET /user/:uid | 404 | 用户不存在 | |
| PATCH /user/me/username | 400 | 新用户名不能为空 | |
| PATCH /user/me/username | 400 | 新用户名与当前用户名相同 | |
| PATCH /user/me/username | 409 | 用户名已被占用 | |
| PATCH /user/me/username | 429 | 每3天只能修改一次用户名 | |
| PATCH /user/me/password | 400 | 旧密码和新密码不能为空 | |
| PATCH /user/me/password | 403 | 旧密码错误 | |
| POST /user/me/avatar | 400 | 未上传文件 | |
| POST /user/me/cover | 400 | 未上传文件 | |

### 论坛模块

| 接口 | 错误码 | 错误消息 | 说明 |
|------|--------|----------|------|
| GET /forum/:slug/posts | 404 | 板块不存在 | |
| GET /forum/:slug/posts | 403 | 无权访问内部板块 | 外部用户访问内部板块 |
| POST /forum/:slug/posts | 400 | 标题和内容不能为空 | |
| POST /forum/:slug/posts | 403 | 无权限在该板块发帖 | 外部用户尝试在内部板块发帖 |
| PATCH .../permission | 403 | 无权限修改帖子设置 | 非管理员/版主 |
| DELETE .../posts/:postId | 403 | 无权限删除此帖子 | |
| POST .../comments | 400 | 评论内容不能为空 | |
| POST .../comments | 403 | 该帖已禁止评论 | |
| DELETE .../comments/:commentId | 403 | 无权限删除此评论 | |
| POST .../replies | 400 | 回复内容不能为空 | |
| POST .../replies | 400 | 缺少被回复用户ID | `replyToUserId` 为空 |
| DELETE .../replies/:replyId | 403 | 无权限删除此回复 | |

### 网盘模块

| 接口 | 错误码 | 错误消息 | 说明 |
|------|--------|----------|------|
| GET /cloud/public/:department | 400 | 无效的部门 | 部门名不是 art/mech/soft |
| POST /cloud/private | 403 | 仅内部成员或管理员可上传私有文件 | |
| POST /cloud/public | 403 | 仅内部成员或管理员可上传公共文件 | |
| POST /cloud/public | 403 | 只能上传到本部门公共网盘 | |
| DELETE .../private/:fileId | 403 | 无权限删除此文件 | |
| DELETE .../public/:fileId | 403 | 无权限删除此文件 | |
| POST /cloud/* | 400 | 未上传文件 | |
| POST /cloud/* | 400 | 无效的type | type 不是 private/public |

### 管理员模块

| 接口 | 错误码 | 错误消息 | 说明 |
|------|--------|----------|------|
| 所有 /admin/* | 403 | 无权访问 | 非管理员访问 |
| POST /admin/ban | 400 | 封禁用户时 userId 不能为空 | |
| POST /admin/grant-mod | 400 | 该用户已经是「板块名」的版主 | 重复授予 |