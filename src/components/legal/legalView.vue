<template>
  <div class="legal-page">
    <div class="legal-content" v-html="rendered"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { renderMarkdown } from '@/markdown/renderer.js'

const route = useRoute()
const isTerms = computed(() => route.path.includes('terms'))
const rawText = ref('')
const rendered = ref('')

onMounted(async () => {
  try {
    if (isTerms.value) {
      rawText.value = (await import('@/assets/legals/terms.md?raw')).default
    } else {
      rawText.value = (await import('@/assets/legals/privacy.md?raw')).default
    }
    rendered.value = renderMarkdown(rawText.value)
  } catch (e) {
    console.error(e)
    rendered.value = '<p>加载失败，请稍后重试。</p>'
  }
})
</script>

<style scoped>
/* =============================================
   legalView 法律文本页样式（应用全局设计令牌）
   保留原有 Markdown 渲染样式，升级颜色与间距
   ============================================= */
.legal-page {
  max-width: 860px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md) 60px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--color-text);
  line-height: 1.8;
}

/* 保证渲染后的 markdown 样式美观，复用全局链接颜色等 */
.legal-content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}
.legal-content :deep(h1) {
  font-size: 2rem;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-lg);
}
.legal-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: var(--space-xl);
  margin-bottom: var(--space-sm);
}
.legal-content :deep(p) {
  margin-bottom: var(--space-md);
}
</style>