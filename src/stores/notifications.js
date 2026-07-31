// src/stores/notifications.js
import { defineStore } from 'pinia'
import request from '@/api/request'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    unreadCount: 0,
  }),
  actions: {
    // 拉取未读数（导航栏红点）
    async fetchUnreadCount() {
      try {
        const res = await request.get('/notifications/unread-count')
        this.unreadCount = res.count || 0
      } catch (e) {
        console.error('获取未读通知数失败', e)
      }
    },
    setUnreadCount(count) {
      this.unreadCount = count
    },
  },
})
