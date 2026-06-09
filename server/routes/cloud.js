// server/routes/cloud.js
import express from 'express';
import { authMiddleware, internalOnly } from '../middlewares/authMiddleware.js';
import {
  uploadFile,
  getPrivateList,
  getPublicList,
  downloadFile,
  deleteFile
} from '../controllers/cloudController.js';

const router = express.Router();

// 所有网盘操作需登录
router.use(authMiddleware);

// 私有网盘
router.get('/private', getPrivateList);
router.post('/private', uploadFile);
router.get('/private/:fileId/download', downloadFile);
router.delete('/private/:fileId', deleteFile);

// 公共网盘
router.get('/public/:department', getPublicList);
router.post('/public', uploadFile);
router.get('/public/:fileId/download', downloadFile);
router.delete('/public/:fileId', deleteFile);

// 添加调试日志：打印所有注册的路由（可选）
console.log('Cloud routes registered: /private, /private/:fileId/download, /public/:department, etc.');

export default router;