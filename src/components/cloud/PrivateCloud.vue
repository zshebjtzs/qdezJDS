<!-- src/components/cloud/PrivateCloud.vue -->
<template>
  <div class="private-cloud">
    <div class="header">
      <div class="header-main">
        <h3>我的私有网盘</h3>
        <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" />
        <button @click="triggerUpload">上传文件</button>
      </div>
      <!-- 搜索行 -->
      <div class="search-row">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索文件名..."
          @keyup.enter="doSearch"
        />
        <button class="btn-outline" @click="doSearch">搜索</button>
        <button v-if="searchQuery" class="btn-outline" @click="clearSearch">清除</button>
      </div>
    </div>

    <div v-if="isSearching" class="search-title">搜索结果</div>

    <div v-if="store.privateLoading" class="loading">加载中...</div>
    <div v-else class="file-list">
      <div v-for="file in store.privateFiles" :key="file.id" class="file-item">
        <div class="file-info">
          <!-- 文件名，支持高亮 -->
          <span class="file-name" v-html="highlightName(file)"></span>
          <span class="file-size">{{ formatSize(file.file_size) }}</span>
          <span class="file-time">{{ formatDate(file.created_at) }}</span>
        </div>
        <div class="file-actions">
          <button @click="handleDownload(file)">下载</button>
          <button @click="deleteFile(file.id)">删除</button>
        </div>
      </div>
      <div v-if="store.privateFiles.length === 0 && isSearching" class="empty">找不到对应的文件</div>
      <div v-else-if="store.privateFiles.length === 0 && !isSearching" class="empty">暂无文件，请上传</div>
    </div>

    <!-- 分页组件 -->
    <Pagination
      :currentPage="store.privatePage"
      :totalPages="store.privateTotalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCloudStore } from '@/stores/cloud'
import { downloadFile } from '@/utils/download.js'
import Pagination from '@/components/common/Pagination.vue'
import { API_BASE } from '@/stores/user'
const isSearching = ref(false)

const store = useCloudStore()
const fileInput = ref(null)
const searchQuery = ref('')

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
  await store.uploadPrivateFile(file)
  fileInput.value.value = ''
}

const deleteFile = async (id) => {
  if (confirm('确定删除该文件吗？')) {
    await store.removePrivateFile(id)
  }
}

const doSearch = () => {
  isSearching.value = true
  store.fetchPrivateFiles(1, 20, searchQuery.value.trim())
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  store.fetchPrivateFiles(1, 20)
}

const handlePageChange = (page) => {
  store.fetchPrivateFiles(page, 20, searchQuery.value.trim())
}

// 高亮文件名中的关键词
const highlightName = (file) => {
  const name = file.original_name
  if (!file.highlights || file.highlights.length === 0) {
    return name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  let result = ''
  let lastIndex = 0
  file.highlights.forEach(({ start, length }) => {
    // 转义普通部分
    result += name.slice(lastIndex, start).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // 高亮部分也转义后包裹 mark 标签
    result += `<mark>${name.slice(start, start + length).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</mark>`
    lastIndex = start + length
  })
  result += name.slice(lastIndex).replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return result
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

onMounted(() => {
  store.fetchPrivateFiles(1, 20)
})
</script>

<style scoped>
@import '@/styles/cloud-common.css';

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
.search-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}
.search-input {
  width: 220px;
  padding: 6px 12px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast);
}
.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(66,185,131,0.1);
}
.search-title {
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 600;
  margin: 0 0 var(--space-sm) 0;
  padding-left: var(--space-sm);
  border-left: 3px solid var(--color-primary);
}
.btn-outline {
  padding: 4px 14px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
}
.btn-outline:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
/* 其他样式已通过 cloud-common.css 引入 */
</style>