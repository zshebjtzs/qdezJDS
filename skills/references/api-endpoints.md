<!-- skills/references/api-endpoints.md -->

> 本文档为 AI Agent 提供项目中所有 API 端点的速查信息。
> 内容从 `test-api.http` 整理，涵盖认证、用户、论坛、网盘、管理员等模块。
> Agent 在修改前后端接口、添加新接口、或排查网络请求问题时，应参考本文档确保路径、参数和权限要求正确。

# API 端点速览

> 所有接口前缀 `/api`，开发环境 `http://localhost:3001/api`。  
> 需要认证的接口在 Header 中携带 `Authorization: Bearer <token>`。

## 认证模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /auth/register | 注册新用户 | 公开（建议仅管理员使用） |
| POST | /auth/login | 登录，返回 JWT | 公开 |

## 用户模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /user/:uid | 查看他人公开信息 | 登录 |
| GET | /user/me/profile | 获取自己的完整信息 | 登录 |
| PATCH | /user/me/username | 修改用户名 | 登录 |
| PATCH | /user/me/password | 修改密码（需旧密码） | 登录 |
| PATCH | /user/me/profile | 修改个人资料 | 登录 |
| POST | /user/me/avatar | 上传头像 | 登录 |
| POST | /user/me/cover | 上传背景图 | 登录 |
| GET | /user/:uid/posts | 获取某用户最近帖子 | 登录 |
| GET | /user/me/bans | 获取自己的封禁状态 | 登录 |

## 论坛模块

### 板块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /forum/categories | 获取所有板块 | 登录 |

### 帖子

| 方法 | 路径 | 参数 | 说明 | 权限 |
|------|------|------|------|------|
| GET | /forum/:slug/posts | ?page,pageSize,sortBy | 获取板块帖子（分页） | 登录 |
| GET | /forum/:slug/posts/:postId | - | 帖子详情 | 登录 |
| POST | /forum/:slug/posts | title,content | 发帖 | 登录 |
| PATCH | /forum/:slug/posts/:postId/permission | field,value | 修改帖子权限 | 管理员/版主 |
| DELETE | /forum/:slug/posts/:postId | - | 删除帖子 | 作者/管理员/版主 |

### 评论

| 方法 | 路径 | 参数 | 说明 | 权限 |
|------|------|------|------|------|
| GET | /forum/:slug/posts/:postId/comments | ?page,pageSize | 评论列表（分页） | 登录 |
| POST | /forum/:slug/posts/:postId/comments | content | 发表评论 | 登录 |
| DELETE | /forum/comments/:commentId | - | 删除评论 | 作者/管理员/版主 |

### 回复

| 方法 | 路径 | 参数 | 说明 | 权限 |
|------|------|------|------|------|
| GET | /forum/comments/:commentId/replies | ?page,pageSize | 回复列表（分页） | 登录 |
| POST | /forum/comments/:commentId/replies | content,replyToUserId,parentReplyId | 发表回复 | 登录 |
| DELETE | /forum/replies/:replyId | - | 删除回复 | 作者/管理员/版主 |

### 板块禁言状态

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /forum/category/:categoryId/ban-status | 查询板块禁言状态 | 公开 |

## 网盘模块

### 私有网盘

| 方法 | 路径 | 参数 | 说明 | 权限 |
|------|------|------|------|------|
| GET | /cloud/private | ?page,pageSize,q | 私有文件列表（分页+搜索） | 登录 |
| POST | /cloud/private | FormData(file,type=private) | 上传私有文件 | 登录 |
| DELETE | /cloud/private/:fileId | - | 删除私有文件 | 文件所有者 |

### 公共网盘

| 方法 | 路径 | 参数 | 说明 | 权限 |
|------|------|------|------|------|
| GET | /cloud/public/:department | ?page,pageSize,q | 公共文件列表（分页+搜索） | 内部成员 |
| POST | /cloud/public | FormData(file,type=public,department) | 上传公共文件 | 本部门/管理员 |
| DELETE | /cloud/public/:fileId | - | 删除公共文件 | 上传者/管理员 |

## 管理员模块

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /admin/users | 用户列表（?page,pageSize,q） | 管理员 |
| GET | /admin/categories | 板块列表 | 管理员 |
| POST | /admin/ban | 封禁（userId,type,duration,categoryId） | 管理员 |
| POST | /admin/unban | 解封（userId,type） | 管理员 |
| POST | /admin/grant-mod | 授予版主（userId,categoryId） | 管理员 |
| POST | /admin/revoke-mod | 撤销版主（userId,categoryId） | 管理员 |
| GET | /admin/user/:userId/bans | 用户封禁详情 | 管理员 |
| GET | /admin/category/:categoryId/ban-status | 板块禁言状态 | 管理员 |
| POST | /admin/category/:categoryId/ban | 设置板块禁言 | 管理员 |
| DELETE | /admin/category/:categoryId/ban | 解除板块禁言 | 管理员 |