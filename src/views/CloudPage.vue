<!-- src/views/CloudPage.vue -->
<template>
  <div class="cloud-page">
    <div class="tabs">
      <button :class="{ active: activeTab === 'private' }" @click="activeTab = 'private'">私有网盘</button>
      <button :class="{ active: activeTab === 'public' }" @click="activeTab = 'public'">公共网盘</button>
    </div>
    <PrivateCloud v-if="activeTab === 'private'" />
    <PublicCloud v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PrivateCloud from '@/components/cloud/PrivateCloud.vue'
import PublicCloud from '@/components/cloud/PublicCloud.vue'
import { useUserStore } from '@/stores/user'
import { useCloudStore } from '@/stores/cloud'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const cloudStore = useCloudStore()
const router = useRouter()

const activeTab = ref('private')

onMounted(async () => {
  // 封禁拦截：如果当前用户被禁止使用网盘，提示并跳转
  if (userStore.bans.cloud) {
    alert('您已被禁止使用网盘')
    router.push('/')
    return
  }

  // 初次加载文件（后续升级为分页）
  await Promise.all([
    cloudStore.fetchPrivateFiles(),
    cloudStore.fetchAllPublicFiles()
  ])
})
</script>

<style scoped>
/* =============================================
   CloudPage 网盘根组件样式（应用全局设计令牌）
   选项卡与内容容器
   ============================================= */

.cloud-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg) 48px;
}

/* ---- 选项卡区域 ---- */
.tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  padding: var(--space-xs);
  background: #f8fbfa;
  border-radius: var(--radius-full);
  border: 1px solid rgba(66, 185, 131, 0.15);
  box-shadow: 0 4px 12px -6px rgba(66, 185, 131, 0.08);
  width: fit-content;
}

.tabs button {
  position: relative;
  padding: 10px 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-smooth);
  letter-spacing: 0.3px;
}

.tabs button:hover {
  color: var(--color-primary);
  background: rgba(66, 185, 131, 0.06);
}

.tabs button.active {
  background: var(--color-primary-gradient);
  color: #ffffff;
  box-shadow: var(--shadow-green);
  transform: translateY(-1px);
}

/* ---- 内容区容器 ---- */
.cloud-page > :last-child {
  background: #ffffff;
  border-radius: var(--radius-xl);
  padding: 4px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(66, 185, 131, 0.1);
  transition: box-shadow var(--transition-fast);
}

.cloud-page > :last-child:hover {
  box-shadow: var(--shadow-md);
}

/* 响应式 */
@media (max-width: 700px) {
  .cloud-page {
    padding: var(--space-lg) var(--space-md);
  }
  .tabs {
    width: 100%;
    justify-content: center;
    gap: var(--space-xs);
  }
  .tabs button {
    padding: var(--space-sm) 20px;
    font-size: 0.95rem;
  }
}

/* 移动端额外微调 */
@media (max-width: 480px) {
  .cloud-page {
    padding: var(--space-sm);
  }
  .tabs {
    width: 100%;
    justify-content: space-around;
  }
  .tabs button {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>