<!-- src/components/forum/postList.vue -->
<template>
  <div class="post-list">
    <h2>{{ categoryName }}</h2>
    <div class="actions">
      <button @click="changeSort('time')" :class="{ active: sortMode === 'time' }">按时间</button>
      <button @click="changeSort('hot')" :class="{ active: sortMode === 'hot' }">按热度</button>
      <router-link v-if="canPost" :to="`/forum/${slug}/new`" class="new-post-link">发新帖</router-link>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else>
      <div v-for="post in posts" :key="post.id" class="post-card">
        <router-link :to="`/forum/${slug}/${post.id}`" class="post-title">{{ post.title }}</router-link>
        <div class="post-meta">
          <router-link :to="`/user/${post.authorUid}`" class="author-link">
            <img :src="getAvatar(post.authorAvatar)" class="avatar-small" />
            <span :class="usernameClass(post)">{{ post.username }}</span>
          </router-link>
          <span class="dept-tag" :class="{ 'external-dept': isExternal(post) }">{{ displayDept(post) }}</span>
          <span>{{ formatDate(post.createdAt) }}</span>
          <span>浏览: {{ post.viewCount }}</span>
          <span>评论: {{ post.commentCount || 0 }}</span>
        </div>
        <button v-if="canDeletePost(post)" @click="deleteThisPost(post)" class="delete-btn">删除</button>
      </div>
      <div v-if="posts.length === 0" class="empty-state">暂无帖子</div>
    </div>

    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPostsByCategory, deletePost } from '@/api/forum'
import Pagination from '@/components/common/Pagination.vue'
import defaultAvatar from '@/assets/images/default-avatar.png'
import { API_BASE } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const isCategoryBanned = ref(false)
const slug = route.params.slug

// 发帖权限：用户未被禁言 且 板块未被禁言
const canPost = computed(() => {
  // 管理员或版主永远可以发帖
  if (userStore.userInfo?.role === 'admin') return true
  if (moderatorIds.value.includes(userStore.userInfo?.id)) return true
  // 普通用户检查个人禁言和板块禁言
  return !userStore.bans.post && !isCategoryBanned.value
})

// 数据
const posts = ref([])
const categoryName = ref('')
const loading = ref(true)
const moderatorIds = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

// 当前排序方式，默认按时间
const sortMode = ref('time')

// 加载帖子（分页 + 排序）
const loadPosts = async (page = 1, sort = sortMode.value) => {
  loading.value = true
  try {
    const res = await getPostsByCategory(slug, page, 10, sort)
    posts.value = res.data
    categoryName.value = res.categoryName
    moderatorIds.value = res.moderatorIds
    currentPage.value = res.page
    totalPages.value = res.totalPages

    // 获取板块禁言状态（通过 categoryId，可从帖子返回中获取或单独请求）
    if (res.data.length > 0) {
      const catId = res.data[0].categoryId;
      await userStore.fetchCategoryBan(catId);
      isCategoryBanned.value = userStore.categoryBans[catId] ?? false;
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 切换排序方式，重新加载第一页
const changeSort = (sort) => {
  sortMode.value = sort
  loadPosts(1, sort)
}

// 分页回调
const handlePageChange = (page) => {
  loadPosts(page, sortMode.value)
}

// 删除权限判断
const canDeletePost = (post) => {
  const userId = userStore.userInfo?.id
  if (!userId) return false
  if (userStore.userInfo.role === 'admin') return true
  if (post.userId === userId) return true
  return moderatorIds.value.includes(userId)
}

const deleteThisPost = async (post) => {
  if (confirm('确定删除？')) {
    try {
      await deletePost(slug, post.id)
      loadPosts(currentPage.value, sortMode.value) // 重新加载当前页
    } catch (err) {
      alert('删除失败')
    }
  }
}

// 工具函数
const getAvatar = (url) => url ? `${API_BASE}/${url.replace(/^\//, '')}` : defaultAvatar

const isExternal = (post) => post.userRole === 'external'

const displayDept = (post) => {
  if (post.userRole === 'external' || post.department === 'none') return '外部人员'
  const map = { art: '艺术部', mech: '机械部', soft: '软件部' }
  return map[post.department] || post.department
}

const usernameClass = (post) => {
  if (post.userRole === 'admin') return 'username-admin'
  if (moderatorIds.value.includes(post.userId)) return 'username-moderator'
  return ''
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

onMounted(() => loadPosts())
</script>

<style scoped>

.avatar-small { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }

.post-list {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  font-weight: 600;
  border-left: 5px solid #42b983;
  padding-left: 14px;
  color: #1e2b39;
}

/* 操作栏 */
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.actions button,
.new-post-link {
  padding: 8px 18px;
  border-radius: 24px;
  border: 1px solid #d0ddd5;
  background: #fff;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;
}

.actions button:hover,
.new-post-link:hover {
  border-color: #42b983;
  color: #42b983;
  background: #f8fdfa;
}

.actions button.active {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}

.new-post-link {
  margin-left: auto;
  background: linear-gradient(135deg, #42b983, #2ecc71);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(66, 185, 131, 0.25);
}

.new-post-link:hover {
  background: linear-gradient(135deg, #359b6e, #27ae60);
  box-shadow: 0 6px 14px rgba(66, 185, 131, 0.35);
}

/* 帖子卡片 */
.post-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid #eef3f0;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.post-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #2c3e50;
  text-decoration: none;
  flex: 1;
}

.post-title:hover {
  color: #42b983;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.85rem;
  color: #5a7070;
  flex-wrap: wrap;
}

.username-admin { color: purple !important; font-weight: 600; }
.username-moderator { color: red !important; font-weight: 600; }

.delete-btn {
  padding: 4px 14px;
  background: #fff4f4;
  border: 1px solid #ffcccc;
  color: #c0392b;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #c0392b;
  color: white;
  border-color: #c0392b;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1rem;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
}
.avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}
.dept-tag {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f6f3;
  color: #2c7a5c;
}
.external-dept {
  background: #f5f5f5;
  color: #888;
}
</style>