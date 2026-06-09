<template>
  <div class="activity-page">
    <!-- 页面标题区 -->
    <section class="page-header">
      <h2>社团活动</h2>
      <p class="subtitle">探索我们的精彩瞬间与未来计划</p>
    </section>

    <!-- 分类筛选栏（UI占位，功能留空） -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <span class="tab active">全部活动</span>
        <span class="tab">进行中</span>
        <span class="tab">即将开始</span>
        <span class="tab">往期回顾</span>
      </div>
      <div class="search-placeholder">
        <span class="search-icon">🔍</span>
        <span class="search-text">搜索活动...</span>
      </div>
    </div>

    <!-- 活动卡片网格 -->
    <div class="activity-grid">
      <!-- 单个活动卡片 - 作为布局样例，实际数据由后端渲染 -->
      <div class="activity-card" v-for="n in 6" :key="n">
        <div class="card-img-placeholder"></div>
        <div class="card-content">
          <div class="card-tag-placeholder"></div>
          <h4 class="card-title-placeholder">活动标题</h4>
          <div class="card-meta">
            <span class="meta-item">📅 2026.04.12</span>
            <span class="meta-item">📍 地点待定</span>
          </div>
          <p class="card-desc-placeholder">活动简介内容将在此处显示，简要描述活动亮点与参与方式。</p>
          <div class="card-footer">
            <span class="status-badge ongoing">进行中</span>
            <span class="detail-link">查看详情 →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多/分页占位 -->
    <div class="pagination-placeholder">
      <span class="page-btn active">1</span>
      <span class="page-btn">2</span>
      <span class="page-btn">3</span>
      <span class="page-btn">...</span>
      <span class="page-btn">下一页</span>
    </div>
  </div>
</template>

<style scoped>
/* 活动页面容器 */
.activity-page {
  margin: 40px 0 60px;
  position: relative;
}

/* 页面标题区 - 与关于页标题风格深度统一 */
.page-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
}

/* 标题区背景光晕 */
.page-header::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(66, 185, 131, 0.06) 0%, transparent 70%);
  top: -180px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  z-index: -1;
}

.page-header h2 {
  font-size: 2.8rem;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #1e2b39 0%, #2c5f4a 90%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  padding: 0 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #5a7070;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 400;
  letter-spacing: 0.8px;
}

/* 标题下方装饰线 */
.page-header::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #42b983, transparent);
  margin: 22px auto 0;
  border-radius: 3px;
}

/* 筛选栏 - 增加玻璃态与装饰 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 44px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(66, 185, 131, 0.15);
  position: relative;
}

.filter-tabs {
  display: flex;
  gap: 28px;
}

.tab {
  font-size: 1rem;
  color: #4a5b6b;
  cursor: pointer;
  padding-bottom: 10px;
  border-bottom: 2.5px solid transparent;
  transition: all 0.25s ease;
  font-weight: 500;
  position: relative;
}

.tab::after {
  content: '';
  position: absolute;
  bottom: -2.5px;
  left: 0;
  width: 0;
  height: 2.5px;
  background: #42b983;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.tab:hover::after {
  width: 100%;
}

.tab.active {
  color: #42b983;
  border-bottom-color: #42b983;
  font-weight: 600;
}

.tab.active::after {
  width: 100%;
}

.tab:hover {
  color: #42b983;
}

.search-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(249, 250, 250, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 40px;
  color: #6f8a7c;
  font-size: 0.95rem;
  border: 1px solid rgba(66, 185, 131, 0.25);
  box-shadow: 0 4px 12px -6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s, border-color 0.3s;
}

.search-placeholder:hover {
  border-color: #42b983;
  box-shadow: 0 6px 16px -8px rgba(66, 185, 131, 0.2);
}

.search-icon {
  font-size: 1.2rem;
  opacity: 0.8;
}

/* 活动卡片网格 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
  margin-bottom: 56px;
}

/* 活动卡片 - 深度优化，参照关于页部门卡片 */
.activity-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(66, 185, 131, 0.1);
  position: relative;
}

/* 卡片顶部装饰条 */
.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #42b983, #7ee0b0);
  transform: scaleX(0);
  transition: transform 0.4s ease;
  transform-origin: left;
  z-index: 2;
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 36px -16px rgba(66, 185, 131, 0.25);
  border-color: rgba(66, 185, 131, 0.3);
}

.activity-card:hover::before {
  transform: scaleX(1);
}

/* 图片占位区 - 增强视觉层次 */
.card-img-placeholder {
  height: 170px;
  background: linear-gradient(145deg, #e3f2ec 0%, #c3dfd2 100%);
  position: relative;
  overflow: hidden;
}

/* 图片区装饰图案 */
.card-img-placeholder::after {
  content: '📸';
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 2rem;
  opacity: 0.15;
  transform: rotate(5deg);
}

/* 卡片内容区 */
.card-content {
  padding: 22px 20px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

/* 标签占位 - 改为胶囊微渐变 */
.card-tag-placeholder {
  width: 70px;
  height: 24px;
  background: linear-gradient(120deg, #f0f6f3, #e0ede6);
  border-radius: 30px;
  margin-bottom: 14px;
  border: 1px solid #d4e8de;
}

/* 标题占位 */
.card-title-placeholder {
  font-size: 1.4rem;
  color: #1e2b39;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.3px;
  transition: color 0.2s;
}

.activity-card:hover .card-title-placeholder {
  color: #42b983;
}

/* 元信息行 */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 14px;
  color: #6f8a7c;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fafdfb;
  padding: 2px 10px 2px 8px;
  border-radius: 30px;
  border: 1px solid #e7f0ec;
}

/* 描述占位 */
.card-desc-placeholder {
  color: #4a5b6b;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
  font-size: 0.95rem;
}

/* 卡片底部状态与链接 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid #edf3f0;
}

.status-badge {
  padding: 5px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f2f5f4;
  color: #557a6b;
  letter-spacing: 0.3px;
  border: 1px solid #dde9e3;
}

.status-badge.ongoing {
  background: #e1f3ea;
  color: #1e6f5c;
  border-color: #b3dfcf;
  box-shadow: 0 2px 6px rgba(66, 185, 131, 0.1);
}

.detail-link {
  color: #42b983;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-link:hover {
  color: #2a7a5c;
  transform: translateX(4px);
}

/* 分页占位 - 融入更多风格元素 */
.pagination-placeholder {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 30px;
}

.page-btn {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: white;
  color: #4a5b6b;
  font-weight: 600;
  box-shadow: 0 4px 8px -4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2ece7;
  cursor: pointer;
  transition: all 0.25s;
  font-size: 0.95rem;
}

.page-btn.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
  box-shadow: 0 8px 16px -8px rgba(66, 185, 131, 0.4);
}

.page-btn:hover:not(.active) {
  background: #f4faf7;
  color: #42b983;
  border-color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -8px rgba(66, 185, 131, 0.2);
}

/* 响应式微调 */
@media (max-width: 640px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tabs {
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 16px;
  }

  .activity-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .page-header h2 {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>