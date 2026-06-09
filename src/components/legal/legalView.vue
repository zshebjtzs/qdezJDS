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
.legal-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  line-height: 1.8;
}

/* 保证渲染后的 markdown 样式美观，复用全局链接颜色等 */
.legal-content :deep(a) {
  color: #42b983;
  text-decoration: underline;
}
.legal-content :deep(h1) {
  font-size: 2rem;
  border-bottom: 2px solid #42b983;
  padding-bottom: 8px;
  margin-bottom: 24px;
}
.legal-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 28px;
  margin-bottom: 12px;
}
.legal-content :deep(p) {
  margin-bottom: 16px;
}
</style>