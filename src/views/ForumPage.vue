<template>
  <div class="forum-page">
    <h2>社团论坛</h2>

    <!-- 内外论坛切换按钮（分段控制器风格，外部在左，内部在右） -->
    <div class="segmented-tabs">
      <button
        :class="{ active: activeTab === 'public' }"
        @click="activeTab = 'public'"
      >
        外部论坛
      </button>
      <button
        v-if="userStore.userInfo?.role !== 'external'"
        :class="{ active: activeTab === 'internal' }"
        @click="activeTab = 'internal'"
      >
        内部论坛
      </button>
    </div>

    <!-- 板块列表 -->
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else class="category-list">
      <div
        v-for="(cat, index) in filteredCategories"
        :key="cat.id"
        class="category-row"
      >
        <router-link :to="`/forum/${cat.slug}`" class="category-link">
          {{ cat.name }}
        </router-link>
      </div>
      <div v-if="filteredCategories.length === 0" class="empty-state">
        暂无板块
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getCategories } from '@/api/forum'

const userStore = useUserStore()
const categories = ref([])
const loading = ref(true)

// 默认显示外部论坛
const activeTab = ref('public')

const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === activeTab.value)
})

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* =============================================
   ForumPage 板块列表样式（应用全局设计令牌）
   统一卡片、按钮、标签风格
   ============================================= */

.forum-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  border-left: 6px solid var(--color-primary);
  padding-left: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* ---- 分段控制器切换按钮 ---- */
.segmented-tabs {
  display: inline-flex;
  background: #f0f2f1;
  border-radius: var(--radius-full);
  padding: var(--space-xs);
  margin-bottom: var(--space-xl);
}

.segmented-tabs button {
  padding: 9px var(--space-lg);
  border: none;
  border-radius: 26px;
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.segmented-tabs button:hover {
  color: var(--color-text);
}

.segmented-tabs button.active {
  background: var(--color-primary-gradient);
  color: #fff;
  box-shadow: var(--shadow-green);
}

/* ---- 板块列表容器 ---- */
.category-list {
  background: #fff;
  border: 2px solid #d6e2de;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.category-row {
  display: flex;
  align-items: center;
  padding: var(--space-md) 22px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.category-row:last-child {
  border-bottom: none;
}

.category-row:hover {
  background: var(--color-primary-bg);
}

.category-link {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  flex: 1;
  transition: color var(--transition-fast);
}

.category-link:hover {
  color: var(--color-primary);
}

/* 加载与空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: 1rem;
}

/* 响应式：平板/手机下板块列表全宽，移除悬停浮起效果 */
@media (max-width: 768px) {
  .forum-page {
    padding: var(--space-md);
  }
  .category-row {
    padding: var(--space-md) 12px;
  }
}

@media (max-width: 480px) {
  .segmented-tabs {
    width: 100%;
    justify-content: center;
  }
  .segmented-tabs button {
    padding: 6px 14px;
    font-size: 0.9rem;
  }
  .category-link {
    font-size: 0.95rem;
  }
}
</style>