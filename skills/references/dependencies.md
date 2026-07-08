<!-- skills/references/dependencies.md -->

> 本文档为 AI Agent 提供项目中关键 npm 依赖包及其用途的速查信息。
> Agent 在需要判断某个功能是否已有现成库、或评估是否应引入新依赖时，应参考本文档。

# 关键依赖列表

## 前端

| 包名 | 用途 | 备注 |
|------|------|------|
| vue | 核心框架 | 3.x，组合式 API |
| vue-router | 路由 | 含导航守卫 |
| pinia | 状态管理 | |
| axios | HTTP 请求 | |
| vditor | Markdown 编辑器 | 已封装在 `src/markdown/editor.vue` |
| markdown-it | Markdown 解析 | 用于帖子内容渲染 |
| markdown-it-texmath | 数学公式插件 | 配合 KaTeX |
| katex | 公式渲染 | |
| highlight.js | 代码高亮 | |
| dompurify | XSS 防护 | |
| cropperjs | 图片裁剪 | 头像/背景图裁剪（待完善） |

## 后端

| 包名 | 用途 | 备注 |
|------|------|------|
| express | Web 框架 | |
| mysql2 | MySQL 驱动 | promise 模式 |
| jsonwebtoken | JWT 签发验证 | |
| bcryptjs | 密码哈希 | |
| multer | 文件上传 | |
| sharp | 图片处理 | 头像/背景图裁剪 |
| axios | HTTP 请求 | 用于极验验证码二次验证 |
| cors | 跨域处理 | |
| helmet | 安全头 | |
| morgan | 请求日志 | |
| dotenv | 环境变量 | |
| uuid | 唯一文件名生成 | |
| iconv-lite | 编码转换 | 处理中文文件名 |