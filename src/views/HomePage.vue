<template>
  <div class="home-container">
    <!-- Token 过期提示弹窗 -->
    <div v-if="showExpiredTip" class="expired-toast">
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span>登录已过期，请重新登录。</span>
      </div>
    </div>
    <!-- 导航 -->
    <div class="nav">
      <div class="logo">青岛二中机电社</div>
    </div>

    <!-- 增强型 Hero 欢迎区（深色科技风 + 星座粒子场） -->
    <div class="hero">
      <canvas ref="particleCanvas" class="hero-particles"></canvas>
      <div class="hero-glow"></div>
      <div class="hero-content">
        <span class="hero-badge">MECHATRONICS SOCIETY</span>
        <h1>欢迎来到 <span class="hero-accent">机电社</span></h1>
        <p class="hero-slogan">动手创造 · 智慧共享</p>
        <p class="hero-desc">这里是展示社团风采与交流的平台</p>
        <div class="hero-actions">
          <router-link to="/home/about" class="hero-btn primary">了解社团</router-link>
          <router-link to="/home/activity" class="hero-btn secondary">查看活动 →</router-link>
        </div>
      </div>
      <!-- 向下滚动提示箭头（纯交互引导） -->
      <div class="scroll-hint" @click="scrollToContent">
        <span class="scroll-text">探索更多</span>
        <div class="scroll-arrow"></div>
      </div>
    </div>

    <!-- 路由器出口，用于显示子页面内容 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initParticles } from '@/utils/particles'

const route = useRoute()
const router = useRouter()
const showExpiredTip = ref(false)
const particleCanvas = ref(null)
let particleCleanup = null

const scrollToContent = () => {
  const pageElement = document.querySelector('.about-page, .activity-page')
  if (pageElement) {
    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  // 初始化星座粒子场
  if (particleCanvas.value) {
    particleCleanup = initParticles(particleCanvas.value)
  }

  if (route.query.expired === '1') {
    showExpiredTip.value = true
    setTimeout(() => {
      showExpiredTip.value = false
      // 清除 expired 参数，避免刷新再次出现
      const newQuery = { ...route.query }
      delete newQuery.expired
      router.replace({ query: newQuery })
    }, 5000)
  }
})

onBeforeUnmount(() => {
  // 清理粒子动画与事件监听
  if (particleCleanup) {
    particleCleanup.destroy()
    particleCleanup = null
  }
})
</script>

<style scoped>
/* =============================================
   HomePage 样式（应用全局设计令牌）
   保留原有布局，替换为 CSS 变量以统一视觉
   ============================================= */

/* 主页容器 —— 沿用原有限制宽度居中 */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

/* 导航栏 —— 原样保留，细节微调更现代 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-border);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.3px;
}

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-links a {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: color var(--transition-fast);
  font-size: 1rem;
}

.nav-links a:hover {
  color: var(--color-primary);
}

/* 增强型 Hero 区域 —— 深色科技风 + 星座粒子场 */
.hero {
  text-align: center;
  padding: 80px 20px 60px;
  margin: 40px 0 20px;
  background: var(--color-tech-gradient);
  border-radius: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-tech);
  border: 1px solid var(--color-accent-border);
  transition: box-shadow var(--transition-fast);
}

.hero:hover {
  box-shadow: var(--shadow-tech-hover);
}

/* 星座粒子画布层 */
.hero-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* 背景光晕装饰（品牌绿光晕，增强深色氛围） */
.hero-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%);
  top: -180px;
  right: -120px;
  border-radius: 50%;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-block;
  padding: 6px var(--space-md);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent-soft);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 24px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(66, 185, 131, 0.35);
}

.hero h1 {
  font-size: 3.2rem;
  margin-bottom: 12px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.2;
  text-shadow: 0 2px 20px var(--color-accent-glow);
}

.hero-accent {
  color: var(--color-accent-mint);
}

.hero-slogan {
  font-size: 1.5rem;
  color: var(--color-accent-soft);
  max-width: 650px;
  margin: 0 auto 10px;
  font-weight: 600;
  letter-spacing: 2px;
}

.hero-desc {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 650px;
  margin: 0 auto 30px;
  font-weight: 400;
}

/* 交互按钮组 */
.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-block;
  padding: 14px var(--space-xl);
  border-radius: var(--radius-full);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition-smooth);
  font-size: 1rem;
  border: 1px solid transparent;
}

.hero-btn.primary {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-green);
}

.hero-btn.primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -8px rgba(66, 185, 131, 0.5);
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
}

.hero-btn.secondary:hover {
  border-color: var(--color-accent-mint);
  color: var(--color-accent-soft);
  transform: translateY(-2px);
  background: rgba(66, 185, 131, 0.15);
}

/* 向下滚动提示 —— 纯交互引导，无新增内容区块 */
.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  cursor: pointer;
  opacity: 0.65;
  transition: opacity var(--transition-fast);
  position: relative;
  z-index: 5;
}

.scroll-hint:hover {
  opacity: 1;
}

.scroll-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.scroll-arrow {
  width: 24px;
  height: 24px;
  border-left: 2px solid var(--color-accent-mint);
  border-bottom: 2px solid var(--color-accent-mint);
  transform: rotate(-45deg);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: rotate(-45deg) translate(0, 0);
  }
  40% {
    transform: rotate(-45deg) translate(8px, 8px);
  }
  60% {
    transform: rotate(-45deg) translate(4px, 4px);
  }
}

/* Token 过期提示弹窗 */
.expired-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  border: 1px solid var(--color-warning-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-lg);
  box-shadow: var(--shadow-sm);
  animation: slideDown 0.4s ease-out;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.toast-icon {
  font-size: 1.2rem;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .hero {
    padding: 60px 16px 40px;
    border-radius: var(--radius-xl);
  }
  .hero h1 {
    font-size: 2.3rem;
  }
  .hero-slogan {
    font-size: 1.2rem;
  }
  .hero-desc {
    font-size: 1rem;
  }
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .hero-btn {
    width: 100%;
    max-width: 260px;
    text-align: center;
  }
  .nav-links {
    gap: 18px;
  }
}
</style>