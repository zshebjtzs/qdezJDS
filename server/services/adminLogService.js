// server/services/adminLogService.js
import pool from '../config/db.js';
import { LOG_RETENTION_DAYS } from '../config/constants.js';

// 写入一条管理员操作日志，同时清理过期日志
export const createLog = async ({ adminId, adminUid, adminUsername, actionType, targetType, targetId, targetSummary, details }) => {
  await pool.query(
    `INSERT INTO admin_logs (admin_id, admin_uid, admin_username, action_type, target_type, target_id, target_summary, details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [adminId, adminUid, adminUsername, actionType, targetType, targetId, targetSummary, details ? JSON.stringify(details) : null]
  );
  // 顺手清理过期日志（每次写入时清理一条即可，不额外消耗资源）
  await cleanupOldLogs();
};

// 分页查询日志（按时间降序）
export const getLogs = async (page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM admin_logs`);
  const total = countResult[0].total;
  return {
    data: rows,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
};

// 清理超过保留天数的日志
const cleanupOldLogs = async () => {
  await pool.query(
    `DELETE FROM admin_logs WHERE created_at < NOW() - INTERVAL ? DAY`,
    [LOG_RETENTION_DAYS]
  );
};
