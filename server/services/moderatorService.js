import pool from '../config/db.js';

export const isModerator = async (userId, categoryId) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM moderators WHERE user_id = ? AND category_id = ?',
    [userId, categoryId]
  );
  return rows.length > 0;
};

export const grantModerator = async (userId, categoryId) => {
  await pool.query(
    'INSERT INTO moderators (user_id, category_id) VALUES (?, ?)',
    [userId, categoryId]
  );
};

export const getModeratorsByCategory = async (categoryId) => {
  const [rows] = await pool.query(
    'SELECT user_id FROM moderators WHERE category_id = ?',
    [categoryId]
  );
  return rows.map(r => r.user_id);
};