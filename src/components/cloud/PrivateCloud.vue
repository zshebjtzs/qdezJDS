<!-- src/components/cloud/PrivateCloud.vue -->
<template>
  <div class="private-cloud">
    <div class="header">
      <div class="header-main">
        <h3>我的私有网盘</h3>
        <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" />
        <button @click="triggerUpload">上传文件</button>
      </div>
      <!-- 搜索框独立一行 -->
      <div class="search-row">
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

    <div v-if="searchQuery" class="search-title">搜索结果</div>

    <div v-if="store.loading" class="loading">加载中...</div>
    <div v-else class="file-list">
      <div v-for="file in displayedFiles" :key="file.id" class="file-item">
        <div class="file-info">
          <span class="file-name">{{ file.original_name }}</span>
          <span class="file-size">{{ formatSize(file.file_size) }}</span>
          <span class="file-time">{{ formatDate(file.created_at) }}</span>
        </div>
        <div class="file-actions">
          <button @click="handleDownload(file)">下载</button>
          <button @click="deleteFile(file.id)">删除</button>
        </div>
      </div>
      <div v-if="displayedFiles.length === 0 && searchQuery" class="empty">找不到对应的文件</div>
      <div v-else-if="displayedFiles.length === 0 && !searchQuery" class="empty">暂无文件，请上传</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCloudStore } from '@/stores/cloud'
import { downloadFile } from '@/utils/download.js'
import { searchFiles } from '@/utils/search.js'

const store = useCloudStore()
const fileInput = ref(null)
const searchQuery = ref('')

// 私有文件原始数据
const privateFiles = computed(() => store.privateFiles)
const displayedFiles = computed(() => {
  return searchFiles(privateFiles.value, searchQuery.value)
})

const handleSearch = () => {
  // 实时过滤，无需额外动作
}

const triggerUpload = () => {
  fileInput.value.click()
}

const handleDownload = (file) => {
  const url = `/api/cloud/private/${file.id}/download`
  downloadFile(url, file.original_name).catch(err => {
    console.error(err)
    alert('下载失败，请重试')
  })
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  await store.uploadPrivateFileAction(file)
  fileInput.value.value = ''
  searchQuery.value = ''
}

const deleteFile = async (id) => {
  if (confirm('确定删除该文件吗？')) {
    await store.removePrivateFile(id)
    searchQuery.value = ''
  }
}

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

/* 头部调整为允许纵向布局 */
.header {
  display: block;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-main h3 {
  margin: 0;
}

/* 搜索行 */
.search-row {
  display: flex;
  justify-content: flex-end;   /* 让搜索框靠右 */
}

.search-input {
  width: 220px;                 /* 限定宽度，避免撑满整行 */
  padding: 6px 12px;
  border: 1px solid #d0ddd5;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #2c3e50;
  outline: none;
  transition: border-color 0.25s ease;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66,185,131,0.1);
}

.search-title {
  font-size: 1rem;
  color: #42b983;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-left: 8px;
  border-left: 3px solid #42b983;
}

/* 保留按钮样式（如果需要微调） */
.header-main button {
  padding: 10px 24px;
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

.header-main button:hover {
  background: linear-gradient(135deg, #359b6e, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(66, 185, 131, 0.4);
}
</style>