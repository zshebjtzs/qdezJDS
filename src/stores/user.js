// src/stores/user.js
import { defineStore } from 'pinia'

// 后端 API 基础地址（作为全局常量导出）
export const API_BASE = 'http://localhost:3001'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    avatarTimestamp: 0,
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
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    updateAvatarTimestamp() {
      this.avatarTimestamp = Date.now();
    },
  },
})