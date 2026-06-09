import pool from '../config/db.js';

export const getRepliesByPostId = async (postId) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.content, r.created_at AS createdAt, 
            r.user_id AS userId, u.username, u.uid AS authorUid, u.role, u.avatar_url AS authorAvatar, u.department
     FROM replies r
     JOIN users u ON r.user_id = u.id
     WHERE r.post_id = ?
     ORDER BY r.created_at ASC`,
    [postId]
  );
  return rows;
};

export const createReply = async (postId, userId, content) => {
  const [result] = await pool.query(
    'INSERT INTO replies (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content]
  );
  return { id: result.insertId };
};