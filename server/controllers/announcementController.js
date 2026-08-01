// server/controllers/announcementController.js
import * as announcementService from '../services/announcementService.js';

// 创建公告（管理员）：标题可选，正文必填
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '公告内容不能为空' });
    }
    const id = await announcementService.createAnnouncement({
      adminId: req.user.id,
      adminUsername: req.user.username,
      title: (title && title.trim()) ? title.trim() : null,
      content
    });
    res.status(201).json({ id, message: '公告已发布' });
  } catch (err) {
    next(err);
  }
};

// 获取公告完整内容（登录用户，详情弹窗用）
export const getAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const announcement = await announcementService.getAnnouncementById(id);
    if (!announcement) return res.status(404).json({ error: '公告不存在' });
    res.json(announcement);
  } catch (err) {
    next(err);
  }
};
