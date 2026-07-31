// server/services/notificationService.js
import pool from '../config/db.js';
import { NOTIFICATION_RETENTION_DAYS } from '../config/constants.js';

// 写入一条通知，同时清理过期通知
export const createNotification = async ({ userId, type, postId, categorySlug, commentId, replyId, actorUsername, titleSnapshot, contentSnapshot }) => {
  await pool.query(
    `INSERT INTO notifications (user_id, type, post_id, category_slug, comment_id, reply_id, actor_username, title_snapshot, content_snapshot)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, postId, categorySlug, commentId, replyId, actorUsername, titleSnapshot, contentSnapshot]
  );
  // 顺手清理过期通知
  await cleanupOldNotifications();
};

// 分页查询某用户的通知（按时间降序）
export const getNotifications = async (userId, page = 1, pageSize = 20) => {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, pageSize, offset]
  );
  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?`,
    [userId]
  );
  const total = countResult[0].total;
  return {
    data: rows,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
};

// 获取未读通知数量（用于导航栏红点）
export const getUnreadCount = async (userId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
  return rows[0].count;
};

// 标记单条已读
export const markRead = async (userId, notificationId) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

// 全部标记已读
export const markAllRead = async (userId) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
};

// 删除单条通知（永久删除）
export const deleteNotification = async (userId, notificationId) => {
  await pool.query(
    `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

// 批量删除通知
export const deleteBatch = async (userId, ids) => {
  if (!ids || ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(
    `DELETE FROM notifications WHERE user_id = ? AND id IN (${placeholders})`,
    [userId, ...ids]
  );
};

// 清理超过保留天数的通知
const cleanupOldNotifications = async () => {
  await pool.query(
    `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL ? DAY`,
    [NOTIFICATION_RETENTION_DAYS]
  );
};
