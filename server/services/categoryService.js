import pool from '../config/db.js';

export const getAllCategories = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, slug, type, department, sort_order FROM categories ORDER BY sort_order ASC'
  );
  return rows;
};

export const getCategoryBySlug = async (slug) => {
  const [rows] = await pool.query(
    'SELECT id, name, slug, type, department FROM categories WHERE slug = ?',
    [slug]
  );
  return rows[0];
};