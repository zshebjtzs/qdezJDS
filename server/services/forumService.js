// server/services/forumService.js
import pool from '../config/db.js';

// 获取指定板块的所有帖子（含作者信息、回复数）
export const getPostsByCategory = async (categoryId, userId = null, page = 1, pageSize = 10, sortBy = 'time') => {
  const selectFields = `
    SELECT 
      p.id, p.title, p.content, p.user_id AS userId, 
      u.username, u.uid AS authorUid, u.role AS userRole, u.avatar_url AS authorAvatar,
      p.department, p.forum_type AS forumType,
      p.category_id AS categoryId, p.view_count AS viewCount,
      p.can_reply AS canReply, p.can_browse AS canBrowse,
      p.created_at AS createdAt,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS commentCount
  `;
  const fromClause = `FROM posts p JOIN users u ON p.user_id = u.id`;
  let whereClause = `WHERE p.category_id = ?`;
  const params = [categoryId];

  if (userId) {
    whereClause += ` AND (p.can_browse = TRUE OR p.user_id = ? OR 
              EXISTS (SELECT 1 FROM moderators m WHERE m.user_id = ? AND m.category_id = ?) OR
              EXISTS (SELECT 1 FROM users u2 WHERE u2.id = ? AND u2.role = 'admin'))`;
    params.push(userId, userId, categoryId, userId);
  }

  // 排序
  let orderClause;
  if (sortBy === 'hot') {
    orderClause = `ORDER BY (commentCount * 5 + viewCount) DESC, created_at DESC`;
  } else {
    orderClause = `ORDER BY p.created_at DESC`;
  }

  const baseQuery = `${selectFields} ${fromClause} ${whereClause} ${orderClause}`;

  const { paginate } = await import('../utils/pagination.js');
  return paginate({ baseQuery, params, page, pageSize });
};

// 获取单个帖子详情
export const getPostById = async (postId) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.username, u.uid AS authorUid, u.role, u.avatar_url AS authorAvatar
     FROM posts p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.id = ?`,
    [postId]
  );
  return rows[0];
};

// 创建帖子
export const createPost = async (postData) => {
  const { title, content, userId, department, forumType, categoryId } = postData;
  const [result] = await pool.query(
    `INSERT INTO posts (title, content, user_id, department, forum_type, category_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, content, userId, department, forumType, categoryId]
  );
  return { id: result.insertId, ...postData };
};

// 更新帖子权限（can_reply, can_browse）
export const updatePostPermission = async (postId, field, value) => {
  const allowedFields = ['can_reply', 'can_browse'];
  if (!allowedFields.includes(field)) throw new Error('Invalid field');
  await pool.query(`UPDATE posts SET ${field} = ? WHERE id = ?`, [value, postId]);
};

// 物理删除帖子（级联删除回复和浏览记录，外键 CASCADE 已处理）
export const deletePost = async (postId) => {
  await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
};

/**
 * 获取某用户最近帖子
 * @param {number} userId - 用户内部 id
 * @param {number} limit - 数量限制
 * @returns {Array} 帖子列表
 */
export const getRecentPostsByUserId = async (userId, limit = 4) => {
  const [rows] = await pool.query(
    `SELECT 
       p.id, p.title, p.view_count AS viewCount,
       p.created_at AS createdAt,
       c.slug AS categorySlug,
       (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) AS replyCount
     FROM posts p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
};