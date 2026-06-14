// server/routes/admin.js
import express from 'express';
import { listUsers, listCategories, banUser, unbanUser, grantModerator, revokeModerator } from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 所有路由都需要管理员权限，这里先只做登录检查，具体管理员检查在控制器中或通过中间件

// 用户列表
router.get('/users', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '无权访问' });
  listUsers(req, res, next);
});

// 板块列表
router.get('/categories', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '无权访问' });
  listCategories(req, res, next);
});

// 封禁
router.post('/ban', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '无权访问' });
  banUser(req, res, next);
});

// 解封
router.post('/unban', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '无权访问' });
  unbanUser(req, res, next);
});

// 授予版主
router.post('/grant-mod', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '无权访问' });
  grantModerator(req, res, next);
});

// 撤销版主
router.post('/revoke-mod', authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '无权访问' });
  revokeModerator(req, res, next);
});

export default router;