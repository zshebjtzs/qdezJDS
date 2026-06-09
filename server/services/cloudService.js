// server/services/cloudService.js
import pool from '../config/db.js';
import path from 'path';
import fs from 'fs/promises';
import { PROJECT_ROOT } from '../config/paths.js';

export const getPrivateFiles = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM files WHERE type = "private" AND owner_id = ? AND is_active = 1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

export const getPublicFiles = async (department) => {
  const [rows] = await pool.query(
    `SELECT f.*, u.username AS owner_name
     FROM files f
     LEFT JOIN users u ON f.owner_id = u.id
     WHERE f.type = 'public' AND f.department = ? AND f.is_active = 1
     ORDER BY f.created_at DESC`,
    [department]
  );
  return rows;
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