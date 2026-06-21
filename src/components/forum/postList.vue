<!-- src/components/forum/postList.vue -->
<template>
  <div class="post-list">
    <h2>{{ categoryName }}</h2>
    <div class="actions">
      <button @click="changeSort('time')" :class="{ active: sortMode === 'time' }">按时间</button>
      <button @click="changeSort('hot')" :class="{ active: sortMode === 'hot' }">按热度</button>
      <router-link v-if="canPost" :to="`/forum/${slug}/new`" class="new-post-link">发新帖</router-link>
      <router-link to="/forum" class="btn-back">← 返回板块列表</router-link>
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
/* =============================================
   postList 帖子列表样式（应用全局设计令牌）
   统一卡片、按钮、标签、分页风格
   ============================================= */

.post-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: var(--space-lg);
  font-weight: 600;
  border-left: 5px solid var(--color-primary);
  padding-left: 14px;
  color: var(--color-text);
}

/* ---- 操作栏（排序 + 发帖）---- */
.actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.actions button,
.new-post-link {
  padding: var(--space-sm) 18px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-dark);
  background: #fff;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: var(--transition-fast);
}

.actions button:hover,
.new-post-link:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.actions button.active {
  background: var(--color-primary-gradient);
  color: #fff;
  border-color: transparent;
}

.new-post-link {
  margin-left: auto;
  background: var(--color-primary-gradient);
  color: #fff;
  border: none;
  box-shadow: var(--shadow-green);
  padding: var(--space-sm) 18px;
  border-radius: var(--radius-full);
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: var(--transition-fast);
}

.new-post-link:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* ---- 帖子卡片 ---- */
.post-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  border: 1px solid var(--color-border);
  transition: var(--transition-smooth);
}

.post-card:hover {
  box-shadow: var(--shadow-sm);
}

.post-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  flex: 1;
  transition: color var(--transition-fast);
}

.post-title:hover {
  color: var(--color-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

/* 作者链接 */
.author-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  transition: color var(--transition-fast);
}

.author-link:hover {
  color: var(--color-primary);
}

.avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

/* 部门标签 */
.dept-tag {
  font-size: 0.8rem;
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.external-dept {
  background: #f5f5f5;
  color: var(--color-text-muted);
}

/* 角色颜色 */
.username-admin { color: var(--color-info) !important; font-weight: 600; }
.username-moderator { color: var(--color-moderator) !important; font-weight: 600; }

/* 删除按钮 */
.delete-btn {
  padding: 4px 14px;
  background: var(--color-danger-light);
  border: 1px solid #ffcccc;
  color: var(--color-danger);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--transition-fast);
}

.delete-btn:hover {
  background: var(--color-danger);
  color: #fff;
  border-color: var(--color-danger);
}

/* 加载与空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: 1rem;
}

/* 头部容器：标题 + 操作栏 */
.post-list-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* 标题重置边距 */
.post-list-header h2 {
  margin-bottom: 0;
}

/* 操作栏（排序、发帖、返回） */
.actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}

/* 返回按钮样式 */
.btn-back {
  font-size: 0.9rem;
  color: var(--color-primary);
  text-decoration: none;
  padding: 6px 16px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  background: #fff;
  transition: var(--transition-fast);
  font-weight: 500;
  white-space: nowrap;
}

.btn-back:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .post-list {
    padding: var(--space-md);
  }
  .post-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  .post-meta {
    gap: 8px;
  }
  .actions {
    justify-content: space-between;
  }
  .new-post-link {
    margin-left: 0;
    margin-top: var(--space-sm);
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .actions {
    flex-wrap: wrap;
    gap: var(--space-xs);
  }
  .actions button {
    flex: 1 1 auto;
  }
}
</style>