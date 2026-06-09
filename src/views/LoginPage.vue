<template>
  <div class="login-container">
    <div class="login-card">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>
      <div class="info">
        <p>测试账号：administrator 密码：qdezJDS2026</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const userStore = useUserStore()
const router = useRouter()

const handleLogin = async () => {
  // 清空之前的错误信息
  errorMsg.value = ''

  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '用户名和密码不能为空'
    return
  }

  loading.value = true
  try {
    const res = await login(username.value, password.value)
    userStore.setToken(res.token)
    userStore.setUserInfo(res.user)
    router.push('/')
  } catch (err) {
    // 处理后端返回的错误信息
    if (err.response && err.response.data && err.response.data.error) {
      errorMsg.value = err.response.data.error
    } else {
      errorMsg.value = '登录失败，请检查网络或联系管理员'
    }
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.error {
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.info {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}
</style>