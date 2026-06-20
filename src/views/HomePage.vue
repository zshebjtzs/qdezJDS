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

    <!-- 增强型 Hero 欢迎区 -->
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <span class="hero-badge">WELCOME</span>
        <h1>欢迎来到机电社</h1>
        <p>这里是展示社团风采与交流的平台</p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showExpiredTip = ref(false)

const scrollToContent = () => {
  const pageElement = document.querySelector('.about-page, .activity-page')
  if (pageElement) {
    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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

/* 增强型 Hero 区域 —— 视觉深度优化 */
.hero {
  text-align: center;
  padding: 80px 20px 60px;
  margin: 40px 0 20px;
  background: linear-gradient(145deg, var(--color-primary-bg) 0%, var(--color-primary-light) 100%);
  border-radius: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 30px -10px rgba(66, 185, 131, 0.1);
  border: 1px solid rgba(66, 185, 131, 0.15);
  transition: box-shadow var(--transition-fast);
}

.hero:hover {
  box-shadow: 0 20px 40px -12px rgba(66, 185, 131, 0.2);
}

/* 背景光晕装饰 */
.hero-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(66, 185, 131, 0.1) 0%, transparent 70%);
  top: -150px;
  right: -100px;
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
  background: rgba(66, 185, 131, 0.12);
  color: #2c7a5c;
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 20px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(66, 185, 131, 0.2);
}

.hero h1 {
  font-size: 3.2rem;
  margin-bottom: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e2b39 0%, #2c5f4a 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero p {
  font-size: 1.3rem;
  color: var(--color-text-secondary);
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
  border-radius: 60px;
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
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid #cbdad3;
}

.hero-btn.secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
  background: rgba(66, 185, 131, 0.04);
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
  color: #5b7a6e;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
  font-weight: 500;
}

.scroll-arrow {
  width: 24px;
  height: 24px;
  border-left: 2px solid var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
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
@media (max-width: 700px) {
  .hero {
    padding: 60px 16px 40px;
    border-radius: var(--radius-xl);
  }
  .hero h1 {
    font-size: 2.3rem;
  }
  .hero p {
    font-size: 1.1rem;
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