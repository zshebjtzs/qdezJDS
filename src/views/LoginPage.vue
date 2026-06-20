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
  errorMsg.value = '';
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '用户名和密码不能为空';
    return;
  }

  loading.value = true;
  try {
    const res = await login(username.value, password.value);
    userStore.setToken(res.token);
    // 立即获取封禁状态
    await userStore.fetchBans();
    // 检查账号封禁
    if (userStore.bans.account) {
      userStore.logout(); // 清除 token 和用户信息
      errorMsg.value = '您的账号已被封禁，请联系管理员';
      loading.value = false;
      return;
    }
    userStore.setUserInfo(res.user);
    router.push('/');
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      errorMsg.value = err.response.data.error;
    } else {
      errorMsg.value = '登录失败，请检查网络或联系管理员';
    }
    console.error('登录失败:', err);
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
/* =============================================
   LoginPage 样式（应用全局设计令牌）
   卡片居中、输入框优化、品牌按钮、过渡动画
   ============================================= */

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-page) 0%, var(--color-primary-light) 100%);
  padding: var(--space-md);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-2xl) var(--space-xl);
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-smooth);
}

.login-card:hover {
  box-shadow: 0 12px 30px rgba(66, 185, 131, 0.12);
}

.login-card h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
  text-align: center;
  border-left: none;
  padding-left: 0;
}

.form-group {
  margin-bottom: var(--space-lg);
}

label {
  display: block;
  margin-bottom: var(--space-xs);
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 12px var(--space-md);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  color: var(--color-text);
  background: #fff;
  outline: none;
  transition: var(--transition-fast);
  box-sizing: border-box;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

input::placeholder {
  color: #aaa;
}

button {
  width: 100%;
  padding: 14px;
  margin-top: var(--space-sm);
  background: var(--color-primary-gradient);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: var(--transition-smooth);
  letter-spacing: 0.5px;
}

button:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.4);
}

button:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.error {
  color: var(--color-danger);
  margin-top: var(--space-md);
  font-size: 0.9rem;
  text-align: center;
  padding: var(--space-sm);
  background: var(--color-danger-light);
  border-radius: var(--radius-sm);
}

.info {
  margin-top: var(--space-md);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.6;
}
</style>