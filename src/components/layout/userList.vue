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
.user-list-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}
h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  border-left: 6px solid #42b983;
  padding-left: 16px;
}
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}
.search-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9e5df;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}
.search-bar input:focus {
  border-color: #42b983;
}
.search-bar button {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid #d0ddd5;
  background: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}
.search-bar button:hover {
  border-color: #42b983;
  color: #42b983;
  background: #f8fdfa;
}
.clear-btn {
  color: #c0392b;
  border-color: #ffcccc;
}
.user-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.user-card {
  width: calc(50% - 8px);
  border: 1px solid #eef3f0;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  transition: box-shadow 0.2s;
}
.user-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.user-disabled {
  opacity: 0.6;
  background: #f5f5f5;
}
.user-link {
  display: flex;
  align-items: center;
  gap: 12px;
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
  color: #2c3e50;
}
.username-admin {
  color: purple !important;
}
.disabled-mark {
  color: #c0392b;
  font-size: 0.8rem;
  margin-left: 4px;
}
.dept-tag {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f6f3;
  color: #2c7a5c;
  width: fit-content;
  margin-top: 4px;
}
.role-external {
  background: #f5f5f5;
  color: #888;
}
.role-admin {
  background: purple;
  color: white;
}
.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>