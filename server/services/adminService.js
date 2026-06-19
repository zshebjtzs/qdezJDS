// server/services/adminService.js
import pool from '../config/db.js';

// 获取普通用户列表（排除其他管理员，支持搜索和分页）
export const getNormalUsers = async (q, page, pageSize) => {
  let baseQuery = `
    SELECT u.id, u.uid, u.username, u.role, u.is_active,
           EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'account' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS is_temp_banned,
           EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'post' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS post_banned,
           EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'cloud' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS cloud_banned,
           EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'account' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS account_banned,
           (SELECT banned_until FROM bans b WHERE b.user_id = u.id AND b.type = 'post' AND (b.banned_until IS NULL OR b.banned_until > NOW()) LIMIT 1) AS post_ban_until,
           (SELECT banned_until FROM bans b WHERE b.user_id = u.id AND b.type = 'cloud' AND (b.banned_until IS NULL OR b.banned_until > NOW()) LIMIT 1) AS cloud_ban_until,
           (SELECT banned_until FROM bans b WHERE b.user_id = u.id AND b.type = 'account' AND (b.banned_until IS NULL OR b.banned_until > NOW()) LIMIT 1) AS account_ban_until
    FROM users u
    WHERE u.role != 'admin'
  `;
  const params = [];
  if (q) {
    baseQuery += ` AND u.username LIKE ?`;
    params.push(`%${q}%`);
  }
  baseQuery += ` ORDER BY u.created_at DESC`;
  const { paginate } = await import('../utils/pagination.js');
  return paginate({ baseQuery, params, page, pageSize });
};

// 获取所有板块列表（用于封禁选择）
export const getAllCategories = async () => {
  const [rows] = await pool.query('SELECT id, name, slug FROM categories ORDER BY sort_order ASC');
  return rows;
};

// 添加封禁记录（createdBy 由控制器传入）
export const addBan = async (userId, type, categoryId = null, bannedUntil = null, createdBy) => {
  await pool.query('DELETE FROM bans WHERE user_id = ? AND type = ?', [userId, type]);
  await pool.query(
    'INSERT INTO bans (user_id, category_id, type, banned_until, created_by) VALUES (?, ?, ?, ?, ?)',
    [userId, categoryId, type, bannedUntil, createdBy]
  );
};

// 解封
export const removeBan = async (userId, type) => {
  await pool.query('DELETE FROM bans WHERE user_id = ? AND type = ?', [userId, type]);
};

// 授予版主
export const grantModerator = async (userId, categoryId) => {
  await pool.query('INSERT INTO moderators (user_id, category_id) VALUES (?, ?)', [userId, categoryId]);
};

// 撤销版主
export const revokeModerator = async (userId, categoryId) => {
  await pool.query('DELETE FROM moderators WHERE user_id = ? AND category_id = ?', [userId, categoryId]);
};

// 查询用户在某个板块是否已是版主
export const isModeratorInCategory = async (userId, categoryId) => {
  const [rows] = await pool.query('SELECT 1 FROM moderators WHERE user_id = ? AND category_id = ?', [userId, categoryId]);
  return rows.length > 0;
};

// 获取单个用户的封禁详情（用于管理员面板弹窗刷新）
export const getUserBanDetails = async (userId) => {
  const [rows] = await pool.query(`
    SELECT 
      EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'post' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS post_banned,
      EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'cloud' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS cloud_banned,
      EXISTS(SELECT 1 FROM bans b WHERE b.user_id = u.id AND b.type = 'account' AND (b.banned_until IS NULL OR b.banned_until > NOW())) AS account_banned,
      (SELECT banned_until FROM bans b WHERE b.user_id = u.id AND b.type = 'post' AND (b.banned_until IS NULL OR b.banned_until > NOW()) LIMIT 1) AS post_ban_until,
      (SELECT banned_until FROM bans b WHERE b.user_id = u.id AND b.type = 'cloud' AND (b.banned_until IS NULL OR b.banned_until > NOW()) LIMIT 1) AS cloud_ban_until,
      (SELECT banned_until FROM bans b WHERE b.user_id = u.id AND b.type = 'account' AND (b.banned_until IS NULL OR b.banned_until > NOW()) LIMIT 1) AS account_ban_until
    FROM users u
    WHERE u.id = ?
  `, [userId]);
  return rows[0];
};

// 获取板块禁言状态
export const getCategoryBanStatus = async (categoryId) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM bans 
     WHERE category_id = ? AND type = 'post' AND user_id IS NULL 
     AND (banned_until IS NULL OR banned_until > NOW()) 
     LIMIT 1`,
    [categoryId]
  );
  return rows.length > 0; // true 表示已被禁言
};

// 设置板块禁言（user_id 为 NULL，表示全板块）
export const addCategoryBan = async (categoryId, createdBy) => {
  // 先清理旧记录
  await pool.query(
    `DELETE FROM bans WHERE category_id = ? AND type = 'post' AND user_id IS NULL`,
    [categoryId]
  );
  // 插入新记录，永久禁言（banned_until 为 NULL）
  await pool.query(
    `INSERT INTO bans (user_id, category_id, type, banned_until, created_by) 
     VALUES (NULL, ?, 'post', NULL, ?)`,
    [categoryId, createdBy]
  );
};

// 解除板块禁言
export const removeCategoryBan = async (categoryId) => {
  await pool.query(
    `DELETE FROM bans WHERE category_id = ? AND type = 'post' AND user_id IS NULL`,
    [categoryId]
  );
};