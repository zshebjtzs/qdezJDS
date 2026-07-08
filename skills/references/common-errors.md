<!-- skills/references/common-errors.md -->

# 常见错误与修复指南

> 本文档为 AI Agent 提供开发过程中常见错误的速查与修复方案。
> 当遇到类似错误信息或现象时，Agent 应优先查阅本文档，避免重复踩坑。

---

## 1. 数据库字段映射遗漏

**现象**：前端获取到的对象缺少某个字段（如 `post.userId` 为 `undefined`），导致权限判断、链接跳转等失效。

**原因**：后端控制器在返回 JSON 时，未将数据库的 snake_case 字段映射为 camelCase。

**修复**：
```javascript
// 错误：直接返回数据库字段
res.json(post);

// 正确：手动映射
res.json({
  id: post.id,
  userId: post.user_id,   // snake → camel
  createdAt: post.created_at,
});
```

---

## 2. 分页接口参数未传递

**现象**：前端调用分页接口，但后端始终返回第一页数据，或者前端分页组件的总页数始终为 1。

**原因**：前端 API 调用时未传递 `page` 和 `pageSize` 参数。

**修复**：
```javascript
// 错误：缺少分页参数
export const getPostsByCategory = (slug) => {
  return request.get(`/forum/${slug}/posts`);
}

// 正确：传递分页参数
export const getPostsByCategory = (slug, page = 1, pageSize = 10, sortBy = 'time') => {
  return request.get(`/forum/${slug}/posts`, { params: { page, pageSize, sortBy } });
}
```

---

## 3. 样式被全局变量覆盖

**现象**：修改了某个组件的 `<style scoped>` 中的颜色或间距，但不生效。

**原因**：该组件同时引入了全局样式（如 `@import '@/styles/cloud-common.css'`），全局样式可能覆盖了 scoped 样式。

**修复**：
- 检查 `<style scoped>` 顶部的 `@import` 语句。
- 如果全局样式定义了相同选择器，需要在 scoped 中用更高的特异性覆盖（如 `.parent .child`）。
- 或者重构为统一使用 CSS 变量，避免硬编码值。

---

## 4. 上传文件后头像/背景图不更新

**现象**：用户上传新头像后，导航栏或 userInfo 页面的头像仍显示旧图。

**原因**：
1. 浏览器缓存了旧图片 URL。
2. 上传成功后未同步更新 `userStore.userInfo.avatar_url`。

**修复**：
```javascript
// 上传成功后强制更新 store 和时间戳
userStore.setUserInfo({ ...userStore.userInfo, avatar_url: res.avatar_url });
userStore.updateAvatarTimestamp();
```

---

## 5. 封禁状态不实时生效

**现象**：管理员封禁用户后，该用户仍能发帖/评论，直到重新登录才受限。

**原因**：`userStore.bans` 仅在登录时获取，未在后续导航时刷新。

**修复**：在路由守卫中增加封禁状态刷新：
```javascript
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth && userStore.isLoggedIn) {
    await userStore.fetchBans();
    if (userStore.bans.account) {
      userStore.logout();
      return next({ path: '/', query: { banned: '1' } });
    }
  }
  next();
});
```

---

## 6. 提交表单后弹窗仍拦截离开

**现象**：在 `postEdit.vue` 点击提交后，浏览器仍然弹出“确定要离开吗”的确认框。

**原因**：路由守卫 `onBeforeRouteLeave` 未区分“提交成功”和“未保存”两种状态。

**修复**：引入 `isSubmitting` 标志，提交成功后清空内容并设置为 `true`，守卫检测到该标志时直接放行。

---

## 7. 构建失败：`TypeScript` 类型检查报错

**现象**：`npm run build` 时报错 `error TS5083: Cannot read file 'tsconfig.json'`。

**原因**：项目根目录缺少 `tsconfig.json` 文件，或者 `build` 脚本中包含了类型检查步骤。

**修复**：
- 方案一：从本地复制 `tsconfig.json` 到服务器。
- 方案二：改用 `npm run build-only` 跳过类型检查，直接构建。

---

## 8. 环境变量未生效

**现象**：修改了 `.env` 文件但后端仍然使用旧配置。

**原因**：修改 `.env` 后未重启后端服务，或者 `.env` 文件位置不正确。

**修复**：
1. 确认 `.env` 文件在 `server/` 目录下（而不是项目根目录）。
2. 重启后端服务：`Ctrl+C` → `node app.js`。