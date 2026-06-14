<!-- src/components/admin/adminController.vue -->
<template>
  <div class="admin-page">
    <h2>管理员控制面板</h2>

    <!-- 用户列表区域 -->
    <section class="section">
      <h3>用户管理</h3>
      <div class="search-bar">
        <input v-model="searchText" placeholder="搜索用户名..." @keyup.enter="searchUsers" />
        <button @click="searchUsers">搜索</button>
        <button v-if="searchText" @click="clearSearch" class="clear-btn">清除</button>
      </div>
      <div v-if="loadingUsers" class="loading">加载中...</div>
      <div v-else class="user-grid">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-basic">
            <span class="username">{{ user.username }}</span>
            <span v-if="user.is_temp_banned" class="banned-mark">[已封禁]</span>
          </div>
          <button @click="openUserPanel(user)">管理</button>
        </div>
        <div v-if="users.length === 0" class="empty">暂无用户</div>
      </div>
      <Pagination :currentPage="currentPage" :totalPages="totalPages" @page-change="handlePageChange" />
    </section>

    <!-- 板块列表区域 -->
    <section class="section">
      <h3>板块禁言设置</h3>
      <div class="category-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card">
          <span>{{ cat.name }}</span>
          <button @click="openCategoryPanel(cat)">设置</button>
        </div>
      </div>
    </section>

    <!-- 用户权限弹窗 -->
    <div v-if="userPanel.visible" class="modal-overlay">
      <div class="modal-card">
        <h4>管理用户：{{ userPanel.user.username }}</h4>
        <div class="perm-section">
          <label><strong>禁止发帖：</strong></label>
          <select v-model="userPanel.postDuration">
            <option value="">不限制</option>
            <option value="1h">1小时</option>
            <option value="1d">1天</option>
            <option value="3d">3天</option>
            <option value="7d">7天</option>
            <option value="30d">1个月</option>
          </select>
          <button @click="applyBan('post')">应用</button>
          <button v-if="userPanel.user._bans?.post" @click="removeBan('post')">解禁</button>
        </div>
        <div class="perm-section">
          <label><strong>禁止网盘：</strong></label>
          <select v-model="userPanel.cloudDuration">
            <option value="">不限制</option>
            <option value="1h">1小时</option>
            <option value="1d">1天</option>
            <option value="3d">3天</option>
            <option value="7d">7天</option>
            <option value="30d">1个月</option>
          </select>
          <button @click="applyBan('cloud')">应用</button>
          <button v-if="userPanel.user._bans?.cloud" @click="removeBan('cloud')">解禁</button>
        </div>
        <div class="perm-section">
          <label><strong>封禁账号：</strong></label>
          <select v-model="userPanel.accountDuration">
            <option value="">不限制</option>
            <option value="1h">1小时</option>
            <option value="1d">1天</option>
            <option value="3d">3天</option>
            <option value="7d">7天</option>
            <option value="30d">1个月</option>
          </select>
          <button @click="applyBan('account')">应用</button>
          <button v-if="userPanel.user._bans?.account" @click="removeBan('account')">解禁</button>
        </div>
        <div class="perm-section">
          <label><strong>授予版主：</strong></label>
          <select v-model="userPanel.modCategoryId">
            <option :value="null">选择板块</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <button @click="grantMod">授予</button>
          <button @click="revokeMod">撤销</button>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="userPanel.visible = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 板块封禁弹窗 -->
    <div v-if="categoryPanel.visible" class="modal-overlay">
      <div class="modal-card">
        <h4>板块：{{ categoryPanel.category.name }}</h4>
        <p>当前全站禁止发帖状态：<span v-if="categoryPanel.isBanned">已禁止</span><span v-else>正常</span></p>
        <button v-if="!categoryPanel.isBanned" @click="banCategory">禁止发帖</button>
        <button v-else @click="unbanCategory">解除禁止</button>
        <button class="btn-cancel" @click="categoryPanel.visible = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/api/request'
import Pagination from '@/components/common/Pagination.vue'

const route = useRoute()
const userStore = useUserStore()

// 权限检查：必须是管理员且 uid 匹配
const adminUid = route.params.adminUid
if (userStore.userInfo?.role !== 'admin' || userStore.userInfo.uid !== adminUid) {
  // 可以在这里跳转或显示禁止
  // 简单起见，在模板里显示无权访问
}

// 用户列表
const users = ref([])
const loadingUsers = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const searchText = ref('')
const currentSearch = ref('')

const fetchUsers = async (page = 1) => {
  loadingUsers.value = true
  try {
    const params = { page, pageSize: 20 }
    if (currentSearch.value) params.q = currentSearch.value
    const res = await request.get('/admin/users', { params })
    users.value = res.data
    currentPage.value = res.page
    totalPages.value = res.totalPages
  } catch (err) {
    console.error(err)
  } finally {
    loadingUsers.value = false
  }
}

const searchUsers = () => {
  currentSearch.value = searchText.value.trim()
  fetchUsers(1)
}
const clearSearch = () => {
  searchText.value = ''
  currentSearch.value = ''
  fetchUsers(1)
}
const handlePageChange = (page) => fetchUsers(page)

// 板块列表
const categories = ref([])
const fetchCategories = async () => {
  try {
    const res = await request.get('/admin/categories')
    categories.value = res
  } catch (err) { console.error(err) }
}

// 用户弹窗
const userPanel = reactive({
  visible: false,
  user: { username: '', _bans: {} },
  postDuration: '',
  cloudDuration: '',
  accountDuration: '',
  modCategoryId: null
})

const openUserPanel = (user) => {
  userPanel.user = user
  userPanel.postDuration = user._bans?.post ? 'forever' : ''
  userPanel.cloudDuration = user._bans?.cloud ? 'forever' : ''
  userPanel.accountDuration = user._bans?.account ? 'forever' : ''
  userPanel.modCategoryId = null
  userPanel.visible = true
}

const applyBan = async (type) => {
  const durationMap = {
    post: userPanel.postDuration,
    cloud: userPanel.cloudDuration,
    account: userPanel.accountDuration
  }
  let duration = durationMap[type]
  if (!duration || duration === '') duration = null // 空字符串转为 null 表示不限期
  try {
    await request.post('/admin/ban', {
      userId: userPanel.user.id,
      type,
      duration
    })
    alert('操作成功')
    userPanel.visible = false
    fetchUsers(currentPage.value)
  } catch (err) { alert('操作失败') }
}

const removeBan = async (type) => {
  try {
    await request.post('/admin/unban', { userId: userPanel.user.id, type })
    alert('解禁成功')
    userPanel.visible = false
    fetchUsers(currentPage.value)
  } catch (err) { alert('操作失败') }
}

const grantMod = async () => {
  if (!userPanel.modCategoryId) return
  try {
    await request.post('/admin/grant-mod', { userId: userPanel.user.id, categoryId: userPanel.modCategoryId })
    alert('授予成功')
    userPanel.visible = false
  } catch (err) { alert('操作失败') }
}

const revokeMod = async () => {
  if (!userPanel.modCategoryId) return
  try {
    await request.post('/admin/revoke-mod', { userId: userPanel.user.id, categoryId: userPanel.modCategoryId })
    alert('撤销成功')
    userPanel.visible = false
  } catch (err) { alert('操作失败') }
}

// 板块封禁弹窗
const categoryPanel = reactive({
  visible: false,
  category: null,
  isBanned: false
})
const openCategoryPanel = (cat) => {
  // 需要查询该板块是否已全站禁止发帖，暂不实现，直接假设未禁止
  // 实际上应通过 bans 表查询，这里简化处理，预留
  categoryPanel.category = cat
  categoryPanel.isBanned = false // 需要后端查询
  categoryPanel.visible = true
}
const banCategory = async () => {
  // 对板块全站禁止发帖，type=post, categoryId=板块id, 永久
  try {
    await request.post('/admin/ban', { userId: null, type: 'post', categoryId: categoryPanel.category.id, duration: null })
    alert('全站禁止发帖已生效')
    categoryPanel.visible = false
  } catch (err) { alert('操作失败') }
}
const unbanCategory = async () => {
  // 解除板块禁止发帖
  try {
    // 解除需要知道具体记录，这里简化，直接删除对应 bans 记录
    // 可以增加接口
    alert('解除功能暂未实现')
  } catch (err) { alert('操作失败') }
}

onMounted(() => {
  fetchUsers()
  fetchCategories()
})
</script>

<style scoped>
.admin-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  border-left: 6px solid #42b983;
  padding-left: 16px;
  color: #1e2b39;
}

.section {
  margin-bottom: 40px;
}

.section h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1e2b39;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.search-bar input {
  flex: 1;
  max-width: 300px;
  padding: 8px 14px;
  border: 1px solid #d9e5df;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
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
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
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

.clear-btn:hover {
  background: #fff4f4;
  border-color: #c0392b;
  color: #c0392b;
}

/* 用户网格 */
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px solid #eef3f0;
  border-radius: 14px;
  padding: 16px 12px;
  background: #fff;
  transition: box-shadow 0.2s;
}

.user-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.user-basic {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.username {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}

.banned-mark {
  font-size: 0.8rem;
  color: #c0392b;
  background: #fff4f4;
  padding: 2px 8px;
  border-radius: 10px;
}

.user-card button {
  padding: 6px 16px;
  border-radius: 18px;
  border: 1px solid #d0ddd5;
  background: #fff;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card button:hover {
  background: #f4faf7;
  border-color: #42b983;
  color: #42b983;
}

/* 板块卡片 */
.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f9fdfb;
  border: 1px solid rgba(66, 185, 131, 0.15);
  border-radius: 12px;
  min-width: 200px;
  flex: 1;
}

.category-card span {
  font-weight: 600;
  color: #1e2b39;
}

.category-card button {
  padding: 4px 14px;
  border-radius: 16px;
  border: 1px solid #d0ddd5;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: #2c3e50;
  transition: all 0.2s;
}

.category-card button:hover {
  border-color: #42b983;
  color: #42b983;
  background: #f4faf7;
}

/* 弹窗通用 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-card {
  background: white;
  padding: 28px;
  border-radius: 18px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.modal-card h4 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1e2b39;
}

/* 权限设置区域 */
.perm-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.perm-section label {
  min-width: 90px;
  font-size: 0.9rem;
}

.perm-section select {
  padding: 6px 12px;
  border: 1px solid #d9e5df;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: #fff;
}

.perm-section button {
  padding: 4px 14px;
  border-radius: 16px;
  border: 1px solid #d0ddd5;
  background: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.perm-section button:hover {
  background: #f4faf7;
  border-color: #42b983;
  color: #42b983;
}

/* 弹窗底部按钮 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #d0ddd5;
  background: #f5f5f5;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

/* 加载与空状态 */
.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 0.95rem;
}
</style>