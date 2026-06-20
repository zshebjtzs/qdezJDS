<!-- src/components/layout/userInfo.vue -->
<template>
  <div class="user-profile" v-if="user">
    <!-- 背景图区域 -->
    <div class="cover-section" :style="coverStyle" @click="isSelf && triggerCoverUpload()">
      <div v-if="isSelf" class="cover-upload-hint">点击更换背景</div>
      <input type="file" ref="coverInput" style="display:none" accept="image/*" @change="handleCoverUpload" />
    </div>

    <!-- 头像及基本信息 -->
    <div class="info-header">
      <div class="avatar-wrapper" @click="isSelf && triggerAvatarUpload()">
        <img :src="avatarDisplaySrc" alt="头像" class="avatar-large" @error="handleAvatarError" />
        <div v-if="isSelf" class="avatar-upload-hint">更换头像</div>
        <input type="file" ref="avatarInput" style="display:none" accept="image/*" @change="handleAvatarUpload" />
      </div>

      <div class="basic-info">
        <div class="name-line">
          <span class="display-name" :class="{ 'admin-name': user.role === 'admin' }">
            {{ user.username }}
          </span>
          <span v-if="user.previous_username" class="previous-name">曾用名：{{ user.previous_username }}</span>
        </div>
        <div class="meta-line">
          <span class="role-badge" :class="'role-' + user.role">{{ roleText }}</span>
          <span class="dept-badge" v-if="user.department !== 'none'">{{ deptText }}</span>
        </div>
        <div class="bio-block" v-if="!isSelf || !editing">
          {{ user.bio || '这个人很懒，什么都没写...' }}
        </div>
        <div v-if="isSelf && editing" class="bio-edit">
          <textarea v-model="editForm.bio" placeholder="介绍一下自己..."></textarea>
        </div>
      </div>

      <!-- 自己查看时：按钮 + 时间信息 -->
      <div class="actions-time-wrapper" v-if="isSelf">
        <div class="profile-actions">
          <button v-if="!editing" class="btn btn-primary" @click="startEdit">编辑资料</button>
          <button v-if="editing" class="btn btn-primary" @click="saveProfile">保存</button>
          <button v-if="editing" class="btn btn-cancel" @click="cancelEdit">取消</button>
          <button class="btn btn-secondary" @click="showPasswordModal = true">修改密码</button>
        </div>
        <div class="time-info">
          <span class="reg-time">注册于 {{ formatDate(user.created_at) }}</span>
          <span class="last-active">
            最近在线：{{ user.last_active_at ? formatDateTime(user.last_active_at) : '暂无记录' }}
          </span>
        </div>
      </div>

      <!-- 他人查看时：时间信息直接放在右侧，与基本信息同行（垂直排列，右对齐） -->
      <div v-if="!isSelf" class="time-info">
        <span class="reg-time">注册于 {{ formatDate(user.created_at) }}</span>
        <span class="last-active">
          最近在线：{{ user.last_active_at ? formatDateTime(user.last_active_at) : '暂无记录' }}
        </span>
      </div>
    </div>

    <!-- 联系方式区域 -->
    <div class="section">
      <h3>联系方式</h3>
      <div class="contacts-list">
        <div
          v-for="(item, index) in (editing ? editForm.contacts : user.contacts)"
          :key="index"
          class="contact-item"
          @click="editing && openContactEdit(index)"
        >
          <span class="contact-platform">{{ item.platform || '未设置' }}:</span>
          <span class="contact-handle">{{ item.handle || '未设置' }}</span>
          <button v-if="isSelf && editing" class="btn-remove" @click.stop="removeContact(index)">×</button>
        </div>
        <button v-if="isSelf && editing" class="btn-add-contact" @click="openContactEdit(null)">+ 新增联系方式</button>
        <div v-if="(!user.contacts || user.contacts.length === 0) && !editing" class="empty-hint">暂无联系方式</div>
      </div>
    </div>

    <!-- 最近发帖 -->
    <div class="section">
      <h3>最近发帖</h3>
      <div class="recent-posts">
        <div v-for="post in recentPosts" :key="post.id" class="post-item" @click="goToPost(post)">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-meta">{{ post.replyCount }}回复 · {{ post.viewCount }}浏览</span>
        </div>
        <div v-if="recentPosts.length === 0" class="empty-hint">暂无帖子</div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal-card">
        <h4>修改密码</h4>
        <input v-model="passwordForm.oldPassword" type="password" placeholder="旧密码" />
        <input v-model="passwordForm.newPassword" type="password" placeholder="新密码" />
        <div class="modal-actions">
          <button class="btn btn-primary" @click="submitPassword">确认</button>
          <button class="btn btn-cancel" @click="showPasswordModal = false">取消</button>
        </div>
        <p v-if="passwordError" class="error-msg">{{ passwordError }}</p>
      </div>
    </div>

    <!-- 联系方式编辑弹窗 -->
    <div v-if="contactModalVisible" class="modal-overlay">
      <div class="modal-card">
        <h4>{{ editingContactIndex !== null ? '编辑联系方式' : '新增联系方式' }}</h4>
        <input v-model="editingContact.platform" placeholder="平台（如微信、QQ）" />
        <input v-model="editingContact.handle" placeholder="账号" />
        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveContact">保存</button>
          <button class="btn btn-cancel" @click="cancelContactEdit">取消</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">加载中...</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore, API_BASE } from '@/stores/user'
import request from '@/api/request'
import defaultAvatar from '@/assets/images/default-avatar.png'
import { validatePasswordStrength } from '@/utils/passwordValidator.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isSelf = computed(() => userStore.userInfo?.uid === route.params.uid)

// 用户数据
const user = ref(null)
const editing = ref(false)
const editForm = ref({
  real_name: '',
  bio: '',
  theme_color: '',
  contacts: []
})
const originalProfile = ref(null)

// 最近发帖
const recentPosts = ref([])

// 密码修改
const showPasswordModal = ref(false)
const passwordForm = ref({ oldPassword: '', newPassword: '' })
const passwordError = ref('')

// 文件上传 ref
const avatarInput = ref(null)
const coverInput = ref(null)

// ---------- 联系方式编辑弹窗状态 ----------
const contactModalVisible = ref(false)
const editingContactIndex = ref(null)       // null 表示新增，数字表示编辑已有项
const editingContact = ref({ platform: '', handle: '' })

// 角色与部门映射
const roleText = computed(() => {
  const map = { admin: '管理员', internal: '内部成员', external: '外部成员' }
  return map[user.value?.role] || ''
})
const deptText = computed(() => {
  const map = { art: '艺术部', mech: '机械部', soft: '软件部' }
  return map[user.value?.department] || ''
})

// 辅助函数：将相对路径转为完整后端 URL
const getFullUrl = (url, timestamp = false) => {
  if (!url) return ''
  const cleanUrl = url.replace(/^\//, '')
  let fullUrl = `${API_BASE}/${cleanUrl}`
  if (timestamp) fullUrl += `?t=${Date.now()}`
  return fullUrl
}

// 头像显示 src（带时间戳）
const avatarDisplaySrc = computed(() => {
  if (user.value?.avatar_url) {
    const ts = user.value._ts || Date.now()
    return getFullUrl(user.value.avatar_url) + '?t=' + ts
  }
  return defaultAvatar
})

// 背景样式
const coverStyle = computed(() => {
  const coverUrl = user.value?.cover_url
  if (coverUrl) {
    const fullUrl = getFullUrl(coverUrl) + '?t=' + (user.value._cover_ts || Date.now())
    return {
      backgroundImage: `url(${fullUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return {
    background: 'linear-gradient(135deg, #42b983, #2c5f4a)'
  }
})

// 头像加载失败回退
const handleAvatarError = (e) => {
  if (e.target.src !== defaultAvatar) {
    e.target.src = defaultAvatar
  }
}

// 加载用户数据
const loadUser = async () => {
  const uid = route.params.uid;   // 获取当前路由参数
  user.value = null;   // 清空旧数据，立即显示加载状态
  try {
    if (isSelf.value) {
      const res = await request.get('/user/me/profile')
      user.value = res
      originalProfile.value = JSON.parse(JSON.stringify(res))
    } else {
      const res = await request.get(`/user/${uid}`)
      user.value = res
    }
    if (user.value.avatar_url) user.value._ts = Date.now()
    if (user.value.cover_url) user.value._cover_ts = Date.now()
    const postRes = await request.get(`/user/${uid}/posts`, { params: { limit: 4 } })
    recentPosts.value = postRes
  } catch (err) {
    console.error('加载用户信息失败', err)
  }
}

// 开始编辑
const startEdit = () => {
  editing.value = true
  editForm.value = {
    real_name: user.value.real_name || '',
    bio: user.value.bio || '',
    theme_color: user.value.theme_color || '',
    contacts: user.value.contacts ? JSON.parse(JSON.stringify(user.value.contacts)) : []
  }
}

// 取消编辑
const cancelEdit = () => {
  editing.value = false
  if (originalProfile.value) {
    // 只恢复可能被编辑的字段，不动头像和背景等其他数据
    user.value.real_name = originalProfile.value.real_name || ''
    user.value.bio = originalProfile.value.bio || ''
    user.value.theme_color = originalProfile.value.theme_color || ''
    user.value.contacts = originalProfile.value.contacts ? JSON.parse(JSON.stringify(originalProfile.value.contacts)) : []
  }
}

// 保存资料（仅提交修改过的字段）
const saveProfile = async () => {
  try {
    const payload = {}
    const old = originalProfile.value

    if (editForm.value.real_name !== (old.real_name || '')) {
      payload.real_name = editForm.value.real_name
    }
    if (editForm.value.bio !== (old.bio || '')) {
      payload.bio = editForm.value.bio
    }
    if (editForm.value.theme_color !== (old.theme_color || '')) {
      payload.theme_color = editForm.value.theme_color
    }
    if (JSON.stringify(editForm.value.contacts) !== JSON.stringify(old.contacts || [])) {
      payload.contacts = editForm.value.contacts
    }

    if (Object.keys(payload).length === 0) {
      alert('没有修改任何信息')
      editing.value = false
      return
    }

    await request.patch('/user/me/profile', payload)

    // 本地同步更新
    for (const key of Object.keys(payload)) {
      user.value[key] = payload[key]
    }
    originalProfile.value = JSON.parse(JSON.stringify(user.value))
    editing.value = false
  } catch (err) {
    alert('保存失败：' + (err.response?.data?.error || err.message))
  }
}

// ---------- 联系方式编辑弹窗操作 ----------
const openContactEdit = (index) => {
  if (index !== null) {
    // 编辑已有项
    const item = editForm.value.contacts[index]
    editingContact.value = { platform: item.platform || '', handle: item.handle || '' }
    editingContactIndex.value = index
  } else {
    // 新增
    editingContact.value = { platform: '', handle: '' }
    editingContactIndex.value = null
  }
  contactModalVisible.value = true
}

const saveContact = () => {
  const item = { ...editingContact.value }
  if (editingContactIndex.value !== null) {
    // 修改已有项
    editForm.value.contacts[editingContactIndex.value] = item
  } else {
    // 追加新项
    editForm.value.contacts.push(item)
  }
  contactModalVisible.value = false
}

const cancelContactEdit = () => {
  contactModalVisible.value = false
}

// 删除联系方式（直接在列表操作，不需要弹窗）
const removeContact = (index) => {
  editForm.value.contacts.splice(index, 1)
}

// 密码修改
const submitPassword = async () => {
  try {
    passwordError.value = ''
    if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
      passwordError.value = '请填写所有密码字段'
      return
    }

    const strength = validatePasswordStrength(passwordForm.value.newPassword)
    if (!strength.valid) {
      passwordError.value = strength.message
      return
    }

    await request.patch('/user/me/password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    alert('密码修改成功')
    showPasswordModal.value = false
    passwordForm.value = { oldPassword: '', newPassword: '' }
  } catch (err) {
    passwordError.value = err.response?.data?.error || '修改失败'
  }
}

// 头像上传
const triggerAvatarUpload = () => { avatarInput.value.click() }
const handleAvatarUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('avatar', file)
  try {
    const res = await request.post('/user/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    user.value.avatar_url = res.avatar_url
    user.value._ts = Date.now()
    userStore.setUserInfo({ ...userStore.userInfo, avatar_url: res.avatar_url })
    userStore.updateAvatarTimestamp()
    e.target.value = ''
  } catch (err) {
    alert('头像上传失败')
  }
}

// 背景上传
const triggerCoverUpload = () => { coverInput.value.click() }
const handleCoverUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('cover', file)
  try {
    const res = await request.post('/user/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    user.value.cover_url = res.cover_url
    user.value._cover_ts = Date.now()
    e.target.value = ''
  } catch (err) {
    alert('背景上传失败')
  }
}

const goToPost = (post) => {
  if (!post.categorySlug) return;
  const routeData = router.resolve({
    name: 'PostSingle',
    params: { slug: post.categorySlug, postId: post.id }
  });
  window.open(routeData.href, '_blank');
};

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

// 监听路由参数变化，当 uid 改变时重新加载用户信息
watch(() => route.params.uid, (newUid) => {
  if (newUid) {
    loadUser();
  }
});

onMounted(loadUser)

</script>

<style scoped>
/* =============================================
   userInfo.vue 样式（应用全局设计令牌）
   覆盖个人主页所有区域：背景、头像、资料、联系方式、
   最近帖子、弹窗、按钮、加载状态
   ============================================= */

.user-profile {
  max-width: 860px;
  margin: 0 auto 60px;
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

/* 背景图区域 */
.cover-section {
  height: 200px;
  position: relative;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.cover-section:hover .cover-upload-hint {
  opacity: 1;
}
.cover-upload-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.4);
  color: #fff;
  padding: 6px var(--space-md);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

/* 头像与基本信息头部 */
.info-header {
  display: flex;
  align-items: flex-start;
  padding: var(--space-lg) var(--space-lg) var(--space-lg);
  background: #fff;
  margin-top: -50px; /* 头像上移，覆盖背景 */
  position: relative;
  z-index: 2;
}

/* 头像区域 */
.avatar-wrapper {
  flex-shrink: 0;
  margin-right: var(--space-lg);
  position: relative;
  cursor: pointer;
}
.avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid #fff;
  object-fit: cover;
  box-shadow: var(--shadow-sm);
}
.avatar-upload-hint {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 0.75rem;
  padding: 2px var(--space-sm);
  border-radius: 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.avatar-wrapper:hover .avatar-upload-hint {
  opacity: 1;
}

/* 基本信息文本 */
.basic-info {
  flex: 1;
}

.name-line {
  margin-bottom: var(--space-sm);
}
.display-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}
.admin-name {
  color: var(--color-info) !important;
}
.previous-name {
  margin-left: var(--space-sm);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* 角色与部门标签行 */
.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-sm);
  font-size: 0.9rem;
}
.role-badge {
  background: var(--color-primary);
  color: white;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
}
.role-external { background: #999; }
.role-admin { background: var(--color-info); }
.dept-badge {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

/* 个人简介 */
.bio-block {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-top: var(--space-sm);
}

.bio-edit textarea {
  width: 100%;
  height: 80px;
  padding: var(--space-sm);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  font-family: inherit;
  resize: vertical;
}

/* 操作按钮组 */
.profile-actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
  margin-left: auto;
  flex-wrap: wrap;
}

/* 按钮复用全局 .btn 风格，但保留本地定义以确保 scoped 特异性 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px var(--space-md);
  border-radius: var(--radius-full);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 0.9rem;
}
.btn-primary {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: var(--shadow-green);
}
.btn-primary:hover { filter: brightness(1.05); }
.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
.btn-cancel {
  background: #eee;
  color: #666;
}

/* 联系方式区域 */
.section {
  padding: var(--space-lg) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
.section h3 {
  font-size: 1.2rem;
  margin-bottom: var(--space-md);
  color: var(--color-text);
}
.contacts-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary-light);
  padding: 4px var(--space-sm);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
}
.contact-platform {
  font-weight: 600;
  color: var(--color-primary);
}
.contact-handle {
  color: var(--color-text-secondary);
}
.btn-remove {
  background: none;
  border: none;
  color: var(--color-danger);
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px;
}
.btn-add-contact {
  background: none;
  border: 1px dashed var(--color-primary);
  color: var(--color-primary);
  padding: 4px var(--space-sm);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 500;
}

/* 最近帖子 */
.recent-posts {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.post-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: var(--transition-fast);
}
.post-item:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
.post-title {
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
}
.post-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-left: var(--space-md);
  white-space: nowrap;
}

/* 弹窗（修改密码、联系方式） */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-card {
  background: white;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}
.modal-card h4 {
  margin-bottom: var(--space-md);
}
.modal-card input {
  width: 100%;
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  border: 1px solid #ddd;
  border-radius: var(--radius-sm);
}
.modal-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}
.error-msg {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-top: var(--space-sm);
}

/* 空状态、加载提示 */
.empty-hint {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: var(--space-md) 0;
  text-align: center;
}
.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--color-text-muted);
}

/* 时间信息（注册时间 + 最近在线） */
.time-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.reg-time {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
.last-active {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

/* 按钮与时间信息包装容器（自己查看时） */
.actions-time-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-sm);
  margin-left: auto;
}

/* 他人查看时时间信息行 */
.time-info-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: 0 var(--space-lg) var(--space-sm);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* 响应式：小屏下头像和信息垂直排列，按钮全宽 */
@media (max-width: 768px) {
  .info-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -30px;
  }
  .avatar-wrapper {
    margin-right: 0;
    margin-bottom: var(--space-md);
  }
  .basic-info {
    width: 100%;
  }
  .profile-actions,
  .actions-time-wrapper {
    margin-left: 0;
    width: 100%;
    align-items: center;
    margin-top: var(--space-md);
  }
  .meta-line {
    justify-content: center;
  }
  .time-info {
    align-items: center;
  }
  .section {
    padding: var(--space-md);
  }
}

@media (max-width: 480px) {
  .user-profile {
    margin: 0 var(--space-xs) 40px;
  }
  .cover-section {
    height: 140px;
  }
  .avatar-large {
    width: 72px;
    height: 72px;
  }
}
</style>