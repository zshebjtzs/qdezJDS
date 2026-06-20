<template>
  <div class="user-list-page">
    <h2>用户列表</h2>

    <div class="search-bar">
      <input v-model="searchText" placeholder="搜索用户名..." @keyup.enter="search" />
      <button @click="search">搜索</button>
      <button v-if="searchText" @click="clearSearch" class="clear-btn">清除</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="user-grid">
      <div v-for="user in users" :key="user.uid" class="user-card" :class="{ 'user-disabled': user.is_active === 0 || user.is_temp_banned }">
        <router-link :to="`/user/${user.uid}`" class="user-link">
          <img :src="getAvatar(user.avatar_url)" alt="头像" class="user-avatar" @error="handleAvatarError" />
          <div class="user-info">
            <span class="username" :class="{ 'username-admin': user.role === 'admin' }">
              {{ user.username }}
              <span v-if="user.is_active === 0 || user.is_temp_banned" class="disabled-mark">[已禁用]</span>
            </span>
            <span class="dept-tag" :class="'role-' + user.role">{{ displayDept(user) }}</span>
          </div>
        </router-link>
      </div>
      <div v-if="users.length === 0" class="empty">暂无用户</div>
    </div>

    <Pagination
      v-if="totalPages > 1"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import Pagination from '@/components/common/Pagination.vue'
import defaultAvatar from '@/assets/images/default-avatar.png'
import { API_BASE } from '@/stores/user'

const users = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const searchText = ref('')
const currentSearch = ref('')  // 当前实际搜索的关键词

const fetchUsers = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, pageSize: 20 }
    if (currentSearch.value) params.q = currentSearch.value
    const res = await request.get('/users', { params })
    users.value = res.data
    currentPage.value = res.page
    totalPages.value = res.totalPages
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  fetchUsers(page)
}

const search = () => {
  currentSearch.value = searchText.value.trim()
  fetchUsers(1)  // 搜索后跳到第一页
}

const clearSearch = () => {
  searchText.value = ''
  currentSearch.value = ''
  fetchUsers(1)
}

const getAvatar = (avatarUrl) => {
  return avatarUrl ? `${API_BASE}/${avatarUrl.replace(/^\//, '')}` : defaultAvatar
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const displayDept = (user) => {
  if (user.role === 'external' || user.department === 'none') return '外部人员'
  const map = { art: '艺术部', mech: '机械部', soft: '软件部' }
  return map[user.department] || user.department
}

onMounted(() => fetchUsers())
</script>

<style scoped>
/* =============================================
   userList.vue 用户列表页样式（应用全局设计令牌）
   搜索栏、用户网格、头像、标签、分页
   ============================================= */

.user-list-page {
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
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: var(--space-lg);
}
.search-bar input {
  flex: 1;
  padding: var(--space-sm) var(--space-sm);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-bar input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66,185,131,0.1);
}
.search-bar button {
  padding: var(--space-sm) 18px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-dark);
  background: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}
.search-bar button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.clear-btn {
  color: var(--color-danger);
  border-color: #ffcccc;
}

/* 用户网格 */
.user-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}
.user-card {
  width: calc(50% - var(--space-sm));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  background: #fff;
  transition: box-shadow var(--transition-fast);
}
.user-card:hover {
  box-shadow: var(--shadow-sm);
}
.user-disabled {
  opacity: 0.6;
  background: #f5f5f5;
}

.user-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: inherit;
}
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.username {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text);
}
.username-admin {
  color: var(--color-info) !important;
}
.disabled-mark {
  color: var(--color-danger);
  font-size: 0.8rem;
  margin-left: 4px;
}

/* 部门标签 */
.dept-tag {
  font-size: 0.8rem;
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  width: fit-content;
  margin-top: 4px;
}
.role-external {
  background: #f5f5f5;
  color: var(--color-text-muted);
}
.role-admin {
  background: var(--color-info);
  color: white;
}

/* 加载与空状态 */
.loading,
.empty {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
}

/* 移动端：单列布局，头像缩小 */
@media (max-width: 768px) {
  .user-card {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
  }
  .search-bar input {
    max-width: 100%;
  }
  .user-avatar {
    width: 40px;
    height: 40px;
  }
}
</style>