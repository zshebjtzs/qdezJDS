import axios from 'axios'

let isLoggingOut = false

// 创建 axios 实例，使用相对路径 /api，由 Vite 代理转发至后端
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器：自动添加 JWT token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一返回 data 字段，并处理 401 错误
request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      const { config } = error
      // 排除登录接口本身
      if (!config.url.includes('/auth/login')) {
        if (!isLoggingOut) {
          isLoggingOut = true

          // 动态导入 userStore 和 router，避免循环依赖
          const { useUserStore } = await import('@/stores/user')
          const { default: router } = await import('@/router')

          const userStore = useUserStore()
          userStore.logout()
          router.push({ path: '/', query: { expired: '1' } })

          setTimeout(() => { isLoggingOut = false }, 1000)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default request