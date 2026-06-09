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

/* ---------- 头部区域覆盖 ---------- */
.header {
  display: block;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(66, 185, 131, 0.15);
}

/* 第一行：标题 + 部门按钮 + 上传按钮 —— 改用 grid 固定左中右位置 */
.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}

.header-main h3 {
  margin: 0;
  flex-shrink: 0;
  line-height: 1.4;
}

.dept-buttons {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
}

.upload-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  /* 保证即使内部按钮隐藏，依然保持宽度占位 */
  min-width: 90px;  /* 可选，按需要保留上传按钮大约宽度，防止坍塌 */
  justify-content: flex-end;
}

/* 第二行：刷新按钮 + 搜索框 —— 搜索框靠右对齐，与上传按钮右侧边缘对齐 */
.header-controls {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  /* 不再使用 padding-left: 18px; 让刷新按钮自然位于左侧 */
}

/* 刷新按钮保持原样，无额外偏移 */
.refresh-btn {
  padding: 3px 14px;
  font-size: 0.8rem;
  background: #ffffff;
  border: 1px solid #d0ddd5;
  border-radius: 20px;
  color: #4a5b6b;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.refresh-btn:hover {
  background: #f4faf7;
  border-color: #42b983;
  color: #42b983;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 搜索框：设置固定宽度并靠右显示（自动右对齐） */
.search-input {
  width: 220px;                 /* 与私有网盘一致 */
  padding: 6px 12px;
  border: 1px solid #d0ddd5;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2c3e50;
  outline: none;
  transition: border-color 0.25s ease;
  margin-left: auto;            /* 推到最右侧，与上传按钮右侧对齐 */
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66,185,131,0.1);
}

/* 搜索结果标题 */
.search-title {
  font-size: 1rem;
  color: #42b983;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-left: 8px;
  border-left: 3px solid #42b983;
}

/* 部门按钮样式 */
.dept-buttons button {
  padding: 7px 20px;
  background: white;
  border: 1.5px solid #d0ddd5;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #4a5b6b;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.3px;
}

.dept-buttons button:hover {
  border-color: #42b983;
  color: #42b983;
  background: rgba(66, 185, 131, 0.04);
  transform: translateY(-1px);
}

.dept-buttons button.active {
  background: linear-gradient(135deg, #42b983, #2ecc71);
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 14px rgba(66, 185, 131, 0.3);
}

.dept-buttons button.active:hover {
  background: #359b6e;
  box-shadow: 0 8px 18px rgba(66, 185, 131, 0.4);
}

/* 上传按钮 */
.upload-section button {
  padding: 9px 24px;
  background: linear-gradient(135deg, #42b983, #2ecc71);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(66, 185, 131, 0.3);
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  letter-spacing: 0.5px;
}

.upload-section button:hover {
  background: linear-gradient(135deg, #359b6e, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(66, 185, 131, 0.4);
}

/* 上传者标签 */
.file-owner {
  color: #6f8a7c;
  font-size: 0.8rem;
  background: #edf5f1;
  padding: 2px 10px;
  border-radius: 20px;
  border: 1px solid #dbe8e1;
}

/* 响应式 */
@media (max-width: 700px) {
  .header-main {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
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
    gap: 8px;
  }
  .search-input {
    width: 100%;
  }
}
</style>