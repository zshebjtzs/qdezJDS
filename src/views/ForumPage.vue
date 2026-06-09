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
.forum-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

h2 {
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: 700;
  color: #1e2b39;
  border-left: 6px solid #42b983;
  padding-left: 16px;
}

/* ---- 分段控制器切换按钮 ---- */
.segmented-tabs {
  display: inline-flex;
  background: #f0f2f1;
  border-radius: 30px;
  padding: 4px;
  margin-bottom: 28px;
}

.segmented-tabs button {
  padding: 9px 24px;
  border: none;
  border-radius: 26px;
  background: transparent;
  color: #5a7070;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.segmented-tabs button:hover {
  color: #2c3e50;
}

.segmented-tabs button.active {
  background: #42b983;
  color: #fff;
  box-shadow: 0 4px 10px rgba(66, 185, 131, 0.3);
}

/* ---- 板块列表容器（明显边框 + 阴影） ---- */
.category-list {
  background: #ffffff;
  border: 2px solid #d6e2de;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.category-row {
  display: flex;
  align-items: center;
  padding: 16px 22px;
  background: #ffffff;
  border-bottom: 1px solid #eef3f0;
  transition: background 0.2s;
}

.category-row:last-child {
  border-bottom: none;
}

.category-row:hover {
  background: #f9fdfb;
}

.category-link {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e2b39;
  text-decoration: none;
  flex: 1;
}

.category-link:hover {
  color: #42b983;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1rem;
}
</style>