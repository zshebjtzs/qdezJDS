// server/routes/announcement.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getAnnouncement } from '../controllers/announcementController.js';

const router = express.Router();

// 获取公告完整内容（登录用户）
router.get('/:id', authMiddleware, getAnnouncement);

export default router;
