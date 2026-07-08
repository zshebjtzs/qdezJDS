<!-- {{ FILE_PATH }} -->
<template>
  <div class="{{ COMPONENT_NAME }}">
    <h2>页面标题</h2>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">加载中...</div>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>

    <!-- 正常内容 -->
    <div v-else>
      <!-- 页面主体 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// 按需导入其他依赖
// import { useRoute, useRouter } from 'vue-router'
// import { useUserStore } from '@/stores/user'
// import request from '@/api/request'

// 响应式数据
const loading = ref(true)
const errorMsg = ref('')

// 数据加载
const loadData = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    // 请求数据
  } catch (err) {
    console.error(err)
    errorMsg.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 页面容器采用全局变量 */
.{{ COMPONENT_NAME }} {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-lg);
  border-left: 6px solid var(--color-primary);
  padding-left: var(--space-md);
  color: var(--color-text);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: 1rem;
}
</style>