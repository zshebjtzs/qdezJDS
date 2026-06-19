// src/stores/user.js
import { defineStore } from 'pinia'

// 后端 API 基础地址（作为全局常量导出）
export const API_BASE = 'http://localhost:3001'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    avatarTimestamp: 0,
    bans: { post: false, cloud: false, account: false }, // 新增封禁状态
    categoryBans: {},  // { categoryId: true/false }
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
    department: (state) => state.userInfo?.department || null,
  },
  actions: {
    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo')
      }
    },
    logout() {
      this.token = null
      this.userInfo = null
      this.bans = { post: false, cloud: false, account: false }
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    updateAvatarTimestamp() {
      this.avatarTimestamp = Date.now()
    },
    setBans(bans) {
      this.bans = bans
    },
    async fetchBans() {
      try {
        // 引入 request 需要动态导入避免循环依赖
        const { default: request } = await import('@/api/request')
        const res = await request.get('/user/me/bans')
        this.setBans(res)
      } catch (e) {
        console.error('获取封禁状态失败', e)
      }
    },
    setCategoryBan(categoryId, isBanned) {
      this.categoryBans = { ...this.categoryBans, [categoryId]: isBanned };
    },
    async fetchCategoryBan(categoryId) {
      try {
        const { default: request } = await import('@/api/request');
        const res = await request.get(`/forum/category/${categoryId}/ban-status`);
        // 假设后端返回 { isBanned: true/false }
        const isBanned = res.isBanned ?? (res.data?.isBanned ?? false);
        // 直接修改 state 下的 categoryBans 属性，Vue 3 + Pinia 能侦测到
        this.categoryBans = {
          ...this.categoryBans,
          [categoryId]: isBanned
        };
      } catch (e) {
        console.error('获取板块禁言失败', e);
      }
    },
  },
})