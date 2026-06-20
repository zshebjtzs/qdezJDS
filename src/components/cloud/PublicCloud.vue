<!-- src/components/cloud/PublicCloud.vue -->
<template>
  <div class="public-cloud">
    <div class="header">
      <!-- 第一行：标题 + 部门按钮 + 上传 -->
      <div class="header-main">
        <h3>公共网盘</h3>
        <div class="dept-buttons">
          <button
            v-for="dept in departments"
            :key="dept.value"
            :class="{ active: currentDept === dept.value }"
            @click="switchDept(dept.value)"
          >
            {{ dept.label }}
          </button>
        </div>
        <div class="upload-section">
          <button v-if="canUpload" @click="triggerUpload">上传文件</button>
          <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" />
        </div>
      </div>
      <!-- 第二行：刷新按钮 + 搜索框 -->
      <div class="header-controls">
        <button class="refresh-btn" @click="refreshCurrentDepartment" :disabled="refreshing">
          {{ refreshing ? '刷新中...' : '刷新' }}
        </button>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索文件名..."
          @blur="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- 搜索结果标题 -->
    <div v-if="searchQuery" class="search-title">搜索结果</div>

    <!-- 文件列表（使用过滤后的数据） -->
    <div v-if="publicLoading" class="loading">加载中...</div>
    <div v-else class="file-list">
      <div v-for="file in displayedFiles" :key="file.id" class="file-item">
        <div class="file-info">
          <span class="file-name">{{ file.original_name }}</span>
          <span class="file-size">{{ formatSize(file.file_size) }}</span>
          <span class="file-time">{{ formatDate(file.created_at) }}</span>
          <span class="file-owner">上传者：{{ file.owner_name || '未知' }}</span>
        </div>
        <div class="file-actions">
          <button @click="handleDownload(file)">下载</button>
          <button v-if="canDelete(file)" @click="deleteFile(file.id)">删除</button>
        </div>
      </div>
      <div v-if="displayedFiles.length === 0 && searchQuery" class="empty">找不到对应的文件</div>
      <div v-else-if="displayedFiles.length === 0 && !searchQuery" class="empty">暂无文件</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCloudStore } from '@/stores/cloud'
import { downloadFile } from '@/utils/download.js'
import { searchFiles } from '@/utils/search.js'

const userStore = useUserStore()
const cloudStore = useCloudStore()

const departments = [
  { label: '艺术部', value: 'art' },
  { label: '机械部', value: 'mech' },
  { label: '软件部', value: 'soft' }
]

const currentDept = ref('art')
const refreshing = ref(false)
const fileInput = ref(null)
const searchQuery = ref('')

// 来自 store 的原始数据
const currentPublicFiles = computed(() => cloudStore.currentPublicFiles)
const publicLoading = computed(() => cloudStore.publicLoading)

// 过滤后的显示数据（基于原始数据与搜索词）
const displayedFiles = computed(() => {
  return searchFiles(currentPublicFiles.value, searchQuery.value)
})

// 搜索触发函数（实际上计算属性已实时过滤，这里仅做标记）
const handleSearch = () => {
  // 搜索动作由 computed 自动完成，仅用于触发blur/enter时的视觉反馈（如有需要）
}

// 切换部门（不请求）
const switchDept = (dept) => {
  cloudStore.setDepartment(dept)
  currentDept.value = dept
  // 切换部门时清空搜索框
  searchQuery.value = ''
}

// 手动刷新当前部门
const refreshCurrentDepartment = async () => {
  refreshing.value = true
  try {
    await cloudStore.refreshPublicDepartment(currentDept.value)
  } finally {
    refreshing.value = false
  }
}

// 上传相关
const canUpload = computed(() => {
  const user = userStore.userInfo
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === 'internal' && user.department === currentDept.value
})

const triggerUpload = () => {
  if (!canUpload.value) {
    alert('只能上传到本部门公共网盘')
    return
  }
  fileInput.value.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  await cloudStore.uploadPublicFileAction(file, currentDept.value)
  fileInput.value.value = ''
  // 上传成功后清空搜索，展示完整列表
  searchQuery.value = ''
}

const handleDownload = (file) => {
  const url = `/api/cloud/public/${file.id}/download`
  downloadFile(url, file.original_name).catch(err => {
    console.error(err)
    alert('下载失败')
  })
}

const canDelete = (file) => {
  const user = userStore.userInfo
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === 'internal' &&
         file.owner_id === user.id &&
         user.department === file.department
}

const deleteFile = async (fileId) => {
  if (confirm('确定删除该文件吗？')) {
    await cloudStore.removePublicFile(fileId, currentDept.value)
    // 删除后清空搜索
    searchQuery.value = ''
  }
}

// 文件信息格式化
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}
</script>

<style scoped>
@import '@/styles/cloud-common.css';

/* =============================================
   PublicCloud 公共网盘独有样式
   部门按钮、刷新、搜索框、上传者标签、布局修正
   ============================================= */

/* ----- 头部布局覆盖（标题 + 部门 + 上传同一行）----- */
.header {
  display: block; /* 覆盖公共 flex，自行用 header-main 布局 */
  margin-bottom: var(--space-lg);
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(66, 185, 131, 0.15);
}

.header-main {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: nowrap;
}

.header-main h3 {
  margin: 0;
  flex-shrink: 0;
  line-height: 1.4;
}

/* 部门按钮组居中 */
.dept-buttons {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  align-items: center;
}

/* 上传区域靠右 */
.upload-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* ----- 第二行：刷新按钮 + 搜索框 ----- */
.header-controls {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.refresh-btn {
  padding: 3px 14px;
  font-size: 0.8rem;
  background: #ffffff;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.refresh-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 搜索框 */
.search-input {
  width: 220px;
  padding: 6px 12px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast);
  margin-left: auto;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(66,185,131,0.1);
}

/* 搜索结果标题 */
.search-title {
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 600;
  margin: 0 0 var(--space-sm) 0;
  padding-left: var(--space-sm);
  border-left: 3px solid var(--color-primary);
}

/* ----- 部门按钮样式（与全局标签统一）----- */
.dept-buttons button {
  padding: 7px 20px;
  background: white;
  border: 1.5px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dept-buttons button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
  transform: translateY(-1px);
}

.dept-buttons button.active {
  background: var(--color-primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-green);
}

/* ----- 上传按钮（扩展公共 .header button）----- */
.upload-section button {
  padding: 9px 24px;
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: var(--transition-smooth);
}

.upload-section button:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
}

/* ----- 上传者标签 ----- */
.file-owner {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  background: #edf5f1;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  border: 1px solid #dbe8e1;
}

/* ----- 响应式 ----- */
@media (max-width: 700px) {
  .header-main {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-sm);
  }
  .header-main h3 {
    width: 100%;
    text-align: center;
  }
  .dept-buttons {
    width: 100%;
    justify-content: center;
  }
  .upload-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .header-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
  }
  .search-input {
    width: 100%;
    margin-left: 0;
  }
}
</style>