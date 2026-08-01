// server/services/announcementService.js
import pool from '../config/db.js';
import { NOTIFICATION_RETENTION_DAYS } from '../config/constants.js';

// 创建公告并通知所有活跃用户（含管理员自己），事务保证原子性
export const createAnnouncement = async ({ adminId, adminUsername, title, content }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. 插入公告
    const [result] = await connection.query(
      `INSERT INTO announcements (admin_id, admin_username, title, content) VALUES (?, ?, ?, ?)`,
      [adminId, adminUsername, title, content]
    );
    const announcementId = result.insertId;

    // 2. 获取所有活跃用户（跳过封禁用户）
    const [users] = await connection.query(
      `SELECT id FROM users WHERE is_active = TRUE`
    );

    // 3. 为每个用户写一条通知（含管理员自己），content_snapshot 存标题供列表展示
    if (users.length > 0) {
      const values = users.map(u => [u.id, 'announcement', announcementId, title]);
      await connection.query(
        `INSERT INTO notifications (user_id, type, announcement_id, content_snapshot) VALUES ?`,
        [values]
      );
    }

    // 4. 顺手清理过期通知
    await connection.query(
      `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL ? DAY`,
      [NOTIFICATION_RETENTION_DAYS]
    );

    await connection.commit();
    return announcementId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// 根据 ID 获取公告完整内容（详情弹窗用）
export const getAnnouncementById = async (announcementId) => {
  const [rows] = await pool.query(
    `SELECT id, title, content, admin_username AS adminUsername, created_at AS createdAt
     FROM announcements WHERE id = ?`,
    [announcementId]
  );
  return rows[0];
};
