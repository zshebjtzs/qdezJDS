<template>
  <div class="layout">
    <nav class="navbar">
      <router-link to="/">首页</router-link>
      <router-link to="/forum">论坛</router-link>
      <router-link to="/cloud">网盘</router-link>
      <span v-if="userStore.isLoggedIn && userStore.userInfo" class="user-info">
        <router-link :to="`/user/${userStore.userInfo.uid}`" class="user-link">
          <img
            :src="avatarSrc"
            alt="头像"
            class="user-avatar"
            @error="handleAvatarError"
          />
          <span :class="usernameClass">{{ userStore.userInfo.username }}</span>
        </router-link>
        <button @click="logout">退出</button>
      </span>
      <router-link v-else to="/login" class="login-link">登录</router-link>
    </nav>
    <main>
      <slot />
    </main>
    <FooterComponent />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore, API_BASE } from '@/stores/user'
import { useRouter } from 'vue-router'
import defaultAvatar from '@/assets/images/default-avatar.png'
import FooterComponent from '@/components/layout/footer.vue'

const userStore = useUserStore()
const router = useRouter()

// ---------- 前置 Token 过期检查 ----------
const token = userStore.token
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now >= payload.exp) {
      userStore.logout()
      router.push({ path: '/', query: { expired: '1' } })
    }
  } catch (e) {
    userStore.logout()
    router.push({ path: '/', query: { expired: '1' } })
  }
}

const logout = () => {
  userStore.logout()
  router.push('/')
}

const usernameClass = computed(() => {
  const role = userStore.userInfo?.role;
  if (role === 'admin') return 'username-admin';
  if (role === 'internal') return 'username-internal';
  if (role === 'external') return 'username-external';
  return '';
});

const avatarSrc = computed(() => {
  const url = userStore.userInfo?.avatar_url;
  if (!url) return defaultAvatar;
  const base = `${API_BASE}/${url.replace(/^\//, '')}`;
  const ts = userStore.avatarTimestamp;
  return ts ? `${base}?t=${ts}` : base;
});

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}
</script>

<style scoped>
/* 主导航栏 - 与主页导航栏视觉统一 */
.navbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 12px 24px;
  margin: 20px auto;
  max-width: 1200px;
  transition: all 0.2s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 导航链接样式（首页、论坛、网盘、登录） */
.navbar a {
  text-decoration: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 500;
  color: #333;
  transition: all 0.25s;
}

.navbar a:hover {
  background-color: #42b98310;
  color: #42b983;
  transform: translateY(-2px);
}

/* 用户信息区域（右侧） */
.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-weight: 500;
}

/* 退出按钮样式 - 与链接风格协调 */
.user-info button {
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.25s;
  font-size: 0.9rem;
}

.user-info button:hover {
  background-color: #ff4d4f10;
  color: #ff4d4f;
  transform: translateY(-2px);
}

.user-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}

.username-admin {
  color: purple !important;
  font-weight: 600;
}

.username-internal {
  color: #42b983 !important;
  font-weight: 600;
}

.username-external {
  color: #999 !important;
  font-weight: 600;
}

.login-link {
  margin-left: auto;
}

/* 移动端适配：换行、右对齐调整 */
@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 8px;
  }
  .user-info {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>