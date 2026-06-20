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
/* =============================================
   MainLayout 导航栏样式（应用全局设计令牌）
   使用 CSS 变量替换硬编码，保留原有布局逻辑
   ============================================= */

/* 主导航栏 - 采用全局卡片风格 */
.navbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-sm) var(--space-lg);
  margin: var(--space-lg) auto;
  max-width: 1200px;
  transition: var(--transition-smooth);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 导航链接 - 统一为轮廓按钮风格 */
.navbar a {
  text-decoration: none;
  background: transparent;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  font-weight: 500;
  color: var(--color-text);
  transition: var(--transition-fast);
}

.navbar a:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateY(-2px);
}

/* 用户信息区域（右侧） */
.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 500;
  color: var(--color-text);
}

/* 用户链接（头像+名字） */
.user-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: inherit;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  transition: var(--transition-fast);
}

.user-link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/* 头像 */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-dark);
}

/* 角色颜色标识（管理员 / 内部 / 外部） */
.username-admin { color: var(--color-info) !important; font-weight: 600; }
.username-internal { color: var(--color-primary) !important; font-weight: 600; }
.username-external { color: #999 !important; font-weight: 600; }

/* 退出按钮 */
.user-info button {
  background: transparent;
  border: none;
  padding: var(--space-xs) 14px;
  border-radius: var(--radius-full);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.user-info button:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  transform: translateY(-2px);
}

/* 登录链接 */
.login-link {
  margin-left: auto;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    padding: var(--space-sm) var(--space-md);
    gap: var(--space-sm);
  }
  .user-info {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>