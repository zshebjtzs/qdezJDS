<template>
  <div class="post-edit">
    <h2>发表新帖</h2>
    <p class="board-hint">当前板块：{{ categoryName }}</p>

    <div class="form-group">
      <input v-model="newTitle" placeholder="输入标题..." class="title-input" />
    </div>
    <div class="form-group">
      <!-- 替换为 Markdown 编辑器 -->
      <MarkdownEditor v-model="newContent" placeholder="请输入内容（支持 Markdown 语法）..." />
    </div>
    <div class="form-actions">
      <button @click="submitPost" class="submit-btn">提交</button>
      <a href="#" @click.prevent="handleCancel" class="cancel-btn">取消</a>
    </div>
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    <!-- Markdown 语法速查面板 -->
    <details class="markdown-help">
      <summary>📖 Markdown 快速入门</summary>
      <div class="help-content">
        <div class="help-item">
          <span class="help-desc"><strong>标题</strong>：文字前加 <code>#</code>，几个 <code>#</code> 代表几级标题</span>
          <span class="help-syntax"><code>## 二级标题</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>加粗</strong>：用两个星号包裹文字</span>
          <span class="help-syntax"><code>**重点内容**</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>斜体</strong>：用一个星号包裹文字</span>
          <span class="help-syntax"><code>*强调内容*</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>删除线</strong>：用两个波浪线包裹文字</span>
          <span class="help-syntax"><code>~~过时信息~~</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>链接</strong>：方括号写文字，圆括号写网址</span>
          <span class="help-syntax"><code>[百度](https://baidu.com)</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>无序列表</strong>：短横或星号加空格</span>
          <span class="help-syntax"><code>- 事项一<br>- 事项二</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>有序列表</strong>：数字加点加空格</span>
          <span class="help-syntax"><code>1. 第一步<br>2. 第二步</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>单行代码</strong>：用单个反引号包裹</span>
          <span class="help-syntax"><code>`console.log('hi')`</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>多行代码块</strong>：用三个反引号包裹，可指定语言</span>
          <div class="help-syntax">
            <code>```javascript<br>你的代码<br>```</code>
            <details class="lang-help">
              <summary>📋 支持的语言及写法</summary>
              <div class="lang-grid">
                <span>JavaScript → <code>javascript</code></span>
                <span>TypeScript → <code>typescript</code></span>
                <span>Python → <code>python</code></span>
                <span>Java → <code>java</code></span>
                <span>C++ → <code>cpp</code></span>
                <span>C → <code>c</code></span>
                <span>CSS → <code>css</code></span>
                <span>HTML → <code>html</code></span>
                <span>Shell → <code>bash</code> 或 <code>shell</code></span>
                <span>JSON → <code>json</code></span>
                <span>Markdown → <code>markdown</code></span>
              </div>
              <p class="lang-tip">⚠️ <strong>注意</strong>：C++ 必须写 <code>cpp</code>，不能写 c++。</p>
            </details>
          </div>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>引用</strong>：段落前加 <code>&gt;</code> 和空格</span>
          <span class="help-syntax"><code>&gt; 引用内容</code></span>
        </div>
        <div class="help-item">
          <span class="help-desc"><strong>换行</strong>：直接回车即可，空一行表示新段落</span>
          <span class="help-syntax"><code>无需特殊语法</code></span>
        </div>
        <p class="help-tip">💡 右侧可实时预览效果，放心尝试！</p>
      </div>
    </details>
    <!-- 外部格式手册链接 -->
    <div class="external-links">
      <a href="https://help.luogu.com.cn/rules/academic/handbook/markdown" target="_blank" rel="noopener noreferrer">
        Markdown 格式手册
      </a>
      <a href="https://help.luogu.com.cn/rules/academic/handbook/latex" target="_blank" rel="noopener noreferrer">
        LaTeX 格式手册
      </a>
      <a href="https://katex.org/docs/supported.html" target="_blank" rel="noopener noreferrer">
        KaTeX 官方文档
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { createPost } from '@/api/forum'
import MarkdownEditor from '@/markdown/editor.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const slug = route.params.slug
const newTitle = ref('')
const newContent = ref('')
const categories = ref([])
const isSubmitting = ref(false)
const categoryName = computed(() => {
  const cat = categories.value.find(c => c.slug === slug)
  return cat ? cat.name : slug
})
const errorMsg = ref('')

// 判断是否有未保存内容
const hasContent = computed(() => {
  return newTitle.value.trim() !== '' || newContent.value.trim() !== ''
})

// 处理取消操作（按钮点击）
const handleCancel = () => {
  // 直接跳转，由路由守卫统一负责离开确认
  router.push(`/forum/${slug}`)
}

// 路由离开守卫
onBeforeRouteLeave((to, from, next) => {
  // 正在提交或没有内容时直接放行
  if (isSubmitting.value || !hasContent.value) {
    next()
  } else {
    const answer = confirm('确定要离开吗？所有输入均不会被保存。')
    if (answer) {
      next()
    } else {
      next(false)
    }
  }
})

// 浏览器关闭/刷新拦截
const beforeUnloadHandler = (e) => {
  if (hasContent.value) {
    e.preventDefault()
    e.returnValue = '' // 触发浏览器默认提示
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnloadHandler)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})

const submitPost = async () => {
  errorMsg.value = ''
  if (!newTitle.value.trim() || !newContent.value.trim()) {
    errorMsg.value = '标题和内容不能为空'
    return
  }
  try {
    await createPost(slug, newTitle.value, newContent.value)
    // 标记为正在提交，并清空内容，绕过守卫
    isSubmitting.value = true
    newTitle.value = ''
    newContent.value = ''
    router.push(`/forum/${slug}`)
  } catch (err) {
    errorMsg.value = '发帖失败，请重试'
    console.error(err)
  }
}
</script>

<style scoped>
/* =============================================
   postEdit 发帖页样式（应用全局设计令牌）
   统一卡片、输入框、按钮、速查面板、外部链接
   ============================================= */

.post-edit {
  max-width: 860px;
  margin: 30px auto;
  padding: var(--space-xl);
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: var(--space-sm);
  font-weight: 700;
  border-left: 5px solid var(--color-primary);
  padding-left: 14px;
}

.board-hint {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-md);
}

.title-input {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  outline: none;
  transition: var(--transition-fast);
}

.title-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  margin-top: 10px;
}

.submit-btn {
  padding: 10px 28px;
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: var(--transition-fast);
}

.submit-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.cancel-btn {
  padding: 10px 28px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-dark);
  background: #fff;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: var(--transition-fast);
}

.cancel-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.error-msg {
  color: var(--color-danger);
  margin-top: var(--space-sm);
  font-size: 0.9rem;
}

/* Markdown 语法速查面板 */
.markdown-help {
  margin-top: 18px;
  background: var(--color-primary-bg);
  border: 1px solid rgba(66, 185, 131, 0.2);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition-fast);
}

.markdown-help[open] {
  background: #ffffff;
  border-color: rgba(66, 185, 131, 0.35);
  box-shadow: var(--shadow-sm);
}

.markdown-help summary {
  padding: var(--space-sm) 18px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #2c7a5c;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.markdown-help summary::-webkit-details-marker {
  display: none;
}

.markdown-help summary::before {
  content: '▶';
  font-size: 0.7rem;
  transition: transform var(--transition-fast);
  display: inline-block;
  width: 14px;
  text-align: center;
}

.markdown-help[open] summary::before {
  transform: rotate(90deg);
}

.help-content {
  padding: 0 18px var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.help-item:last-child {
  border-bottom: none;
}

.help-desc {
  flex: 1;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.help-desc strong {
  color: var(--color-text);
}

.help-desc code {
  background: #edf5f1;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: #2c7a5c;
}

.help-syntax {
  flex-shrink: 0;
}

.help-syntax code {
  display: inline-block;
  background: #f4f8f6;
  border: 1px solid #dfece4;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text);
  white-space: nowrap;
}

.help-tip {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 6px 0 0;
  text-align: center;
}

/* 内嵌语言下拉帮助 */
.lang-help {
  margin-top: 6px;
  background: var(--color-primary-bg);
  border: 1px solid #dfece4;
  border-radius: var(--radius-sm);
  padding: var(--space-xs) 10px;
}

.lang-help summary {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c7a5c;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) 0;
}

.lang-help summary::-webkit-details-marker {
  display: none;
}

.lang-help summary::before {
  content: '▸';
  font-size: 0.8rem;
  transition: transform var(--transition-fast);
}

.lang-help[open] summary::before {
  transform: rotate(90deg);
}

.lang-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 4px var(--space-md);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.lang-grid code {
  background: #edf5f1;
  padding: 0 4px;
  border-radius: 3px;
  color: #2c7a5c;
  font-size: 0.8rem;
}

.lang-tip {
  font-size: 0.82rem;
  color: var(--color-danger);
  margin-top: var(--space-sm);
}

/* 外部手册链接区域 */
.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.external-links a {
  font-size: 0.9rem;
  color: #2c7a5c;
  background: var(--color-primary-light);
  border: 1px solid rgba(66, 185, 131, 0.2);
  border-radius: var(--radius-full);
  padding: 4px 14px;
  text-decoration: none;
  transition: var(--transition-fast);
}

.external-links a:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>