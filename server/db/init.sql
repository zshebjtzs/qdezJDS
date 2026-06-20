-- =============================================
-- 青岛二中机电社网站 数据库初始化脚本
-- 适用于全新部署或重建所有表结构
-- =============================================

-- 临时禁用外键检查（确保建表顺序不受约束影响）
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. 用户表
-- =============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`                    INT              NOT NULL AUTO_INCREMENT,
  `uid`                   CHAR(15)         NOT NULL COMMENT '对外唯一标识，U+14位随机字符',
  `username`              VARCHAR(50)      NOT NULL,
  `previous_username`     VARCHAR(50)      DEFAULT NULL COMMENT '最近曾用名',
  `username_changed_at`   TIMESTAMP        NULL DEFAULT NULL COMMENT '上次修改用户名时间',
  `password`              VARCHAR(255)     NOT NULL COMMENT 'bcrypt 哈希',
  `real_name`             VARCHAR(50)      DEFAULT NULL COMMENT '真实姓名',
  `avatar_url`            VARCHAR(255)     DEFAULT NULL COMMENT '头像存储路径',
  `cover_url`             VARCHAR(255)     DEFAULT NULL COMMENT '背景图存储路径',
  `bio`                   VARCHAR(500)     DEFAULT NULL COMMENT '个人简介',
  `contacts`              JSON             DEFAULT NULL COMMENT '联系方式 [{platform, handle}]',
  `theme_color`           VARCHAR(7)       DEFAULT NULL COMMENT '自定义主题色',
  `department`            ENUM('art','mech','soft','none') NOT NULL DEFAULT 'none',
  `role`                  ENUM('internal','external','admin') NOT NULL DEFAULT 'external',
  `is_active`             BOOLEAN          NOT NULL DEFAULT TRUE,
  `created_at`            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_active_at`        TIMESTAMP        NULL DEFAULT NULL COMMENT '最近活跃时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uid` (`uid`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. 板块表
-- =============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(50)      NOT NULL COMMENT '板块名称',
  `slug`          VARCHAR(50)      NOT NULL COMMENT 'URL 友好名',
  `type`          ENUM('internal','public') NOT NULL,
  `department`    ENUM('art','mech','soft','none') NOT NULL DEFAULT 'none',
  `sort_order`    INT              DEFAULT 0,
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. 帖子表
-- =============================================
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(200)     NOT NULL,
  `content`       TEXT             NOT NULL,
  `user_id`       INT              NOT NULL,
  `category_id`   INT              NOT NULL,
  `department`    ENUM('art','mech','soft','none') NOT NULL COMMENT '冗余，发帖人部门',
  `forum_type`    ENUM('internal','public') NOT NULL,
  `view_count`    INT              DEFAULT 0,
  `can_reply`     BOOLEAN          DEFAULT TRUE COMMENT '是否允许评论',
  `can_browse`    BOOLEAN          DEFAULT TRUE COMMENT '是否允许浏览',
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. 评论表
-- =============================================
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `post_id`       INT              NOT NULL,
  `user_id`       INT              NOT NULL,
  `content`       TEXT             NOT NULL,
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. 回复表（多级嵌套）
-- =============================================
DROP TABLE IF EXISTS `replies`;
CREATE TABLE `replies` (
  `id`                INT              NOT NULL AUTO_INCREMENT,
  `comment_id`        INT              NOT NULL COMMENT '所属根评论ID',
  `user_id`           INT              NOT NULL COMMENT '发表回复的用户ID',
  `reply_to_user_id`  INT              NOT NULL COMMENT '被回复的用户ID',
  `parent_reply_id`   INT              DEFAULT NULL COMMENT '被回复的回复ID（NULL表示直接回复评论）',
  `content`           TEXT             NOT NULL,
  `created_at`        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reply_to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_reply_id`) REFERENCES `replies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. 封禁记录表
-- =============================================
DROP TABLE IF EXISTS `bans`;
CREATE TABLE `bans` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `user_id`       INT              NULL COMMENT '被禁用户ID（NULL表示板块禁言）',
  `category_id`   INT              NULL COMMENT '板块ID（NULL表示全站）',
  `type`          ENUM('account','post','cloud') NOT NULL DEFAULT 'account',
  `banned_until`  TIMESTAMP        NULL DEFAULT NULL COMMENT '封禁截止时间（NULL表示永久）',
  `reason`        VARCHAR(255)     DEFAULT NULL,
  `created_by`    INT              NOT NULL COMMENT '操作者用户ID',
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. 版主指派表
-- =============================================
DROP TABLE IF EXISTS `moderators`;
CREATE TABLE `moderators` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `user_id`       INT              NOT NULL,
  `category_id`   INT              NOT NULL,
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mod` (`user_id`, `category_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. 浏览记录表（去重用）
-- =============================================
DROP TABLE IF EXISTS `post_views`;
CREATE TABLE `post_views` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `user_id`       INT              NOT NULL,
  `post_id`       INT              NOT NULL,
  `view_date`     DATE             NOT NULL COMMENT '浏览日期（UTC+8）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_view` (`user_id`, `post_id`, `view_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. 文件记录表（网盘）
-- =============================================
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id`            INT              NOT NULL AUTO_INCREMENT,
  `file_name`     VARCHAR(255)     NOT NULL COMMENT '存储唯一名（UUID+扩展名）',
  `original_name` VARCHAR(255)     NOT NULL COMMENT '用户上传时的原始文件名',
  `file_path`     VARCHAR(500)     NOT NULL COMMENT '相对路径',
  `file_size`     INT              NOT NULL COMMENT '字节数',
  `mime_type`     VARCHAR(100)     DEFAULT NULL,
  `type`          ENUM('private','public','software') NOT NULL,
  `owner_id`      INT              NULL COMMENT '上传者ID',
  `department`    ENUM('art','mech','soft','none') NULL,
  `is_active`     BOOLEAN          DEFAULT TRUE,
  `created_at`    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. 插入默认板块数据
-- =============================================
INSERT INTO `categories` (`name`, `slug`, `type`, `department`, `sort_order`) VALUES
('站务公告', 'announcements', 'public', 'none', 1),
('活动通知', 'notices', 'public', 'none', 2),
('问题与求助', 'help', 'public', 'none', 3),
('杂谈分享', 'general', 'public', 'none', 4),
('灌水聊天', 'water-cooler', 'public', 'none', 5),
('内部通知', 'internal-notices', 'internal', 'none', 10),
('内部灌水', 'internal-lounge', 'internal', 'none', 11),
('艺术部事务', 'art-affairs', 'internal', 'art', 20),
('机械部事务', 'mech-affairs', 'internal', 'mech', 21),
('软件部事务', 'soft-affairs', 'internal', 'soft', 22);

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;