<!-- skills/references/database-operations.md -->

# 数据库开发操作指南

> 本文档为 AI Agent 提供数据库相关操作的命令模板和必须遵循的流程。  
> **核心原则**：任何涉及数据库结构的变更，必须先向用户确认，获得明确许可后才能执行。

---

## 1. Agent 必须追问的 Checklist

在生成任何数据库修改命令之前，Agent **必须**逐一确认以下问题（除非用户已明确说明）：

1. **操作类型**：是新建表、修改现有表结构（加字段/改类型）、清空数据、还是删除表？
2. **数据保护**：是否需要备份？用户是否要求保留原有数据？
3. **外键影响**：操作是否会影响其他表的外键约束？是否需要临时禁用外键检查？
4. **清空范围**：如果清空某个表，是否也需要清空关联表（如清空 `posts` 时是否清空 `comments` 和 `replies`）？
5. **默认数据**：新建表或清空后，是否需要插入默认数据（如板块、管理员账号）？
6. **环境确认**：用户在哪个环境执行？开发环境还是生产环境？（生产环境需额外警告）

**示例对话**：
> 用户：“我要给 users 表加个字段。”  
> Agent：“需要确认：1. 字段名、类型和默认值是什么？2. 是否允许 NULL？3. 是否需要同时更新注册逻辑？4. 开发环境还是生产环境？”

---

## 2. 常用操作命令

> ⚠️ 如果提示 `mysql 不是内部或外部命令`，说明 MySQL 的 bin 目录未加入系统 PATH。
> 请先 `cd` 到 MySQL 安装目录的 `bin` 文件夹，再用 `.\mysql -u root -p` 连接。

### 2.1 连接与查看

```bash
# 登录 MySQL（使用 root 或专用账号）
mysql -u root -p

# 查看所有数据库
SHOW DATABASES;

# 选择数据库
USE qdez_JDS_db;

# 查看所有表
SHOW TABLES;

# 查看表结构
DESCRIBE users;

# 查看建表语句
SHOW CREATE TABLE users;
```

### 2.2 备份与恢复

```bash
# 备份整个数据库
mysqldump -u root -p qdez_JDS_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份单个表结构 + 数据
mysqldump -u root -p qdez_JDS_db users > users_backup.sql

# 恢复数据库
mysql -u root -p qdez_JDS_db < backup.sql
```

### 2.3 新建表（含外键）

```sql
-- 示例：创建新表
CREATE TABLE IF NOT EXISTS `new_table` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.4 修改现有表（加字段/改类型/加索引）

```sql
-- 添加新字段（允许 NULL）
ALTER TABLE users ADD COLUMN `new_field` VARCHAR(100) NULL AFTER `bio`;

-- 修改字段类型（注意：可能丢失数据）
ALTER TABLE users MODIFY COLUMN `bio` VARCHAR(1000);

-- 添加索引
ALTER TABLE posts ADD INDEX `idx_category_id` (`category_id`);

-- 添加外键
ALTER TABLE posts ADD FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE;
```

### 2.5 清空数据（保留表结构）

```sql
-- 禁用外键检查（清空多表时必须）
SET FOREIGN_KEY_CHECKS = 0;

-- 清空单个表
TRUNCATE TABLE posts;

-- 清空多个关联表
TRUNCATE TABLE posts;
TRUNCATE TABLE comments;
TRUNCATE TABLE replies;

-- 重新启用外键
SET FOREIGN_KEY_CHECKS = 1;
```

### 2.6 删除表或数据库

```sql
-- 删除表（不可恢复！）
DROP TABLE IF EXISTS `old_table`;

-- 删除数据库（不可恢复！）
DROP DATABASE IF EXISTS `old_db`;
```

### 2.7 插入默认数据

```sql
-- 示例：插入板块数据
INSERT INTO `categories` (`name`, `slug`, `type`, `department`, `sort_order`) VALUES
('站务公告', 'announcements', 'public', 'none', 1),
('活动通知', 'notices', 'public', 'none', 2);
```

### 2.8 导入初始化脚本

```bash
# 命令行导入 SQL 文件
mysql -u root -p qdez_JDS_db < server/db/init.sql

# 或在 MySQL 交互模式中
mysql> source server/db/init.sql;
```

---

## 3. Agent 提供命令时的格式要求

- 所有 SQL 语句必须以 `;` 结尾。
- 涉及多表操作时必须包含 `SET FOREIGN_KEY_CHECKS = 0;` 和 `= 1;`。
- 清空或删除操作必须在注释中写 `⚠️ 此操作不可逆，请确认已备份`。
- 如果用户要求修改现有表，Agent 应同时提供“回滚 SQL”（如何改回去），以备不测。

---

## 4. 数据库修改后的验证命令

```sql
-- 检查字段是否添加成功
SHOW COLUMNS FROM users;

-- 检查索引
SHOW INDEX FROM posts;

-- 检查外键
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'qdez_JDS_db' AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 验证数据完整性
SELECT COUNT(*) FROM posts WHERE category_id NOT IN (SELECT id FROM categories);  -- 应返回 0
```
