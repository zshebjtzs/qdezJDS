<template>
  <div class="about-page">
    <!-- 页面标题区 - 增加背景光晕装饰 -->
    <section class="page-header">
      <div class="header-glow"></div>
      <h2>关于我们</h2>
      <p class="subtitle">机电融合 · 创新无限</p>
      <div class="header-divider"></div>
    </section>

    <!-- 社团简介区域 - 图文错落布局优化 -->
    <section class="about-section">
      <div class="section-title">
        <span class="title-deco"></span>
        <h3>社团简介</h3>
        <span class="title-deco right"></span>
      </div>
      <div class="intro-card enhanced">
        <div class="intro-text">
          <p class="placeholder-text">
            青岛二中机电社成立于 <span class="highlight">2024</span>，是校内最具活力的科技类社团之一。
            我们致力于为对机械、电子、软件感兴趣的同学们提供一个实践与交流的平台。
          </p>
          <p class="placeholder-text">
            社团秉持<span class="slogan-text">“动手创造，智慧共享”</span>的理念，通过项目驱动、竞赛参与、
            工作坊分享等形式，激发成员创新思维，提升综合工程素养。
          </p>
          <!-- 装饰性数据小标签 -->
          <div class="stat-badges">
            <span class="stat-badge"><strong>10+</strong> 项目</span>
            <span class="stat-badge"><strong>50+</strong> 成员</span>
            <span class="stat-badge"><strong>5+</strong> 奖项</span>
          </div>
        </div>
        <div class="intro-img-placeholder enhanced">
          <div class="img-box">
            <div class="img-overlay">
              <span class="overlay-icon">📸</span>
            </div>
          </div>
          <div class="img-caption">
            <span class="caption-line"></span>
            社团合照 / 活动剪影
            <span class="caption-line"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- 部门风采区域 - 卡片增加悬停细节与装饰 -->
    <section class="about-section">
      <div class="section-title">
        <span class="title-deco"></span>
        <h3>部门风采</h3>
      </div>
      <div class="dept-grid">
        <!-- 机械部卡片 -->
        <div class="dept-card">
          <div class="dept-icon-wrapper">
            <div class="dept-icon">⚙️</div>
            <div class="icon-glow"></div>
          </div>
          <h4>机械部</h4>
          <p class="dept-desc placeholder-text">
            负责结构设计、加工装配与机械创新。拥有3D打印机、激光切割机等设备，
            让创意从图纸变为现实。
          </p>
          <div class="card-footer-deco"></div>
        </div>
        <!-- 软件部卡片 -->
        <div class="dept-card">
          <div class="dept-icon-wrapper">
            <div class="dept-icon">💻</div>
            <div class="icon-glow"></div>
          </div>
          <h4>软件部</h4>
          <p class="dept-desc placeholder-text">
            专注嵌入式开发、算法应用与前端设计。从底层驱动到用户界面，
            用代码赋予机器灵魂。
          </p>
          <div class="card-footer-deco"></div>
        </div>
        <!-- 文艺部卡片 -->
        <div class="dept-card">
          <div class="dept-icon-wrapper">
            <div class="dept-icon">🎨</div>
            <div class="icon-glow"></div>
          </div>
          <h4>文艺部</h4>
          <p class="dept-desc placeholder-text">
            负责社团宣传、活动策划与视觉设计。用文字与影像记录精彩瞬间，
            传播机电文化。
          </p>
          <div class="card-footer-deco"></div>
        </div>
      </div>
    </section>

    <!-- 基本信息区域 - 重新设计为双栏信息卡与荣誉墙组合 -->
    <section class="about-section">
      <div class="section-title">
        <span class="title-deco"></span>
        <h3>基本信息</h3>
      </div>
      <div class="info-wrapper">
        <div class="info-panel modern">
          <div class="info-item">
            <span class="info-icon">📍</span>
            <div class="info-content">
              <span class="info-label">活动地点</span>
              <span class="info-value placeholder-text">教学楼二楼无用空间</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📅</span>
            <div class="info-content">
              <span class="info-label">常规活动时间</span>
              <span class="info-value placeholder-text">每周四 15:10 - 16:50 | 双休及节假日</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📧</span>
            <div class="info-content">
              <span class="info-label">联系邮箱</span>
              <span class="info-value placeholder-text"> </span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">🏆</span>
            <div class="info-content">
              <span class="info-label">主要荣誉</span>
              <span class="info-value placeholder-text"> </span>
            </div>
          </div>
        </div>
        <!-- 新增荣誉徽章墙 - 纯装饰静态展示 -->
        <div class="honor-wall">
          <div class="honor-item">
            <div class="honor-badge">🥇</div>
            <span>创新大赛一等奖</span>
          </div>
          <div class="honor-item">
            <div class="honor-badge">🏅</div>
            <span>优秀社团</span>
          </div>
          <div class="honor-item">
            <div class="honor-badge">🔧</div>
            <span>最佳工程奖</span>
          </div>
          <div class="honor-item">
            <div class="honor-badge">📋</div>
            <span>专利3项</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 愿景结语 - 增强视觉效果 -->
    <div class="vision-statement enhanced">
      <div class="vision-quote">❝</div>
      <p class="placeholder-text">期待与你一同探索科技的无限可能。</p>
      <div class="vision-quote right">❞</div>
    </div>
  </div>
</template>

<style scoped>
/* 关于页面容器 */
.about-page {
  margin: 40px 0 60px;
  position: relative;
}

/* ---------- 页面标题区优化 ---------- */
.page-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.header-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(66, 185, 131, 0.08) 0%, transparent 70%);
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  z-index: -1;
}

.page-header h2 {
  font-size: 2.8rem;
  color: #2c3e50;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
  font-weight: 700;
  background: linear-gradient(135deg, #2c3e50 0%, #42b983 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  padding: 0 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 400;
  letter-spacing: 1px;
}

.header-divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #42b983, transparent);
  margin: 20px auto 0;
  border-radius: 2px;
}

/* 区块标题装饰增强 */
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.title-deco {
  width: 6px;
  height: 28px;
  background: linear-gradient(to bottom, #42b983, #2ecc71);
  border-radius: 6px;
  margin-right: 15px;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.title-deco.right {
  margin-left: auto;
  margin-right: 0;
  opacity: 0.4;
}

.section-title h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
  position: relative;
}

/* 简介卡片增强 */
.intro-card.enhanced {
  display: flex;
  gap: 40px;
  background: white;
  border-radius: 24px;
  padding: 30px 30px 30px 40px;
  box-shadow: 0 15px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(66, 185, 131, 0.15);
  backdrop-filter: blur(2px);
  transition: box-shadow 0.3s;
}

.intro-card.enhanced:hover {
  box-shadow: 0 20px 40px -12px rgba(66, 185, 131, 0.2);
}

.intro-text {
  flex: 1.2;
}

.highlight {
  color: #42b983;
  font-weight: 600;
  background: linear-gradient(120deg, rgba(66,185,131,0.1) 0%, rgba(66,185,131,0.1) 100%);
  padding: 2px 8px;
  border-radius: 20px;
}

.slogan-text {
  font-weight: 600;
  color: #2c3e50;
  border-left: 3px solid #42b983;
  padding-left: 12px;
}

.stat-badges {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.stat-badge {
  background: #f8fbfa;
  padding: 6px 16px;
  border-radius: 40px;
  font-size: 0.9rem;
  color: #555;
  border: 1px solid #e0f0e8;
}

.stat-badge strong {
  color: #42b983;
  font-size: 1.2rem;
  margin-right: 4px;
}

/* 图片占位增强 */
.intro-img-placeholder.enhanced {
  flex: 0.8;
  text-align: center;
}

.img-box {
  height: 200px;
  background: linear-gradient(145deg, #eaf7f0 0%, #c8e6d9 100%);
  border-radius: 20px;
  margin-bottom: 12px;
  border: 1px solid rgba(66, 185, 131, 0.3);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.02), 0 8px 20px -8px rgba(66,185,131,0.2);
  position: relative;
  overflow: hidden;
}

.img-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: backdrop-filter 0.3s;
}

.img-box:hover .img-overlay {
  backdrop-filter: blur(2px);
}

.overlay-icon {
  font-size: 3rem;
  opacity: 0.6;
  transform: scale(1);
  transition: transform 0.3s;
}

.img-box:hover .overlay-icon {
  transform: scale(1.1);
  opacity: 0.8;
}

.img-caption {
  color: #888;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.caption-line {
  width: 30px;
  height: 1px;
  background: #ddd;
}

/* 部门卡片深度优化 */
.dept-card {
  background: white;
  border-radius: 20px;
  padding: 30px 20px 25px;
  box-shadow: 0 10px 20px -8px rgba(0,0,0,0.06);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid #f0f6f3;
  position: relative;
  overflow: hidden;
}

.dept-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #42b983, #7ee0b0);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.dept-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 30px -10px rgba(66, 185, 131, 0.15);
  border-color: rgba(66, 185, 131, 0.3);
}

.dept-card:hover::before {
  transform: scaleX(1);
}

.dept-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.dept-icon {
  font-size: 3.2rem;
  transition: transform 0.2s;
  filter: drop-shadow(0 4px 6px rgba(66,185,131,0.2));
}

.dept-card:hover .dept-icon {
  transform: scale(1.05);
}

.icon-glow {
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(66,185,131,0.15) 0%, transparent 70%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s;
}

.dept-card:hover .icon-glow {
  opacity: 1;
}

.dept-card h4 {
  font-size: 1.6rem;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.dept-desc {
  color: #666;
  line-height: 1.7;
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.card-footer-deco {
  width: 40px;
  height: 2px;
  background: #42b983;
  margin: 0 auto;
  border-radius: 2px;
  opacity: 0.3;
  transition: width 0.3s, opacity 0.3s;
}

.dept-card:hover .card-footer-deco {
  width: 60px;
  opacity: 0.8;
}

/* 基本信息区域 - 双栏布局 */
.info-wrapper {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}

.info-panel.modern {
  background: white;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 10px 20px -8px rgba(0,0,0,0.06);
  border: 1px solid #f0f6f3;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 1.4rem;
  min-width: 28px;
  text-align: center;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
}

/* 荣誉墙 */
.honor-wall {
  background: linear-gradient(135deg, #f9fdfb 0%, #ffffff 100%);
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 10px 20px -8px rgba(0,0,0,0.04);
  border: 1px solid rgba(66, 185, 131, 0.15);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  align-content: start;
}

.honor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}

.honor-item:hover {
  transform: translateY(-3px);
}

.honor-badge {
  font-size: 2rem;
  margin-bottom: 8px;
}

.honor-item span:last-child {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

/* 愿景区域增强 */
.vision-statement.enhanced {
  text-align: center;
  margin-top: 60px;
  padding: 30px 20px;
  background: linear-gradient(105deg, #f9fdfb 0%, #ffffff 100%);
  border-radius: 60px 20px 60px 20px;
  font-size: 1.3rem;
  color: #2c3e50;
  font-style: normal;
  box-shadow: 0 10px 20px -8px rgba(66,185,131,0.1);
  border: 1px solid rgba(66, 185, 131, 0.2);
  position: relative;
}

.vision-quote {
  font-size: 3rem;
  color: #42b983;
  opacity: 0.3;
  line-height: 1;
  font-family: serif;
}

.vision-quote.right {
  text-align: right;
}

.vision-statement p {
  margin: 10px 0;
  font-weight: 500;
}

/* 响应式保持 */
@media (max-width: 700px) {
  .intro-card.enhanced {
    flex-direction: column;
    padding: 25px;
  }
  
  .info-wrapper {
    grid-template-columns: 1fr;
  }
  
  .honor-wall {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-header h2 {
    font-size: 2.2rem;
  }
  
  .stat-badges {
    flex-wrap: wrap;
  }
}
</style>