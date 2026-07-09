<!-- skills/references/component-docs.md -->

# 核心组件文档

> 本文档为 AI Agent 提供项目中复杂组件的 Props、Emits、依赖关系和使用说明。
> 修改这些组件前，必须阅读本文档。

## 1. Pagination.vue

- **路径**：`src/components/common/Pagination.vue`
- **功能**：通用分页器，显示数字按钮和首尾/上下页。
- **Props**：
  - `currentPage` (Number, 必填)：当前页码（从1开始）。
  - `totalPages` (Number, 必填)：总页数。
  - `maxButtons` (Number, 可选, 默认 7)：最多显示数字按钮数（奇数）。
- **Emits**：
  - `page-change(page)`：用户点击某页时触发，参数为目标页码。
- **依赖**：无外部 store，纯 UI 组件。
- **使用示例**：
  ```vue
  <Pagination :currentPage="page" :totalPages="total" @page-change="handlePage" />
  ```

## 2. userInfo.vue

- **路径**：`src/components/layout/userInfo.vue`
- **功能**：用户信息页，支持“查看自己”（可编辑）和“查看他人”（只读）两种模式。
- **路由参数**：`:uid`
- **核心状态**：
  - `isSelf`：计算属性，判断当前用户是否在查看自己的信息。
  - `user`：用户完整数据对象。
  - `editing`：是否处于编辑模式。
- **依赖的 Store**：`useUserStore` (userInfo, bans, avatarTimestamp)
- **依赖的 API**：`/user/me/profile`, `/user/:uid`, `/user/:uid/posts`, `/user/me/avatar`, `/user/me/cover`, `/user/me/password`, `/user/me/profile` (PATCH)
- **子组件**：MarkdownEditor 被用于回复弹窗（但 userInfo 中没有使用，之前描述有误，实际仅用于背景和头像上传）。
- **注意事项**：
  - 头像上传后需同步更新 `userStore.userInfo.avatar_url` 和 `avatarTimestamp`。
  - 背景上传后需带时间戳以防缓存。

## 3. adminController.vue

- **路径**：`src/components/admin/adminController.vue`
- **功能**：管理员控制面板，用户管理、封禁/解封、授予/撤销版主、板块禁言。
- **路由参数**：`:adminUid`（必须与当前登录管理员 uid 匹配）。
- **核心状态**：
  - `users`：用户列表（分页）。
  - `categories`：板块列表。
  - `userPanel.visible` 和相关封禁时长选择。
  - `categoryPanel.visible`。
- **依赖的 Store**：`useUserStore`
- **依赖的 API**：`/admin/users`, `/admin/categories`, `/admin/ban`, `/admin/unban`, `/admin/grant-mod`, `/admin/revoke-mod`, `/admin/user/:userId/bans`, `/admin/category/:catId/ban-status`
- **权限**：组件内未显式检查，依赖路由守卫和登录状态；但最佳实践是在 `onMounted` 中再次验证 `userStore.userInfo.uid === adminUid` 且 `role === 'admin'`。
- **注意事项**：
  - 执行封禁/解封后需重新获取该用户的封禁详情并更新弹窗。
  - 板块禁言功能目前部分简化，需后续完善。

## 4. postSingle.vue

- **路径**：`src/components/forum/postSingle.vue`
- **功能**：帖子详情页，包含帖子正文、管理栏、二级评论/回复树、回复弹窗、分页。
- **路由参数**：`:slug`, `:postId`
- **核心状态**：
  - `post`：帖子对象。
  - `comments`：评论数组，每个评论包含 `replies` 和回复分页状态。
  - `replyDialog`：回复弹窗状态（visible, commentId, replyToUserId, parentReplyId）。
  - `allCommentsCollapsed`, `collapsedReplies`：展开/收起状态。
- **依赖的 Store**：`useUserStore`
- **依赖的 API**：`getPostDetail`, `deletePost`, `updatePostPermission`, `getComments`, `addComment`, `getReplies`, `addReply`, `deleteComment`, `deleteReply`
- **关键计算属性**：
  - `canDelete`：删除帖子权限（管理员/版主/作者）。
  - `canManagePerms`：修改帖子权限（仅管理员/版主，不含作者）。
  - `canReply`：能否发表评论/回复（受帖子设置、用户禁言、板块禁言影响）。
- **重要逻辑**：
  - `buildReplyTree`：将扁平回复数据转为两级嵌套树，深度限制为2。
  - 回复按钮通过 `openReplyDialog` 打开弹窗，提交后重新加载对应评论的回复。
  - 板块禁言状态通过 `fetchCategoryBan` 获取并缓存在 store 中。

## 5. MarkdownEditor (editor.vue)

- **路径**：`src/markdown/editor.vue`
- **功能**：封装 Vditor 编辑器，支持分屏预览、工具栏配置、数学公式、上传预留。
- **Props**：
  - `modelValue` (String)：编辑器内容，支持 v-model。
  - `placeholder` (String, 默认 "请输入内容...")：占位文本。
  - `height` (Number, 默认 400)：编辑器高度。
- **Emits**：
  - `update:modelValue`：内容变化时触发。
- **依赖**：无外部 store，纯 UI 组件。
- **初始化**：`onMounted` 中通过 `nextTick` 确保 DOM 渲染后创建 Vditor 实例，若容器高度为0则延迟重试。
- **注意事项**：组件卸载时需调用 `vditorInstance.destroy()` 释放资源。