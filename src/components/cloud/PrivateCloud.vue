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

/* =============================================
   PrivateCloud 私有网盘独有样式（应用全局设计令牌）
   搜索框、按钮、头部布局的专属优化
   ============================================= */

/* 头部调整为允许纵向布局 */
.header {
  display: block;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.header-main h3 {
  margin: 0;
}

/* 搜索行：右对齐，与上传按钮区域保持视觉平衡 */
.search-row {
  display: flex;
  justify-content: flex-end;
}

/* 搜索框：限定宽度，使用全局变量 */
.search-input {
  width: 220px;
  padding: 6px var(--space-sm);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast);
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
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

/* 上传按钮（覆盖公共样式，保持私有网盘独特的渐变按钮） */
.header-main button {
  padding: 10px var(--space-lg);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: var(--transition-smooth);
  letter-spacing: 0.5px;
}

.header-main button:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(66, 185, 131, 0.4);
}

/* 响应式保护：小屏时允许换行和居中对齐 */
@media (max-width: 700px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-main {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-sm);
  }
  .search-row {
    justify-content: center;
    margin-top: var(--space-sm);
  }
  .search-input {
    width: 100%;
  }
}
</style>