// server/controllers/notificationController.js
import * as notificationService from '../services/notificationService.js';

// 获取当前用户的通知列表（分页）
export const listNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const result = await notificationService.getNotifications(req.user.id, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// 获取未读通知数量（导航栏红点）
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// 标记单条已读
export const markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(req.user.id, req.params.id);
    res.json({ message: '已标记为已读' });
  } catch (err) {
    next(err);
  }
};

// 全部标记已读
export const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ message: '全部已读' });
  } catch (err) {
    next(err);
  }
};

// 删除单条通知
export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.user.id, req.params.id);
    res.json({ message: '已删除' });
  } catch (err) {
    next(err);
  }
};

// 批量删除通知
export const deleteBatch = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await notificationService.deleteBatch(req.user.id, ids);
    res.json({ message: '已删除' });
  } catch (err) {
    next(err);
  }
};
