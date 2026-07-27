// server/controllers/adminController.js
import * as adminService from '../services/adminService.js';
import { createLog } from '../services/adminLogService.js';
import { findUserById } from '../services/userService.js';
import pool from '../config/db.js';

// 封禁类型 → 中文描述
const BAN_TYPE_LABELS = {
  post: '发帖权限',
  cloud: '网盘使用权限',
  account: '账户登录权限',
};

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
    // 获取被禁用户信息用于日志
    const bannedUser = await findUserById(userId);
    createLog({
      adminId: req.user.id, adminUid: req.user.uid, adminUsername: req.user.username,
      actionType: 'ban_user',
      targetType: 'user', targetId: userId,
      targetSummary: `封禁了用户 ${bannedUser?.username || userId} 的${BAN_TYPE_LABELS[type] || type}`,
      details: { banType: type, duration: duration || 'permanent', categoryId }
    });
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
    const unbannedUser = await findUserById(userId);
    createLog({
      adminId: req.user.id, adminUid: req.user.uid, adminUsername: req.user.username,
      actionType: 'unban_user',
      targetType: 'user', targetId: userId,
      targetSummary: `启用了用户 ${unbannedUser?.username || userId} 的${BAN_TYPE_LABELS[type] || type}`,
      details: { banType: type }
    });
    res.json({ message: '解封成功' });
  } catch (err) {
    next(err);
  }
};

// 授予版主
export const grantModerator = async (req, res, next) => {
  try {
    const { userId, categoryId } = req.body;
    // 检查是否已是版主
    const isAlreadyMod = await adminService.isModeratorInCategory(userId, categoryId);
    if (isAlreadyMod) {
      const [category] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
      const categoryName = category[0]?.name || '该板块';
      return res.status(400).json({ error: `该用户已经是「${categoryName}」的版主` });
    }
    await adminService.grantModerator(userId, categoryId);
    const modUser = await findUserById(userId);
    const [catRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
    createLog({
      adminId: req.user.id, adminUid: req.user.uid, adminUsername: req.user.username,
      actionType: 'grant_mod',
      targetType: 'user', targetId: userId,
      targetSummary: `用户 ${modUser?.username || userId} 成为「${catRows[0]?.name || categoryId}」版主`,
      details: { categoryId }
    });
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
    const revokedUser = await findUserById(userId);
    const [revCatRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
    createLog({
      adminId: req.user.id, adminUid: req.user.uid, adminUsername: req.user.username,
      actionType: 'revoke_mod',
      targetType: 'user', targetId: userId,
      targetSummary: `撤销用户 ${revokedUser?.username || userId} 的「${revCatRows[0]?.name || categoryId}」版主`,
      details: { categoryId }
    });
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

// 获取板块禁言状态
export const getCategoryBanStatus = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const isBanned = await adminService.getCategoryBanStatus(categoryId);
    res.json({ isBanned });
  } catch (err) {
    next(err);
  }
};

// 设置板块禁言
export const banCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    await adminService.addCategoryBan(categoryId, req.user.id);
    const [banCatRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
    createLog({
      adminId: req.user.id, adminUid: req.user.uid, adminUsername: req.user.username,
      actionType: 'category_ban',
      targetType: 'category', targetId: categoryId,
      targetSummary: `板块「${banCatRows[0]?.name || categoryId}」禁言`,
      details: {}
    });
    res.json({ message: '板块禁言已生效' });
  } catch (err) {
    next(err);
  }
};

// 解除板块禁言
export const unbanCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    await adminService.removeCategoryBan(categoryId);
    const [unbanCatRows] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
    createLog({
      adminId: req.user.id, adminUid: req.user.uid, adminUsername: req.user.username,
      actionType: 'category_unban',
      targetType: 'category', targetId: categoryId,
      targetSummary: `解除板块「${unbanCatRows[0]?.name || categoryId}」禁言`,
      details: {}
    });
    res.json({ message: '板块禁言已解除' });
  } catch (err) {
    next(err);
  }
};

// 获取操作日志（分页）
export const getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { getLogs: fetchLogs } = await import('../services/adminLogService.js');
    const result = await fetchLogs(page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};