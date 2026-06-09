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
.user-profile {
  max-width: 860px;
  margin: 0 auto 60px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.cover-section {
  height: 200px;
  position: relative;
  cursor: pointer;
  transition: opacity 0.3s;
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
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.info-header {
  display: flex;
  align-items: flex-start;
  padding: 20px 24px 24px;
  background: #fff;
  margin-top: -50px; /* 头像上移，覆盖背景 */
  position: relative;
  z-index: 2;
}

.avatar-wrapper {
  flex-shrink: 0;
  margin-right: 20px;
  position: relative;
  cursor: pointer;
}
.avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid #fff;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.avatar-upload-hint {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}
.avatar-wrapper:hover .avatar-upload-hint {
  opacity: 1;
}

.basic-info {
  flex: 1;
}

.name-line {
  margin-bottom: 8px;
}
.display-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e2b39;
}
.admin-name {
  color: purple !important;
}
.previous-name {
  margin-left: 12px;
  font-size: 0.85rem;
  color: #888;
}

.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.9rem;
}
.role-badge {
  background: #42b983;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}
.role-external { background: #999; }
.role-admin { background: purple; }
.dept-badge {
  background: #f0f6f3;
  color: #2c7a5c;
  padding: 2px 10px;
  border-radius: 12px;
}

.bio-block {
  color: #4a5b6b;
  line-height: 1.6;
  margin-top: 8px;
}

.bio-edit textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  border: 1px solid #d9e5df;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
}

/* 按钮样式 */
.profile-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;   /* 将按钮推到右侧 */
  flex-wrap: wrap;
}
.btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
}
.btn-primary {
  background: #42b983;
  color: white;
}
.btn-primary:hover { background: #359b6e; }
.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
.btn-cancel {
  background: #eee;
  color: #666;
}

/* 联系方式 */
.section {
  padding: 20px 24px;
  border-top: 1px solid #f0f3f0;
}
.section h3 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: #1e2b39;
}
.contacts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f4f8f6;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}
.contact-platform {
  font-weight: 600;
  color: #2c7a5c;
}
.contact-handle {
  color: #4a5b6b;
}
.btn-remove {
  background: none;
  border: none;
  color: #c0392b;
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px;
}
.btn-add-contact {
  background: none;
  border: 1px dashed #42b983;
  color: #42b983;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

/* 最近帖子 */
.recent-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fdfb;
  border-radius: 10px;
  border: 1px solid #eef3f0;
  cursor: pointer;
  transition: 0.2s;
}
.post-item:hover {
  background: #f4faf7;
  border-color: #42b983;
}
.post-title {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}
.post-meta {
  font-size: 0.8rem;
  color: #888;
  margin-left: 16px;
  white-space: nowrap;
}

/* 密码弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.modal-card h4 {
  margin-bottom: 16px;
}
.modal-card input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.error-msg { color: #c0392b; font-size: 0.9rem; margin-top: 8px; }

.empty-hint {
  color: #999;
  font-size: 0.9rem;
  padding: 16px 0;
  text-align: center;
}
.loading-state {
  text-align: center;
  padding: 60px;
  color: #aaa;
}

/* ---- 时间信息样式 ---- */
.time-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: auto;   /* 向右推，覆盖按钮容器内的默认值，也可直接应用于所有.time-info */
}
.reg-time {
  color: #888;
  font-size: 0.85rem;
}
.last-active {
  color: #888;
  font-size: 0.85rem;
}

/* 自己查看时的按钮与时间包装容器（保持原有逻辑） */
.actions-time-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: auto;   /* 确保靠右 */
}
</style>