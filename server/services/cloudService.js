// server/services/cloudService.js
import pool from '../config/db.js';
import path from 'path';
import fs from 'fs/promises';
import { PROJECT_ROOT } from '../config/paths.js';

// 辅助函数：转义 LIKE 通配符，防止用户输入的 % 和 _ 被当作模式
function escapeLike(str) {
  return str.replace(/[%_]/g, '\\$&');
}

// 辅助函数：在文件名中计算关键词高亮位置（不区分大小写）
function computeHighlights(fileName, keyword) {
  if (!keyword) return [];
  const highlights = [];
  const lowerName = fileName.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let startIndex = 0;
  while ((startIndex = lowerName.indexOf(lowerKeyword, startIndex)) !== -1) {
    highlights.push({ start: startIndex, length: keyword.length });
    startIndex += lowerKeyword.length;
  }
  return highlights;
}

export const getPrivateFiles = async (userId, page = 1, pageSize = 20, q = '') => {
  let baseQuery = `
    SELECT id, file_name, original_name, file_path, file_size, mime_type, created_at
    FROM files
    WHERE type = 'private' AND owner_id = ? AND is_active = 1
  `;
  const params = [userId];

  if (q) {
    const escapedQ = escapeLike(q);
    baseQuery = `
      SELECT id, file_name, original_name, file_path, file_size, mime_type, created_at
      FROM files
      WHERE type = 'private' AND owner_id = ? AND is_active = 1
        AND LOWER(original_name) LIKE LOWER(CONCAT('%', ?, '%'))
      ORDER BY created_at DESC
    `;
    params.push(escapedQ);
  } else {
    baseQuery += ` ORDER BY created_at DESC`;
  }

  const { paginate } = await import('../utils/pagination.js');
  const result = await paginate({ baseQuery, params, page, pageSize });

  // 为每条记录添加高亮位置
  result.data = result.data.map(file => ({
    ...file,
    highlights: q ? computeHighlights(file.original_name, q) : []
  }));

  return result;
};

export const getPublicFiles = async (department, page = 1, pageSize = 20, q = '') => {
  let baseQuery = `
    SELECT f.id, f.file_name, f.original_name, f.file_path, f.file_size, f.mime_type, f.created_at,
           u.username AS owner_name
    FROM files f
    LEFT JOIN users u ON f.owner_id = u.id
    WHERE f.type = 'public' AND f.department = ? AND f.is_active = 1
  `;
  const params = [department];

  if (q) {
    const escapedQ = escapeLike(q);
    baseQuery = `
      SELECT f.id, f.file_name, f.original_name, f.file_path, f.file_size, f.mime_type, f.created_at,
             u.username AS owner_name
      FROM files f
      LEFT JOIN users u ON f.owner_id = u.id
      WHERE f.type = 'public' AND f.department = ? AND f.is_active = 1
        AND LOWER(f.original_name) LIKE LOWER(CONCAT('%', ?, '%'))
      ORDER BY f.created_at DESC
    `;
    params.push(escapedQ);
  } else {
    baseQuery += ` ORDER BY f.created_at DESC`;
  }

  const { paginate } = await import('../utils/pagination.js');
  const result = await paginate({ baseQuery, params, page, pageSize });

  result.data = result.data.map(file => ({
    ...file,
    highlights: q ? computeHighlights(file.original_name, q) : []
  }));

  return result;
};

export const createFileRecord = async (fileData) => {
  const { fileName, originalName, filePath, fileSize, mimeType, type, ownerId, department } = fileData;
  const [result] = await pool.query(
    `INSERT INTO files (file_name, original_name, file_path, file_size, mime_type, type, owner_id, department)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [fileName, originalName, filePath, fileSize, mimeType, type, ownerId, department]
  );
  return { id: result.insertId };
};

export const getFileById = async (fileId) => {
  const [rows] = await pool.query('SELECT * FROM files WHERE id = ? AND is_active = 1', [fileId]);
  return rows[0];
};

export const deleteFileRecord = async (fileId) => {
  await pool.query('UPDATE files SET is_active = 0 WHERE id = ?', [fileId]);
};

export const deletePhysicalFile = async (relativePath) => {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  try {
    await fs.unlink(fullPath);
    console.log(`✅ 物理文件已删除: ${fullPath}`);
  } catch (err) {
    console.error(`❌ 物理文件删除失败: ${fullPath}`, err);
    throw err;
  }
};



