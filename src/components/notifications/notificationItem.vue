<!-- src/components/notifications/notificationItem.vue -->
<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.is_read, 'edit-mode': editMode }"
    @click="onClick"
  >
    <!-- 编辑模式复选框 -->
    <input
      v-if="editMode"
      type="checkbox"
      class="select-box"
      :checked="selected"
      @click.stop
      @change="$emit('toggle-select')"
    />
    <!-- 未读标识 -->
    <span v-else class="unread-dot" :class="{ read: notification.is_read }"></span>

    <div class="notif-body">
      <p class="notif-text" v-html="renderText"></p>
      <span class="notif-time">{{ formatTime }}</span>
    </div>

    <!-- 操作按钮（非编辑模式） -->
    <div v-if="!editMode" class="notif-actions">
      <button v-if="hasDetail" class="detail-btn" @click.stop="onDetailClick">详情</button>
      <button class="delete-btn" @click.stop="$emit('delete')">🗑</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notification: { type: Object, required: true },
  editMode: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-select', 'read', 'delete', 'open-detail'])

// 转义 HTML，防止 XSS（通知内容为用户输入）
const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 渲染通知文本（含可点击链接）
const renderText = computed(() => {
  const n = props.notification
  const title = escapeHtml(n.title_snapshot || '帖子')
  const actor = escapeHtml(n.actor_username || '用户')
  const content = escapeHtml(n.content_snapshot || '')

  const titleLink = n.category_slug && n.post_id
    ? `<a class="n-link" href="/forum/${n.category_slug}/${n.post_id}" target="_blank" rel="noopener">${title}</a>`
    : title

  const actorLink = n.actor_uid
    ? `<a class="n-link" href="/user/${n.actor_uid}" target="_blank" rel="noopener">${actor}</a>`
    : actor

  switch (n.type) {
    case 'comment':
      return `您的帖子 ${titleLink} 被 ${actorLink} 评论：${content}`
    case 'reply':
      return `您的回复被 ${actorLink} 回复：${content}`
    case 'post_deleted':
      return `您的帖子 ${titleLink} 已被删除`
    case 'comment_deleted':
      return `您在 ${titleLink} 下的评论已被删除`
    case 'reply_deleted':
      return `您在 ${titleLink} 下的回复已被删除`
    case 'permission_changed':
      return `您的帖子 ${titleLink} ${content}`
    case 'banned':
      return `您的${content}`
    case 'unbanned':
      return `您的${content}`
    case 'announcement': {
      // 公告不内联展示内容，仅显示标题（content_snapshot 存标题），详情弹窗看全文
      return content
        ? `新公告：${content}，点击「详情」查看完整内容`
        : `管理员发布了一条新公告，点击「详情」查看完整内容`
    }
    default:
      return content
  }
})

// 是否有"详情"按钮
const hasDetail = computed(() => {
  return ['comment', 'reply', 'permission_changed', 'comment_deleted', 'reply_deleted', 'announcement'].includes(props.notification.type)
})

// 格式化时间
const formatTime = computed(() => {
  const iso = props.notification.created_at
  if (!iso) return ''
  const d = new Date(iso)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day} ${hour}:${minute}`
})

// 点击通知块：标记已读（跳过链接/按钮/复选框）
const onClick = (e) => {
  if (props.editMode) return
  if (e.target.closest('a, button, input')) return
  emit('read')
}

// 点击详情：标记已读 + 打开详情
const onDetailClick = () => {
  emit('read')
  emit('open-detail')
}
</script>

<style scoped>
/* =============================================
   notificationItem 单条通知样式（应用全局设计令牌）
   未读圆点、文本、操作按钮、编辑模式
   ============================================= */

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
  background: #fff;
  cursor: pointer;
  transition: var(--transition-fast);
}
.notification-item:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--color-primary);
}

/* 未读状态：浅绿背景 */
.notification-item.unread {
  background: var(--color-primary-bg);
  border-color: rgba(66, 185, 131, 0.25);
}

/* 编辑模式：不显示手型 */
.notification-item.edit-mode {
  cursor: default;
}

/* 未读圆点 */
.unread-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 0 3px var(--color-danger-light);
}
.unread-dot.read {
  background: transparent;
  box-shadow: none;
  border: 2px solid var(--color-border-dark);
}

/* 编辑模式复选框 */
.select-box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 4px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* 通知主体 */
.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text);
  word-break: break-word;
}
.n-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}
.n-link:hover {
  text-decoration: underline;
}
.notif-time {
  display: block;
  margin-top: var(--space-xs);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* 操作按钮 */
.notif-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}
.detail-btn {
  padding: 4px 14px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition-fast);
}
.detail-btn:hover {
  background: var(--color-primary);
  color: #fff;
}
.delete-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  opacity: 0.5;
  transition: var(--transition-fast);
}
.delete-btn:hover {
  opacity: 1;
}
</style>
