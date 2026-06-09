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

    <!-- 管理控件：删除按钮 & 权限复选框 -->
    <div v-if="canDelete" class="manage-bar">
      <button @click="deleteThisPost">删除帖子</button>
      <template v-if="canManagePerms">
        <label>
          <input type="checkbox" :checked="post.canBrowse" @change="togglePerm('can_browse', $event)" /> 允许浏览
        </label>
        <label>
          <input type="checkbox" :checked="post.canReply" @change="togglePerm('can_reply', $event)" /> 允许回复
        </label>
      </template>
    </div>

    <hr />
    <h3>回复 ({{ post.replies.length }})</h3>
    <div v-for="reply in post.replies" :key="reply.id" class="reply">
      <div class="reply-header">
        <router-link :to="`/user/${reply.authorUid}`" class="author-link">
          <img :src="getAvatar(reply.authorAvatar)" class="avatar-small" />
          <span :class="usernameClass(reply)">{{ reply.username }}</span>
        </router-link>
        <span class="dept-tag" :class="{ 'external-dept': isExternal(reply) }">{{ displayDept(reply) }}</span>
        <span>{{ formatDate(reply.createdAt) }}</span>
      </div>
      <div class="reply-content" v-html="renderMarkdown(reply.content)"></div>
    </div>

    <!-- 回复区域 -->
    <div class="reply-form">
      <div v-if="canReply">
        <MarkdownEditor v-model="replyContent" placeholder="输入回复..." :height="200" />
        <button @click="submitReply" class="reply-submit-btn">回复</button>
      </div>
      <div v-else>
        <p class="reply-disabled-hint">禁止回复</p>
      </div>
    </div>
    <!-- Markdown 语法速查面板 -->
    <details class="markdown-help">
      <summary>📖 Markdown 快速入门</summary>
      <div class="help-content">
        <div class="help-item">
          <span class="help-desc"><strong>标题</strong>：文字前加 <code>#</code>，几个 <code>#</code> 代表几级标题</span>
          <span class="help-syntax"><code>## 二级标题</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>加粗</strong>：用两个星号包裹文字</span>
          <span class="help-syntax"><code>**重点内容**</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>斜体</strong>：用一个星号包裹文字</span>
          <span class="help-syntax"><code>*强调内容*</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>删除线</strong>：用两个波浪线包裹文字</span>
          <span class="help-syntax"><code>~~过时信息~~</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>链接</strong>：方括号写文字，圆括号写网址</span>
          <span class="help-syntax"><code>[百度](https://baidu.com)</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>无序列表</strong>：短横或星号加空格</span>
          <span class="help-syntax"><code>- 事项一<br>- 事项二</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>有序列表</strong>：数字加点加空格</span>
          <span class="help-syntax"><code>1. 第一步<br>2. 第二步</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>单行代码</strong>：用单个反引号包裹</span>
          <span class="help-syntax"><code>`console.log('hi')`</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>多行代码块</strong>：用三个反引号包裹，可指定语言</span>
          <div class="help-syntax">
            <code>```javascript<br>你的代码<br>```</code>
            <details class="lang-help">
              <summary>📋 支持的语言及写法</summary>
              <div class="lang-grid">
                <span>JavaScript → <code>javascript</code></span>
                <span>TypeScript → <code>typescript</code></span>
                <span>Python → <code>python</code></span>
                <span>Java → <code>java</code></span>
                <span>C++ → <code>cpp</code></span>
                <span>C → <code>c</code></span>
                <span>CSS → <code>css</code></span>
                <span>HTML → <code>html</code></span>
                <span>Shell → <code>bash</code> 或 <code>shell</code></span>
                <span>JSON → <code>json</code></span>
                <span>Markdown → <code>markdown</code></span>
              </div>
              <p class="lang-tip">⚠️ <strong>注意</strong>：C++ 必须写 <code>cpp</code>，不能写 c++。</p>
            </details>
          </div>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>引用</strong>：段落前加 <code>&gt;</code> 和空格</span>
          <span class="help-syntax"><code>&gt; 引用内容</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>换行</strong>：直接回车即可，空一行表示新段落</span>
          <span class="help-syntax"><code>无需特殊语法</code></span>
        </div>
        <p class="help-tip">💡 右侧可实时预览效果，放心尝试！</p>
      </div>
    </details>
    <!-- 外部格式手册链接 -->
    <div class="external-links">
      <a href="https://help.luogu.com.cn/rules/academic/handbook/markdown" target="_blank" rel="noopener noreferrer">
        Markdown 格式手册
      </a>
      <a href="https://help.luogu.com.cn/rules/academic/handbook/latex" target="_blank" rel="noopener noreferrer">
        LaTeX 格式手册
      </a>
      <a href="https://katex.org/docs/supported.html" target="_blank" rel="noopener noreferrer">
        KaTeX 官方文档
      </a>
    </div>
  </div>
  <div v-else class="loading-state">加载中或帖子不存在</div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPostDetail, addReply, deletePost, updatePostPermission } from '@/api/forum'
import { renderMarkdown } from '@/markdown/renderer.js'
import MarkdownEditor from '@/markdown/editor.vue'
import defaultAvatar from '@/assets/images/default-avatar.png'
import { API_BASE } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const slug = route.params.slug
const postId = route.params.postId
const post = ref(null)
const replyContent = ref('')

// 当前登录用户信息
const currentUserId = computed(() => userStore.userInfo?.id)
const currentUserRole = computed(() => userStore.userInfo?.role)

// 帖子作者 ID（兼容下划线和驼峰）
const postAuthorId = computed(() => post.value?.userId ?? post.value?.user_id)

// 版主列表（兼容可能的命名差异）
const moderatorList = computed(() => {
  return post.value?.moderatorIds || post.value?.moderator_ids || []
})

// 删除权限：管理员 / 作者本人 / 本板块版主
const canDelete = computed(() => {
  if (!post.value || !currentUserId.value) return false
  if (currentUserRole.value === 'admin') return true
  if (postAuthorId.value === currentUserId.value) return true
  return moderatorList.value.includes(currentUserId.value)
})

// 权限修改（复选框）：仅管理员或本板块版主
const canManagePerms = computed(() => {
  if (!post.value || !currentUserId.value) return false
  if (currentUserRole.value === 'admin') return true
  return moderatorList.value.includes(currentUserId.value)
})

// 回复权限：管理员/版主/作者总是可以回复，否则看帖子的 canReply 设置
const canReply = computed(() => {
  if (!post.value) return false
  if (canDelete.value || canManagePerms.value) return true
  return post.value.canReply !== false
})

// 用户名颜色
const usernameClass = (item) => {
  const itemRole = item.role
  const itemUserId = item.userId ?? item.user_id
  if (itemRole === 'admin') return 'username-admin'
  if (moderatorList.value.includes(itemUserId)) return 'username-moderator'
  return ''
}

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

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  try {
    await addReply(slug, postId, replyContent.value)
    replyContent.value = ''
    await loadPost()
  } catch (err) {
    alert('回复失败')
  }
}

const deleteThisPost = async () => {
  if (confirm('确定删除该帖子吗？')) {
    try {
      await deletePost(slug, postId)
      router.push(`/forum/${slug}`)
    } catch (err) {
      alert('删除失败')
    }
  }
}

const loadPost = async () => {
  try {
    post.value = await getPostDetail(slug, postId)
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

const getAvatar = (avatarUrl) => {
  return avatarUrl ? `${API_BASE}/${avatarUrl.replace(/^\//, '')}` : defaultAvatar
}

const isExternal = (item) => {
  return item.role === 'external'
}

const displayDept = (item) => {
  if (item.role === 'external' || item.department === 'none') return '外部人员'
  const map = { art: '艺术部', mech: '机械部', soft: '软件部' }
  return map[item.department] || item.department
}

onMounted(loadPost)
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
</style>