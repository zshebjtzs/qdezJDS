# 青岛二中机电社网站 (qdezJDS2026)

这是一份标准的 Vue3 + Node.js + MySQL2 全栈项目，支持用户认证、论坛、网盘。  
项目采用 Vibecoding 开发模式，接入 deepseek-v4pro API + Codex 进行应用层代码编写，依赖专业的 Prompt 和 Skill 编写保证项目的可维护性。  
项目的多数架构复用了 Github 的成熟开源项目,例如套用了 Vditor 来为论坛加入 Markdown ，保证网站运行的稳定性。  

## 功能模块
- 用户系统（JWT 认证）
- 内部/公开论坛
- 私有/公共网盘（部门共享）

## 技术栈
- 前端：Vue 3 + Vite + Pinia + Vue Router + Axios
- 后端：Node.js + Express + MySQL2
- 认证：JWT + bcryptjs

## 如何运行
### 1. 克隆仓库
git clone https://github.com/zshebjtzs/qdezJDS.git  
cd qdezJDS  

### 2. 安装依赖
# 前端
npm install  
# 后端
cd ./server  
npm install  

### 3. 配置数据库
- 创建 MySQL 数据库，导入 `server/db/init.sql`
- 复制 `server/.env.example` 为 `.env` 并填写实际配置

### 4. 启动开发服务
# 前端 (根目录)
npm run dev
# 后端 (server 目录)
cd ./server  
node app.js  

## 默认账号
无注册页面，请用 REST Client 或数据库插入用户。

## 许可证
MIT License