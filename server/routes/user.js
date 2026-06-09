// server/routes/user.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getUserPublic, getOwnProfile,
  changeUsername, changePassword, editProfile,
  uploadAvatar, uploadCover,
  getUserRecentPosts          // 新增
} from '../controllers/userController.js';
import { uploadAvatar as avatarUpload, uploadCover as coverUpload } from '../middlewares/upload.js';

const router = express.Router();

// ---------- 板块一接口 ----------
router.get('/me/profile', authMiddleware, getOwnProfile);
router.get('/:uid', authMiddleware, getUserPublic);

// ---------- 板块二接口 ----------
router.patch('/me/username', authMiddleware, changeUsername);
router.patch('/me/password', authMiddleware, changePassword);
router.patch('/me/profile', authMiddleware, editProfile);
router.post('/me/avatar', authMiddleware, avatarUpload.single('avatar'), uploadAvatar);
router.post('/me/cover', authMiddleware, coverUpload.single('cover'), uploadCover);

// ---------- 板块三接口 ----------
// 获取某用户最近帖子 (例如 /api/user/Ua3K9mR2xP7vQ1L/posts?limit=4)
router.get('/:uid/posts', authMiddleware, getUserRecentPosts);

export default router;