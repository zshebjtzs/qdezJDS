// src/api/announcements.js
import request from './request'

// 管理员发布公告（广播给所有活跃用户）
export const createAnnouncement = (title, content) => {
  return request.post('/admin/announcements', { title, content })
}

// 获取公告完整内容（详情弹窗用）
export const getAnnouncement = (id) => {
  return request.get(`/announcements/${id}`)
}
