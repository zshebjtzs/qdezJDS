// server/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入路由
import authRoutes from './routes/auth.js';
import forumRoutes from './routes/forum.js';
import cloudRoutes from './routes/cloud.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import userListRoutes from './routes/userList.js';

// 导入错误处理中间件
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 获取 __dirname 等价物（ES模块）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 全局中间件
app.use(helmet({
  crossOriginResourcePolicy: false,
}));                            // 安全头
app.use(cors());                                 // 允许跨域（开发环境可配置具体域名）
app.use(express.json());                         // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL-encoded
app.use(morgan('dev'));                          // 日志输出

// 静态文件服务（后续网盘上传的文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由挂载（所有 API 前缀为 /api）
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/cloud', cloudRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userListRoutes);

// 版主指派接口（管理员用）
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 处理（未匹配路由）
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 全局错误处理（最后注册）
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});