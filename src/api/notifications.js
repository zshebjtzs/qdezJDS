// src/api/notifications.js
import request from './request'

// 获取通知列表（分页）
export const getNotifications = (page = 1, pageSize = 20) => {
  return request.get('/notifications', { params: { page, pageSize } })
}

// 获取未读通知数量（导航栏红点）
export const getUnreadCount = () => {
  return request.get('/notifications/unread-count')
}

// 标记单条已读
export const markRead = (id) => {
  return request.patch(`/notifications/${id}/read`)
}

// 全部标记已读
export const markAllRead = () => {
  return request.patch('/notifications/read-all')
}

// 删除单条通知（永久）
export const deleteNotification = (id) => {
  return request.delete(`/notifications/${id}`)
}

// 批量删除通知
export const deleteBatchNotifications = (ids) => {
  return request.delete('/notifications', { data: { ids } })
}
