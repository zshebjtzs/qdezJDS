<!-- skills/references/database-schema.md -->

> 本文档为 AI Agent 提供当前数据库核心表结构的速查信息。
> 内容从 `server/db/init.sql` 提取，仅包含表结构（字段、类型、外键），不包含数据插入语句。
> Agent 在设计 SQL 查询、修改表结构或新增功能时，应优先查阅本文档以确保字段名、类型和外键关系的准确性。

# 数据库表结构速览

> 从 `server/db/init.sql` 提取，仅包含当前核心表结构，不含数据插入。

## users 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 内部主键 |
| uid | CHAR(15) UNIQUE | 对外唯一标识，U + 14 位随机字符 |
| username | VARCHAR(50) UNIQUE | 可修改，3天冷却 |
| previous_username | VARCHAR(50) NULL | 最近曾用名 |
| username_changed_at | TIMESTAMP NULL | 上次修改用户名时间 |
| password | VARCHAR(255) | bcrypt 哈希 |
| real_name | VARCHAR(50) NULL | 真实姓名 |
| avatar_url | VARCHAR(255) NULL | 头像路径 |
| cover_url | VARCHAR(255) NULL | 背景图路径 |
| bio | VARCHAR(500) NULL | 个人简介 |
| contacts | JSON NULL | 联系方式 [{platform, handle}] |
| theme_color | VARCHAR(7) NULL | 自定义主题色 |
| department | ENUM('art','mech','soft','none') | 部门 |
| role | ENUM('internal','external','admin') | 角色 |
| is_active | BOOLEAN DEFAULT TRUE | 账号是否启用 |
| created_at | TIMESTAMP | 注册时间 |
| last_active_at | TIMESTAMP NULL | 最近活跃时间 |

## categories 板块表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 板块 ID |
| name | VARCHAR(50) | 板块名称 |
| slug | VARCHAR(50) UNIQUE | URL 友好名 |
| type | ENUM('internal','public') | 板块类型 |
| department | ENUM(...) | 关联部门，none 表示无 |
| sort_order | INT | 排序 |
| created_at | TIMESTAMP | 创建时间 |

## posts 帖子表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 帖子 ID |
| title | VARCHAR(200) | 标题 |
| content | TEXT | Markdown 内容 |
| user_id | INT FK | 作者 ID |
| category_id | INT FK | 所属板块 |
| department | ENUM(...) | 冗余作者部门 |
| forum_type | ENUM('internal','public') | 论坛类型 |
| view_count | INT DEFAULT 0 | 浏览量 |
| can_reply | BOOLEAN DEFAULT TRUE | 是否允许评论 |
| can_browse | BOOLEAN DEFAULT TRUE | 是否允许浏览 |
| created_at | TIMESTAMP | 发布时间 |

## comments 评论表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 评论 ID |
| post_id | INT FK | 所属帖子 |
| user_id | INT FK | 评论者 ID |
| content | TEXT | 评论内容 |
| created_at | TIMESTAMP | 评论时间 |

## replies 回复表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 回复 ID |
| comment_id | INT FK | 所属评论 |
| user_id | INT FK | 回复者 ID |
| reply_to_user_id | INT FK | 被回复的用户 ID |
| parent_reply_id | INT FK NULL | 被回复的回复 ID（NULL 表示直接回复评论） |
| content | TEXT | 回复内容 |
| created_at | TIMESTAMP | 回复时间 |

## bans 封禁表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 记录 ID |
| user_id | INT NULL | 被禁用户（NULL 表示板块禁言） |
| category_id | INT NULL | 板块 ID（NULL 表示全站） |
| type | ENUM('account','post','cloud') | 封禁类型 |
| banned_until | TIMESTAMP NULL | 封禁截止时间（NULL 为永久） |
| reason | VARCHAR(255) NULL | 原因 |
| created_by | INT FK | 操作者 ID |
| created_at | TIMESTAMP | 操作时间 |

## moderators 版主表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 记录 ID |
| user_id | INT FK | 用户 ID |
| category_id | INT FK | 板块 ID |
| created_at | TIMESTAMP | 授予时间 |

## post_views 浏览记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 记录 ID |
| user_id | INT FK | 用户 ID |
| post_id | INT FK | 帖子 ID |
| view_date | DATE | 浏览日期 (UTC+8) |

## files 文件记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 文件 ID |
| file_name | VARCHAR(255) | 存储唯一名 |
| original_name | VARCHAR(255) | 用户上传时的原始文件名 |
| file_path | VARCHAR(500) | 相对路径 |
| file_size | INT | 字节数 |
| mime_type | VARCHAR(100) NULL | MIME 类型 |
| type | ENUM('private','public','software') | 文件类型 |
| owner_id | INT NULL | 上传者 ID |
| department | ENUM(...) NULL | 部门（公共文件） |
| is_active | BOOLEAN DEFAULT TRUE | 软删除标记 |
| created_at | TIMESTAMP | 上传时间 |