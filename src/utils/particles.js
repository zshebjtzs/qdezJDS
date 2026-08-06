// src/utils/particles.js
// 星座网络粒子场：Canvas 绘制 + 鼠标交互，零外部依赖

/**
 * 在指定 canvas 上初始化粒子场
 * @param {HTMLCanvasElement} canvas - 目标 canvas 元素
 * @param {Object} options - 可覆盖的配置
 * @returns {{ destroy: Function }} 返回销毁句柄
 */
export function initParticles(canvas, options = {}) {
  const DEFAULTS = {
    minCount: 40,           // 最少粒子数
    maxCount: 120,          // 最多粒子数
    areaPerParticle: 18000, // 每像素面积对应的粒子数基准
    minSize: 1,             // 最小粒子尺寸
    maxSize: 3,             // 最大粒子尺寸
    speed: 0.5,             // 漂移速度系数
    linkDistance: 120,      // 连线阈值（px）
    lineAlpha: 0.15,        // 连线基准透明度
    pushRadius: 150,        // 鼠标推挤半径
    pushForce: 1.5,         // 鼠标推挤力度
    parallax: 18,           // 视差最大位移（px）
    colors: ['#42b983', '#ffffff', '#a0e6c8', '#5cd6a3'],
  };

  const opts = { ...DEFAULTS, ...options };
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let running = false;
  let resizeObserver = null;

  // 鼠标状态（视差用平滑值）
  const mouse = { x: -9999, y: -9999, active: false };
  let targetPX = 0, targetPY = 0; // 视差目标
  let curPX = 0, curPY = 0;       // 视差当前值（lerp）

  // 按面积动态计算粒子数
  const computeCount = () => {
    const area = width * height;
    const n = Math.floor(area / opts.areaPerParticle);
    return Math.min(opts.maxCount, Math.max(opts.minCount, n));
  };

  const createParticle = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * opts.speed * 2,
    vy: (Math.random() - 0.5) * opts.speed * 2,
    size: opts.minSize + Math.random() * (opts.maxSize - opts.minSize),
    color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
  });

  // 根据容器尺寸重置画布与粒子
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) {
      // 布局尚未就绪，延迟重试
      setTimeout(resize, 100);
      return;
    }
    dpr = window.devicePixelRatio || 1;
    // 只设置绘制分辨率（backing store），显示尺寸交给 CSS（position:absolute; inset:0）
    // 这样无论测量时机如何，画布都始终铺满容器，不会因内联宽高被冻结成小矩形
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: computeCount() }, createParticle);
  };

  // 绘制一帧（reduced-motion 时用于静态星空）
  const drawFrame = (withMotion) => {
    ctx.clearRect(0, 0, width, height);

    // 视差平移
    if (withMotion) {
      ctx.save();
      ctx.translate(curPX, curPY);
    }

    // 连线（星座网络）
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < opts.linkDistance) {
          const alpha = (1 - dist / opts.linkDistance) * opts.lineAlpha;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 粒子
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    if (withMotion) ctx.restore();
  };

  const step = () => {
    if (!running) return;

    // 更新粒子位置 + 鼠标推挤
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // 边界回绕
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // 鼠标推挤
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < opts.pushRadius && dist > 0.01) {
          const force = (opts.pushRadius - dist) / opts.pushRadius * opts.pushForce;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }
    }

    // 视差 lerp 平滑
    curPX += (targetPX - curPX) * 0.06;
    curPY += (targetPY - curPY) * 0.06;

    drawFrame(true);
    rafId = requestAnimationFrame(step);
  };

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
    // 视差目标：以画布中心为原点，范围 ±parallax
    targetPX = (mouse.x / width - 0.5) * 2 * opts.parallax;
    targetPY = (mouse.y / height - 0.5) * 2 * opts.parallax;
  };

  const onMouseLeave = () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
    targetPX = 0;
    targetPY = 0;
  };

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  const start = () => {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(step);
    }
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };

  const destroy = () => {
    stop();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    // 事件挂在 canvas 的父元素（hero）上，避免 pointer-events 拦截内容
    const parent = canvas.parentElement;
    if (parent) {
      parent.removeEventListener('mousemove', onMouseMove);
      parent.removeEventListener('mouseleave', onMouseLeave);
    }
  };

  // 监听挂在父容器（hero），canvas 自身 pointer-events:none 不挡内容
  const parent = canvas.parentElement;
  if (parent) {
    parent.addEventListener('mousemove', onMouseMove);
    parent.addEventListener('mouseleave', onMouseLeave);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);

  // 初次校准（若布局尚未就绪，resize 内部会用 0 尺寸兜底重试）
  resize();

  // 首帧绘制后再校准一次，确保拿到最终布局尺寸（防止挂载早期读到未定型/偏小的尺寸）
  requestAnimationFrame(() => {
    requestAnimationFrame(resize);
  });

  // 监听父容器尺寸变化（视口缩放 / 布局调整 / 内容高度变化），自动重同步绘制分辨率
  if (parent && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(parent);
  }

  if (prefersReduced) {
    // 减少动效偏好：只画一帧静态星空
    drawFrame(false);
    return { destroy };
  }

  start();
  return { destroy };
}
