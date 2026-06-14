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
.app-footer {
  text-align: center;
  padding: 24px 0 30px;
  margin-top: 60px;
  border-top: 1px solid #eee;
  color: #8a9aa8;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-links a {
  color: #8a9aa8;
  text-decoration: none;
  margin: 0 12px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #42b983;
}

/* 管理员链接专属颜色（紫色） */
.admin-link {
  color: purple !important;
  font-weight: 600;
}

.admin-link:hover {
  color: #9b30ff !important; /* 悬停时微调紫色，仍保持紫色系 */
}

.footer-copyright {
  font-size: 0.85rem;
}
</style>