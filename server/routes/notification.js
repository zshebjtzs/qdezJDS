// server/routes/notification.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteBatch
} from '../controllers/notificationController.js';

const router = express.Router();

// 所有通知接口都需要登录
router.get('/', authMiddleware, listNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.patch('/:id/read', authMiddleware, markRead);
router.patch('/read-all', authMiddleware, markAllRead);
router.delete('/:id', authMiddleware, deleteNotification);
router.delete('/', authMiddleware, deleteBatch);

export default router;
