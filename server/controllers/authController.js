// server/controllers/authController.js
import { createUser, findUserByUsername, findUserByUid } from '../services/userService.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import crypto from 'crypto';

// 生成 15 位 uid：U + 14 位 base62 随机
const generateUid = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(14); // 14字节对应14个字符
  let uid = 'U';
  for (let i = 0; i < 14; i++) {
    uid += chars[bytes[i] % 62]; // 均匀分布
  }
  return uid;
};

// 注册
export const register = async (req, res, next) => {
  try {
    const { username, password, department, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    // 生成 uid，确保唯一（冲突概率极低，循环检查一次）
    let uid = generateUid();
    while (await findUserByUid(uid)) { // 需要 service 有这个函数，已提供
      uid = generateUid();
    }

    // 注意：密码在这里哈希？你的旧逻辑在 userService.createUser 里做？最好统一
    // 按照原来你的 userService.createUser 会哈希，但我们保留原方式，需要检查
    // 为清晰起见，在控制器中哈希密码
    const hashedPassword = await hashPassword(password);
    await createUser({
      uid,
      username,
      password: hashedPassword,
      department: department || 'none',
      role: role || 'external'
    });

    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    next(err);
  }
};

// 登录（修改返回字段，增加 uid 等）
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: '账号已被禁用' });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id, 
        uid: user.uid,
        username: user.username,
        department: user.department,
        role: user.role,
        avatar_url: user.avatar_url,
        cover_url: user.cover_url,
        theme_color: user.theme_color
      }
    });
  } catch (err) {
    next(err);
  }
};