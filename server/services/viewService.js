import pool from '../config/db.js';

export const recordView = async (userId, postId) => {
  // 获取 UTC+8 今日日期 (YYYY-MM-DD)
  const now = new Date();
  const offset = 8 * 60; // UTC+8 分钟
  const localDate = new Date(now.getTime() + offset * 60000);
  const today = localDate.toISOString().slice(0, 10);

  // 尝试插入，若重复则忽略（唯一索引保证）
  try {
    await pool.query(
      'INSERT INTO post_views (user_id, post_id, view_date) VALUES (?, ?, ?)',
      [userId, postId, today]
    );
    // 插入成功，更新帖子的 view_count
    await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [postId]);
  } catch (err) {
    // 如果是重复键错误，忽略；否则抛出
    if (err.code !== 'ER_DUP_ENTRY') throw err;
  }
};