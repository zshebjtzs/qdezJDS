// {{ FILE_PATH }}
import pool from '../config/db.js';

/**
 * {{ DESCRIPTION }}
 * @param {number} id - 记录 ID
 * @returns {Promise<Object|null>} 查询结果
 */
export const getById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM table_name WHERE id = ?',
    [id]
  );
  return rows[0];
};

/**
 * 创建新记录
 * @param {Object} data - 数据对象
 * @returns {Promise<number>} 新记录的 ID
 */
export const create = async (data) => {
  const { field1, field2 } = data;
  const [result] = await pool.query(
    'INSERT INTO table_name (field1, field2) VALUES (?, ?)',
    [field1, field2]
  );
  return result.insertId;
};

/**
 * 更新记录
 * @param {number} id - 记录 ID
 * @param {Object} data - 要更新的字段
 */
export const update = async (id, data) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  await pool.query(
    `UPDATE table_name SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

/**
 * 删除记录
 * @param {number} id - 记录 ID
 */
export const remove = async (id) => {
  await pool.query('DELETE FROM table_name WHERE id = ?', [id]);
};