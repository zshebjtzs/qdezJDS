// server/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { updateLastActive } from '../services/userService.js';

dotenv.config();

// JWT 认证中间件
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, uid, username, department, role }

    // 更新最近活跃时间（异步执行，不阻塞请求）
    if (req.user.id) {
      updateLastActive(req.user.id);
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: '无效或过期的令牌' });
  }
};

// 内部成员专用中间件（网盘曾用，保留兼容）
export const internalOnly = (req, res, next) => {
  if (req.user.role !== 'internal') {
    return res.status(403).json({ error: '仅内部成员可访问网盘功能' });
  }
  next();
};