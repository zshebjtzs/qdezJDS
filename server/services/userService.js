// server/services/userService.js
import pool from '../config/db.js';

// 根据 uid 查找用户（公开信息，不含密码等敏感字段）
export const findUserByUid = async (uid) => {
  const [rows] = await pool.query(
    `SELECT id, uid, username, previous_username, real_name, avatar_url, cover_url,
            bio, contacts, theme_color, department, role, is_active,
            created_at, last_active_at
     FROM users WHERE uid = ?`,
    [uid]
  );
  return rows[0];
};

// 根据 id 查找用户（完整信息，包含密码等）
export const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
  return rows[0];
};

// 根据 username 查找用户（用于注册检查）
export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE username = ?`, // 返回所有字段
    [username]
  );
  return rows[0];
};

// 创建用户（注册时使用）
export const createUser = async (userData) => {
  const { uid, username, password, department, role } = userData;
  const [result] = await pool.query(
    `INSERT INTO users (uid, username, password, department, role)
     VALUES (?, ?, ?, ?, ?)`,
    [uid, username, password, department, role]
  );
  return result.insertId;
};

// 更新最近活跃时间（中间件会调用）
export const updateLastActive = async (userId) => {
  await pool.query(
    `UPDATE users SET last_active_at = NOW()
     WHERE id = ? AND (last_active_at IS NULL OR last_active_at < NOW() - INTERVAL 5 MINUTE)`,
    [userId]
  );
};

// 修改用户名（含曾用名与冷却检查）
export const updateUsername = async (userId, newUsername) => {
  await pool.query(
    `UPDATE users 
     SET previous_username = username, 
         username = ?, 
         username_changed_at = NOW() 
     WHERE id = ?`,
    [newUsername, userId]
  );
};

// 修改密码
export const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    `UPDATE users SET password = ? WHERE id = ?`,
    [hashedPassword, userId]
  );
};

// 更新个人资料（简介、真实姓名、主题色、联系方式等）
export const updateProfile = async (userId, profileData) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(profileData)) {
    if (['real_name', 'bio', 'theme_color', 'contacts'].includes(key)) {
      let processedValue = value;
      // 将数组/对象类型的 contacts 序列化为 JSON 字符串
      if (key === 'contacts') {
        processedValue = JSON.stringify(value);
      }
      fields.push(`${key} = ?`);
      values.push(processedValue);
    }
  }
  if (fields.length === 0) return;
  values.push(userId);
  await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

// 更新头像路径
export const updateAvatar = async (userId, avatarUrl) => {
  await pool.query(
    `UPDATE users SET avatar_url = ? WHERE id = ?`,
    [avatarUrl, userId]
  );
};

// 更新背景图路径
export const updateCover = async (userId, coverUrl) => {
  await pool.query(
    `UPDATE users SET cover_url = ? WHERE id = ?`,
    [coverUrl, userId]
  );
};