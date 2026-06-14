// server/services/commentService.js
import pool from '../config/db.js';

// 为帖子创建评论
export const createComment = async (postId, userId, content) => {
  const [result] = await pool.query(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content]
  );
  return result.insertId;
};

// 分页获取帖子的评论（含用户信息和回复计数）
export const getCommentsByPostId = async (postId, page = 1, pageSize = 10) => {
  const baseQuery = `
    SELECT 
      c.id, c.content, c.created_at AS createdAt,
      c.user_id AS userId,
      u.username, u.uid AS authorUid, u.role, u.avatar_url AS authorAvatar,
      (SELECT COUNT(*) FROM replies r WHERE r.comment_id = c.id) AS replyCount
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  // 使用通用分页
  const { paginate } = await import('../utils/pagination.js');
  return paginate({ baseQuery, params: [postId], page, pageSize });
};

// 获取单条评论（用于权限检查等）
export const getCommentById = async (commentId) => {
  const [rows] = await pool.query(
    'SELECT * FROM comments WHERE id = ?',
    [commentId]
  );
  return rows[0];
};