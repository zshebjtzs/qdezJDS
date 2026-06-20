<template>
  <div class="pagination" v-if="totalPages > 1">
    <!-- 第一页 -->
    <button class="page-btn" :disabled="currentPage <= 1" @click="changePage(1)">«</button>
    <!-- 上一页 -->
    <button class="page-btn" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">‹</button>

    <!-- 数字按钮区 -->
    <button
      v-for="page in pages"
      :key="page"
      class="page-btn"
      :class="{ active: page === currentPage }"
      :disabled="page === '...'"
      @click="page !== '...' && changePage(page)"
    >
      {{ page }}
    </button>

    <!-- 下一页 -->
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">›</button>
    <!-- 最后一页 -->
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(totalPages)">»</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  maxButtons: { type: Number, default: 7 }   // 必须为奇数
});

const emit = defineEmits(['page-change']);

// 计算需要显示的数字按钮数组
const pages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const max = Math.max(props.maxButtons, 5);  // 最少5个
  const half = Math.floor(max / 2);

  if (total <= max) {
    // 总页数很少，全部显示
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // 左侧需补齐
  let start = current - half;
  let end = current + half;

  if (start < 1) {
    start = 1;
    end = max;
  }
  if (end > total) {
    end = total;
    start = total - max + 1;
  }

  const result = [];
  if (start > 1) {
    result.push(1);
    if (start > 2) result.push('...');
  }
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  if (end < total) {
    if (end < total - 1) result.push('...');
    result.push(total);
  }
  return result;
});

const changePage = (page) => {
  if (page < 1 || page > props.totalPages) return;
  emit('page-change', page);
};
</script>

<style scoped>
/* =============================================
   通用分页组件样式（应用全局设计令牌）
   数字按钮、方向按钮、高亮状态、禁用态
   ============================================= */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: var(--space-lg) 0;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 6px;
  background: #fff;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary-gradient);
  color: #fff;
  border-color: transparent;
  box-shadow: var(--shadow-green);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>