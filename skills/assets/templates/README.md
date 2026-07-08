<!-- skills/assets/templates/README.md -->

# 代码模板使用指南

> 本文档为 AI Agent 提供项目代码模板的使用说明。
> 当 Agent 需要新建文件时，应优先使用这些模板，确保生成的文件符合项目规范。

## 使用方式

1. 根据要创建的文件类型，选择对应模板（Vue 组件、后端 Service、后端 Controller 等）。
2. 复制模板内容。
3. 将模板中的占位符（`{{  }}` 包裹的部分）替换为实际内容。
4. 确保文件第一行的路径注释正确无误（如 `// src/components/forum/newComponent.vue`）。
5. 将文件保存到正确的路径。

## 模板列表

| 模板文件 | 用途 |
|---------|------|
| `component-skeleton.vue` | 创建新的 Vue 3 组合式 API 组件 |
| `component-page.vue` | 创建新的页面级组件（含基础布局） |
| `service-skeleton.js` | 创建新的后端 Service 层模块 |
| `controller-skeleton.js` | 创建新的后端 Controller 层模块 |

## 占位符说明

| 占位符 | 说明 |
|--------|------|
| `{{ FILE_PATH }}` | 文件的完整相对路径，如 `src/components/forum/postCard.vue` |
| `{{ COMPONENT_NAME }}` | 组件名（PascalCase），如 `PostCard` |
| `{{ MODULE_NAME }}` | 模块名（camelCase），如 `postService` |
| `{{ FUNCTION_NAME }}` | 函数名（camelCase），如 `getPostById` |
| `{{ DESCRIPTION }}` | 功能描述，如 `获取帖子详情` |