<!-- src/components/forum/postSingle.vue -->
<template>
  <div class="post-single" v-if="post">
    <h2>{{ post.title }}</h2>
    <div class="author-line">
      <router-link :to="`/user/${post.authorUid}`" class="author-link">
        <img :src="getAvatar(post.authorAvatar)" class="avatar-medium" />
        <span :class="usernameClass(post)">{{ post.username }}</span>
      </router-link>
      <span class="dept-tag" :class="{ 'external-dept': isExternal(post) }">{{ displayDept(post) }}</span>
      <span>{{ formatDate(post.createdAt) }}</span>
      <span>浏览: {{ post.viewCount }}</span>
    </div>
    <div class="content" v-html="renderMarkdown(post.content)"></div>

    <!-- 管理控件 -->
    <div v-if="canDelete" class="manage-bar">
      <button @click="deleteThisPost">删除帖子</button>
      <template v-if="canManagePerms">
        <label>
          <input type="checkbox" :checked="post.canBrowse" @change="togglePerm('can_browse', $event)" /> 允许浏览
        </label>
        <label>
          <input type="checkbox" :checked="post.canReply" @change="togglePerm('can_reply', $event)" /> 允许评论
        </label>
      </template>
    </div>

    <hr />

    <!-- 评论区域标题 + 全局展开/收起 -->
    <div class="comments-header">
      <h3>评论 ({{ totalComments }})</h3>
      <button class="toggle-btn" @click="allCommentsCollapsed = !allCommentsCollapsed">
        {{ allCommentsCollapsed ? '展开全部评论' : '收起全部评论' }}
      </button>
    </div>

    <!-- 评论列表 -->
    <div v-if="!allCommentsCollapsed">
      <div v-for="comment in comments" :key="comment.id" class="comment-block">
        <div class="comment-header">
          <router-link :to="`/user/${comment.authorUid}`" class="author-link">
            <img :src="getAvatar(comment.authorAvatar)" class="avatar-small" />
            <span :class="usernameClass(comment)">{{ comment.username }}</span>
          </router-link>
          <span class="dept-tag" :class="{ 'external-dept': isExternal(comment) }">{{ displayDept(comment) }}</span>
          <span>{{ formatDate(comment.createdAt) }}</span>
          <button v-if="post.canReply" class="reply-btn" @click="openReplyDialog(comment.id, comment.userId, comment.username)">回复</button>
          <button v-if="canDeleteComment(comment)" class="delete-btn" @click="deleteThisComment(comment.id)">删除</button>
        </div>
        <div class="comment-content" v-html="renderMarkdown(comment.content)"></div>

        <!-- 收起/展开该评论的回复 -->
        <div v-if="comment.replyTotalCount > 0" class="replies-toggle">
          <button class="toggle-btn small" @click="toggleCommentReplies(comment.id)">
            {{ isRepliesCollapsed(comment.id) ? `展开回复 (${comment.replyTotalCount})` : '收起回复' }}
          </button>
        </div>

        <!-- 该评论的嵌套回复（二级限制） -->
        <div v-if="!isRepliesCollapsed(comment.id) && comment.replies && comment.replies.length > 0" class="replies-container">
          <div v-for="reply in comment.replies" :key="reply.id" :style="{ marginLeft: (reply.depth || 0) * 20 + 'px' }" class="reply-item">
            <div class="reply-header">
              <router-link :to="`/user/${reply.authorUid}`" class="author-link">
                <img :src="getAvatar(reply.authorAvatar)" class="avatar-small" />
                <span :class="usernameClass(reply)">{{ reply.username }}</span>
              </router-link>
              <span class="reply-meta">{{ formatDate(reply.createdAt) }}</span>
              <button v-if="post.canReply" class="reply-btn" @click="openReplyDialog(comment.id, reply.userId, reply.username, reply.id)">回复</button>
              <button v-if="canDeleteReply(reply)" class="delete-btn" @click="deleteThisReply(reply.id, comment.id)">删除</button>
            </div>
            <div class="reply-content">
              <span v-if="reply.replyToUserName" class="reply-to">回复 @{{ reply.replyToUserName }}：</span>
              <span v-html="renderMarkdown(reply.content)"></span>
            </div>
          </div>
          <!-- 回复分页 -->
          <Pagination
            v-if="comment.replyTotalPages > 1"
            :currentPage="comment.replyCurrentPage"
            :totalPages="comment.replyTotalPages"
            @page-change="(page) => loadReplies(comment, page)"
          />
        </div>
      </div>
    </div>

    <!-- 评论分页 -->
    <Pagination
      :currentPage="commentCurrentPage"
      :totalPages="commentTotalPages"
      @page-change="handleCommentPageChange"
    />

    <!-- 发表评论 -->
    <div v-if="post.canReply" class="comment-form">
      <h3>发表评论</h3>
      <MarkdownEditor v-model="newComment" placeholder="输入评论..." :height="200" />
      <button @click="submitComment" class="submit-btn">提交评论</button>
    </div>

    <!-- 回复弹窗 -->
    <div v-if="replyDialog.visible" class="modal-overlay">
      <div class="modal-card">
        <h4>{{ replyDialog.placeholder }}</h4>
        <MarkdownEditor v-model="replyContent" :placeholder="replyDialog.placeholder" :height="200" />
        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitReply">提交</button>
          <button class="btn btn-cancel" @click="replyDialog.visible = false">取消</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">加载中或帖子不存在</div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPostDetail, deletePost, updatePostPermission, getComments, addComment, getReplies, addReply, deleteComment, deleteReply } from '@/api/forum'
import { renderMarkdown } from '@/markdown/renderer.js'
import MarkdownEditor from '@/markdown/editor.vue'
import Pagination from '@/components/common/Pagination.vue'
import defaultAvatar from '@/assets/images/default-avatar.png'
import { API_BASE } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const slug = route.params.slug
const postId = route.params.postId

// 帖子数据
const post = ref(null)
// 评论数据
const comments = ref([])
const totalComments = ref(0)
const commentCurrentPage = ref(1)
const commentTotalPages = ref(1)

// 回复弹窗状态
const replyDialog = reactive({
  visible: false,
  commentId: null,
  replyToUserId: null,
  replyToUsername: '',
  parentReplyId: null,
  placeholder: ''
})
const replyContent = ref('')

// 新评论内容
const newComment = ref('')

// 当前用户
const currentUserId = computed(() => userStore.userInfo?.id)
const currentUserRole = computed(() => userStore.userInfo?.role)

// 权限计算
const canDelete = computed(() => {
  if (!post.value || !currentUserId.value) return false
  if (currentUserRole.value === 'admin') return true
  if (post.value.userId === currentUserId.value) return true
  return (post.value.moderatorIds || []).includes(currentUserId.value)
})

const canManagePerms = computed(() => {
  if (!post.value || !currentUserId.value) return false
  if (currentUserRole.value === 'admin') return true
  return (post.value.moderatorIds || []).includes(currentUserId.value)
})

// 折叠状态管理
const allCommentsCollapsed = ref(false) // 默认展开
const collapsedReplies = reactive({})

const toggleCommentReplies = (commentId) => {
  collapsedReplies[commentId] = !collapsedReplies[commentId]
}

const isRepliesCollapsed = (commentId) => {
  return collapsedReplies[commentId] === true
}

// 加载帖子详情
const loadPost = async () => {
  try {
    post.value = await getPostDetail(slug, postId)
  } catch (err) {
    console.error(err)
  }
}

// 加载评论（分页）
const loadComments = async (page = 1) => {
  try {
    const res = await getComments(slug, postId, page)
    comments.value = res.data
    totalComments.value = res.total
    commentCurrentPage.value = res.page
    commentTotalPages.value = res.totalPages

    // 为每条评论加载第一页回复
    comments.value.forEach(comment => {
      loadReplies(comment, 1)
    })
  } catch (err) {
    console.error(err)
  }
}

// 加载某评论的回复
const loadReplies = async (comment, page = 1) => {
  try {
    const res = await getReplies(comment.id, page)
    // 构建二级嵌套（扁平化为最多二级）
    const replyTree = buildReplyTree(res.data)
    comment.replies = replyTree
    comment.replyCurrentPage = page
    comment.replyTotalPages = res.totalPages
    comment.replyTotalCount = res.total
  } catch (err) {
    console.error(err)
  }
}

// 扁平回复转二级嵌套（深度限制为1，即最多一级回复和二级回复）
const buildReplyTree = (flatReplies) => {
  const map = {}
  const roots = [] // 一级回复

  flatReplies.forEach(r => {
    r.children = []
    r.depth = 0
    map[r.id] = r
  })

  flatReplies.forEach(r => {
    if (r.parentReplyId && map[r.parentReplyId]) {
      const parent = map[r.parentReplyId]
      if (parent.depth === 0) {
        // 父是一级回复，当前回复为二级
        r.depth = 1
        parent.children.push(r)
      } else {
        // 父已经是二级回复，找到它所属的一级回复，将当前回复也作为该一级回复的二级回复
        let ancestor = parent
        while (ancestor.depth !== 0) {
          // 根据 parentReplyId 向上查找一级回复
          if (ancestor.parentReplyId && map[ancestor.parentReplyId]) {
            ancestor = map[ancestor.parentReplyId]
          } else {
            break
          }
        }
        if (ancestor.depth === 0) {
          r.depth = 1
          ancestor.children.push(r)
        } else {
          // 找不到一级回复，直接作为一级回复
          r.depth = 0
          roots.push(r)
        }
      }
    } else {
      // 无父回复或父回复不存在，直接作为一级回复
      r.depth = 0
      roots.push(r)
    }
  })

  // 一级回复按时间排序
  roots.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  // 展平为渲染列表，每个一级回复后紧跟其二级回复（按时间排序）
  const result = []
  roots.forEach(root => {
    result.push(root)
    if (root.children.length > 0) {
      root.children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      root.children.forEach(child => {
        child.depth = 1
        result.push(child)
      })
    }
  })

  return result
}

// 打开回复弹窗
const openReplyDialog = (commentId, replyToUserId, replyToUsername, parentReplyId = null) => {
  replyDialog.visible = true
  replyDialog.commentId = commentId
  replyDialog.replyToUserId = replyToUserId
  replyDialog.replyToUsername = replyToUsername
  replyDialog.parentReplyId = parentReplyId
  replyDialog.placeholder = `回复 @${replyToUsername} ...`
  replyContent.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) return
  try {
    await addReply(replyDialog.commentId, {
      content: replyContent.value,
      replyToUserId: replyDialog.replyToUserId,
      parentReplyId: replyDialog.parentReplyId
    })
    replyDialog.visible = false
    const comment = comments.value.find(c => c.id === replyDialog.commentId)
    if (comment) {
      loadReplies(comment, comment.replyCurrentPage || 1)
    }
  } catch (err) {
    alert('回复失败')
  }
}

// 提交新评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  try {
    await addComment(slug, postId, newComment.value)
    newComment.value = ''
    loadComments(1)
  } catch (err) {
    alert('评论失败')
  }
}

// ---------- 删除功能 ----------

// 评论删除权限：作者 / 管理员 / 版主
const canDeleteComment = (comment) => {
  const userId = currentUserId.value
  if (!userId) return false
  if (currentUserRole.value === 'admin') return true
  if (comment.userId === userId) return true
  return (post.value?.moderatorIds || []).includes(userId)
}

// 回复删除权限：与评论相同
const canDeleteReply = (reply) => {
  return canDeleteComment(reply)
}

const deleteThisComment = async (commentId) => {
  if (confirm('确定删除该评论及其所有回复？')) {
    try {
      await deleteComment(slug, commentId)
      loadComments(commentCurrentPage.value)
    } catch (err) {
      alert('删除失败')
    }
  }
}

const deleteThisReply = async (replyId, commentId) => {
  if (confirm('确定删除该回复？')) {
    try {
      await deleteReply(slug, replyId)
      const comment = comments.value.find(c => c.id === commentId)
      if (comment) {
        loadReplies(comment, comment.replyCurrentPage || 1)
      }
    } catch (err) {
      alert('删除失败')
    }
  }
}

// 删除帖子（原有逻辑）
const deleteThisPost = async () => {
  if (confirm('确定删除？')) {
    try {
      await deletePost(slug, postId)
      router.push(`/forum/${slug}`)
    } catch (err) {
      alert('删除失败')
    }
  }
}

// 修改权限
const togglePerm = async (field, event) => {
  const newValue = event.target.checked
  if (field === 'can_browse') post.value.canBrowse = newValue
  else if (field === 'can_reply') post.value.canReply = newValue
  try {
    await updatePostPermission(slug, postId, field, newValue ? 1 : 0)
  } catch (err) {
    if (field === 'can_browse') post.value.canBrowse = !newValue
    else if (field === 'can_reply') post.value.canReply = !newValue
    alert('权限更新失败')
  }
}

// 工具函数
const getAvatar = (url) => url ? `${API_BASE}/${url.replace(/^\//, '')}` : defaultAvatar
const isExternal = (item) => item.role === 'external'
const displayDept = (item) => {
  if (item.role === 'external' || item.department === 'none') return '外部人员'
  const map = { art: '艺术部', mech: '机械部', soft: '软件部' }
  return map[item.department] || item.department
}
const usernameClass = (item) => {
  if (item.role === 'admin') return 'username-admin'
  if (post.value?.moderatorIds?.includes(item.userId)) return 'username-moderator'
  return ''
}
const formatDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

const handleCommentPageChange = (page) => {
  loadComments(page)
}

onMounted(() => {
  loadPost().then(() => {
    if (post.value) loadComments()
  })
})
</script>

<style scoped>
.post-single {
  max-width: 860px;
  margin: 20px auto;
  padding: 28px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  border: 1px solid #eef3f0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.author-line {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.9rem;
  color: #5a7070;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eef3f0;
}

.username-admin { color: purple !important; font-weight: 600; }
.username-moderator { color: red !important; font-weight: 600; }

.content {
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 28px;
  word-break: break-word;
}

.content a { color: #42b983; text-decoration: underline; }

/* ---- 管理栏样式 ---- */
.manage-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: #f9fdfb;
  border: 1px solid rgba(66, 185, 131, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
}

.manage-bar button {
  padding: 6px 18px;
  border-radius: 20px;
  border: 1px solid #ffcccc;
  background: #fff4f4;
  color: #c0392b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.manage-bar button:hover {
  background: #c0392b;
  color: white;
  border-color: #c0392b;
}

.manage-bar label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #2c3e50;
  cursor: pointer;
}

.manage-bar input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #42b983;
  cursor: pointer;
}

hr {
  border: none;
  border-top: 2px solid #f0f3f0;
  margin: 28px 0;
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 18px;
}

.reply {
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #f9fcfb;
  border-radius: 12px;
  border: 1px solid #eef3f0;
}

.reply-header {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.reply-content {
  font-size: 0.95rem;
  line-height: 1.7;
}

.reply-content a { color: #42b983; }

.reply-form {
  margin-top: 20px;
}

.reply-submit-btn {
  margin-top: 12px;
  padding: 8px 22px;
  border-radius: 24px;
  background: #42b983;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.reply-submit-btn:hover {
  background: #359b6e;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-disabled-hint {
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 500;
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
.avatar-medium {
  width: 32px;
  height: 32px;
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
/* Markdown 语法速查面板 */
.markdown-help {
  margin-top: 18px;
  background: #f9fdfb;
  border: 1px solid rgba(66, 185, 131, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.markdown-help[open] {
  background: #ffffff;
  border-color: rgba(66, 185, 131, 0.35);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.06);
}

.markdown-help summary {
  padding: 12px 18px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #2c7a5c;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.markdown-help summary::-webkit-details-marker {
  display: none;
}

.markdown-help summary::before {
  content: '▶';
  font-size: 0.7rem;
  transition: transform 0.2s;
  display: inline-block;
  width: 14px;
  text-align: center;
}

.markdown-help[open] summary::before {
  transform: rotate(90deg);
}

.help-content {
  padding: 0 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f6f3;
}

.help-item:last-child {
  border-bottom: none;
}

.help-desc {
  flex: 1;
  font-size: 0.9rem;
  color: #4a5b6b;
  line-height: 1.5;
}

.help-desc strong {
  color: #2c3e50;
}

.help-desc code {
  background: #edf5f1;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #2c7a5c;
}

.help-syntax {
  flex-shrink: 0;
}

.help-syntax code {
  display: inline-block;
  background: #f4f8f6;
  border: 1px solid #dfece4;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #1e2b39;
  white-space: nowrap;
}

.help-tip {
  font-size: 0.85rem;
  color: #6f8a7c;
  margin: 6px 0 0;
  text-align: center;
}

.lang-help {
  margin-top: 6px;
  background: #fafdfb;
  border: 1px solid #dfece4;
  border-radius: 8px;
  padding: 4px 10px;
}

.lang-help summary {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c7a5c;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.lang-help summary::-webkit-details-marker {
  display: none;
}

.lang-help summary::before {
  content: '▸';
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.lang-help[open] summary::before {
  transform: rotate(90deg);
}

.lang-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 4px 16px;
  font-size: 0.85rem;
  color: #4a5b6b;
  margin-top: 6px;
}

.lang-grid code {
  background: #edf5f1;
  padding: 0 4px;
  border-radius: 3px;
  color: #2c7a5c;
  font-size: 0.8rem;
}

.lang-tip {
  font-size: 0.82rem;
  color: #c0392b;
  margin-top: 8px;
}
/* 外部手册链接区域 */
.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.external-links a {
  font-size: 0.9rem;
  color: #2c7a5c;
  background: #f4faf7;
  border: 1px solid rgba(66, 185, 131, 0.2);
  border-radius: 20px;
  padding: 4px 14px;
  text-decoration: none;
  transition: 0.2s;
}

.external-links a:hover {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}
/* 新增 */
.reply-btn {
  background: none;
  border: 1px solid #d0ddd5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 8px;
  margin-left: 8px;
}
.reply-btn:hover { background: #f0f0f0; }
.replies-container { margin-top: 10px; padding-left: 16px; border-left: 2px solid #eef3f0; }
.reply-item { margin-bottom: 8px; }
.reply-to { color: #2c7a5c; font-weight: 500; margin-right: 4px; }
.submit-btn { margin-top: 12px; padding: 8px 22px; border-radius: 24px; background: #42b983; color: white; border: none; font-weight: 600; cursor: pointer; }
.comment-form { margin-top: 24px; }
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex; justify-content: center; align-items: center; z-index: 100;
}
.modal-card {
  background: white; padding: 24px; border-radius: 16px;
  width: 90%; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
.btn { padding: 6px 16px; border-radius: 20px; border: none; font-weight: 600; cursor: pointer; }
.btn-primary { background: #42b983; color: white; }
.btn-cancel { background: #eee; color: #666; }

.toggle-btn {
  background: none;
  border: 1px solid #d0ddd5;
  border-radius: 16px;
  padding: 4px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #2c7a5c;
  transition: 0.2s;
}
.toggle-btn:hover {
  background: #f4faf7;
  border-color: #42b983;
}
.toggle-btn.small {
  font-size: 0.8rem;
  padding: 2px 10px;
}
.comments-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}
.replies-toggle {
  margin-top: 8px;
}

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
</style>