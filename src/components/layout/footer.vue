<!-- src/components/layout/footer.vue -->
<template>
  <footer class="app-footer">
    <div class="footer-links">
      <router-link to="/legal/terms" target="_blank">使用条款</router-link>
      <router-link to="/legal/privacy" target="_blank">隐私政策</router-link>
      <br>
      <router-link to="/home/UserList">用户列表</router-link>
      <!-- 管理员入口：仅管理员可见 -->
      <router-link
        v-if="isAdmin"
        :to="`/admin/controller/${userStore.userInfo.uid}`"
        class="admin-link"
      >
        权限管理
      </router-link>
    </div>
    <div class="footer-copyright">
      © 2026 机电社. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => {
  return userStore.isLoggedIn && userStore.userInfo?.role === 'admin'
})
</script>

<style scoped>
/* =============================================
   Footer 页脚样式（应用全局设计令牌）
   链接、版权、管理员入口
   ============================================= */
.app-footer {
  text-align: center;
  padding: var(--space-lg) 0 30px;
  margin-top: 60px;
  border-top: 1px solid #eee;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-links a {
  color: var(--color-text-muted);
  text-decoration: none;
  margin: 0 var(--space-sm);
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-primary);
}

/* 管理员链接专属颜色（紫色） */
.admin-link {
  color: var(--color-info) !important;
  font-weight: 600;
}

.admin-link:hover {
  color: #9b30ff !important; /* 悬停时微调紫色，仍保持紫色系 */
}

.footer-copyright {
  font-size: 0.85rem;
}
</style>