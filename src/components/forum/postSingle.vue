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
          <input type="checkbox" :checked="canReply" @change="togglePerm('can_reply', $event)" /> 允许评论
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
          <button v-if="canReply" class="reply-btn" @click="openReplyDialog(comment.id, comment.userId, comment.username)">回复</button>
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
              <button v-if="canReply" class="reply-btn" @click="openReplyDialog(comment.id, reply.userId, reply.username, reply.id)">回复</button>
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
    <div v-if="canReply" class="comment-form">
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
// 评论及回复权限
const isCategoryBanned = ref(false)

// 评论/回复权限：帖子允许评论 且 用户未被禁言 且 板块未被禁言
const canReply = computed(() => {
  if (!post.value) return false
  // 仅管理员或当前板块版主可绕过禁言限制
  if (
    currentUserRole.value === 'admin' ||
    (post.value.moderatorIds || []).includes(currentUserId.value)
  ) {
    return true
  }
  // 普通用户（含作者）：需帖子允许评论、未被个人禁言、板块未被禁言
  return (
    post.value.canReply !== false &&
    !userStore.bans.post &&
    !isCategoryBanned.value
  )
})

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

// 加载帖子详情后检查板块禁言
const loadPost = async () => {
  try {
    post.value = await getPostDetail(slug, postId)
    if (post.value) {
      // 获取板块禁言状态
      await userStore.fetchCategoryBan(post.value.categoryId)
      // 强制从 store 读取最新值，并使用 ?? false 兜底
      isCategoryBanned.value = userStore.categoryBans[post.value.categoryId] ?? false
      
      // 调试日志：查看实际获取的值
      /*
      console.log('板块禁言状态:', {
        categoryId: post.value.categoryId,
        isBanned: isCategoryBanned.value,
        bansPost: userStore.bans.post,
        canReply: canReply.value
      })
      */
    }
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
  if (!canReply.value) {
    alert('您已被禁言，无法评论')
    return
  }
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
  if (!canReply.value) {
    alert('您已被禁言，无法评论')
    return
  }
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

onMounted(async () => {
  await userStore.fetchBans();  // 确保最新
  await loadPost();
  if (post.value) loadComments();
})
</script>

<style scoped>
/* =============================================
   postSingle 帖子详情样式（应用全局设计令牌）
   覆盖帖子内容、评论区、管理栏、弹窗
   ============================================= */

.post-single {
  max-width: 860px;
  margin: var(--space-lg) auto;
  padding: var(--space-xl);
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 700;
}

/* ---- 作者信息行 ---- */
.author-line {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

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

.avatar-medium {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
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

/* ---- 帖子正文 ---- */
.content {
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: var(--space-xl);
  word-break: break-word;
}

.content a {
  color: var(--color-primary);
  text-decoration: underline;
}

/* ---- 管理栏（删除按钮 + 权限复选框）---- */
.manage-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  background: var(--color-primary-bg);
  border: 1px solid rgba(66, 185, 131, 0.15);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-lg);
}

.manage-bar button {
  padding: 6px 18px;
  border-radius: var(--radius-full);
  border: 1px solid #ffcccc;
  background: var(--color-danger-light);
  color: var(--color-danger);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-fast);
}

.manage-bar button:hover {
  background: var(--color-danger);
  color: #fff;
  border-color: var(--color-danger);
}

.manage-bar label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
}

.manage-bar input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* ---- 分隔线 ---- */
hr {
  border: none;
  border-top: 2px solid #f0f3f0;
  margin: var(--space-xl) 0;
}

/* ---- 评论区域标题 ---- */
.comments-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.comments-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-text);
}

/* 展开/收起按钮 */
.toggle-btn {
  background: none;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  padding: 4px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--color-primary);
  transition: var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.toggle-btn.small {
  font-size: 0.8rem;
  padding: 2px 10px;
}

/* ---- 评论区块 ---- */
.comment-block {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  flex-wrap: wrap;
}

.comment-content {
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: var(--space-sm);
}

/* ---- 回复按钮 ---- */
.reply-btn {
  background: none;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px var(--space-sm);
  transition: var(--transition-fast);
  color: var(--color-text-secondary);
}

.reply-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* ---- 嵌套回复容器 ---- */
.replies-container {
  margin-top: var(--space-sm);
  padding-left: var(--space-md);
  border-left: 2px solid var(--color-border);
}

.replies-toggle {
  margin-top: var(--space-sm);
}

.reply-item {
  margin-bottom: var(--space-sm);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.reply-content {
  font-size: 0.95rem;
  line-height: 1.7;
}

/* “回复 @用户名” 前缀 */
.reply-to {
  color: var(--color-primary);
  font-weight: 500;
  margin-right: 4px;
}

/* ---- 评论输入区 ---- */
.comment-form {
  margin-top: var(--space-lg);
}

.comment-form h3 {
  font-size: 1.2rem;
  margin-bottom: var(--space-md);
  color: var(--color-text);
}

/* 提交按钮 */
.submit-btn {
  margin-top: var(--space-sm);
  padding: var(--space-sm) 22px;
  border-radius: var(--radius-full);
  background: var(--color-primary-gradient);
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-green);
}

.submit-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* ---- 弹窗 ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-card {
  background: #fff;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  margin-top: var(--space-md);
}

/* 弹窗按钮复用全局 .btn 类 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #fff;
  box-shadow: var(--shadow-green);
}

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-cancel {
  background: #eee;
  color: #666;
}

.btn-cancel:hover {
  background: #ddd;
}

/* ---- 删除按钮 ---- */
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

/* ---- 禁止回复提示 ---- */
.reply-disabled-hint {
  color: var(--color-danger);
  font-size: 0.9rem;
  font-weight: 500;
}

/* ---- 加载与空状态 ---- */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .post-single {
    padding: var(--space-md);
    margin: var(--space-sm);
  }
  .author-line {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  .manage-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  .comment-header {
    flex-wrap: wrap;
  }
  .reply-header {
    flex-wrap: wrap;
  }
  .replies-container {
    padding-left: var(--space-sm);
  }
  .modal-card {
    width: 95%;
    padding: var(--space-md);
  }
}

@media (max-width: 480px) {
  .comments-header {
    flex-direction: column;
    gap: var(--space-sm);
  }
  .reply-item {
    margin-left: 0 !important;  /* 覆盖内联 style，小屏下不缩进 */
  }
}
</style>