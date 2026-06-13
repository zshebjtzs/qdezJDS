// server/middlewares/upload.js
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { PROJECT_ROOT } from '../config/paths.js';

// 临时目录（所有文件先上传到这里）
const tempDir = path.join(PROJECT_ROOT, 'uploads', 'temp');
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 所有文件先存到临时目录
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  }
});

// 文件类型过滤(待定)
// const fileFilter = (req, file, cb) => {
//   const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip', 'text/plain'];
//   if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|pdf|zip|txt)$/i)) {
//     cb(null, true);
//   } else {
//     cb(new Error('不支持的文件类型'), false);
//   }
// };

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  // fileFilter,
});

export default upload;


const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(PROJECT_ROOT, 'uploads', 'temp')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(PROJECT_ROOT, 'uploads', 'temp')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cover_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持 JPEG、PNG、WebP、SVG 格式'), false);
  }
});

export const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持 JPEG、PNG、WebP 格式'), false);
  }
});