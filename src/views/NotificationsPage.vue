<!-- src/views/NotificationsPage.vue -->
<template>
  <div class="notifications-page">
    <h2>我的通知</h2>

    <!-- 工具栏 -->
    <div class="toolbar">
      <button class="tool-btn" @click="toggleEditMode">
        {{ editMode ? '完成' : '管理' }}
      </button>
      <button v-if="!editMode" class="tool-btn" @click="handleMarkAllRead">全部标为已读</button>
      <button
        v-if="editMode && selectedIds.length > 0"
        class="tool-btn danger"
        @click="handleBatchDelete"
      >
        删除选中 ({{ selectedIds.length }})
      </button>
    </div>

    <!-- 通知列表 -->
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else>
      <notificationItem
        v-for="n in notifications"
        :key="n.id"
        :notification="n"
        :edit-mode="editMode"
        :selected="selectedIds.includes(n.id)"
        @toggle-select="toggleSelect(n.id)"
        @read="handleRead(n)"
        @delete="handleDelete(n.id)"
        @open-detail="openDetail(n)"
      />
      <div v-if="notifications.length === 0" class="empty-state">暂无通知</div>
    </div>

    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @page-change="handlePageChange"
    />

    <!-- 被删内容弹窗 -->
    <div v-if="detailModal.visible" class="modal-overlay" @click.self="detailModal.visible = false">
      <div class="modal-card">
        <h4>已删除的内容</h4>
        <div class="deleted-content" v-html="renderDetailContent"></div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="detailModal.visible = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteBatchNotifications
} from '@/api/notifications'
import { renderMarkdown } from '@/markdown/renderer'
import NotificationItem from '@/components/notifications/notificationItem.vue'
import Pagination from '@/components/common/Pagination.vue'

const notifStore = useNotificationStore()

const notifications = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// 编辑模式
const editMode = ref(false)
const selectedIds = ref([])

// 被删内容弹窗
const detailModal = reactive({
  visible: false,
  content: '',
})

const load = async (page = 1) => {
  loading.value = true
  try {
    const res = await getNotifications(page, 20)
    notifications.value = res.data
    currentPage.value = res.page
    totalPages.value = res.totalPages
  } catch (err) {
    console.error('获取通知失败', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => load(page)

// 标记单条已读（乐观更新，不刷新）
const handleRead = async (n) => {
  if (n.is_read) return
  n.is_read = true
  notifStore.setUnreadCount(Math.max(0, notifStore.unreadCount - 1))
  try {
    await markRead(n.id)
  } catch (err) {
    n.is_read = false
    notifStore.fetchUnreadCount()
    console.error('标记已读失败', err)
  }
}

// 全部标为已读
const handleMarkAllRead = async () => {
  try {
    await markAllRead()
    notifications.value.forEach(n => { n.is_read = true })
    notifStore.setUnreadCount(0)
  } catch (err) {
    console.error('标记全部已读失败', err)
  }
}

// 删除单条（永久）
const handleDelete = async (id) => {
  if (!confirm('确定删除这条通知吗？')) return
  try {
    await deleteNotification(id)
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx !== -1) {
      const wasUnread = !notifications.value[idx].is_read
      notifications.value.splice(idx, 1)
      if (wasUnread) notifStore.setUnreadCount(Math.max(0, notifStore.unreadCount - 1))
    }
  } catch (err) {
    alert('删除失败')
  }
}

// 编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value
  selectedIds.value = []
}

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx !== -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

// 批量删除
const handleBatchDelete = async () => {
  if (!confirm(`确定删除选中的 ${selectedIds.value.length} 条通知吗？`)) return
  try {
    const ids = [...selectedIds.value]
    await deleteBatchNotifications(ids)
    const unreadRemoved = notifications.value.filter(n => ids.includes(n.id) && !n.is_read).length
    notifications.value = notifications.value.filter(n => !ids.includes(n.id))
    if (unreadRemoved) notifStore.setUnreadCount(Math.max(0, notifStore.unreadCount - unreadRemoved))
    selectedIds.value = []
  } catch (err) {
    alert('删除失败')
  }
}

// 详情：被删内容弹窗 / 其它新标签页跳转
const openDetail = (n) => {
  if (n.type === 'comment_deleted' || n.type === 'reply_deleted') {
    detailModal.content = n.content_snapshot || ''
    detailModal.visible = true
    return
  }
  const base = `/forum/${n.category_slug}/${n.post_id}`
  if (n.type === 'comment' && n.comment_id) {
    window.open(`${base}?commentId=${n.comment_id}`, '_blank')
  } else if (n.type === 'reply' && n.comment_id) {
    const url = `${base}?commentId=${n.comment_id}${n.reply_id ? `&replyId=${n.reply_id}` : ''}`
    window.open(url, '_blank')
  } else if (n.type === 'permission_changed') {
    window.open(base, '_blank')
  }
}

const renderDetailContent = computed(() => {
  if (!detailModal.content) return '<p class="empty-hint">内容为空</p>'
  return renderMarkdown(detailModal.content)
})

onMounted(() => load())
</script>

<style scoped>
/* =============================================
   NotificationsPage 通知页样式（应用全局设计令牌）
   工具栏、列表容器、弹窗
   ============================================= */

.notifications-page {
  max-width: 860px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: var(--space-lg);
  font-weight: 600;
  border-left: 5px solid var(--color-primary);
  padding-left: 14px;
  color: var(--color-text);
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}
.tool-btn {
  padding: var(--space-sm) 18px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-dark);
  background: #fff;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: var(--transition-fast);
}
.tool-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.tool-btn.danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-light);
}
.tool-btn.danger:hover {
  background: var(--color-danger);
  color: #fff;
}

/* 加载与空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

/* 被删内容弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-card {
  background: #fff;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.modal-card h4 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--color-text);
}
.deleted-content {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  background: var(--color-primary-bg);
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}
.btn-cancel {
  padding: var(--space-sm) 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-dark);
  background: #f5f5f5;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}
.btn-cancel:hover {
  background: #e0e0e0;
}
</style>
