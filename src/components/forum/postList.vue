<template>
  <div class="post-list">
    <h2>{{ categoryName }}</h2>
    <div class="actions">
      <button @click="sortMode = 'time'" :class="{ active: sortMode === 'time' }">按时间</button>
      <button @click="sortMode = 'hot'" :class="{ active: sortMode === 'hot' }">按热度</button>
      <router-link :to="`/forum/${slug}/new`" class="new-post-link">发新帖</router-link>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else>
      <div v-for="post in sortedPosts" :key="post.id" class="post-card">
        <router-link :to="`/forum/${slug}/${post.id}`" class="post-title">{{ post.title }}</router-link>
        <div class="post-meta">
          <router-link :to="`/user/${post.authorUid}`" class="author-link">
            <img :src="getAvatar(post.authorAvatar)" class="avatar-small" />
            <span :class="usernameClass(post)">{{ post.username }}</span>
          </router-link>
          <span class="dept-tag" :class="{ 'external-dept': isExternal(post) }">{{ displayDept(post) }}</span>
          <span>{{ formatDate(post.createdAt) }}</span>
          <span>浏览: {{ post.viewCount }}</span>
          <span>回复: {{ post.replyCount }}</span>
        </div>
        <button v-if="canDeletePost(post)" @click="deleteThisPost(post)" class="delete-btn">删除</button>
      </div>
      <div v-if="sortedPosts.length === 0" class="empty-state">暂无帖子</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPostsByCategory, deletePost } from '@/api/forum'
import { sortByTime, sortByHot } from '@/utils/forumSort'
import defaultAvatar from '@/assets/images/default-avatar.png'
import { API_BASE } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const slug = route.params.slug
const loading = ref(true)
const posts = ref([])
const categoryName = ref('')
const sortMode = ref('time')
const moderatorIds = ref([])

const sortedPosts = computed(() => {
  if (sortMode.value === 'hot') return sortByHot(posts.value)
  return sortByTime(posts.value)
})

const canDeletePost = (post) => {
  const userId = userStore.userInfo?.id
  if (!userId) return false
  if (userStore.userInfo.role === 'admin') return true
  if (post.userId === userId) return true
  if (moderatorIds.value.includes(userId)) return true
  return false
}

const usernameClass = (post) => {
  if (post.userRole === 'admin') return 'username-admin'
  if (moderatorIds.value.includes(post.userId)) return 'username-moderator'
  return ''
}

const loadPosts = async () => {
  try {
    const res = await getPostsByCategory(slug)
    posts.value = res.posts
    categoryName.value = res.categoryName
    moderatorIds.value = res.moderatorIds
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const deleteThisPost = async (post) => {
  if (confirm('确定删除？')) {
    try {
      await deletePost(slug, post.id)
      await loadPosts()
    } catch (err) {
      alert('删除失败')
    }
  }
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

const getAvatar = (avatarUrl) => {
  return avatarUrl ? `${API_BASE}/${avatarUrl.replace(/^\//, '')}` : defaultAvatar
}

const isExternal = (post) => {
  return post.userRole === 'external'
}

const displayDept = (post) => {
  if (post.userRole === 'external' || post.department === 'none') return '外部人员'
  const map = { art: '艺术部', mech: '机械部', soft: '软件部' }
  return map[post.department] || post.department
}

onMounted(loadPosts)
</script>

<style scoped>
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