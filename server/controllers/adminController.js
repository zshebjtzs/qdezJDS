// server/controllers/adminController.js
import * as adminService from '../services/adminService.js';

// 用户列表（分页+搜索）
export const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const q = req.query.q || '';
    const result = await adminService.getNormalUsers(q, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// 板块列表
export const listCategories = async (req, res, next) => {
  try {
    const categories = await adminService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// 封禁用户（发帖/网盘/账号）
export const banUser = async (req, res, next) => {
  try {
    const { userId, type, categoryId, duration } = req.body;
    let bannedUntil = null;
    const durationsMap = { '1h': 1, '1d': 24, '3d': 72, '7d': 168, '30d': 720 };
    if (duration && durationsMap[duration]) {
      bannedUntil = new Date(Date.now() + durationsMap[duration] * 60 * 60 * 1000);
    }
    await adminService.addBan(userId, type, categoryId || null, bannedUntil, req.user.id);
    res.json({ message: '封禁成功' });
  } catch (err) {
    next(err);
  }
};

// 解封
export const unbanUser = async (req, res, next) => {
  try {
    const { userId, type } = req.body;
    await adminService.removeBan(userId, type);
    res.json({ message: '解封成功' });
  } catch (err) {
    next(err);
  }
};

// 授予版主
export const grantModerator = async (req, res, next) => {
  try {
    const { userId, categoryId } = req.body;
    await adminService.grantModerator(userId, categoryId);
    res.json({ message: '版主授予成功' });
  } catch (err) {
    next(err);
  }
};

// 撤销版主
export const revokeModerator = async (req, res, next) => {
  try {
    const { userId, categoryId } = req.body;
    await adminService.revokeModerator(userId, categoryId);
    res.json({ message: '版主已撤销' });
  } catch (err) {
    next(err);
  }
};

export const getUserBans = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const details = await adminService.getUserBanDetails(userId);
    if (!details) return res.status(404).json({ error: '用户不存在' });
    res.json(details);
  } catch (err) { next(err); }
};