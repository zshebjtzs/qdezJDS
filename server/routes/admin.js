// server/routes/admin.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { grantModerator } from '../services/moderatorService.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/moderators', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可操作' });
    const { userId, categoryId } = req.body;
    await grantModerator(userId, categoryId);
    res.json({ message: '版主已指派' });
  } catch (err) {
    next(err);
  }
});

export default router;