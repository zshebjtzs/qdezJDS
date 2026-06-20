<template>
  <div class="not-found">
    <!-- 装饰背景光晕 -->
    <div class="not-found-glow"></div>

    <!-- 错误代码 -->
    <div class="error-code">
      <span class="digit">4</span>
      <span class="digit zero">0</span>
      <span class="digit">4</span>
    </div>

    <!-- 提示文字 -->
    <h2>页面未找到</h2>
    <p class="subtitle">请不要乱输网页地址，您访问的页面不存在或已被移除。</p>

    <!-- 返回按钮 -->
    <button @click="backToHomePage" class="back-btn">
      <span class="btn-arrow">←</span> 退回主页
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const backToHomePage = () => {
  router.push('/')
}
</script>

<style scoped>
/* =============================================
   NotFound 404 页面样式（应用全局设计令牌）
   数字动画、装饰光晕、品牌按钮
   ============================================= */

.not-found {
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: var(--space-2xl) var(--space-md);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 背景装饰光晕 */
.not-found-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(66, 185, 131, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
}

/* 错误代码数字 */
.error-code {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: var(--space-lg);
  position: relative;
  z-index: 1;
}

.digit {
  color: var(--color-text);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: float 3s ease-in-out infinite;
}

/* 中间数字延迟动画，营造节奏感 */
.digit:nth-child(2) {
  animation-delay: 0.5s;
}

.digit.zero {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 标题 */
h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
  position: relative;
  z-index: 1;
}

.subtitle {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-xl);
  max-width: 400px;
  position: relative;
  z-index: 1;
}

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 14px var(--space-xl);
  background: var(--color-primary-gradient);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: var(--transition-smooth);
  text-decoration: none;
  position: relative;
  z-index: 1;
}

.back-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(66, 185, 131, 0.4);
}

.btn-arrow {
  font-size: 1.2rem;
  transition: transform var(--transition-fast);
}

.back-btn:hover .btn-arrow {
  transform: translateX(-4px);
}

/* 响应式 */
@media (max-width: 480px) {
  .error-code {
    font-size: 5rem;
    gap: var(--space-xs);
  }
  h2 {
    font-size: 1.4rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
}
</style>