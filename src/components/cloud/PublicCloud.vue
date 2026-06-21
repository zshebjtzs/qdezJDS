<!-- src/components/cloud/PublicCloud.vue -->
<template>
  <div class="public-cloud">
    <div class="header">
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
      <div class="header-controls">
        <button class="refresh-btn" @click="refreshCurrentDepartment" :disabled="refreshing">
          {{ refreshing ? '刷新中...' : '刷新' }}
        </button>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索文件名..."
          @keyup.enter="doSearch"
        />
        <button class="btn-outline" @click="doSearch">搜索</button>
        <button v-if="isSearching" class="btn-outline" @click="clearSearch">清除</button>
      </div>
    </div>

    <div v-if="isSearching" class="search-title">搜索结果</div>

    <div v-if="store.publicLoading" class="loading">加载中...</div>
    <div v-else class="file-list">
      <div v-for="file in store.publicFiles" :key="file.id" class="file-item">
        <div class="file-info">
          <span class="file-name" v-html="highlightName(file)"></span>
          <span class="file-size">{{ formatSize(file.file_size) }}</span>
          <span class="file-time">{{ formatDate(file.created_at) }}</span>
          <span class="file-owner">上传者：{{ file.owner_name || '未知' }}</span>
        </div>
        <div class="file-actions">
          <button @click="handleDownload(file)">下载</button>
          <button v-if="canDelete(file)" @click="deleteFile(file.id)">删除</button>
        </div>
      </div>
      <div v-if="store.publicFiles.length === 0 && isSearching" class="empty">找不到对应的文件</div>
      <div v-else-if="store.publicFiles.length === 0 && !isSearching" class="empty">暂无文件，请上传</div>
    </div>

    <Pagination
      :currentPage="store.publicPage"
      :totalPages="store.publicTotalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCloudStore } from '@/stores/cloud'
import { downloadFile } from '@/utils/download.js'
import Pagination from '@/components/common/Pagination.vue'
import { API_BASE } from '@/stores/user'
const isSearching = ref(false)

const userStore = useUserStore()
const store = useCloudStore()
const departments = [
  { label: '艺术部', value: 'art' },
  { label: '机械部', value: 'mech' },
  { label: '软件部', value: 'soft' }
]

const currentDept = ref('art')
const refreshing = ref(false)
const fileInput = ref(null)
const searchQuery = ref('')

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
  await store.uploadPublicFile(file, currentDept.value)
  fileInput.value.value = ''
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
    await store.removePublicFile(fileId, currentDept.value)
  }
}

const refreshCurrentDepartment = async () => {
  refreshing.value = true
  try {
    await store.fetchPublicFiles(currentDept.value, store.publicPage, 20, searchQuery.value.trim())
  } finally {
    refreshing.value = false
  }
}

const switchDept = (dept) => {
  currentDept.value = dept
  store.setDepartment(dept)
  searchQuery.value = ''
  isSearching.value = false
  store.fetchPublicFiles(dept, 1, 20)
}

const doSearch = () => {
  isSearching.value = true
  store.fetchPublicFiles(currentDept.value, 1, 20, searchQuery.value.trim())
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  store.fetchPublicFiles(currentDept.value, 1, 20, searchQuery.value.trim())
}

const handlePageChange = (page) => {
  store.fetchPublicFiles(currentDept.value, page, 20, searchQuery.value.trim())
}

const highlightName = (file) => {
  const name = file.original_name
  if (!file.highlights || file.highlights.length === 0) {
    return name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  let result = ''
  let lastIndex = 0
  file.highlights.forEach(({ start, length }) => {
    result += name.slice(lastIndex, start).replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
  store.fetchPublicFiles(currentDept.value, 1, 20)
})
</script>

<style scoped>
@import '@/styles/cloud-common.css';

.header {
  display: block;
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
}
.dept-buttons {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
}
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
.dept-buttons button.active {
  background: var(--color-primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-green);
}
.upload-section {
  flex-shrink: 0;
}
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
}
.refresh-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
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
  margin-left: auto;
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
.file-owner {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  background: #edf5f1;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  border: 1px solid #dbe8e1;
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
/* 其他公共样式已通过 cloud-common.css 引入 */
</style>