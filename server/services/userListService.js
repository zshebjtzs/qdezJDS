import pool from '../config/db.js';

/**
 * 获取用户列表（支持搜索）
 * @param {string} q - 搜索关键词
 * @returns {string} 基础查询语句
 */
export const buildUserListQuery = (q) => {
  let baseQuery = `
    SELECT 
      u.id, u.uid, u.username, u.avatar_url, u.department, u.role,
      u.is_active,
      EXISTS(
        SELECT 1 FROM bans b 
        WHERE b.user_id = u.id 
          AND b.type = 'account' 
          AND (b.banned_until IS NULL OR b.banned_until > NOW())
      ) AS is_temp_banned
    FROM users u
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    baseQuery += ` AND u.username LIKE ?`;
    params.push(`%${q}%`);
  }

  baseQuery += ` ORDER BY u.created_at DESC`;  // 默认按注册时间倒序
  return { baseQuery, params };
};

/**
 * 查询用户总数和列表（通过 paginate 工具）
 */
import { paginate } from '../utils/pagination.js';

export const getUserList = async (page, pageSize, q) => {
  const { baseQuery, params } = buildUserListQuery(q);
  return paginate({ baseQuery, params, page, pageSize });
};