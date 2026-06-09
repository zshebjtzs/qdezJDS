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
import { useCloudStore } from '@/stores/cloud'

const activeTab = ref('private')
const cloudStore = useCloudStore()

onMounted(async () => {
  // 初次加载：同时获取私有和所有公共部门文件
  await Promise.all([
    cloudStore.fetchPrivateFiles(),
    cloudStore.fetchAllPublicFiles()
  ])
})
</script>

<style scoped>
.cloud-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

/* ---- 选项卡区域 ---- */
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding: 8px;
  background: #f8fbfa;
  border-radius: 48px;
  border: 1px solid rgba(66, 185, 131, 0.15);
  box-shadow: 0 4px 12px -6px rgba(66, 185, 131, 0.08);
  width: fit-content;
  position: relative;
}

/* 单个选项卡按钮 */
.tabs button {
  position: relative;
  padding: 10px 28px;
  background: transparent;
  border: none;
  border-radius: 40px;
  font-size: 1rem;
  font-weight: 600;
  color: #4a5b6b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* 悬停未激活态 */
.tabs button:not(.active):hover {
  color: #42b983;
  background: rgba(66, 185, 131, 0.06);
}

/* 激活态 - 品牌渐变胶囊 */
.tabs button.active {
  background: linear-gradient(135deg, #42b983, #2ecc71);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(66, 185, 131, 0.35);
  transform: translateY(-1px);
}

/* 激活态光晕装饰 */
.tabs button.active::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(66,185,131,0.3), transparent);
  z-index: -1;
  filter: blur(6px);
  opacity: 0.6;
}

/* ---- 内容区容器 ---- */
.cloud-page > :last-child {
  background: #ffffff;
  border-radius: 24px;
  padding: 4px; /* 内边距由子组件自己控制，这里仅提供基础容器 */
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(66, 185, 131, 0.1);
  transition: box-shadow 0.3s ease;
}

.cloud-page > :last-child:hover {
  box-shadow: 0 20px 40px -12px rgba(66, 185, 131, 0.12);
}

/* 响应式调整 */
@media (max-width: 700px) {
  .cloud-page {
    padding: 20px 16px 40px;
  }
  
  .tabs {
    width: 100%;
    justify-content: center;
    gap: 8px;
  }
  
  .tabs button {
    padding: 8px 20px;
    font-size: 0.95rem;
  }
}
</style>