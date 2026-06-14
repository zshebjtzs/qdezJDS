// server/utils/pagination.js
/**
 * 通用分页查询
 * @param {object} options
 * @param {string} options.baseQuery - 不带 LIMIT/OFFSET 的 SQL 查询语句
 * @param {Array}  options.params     - baseQuery 中占位符对应的参数数组
 * @param {number} options.page       - 当前页码（从 1 开始）
 * @param {number} options.pageSize   - 每页数量
 * @returns {Promise<{data: Array, total: number, page: number, pageSize: number, totalPages: number}>}
 */
import pool from '../config/db.js';

export async function paginate({ baseQuery, params = [], page = 1, pageSize = 10 }) {
  // 1. 计算总数
  const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS _count`;
  const [[{ total }]] = await pool.query(countQuery, params);

  // 2. 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  // 3. 查询当前页数据
  const offset = (page - 1) * pageSize;
  const dataQuery = `${baseQuery} LIMIT ? OFFSET ?`;
  const [rows] = await pool.query(dataQuery, [...params, pageSize, offset]);

  return {
    data: rows,
    total,
    page,
    pageSize,
    totalPages
  };
}