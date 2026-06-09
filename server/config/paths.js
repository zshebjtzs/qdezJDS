// server/config/paths.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server 目录的绝对路径
export const SERVER_ROOT = __dirname;
// 项目根目录（server 的上一级，即包含 src、index.html 等）
export const PROJECT_ROOT = path.resolve(__dirname, '..');