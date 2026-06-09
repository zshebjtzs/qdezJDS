// server/controllers/userController.js
import { 
  findUserByUsername, findUserById, 
  updateUsername, updatePassword, updateProfile, updateAvatar, updateCover, findUserByUid 
} from '../services/userService.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { PROJECT_ROOT } from '../config/paths.js';

import { getRecentPostsByUserId } from '../services/forumService.js';

// 获取他人公开信息
export const getUserPublic = async (req, res, next) => {
  try {
    const { uid } = req.params;
    // 防止误将 'me' 路由到这里（因路由顺序已避免，但额外检查）
    if (uid === 'me' || uid === 'me/profile') {
      return res.status(400).json({ error: '无效的用户标识' });
    }
    const user = await findUserByUid(uid);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    // 仅返回公开字段
    const publicUser = {
      uid: user.uid,
      username: user.username,
      previous_username: user.previous_username,
      real_name: user.real_name,
      avatar_url: user.avatar_url,
      cover_url: user.cover_url,
      bio: user.bio,
      department: user.department,
      role: user.role,
      theme_color: user.theme_color,
      contacts: user.contacts,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
    };
    res.json(publicUser);
  } catch (err) {
    next(err);
  }
};

// 获取自己的完整信息（除密码外）
export const getOwnProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    const { password, ...ownData } = user;  // 删除密码字段
    res.json(ownData);
  } catch (err) {
    next(err);
  }
};

// 1. 修改用户名（含3天冷却）
export const changeUsername = async (req, res, next) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ error: '新用户名不能为空' });

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    // 检查冷却时间
    if (user.username_changed_at) {
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - new Date(user.username_changed_at).getTime() < threeDays) {
        return res.status(429).json({ error: '每3天只能修改一次用户名' });
      }
    }

    // 检查是否与旧用户名相同
    if (newUsername === user.username) {
      return res.status(400).json({ error: '新用户名与当前用户名相同' });
    }

    // 检查唯一性
    const existing = await findUserByUsername(newUsername);
    if (existing) return res.status(409).json({ error: '用户名已被占用' });

    await updateUsername(req.user.id, newUsername);
    res.json({ message: '用户名已更新', previous_username: user.username });
  } catch (err) {
    next(err);
  }
};

// 2. 修改密码
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }

    const user = await findUserById(req.user.id);
    const valid = await comparePassword(oldPassword, user.password);
    if (!valid) return res.status(403).json({ error: '旧密码错误' });

    const hashed = await hashPassword(newPassword);
    await updatePassword(req.user.id, hashed);
    res.json({ message: '密码已修改' });
  } catch (err) {
    next(err);
  }
};

// 3. 修改个人资料
export const editProfile = async (req, res, next) => {
  try {
    const allowedFields = ['real_name', 'bio', 'theme_color', 'contacts'];
    const profileData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        profileData[field] = req.body[field];
      }
    }
    await updateProfile(req.user.id, profileData);
    res.json({ message: '个人资料已更新' });
  } catch (err) {
    next(err);
  }
};

// 4. 上传头像（使用 multer 单文件，并裁剪多尺寸）
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未上传文件' });

    const userId = req.user.id;
    const uid = req.user.uid;
    const tempPath = req.file.path;
    const outputDir = path.join(PROJECT_ROOT, 'uploads', 'avatars');
    await fs.mkdir(outputDir, { recursive: true });

    const sizes = [
      { suffix: 'small', width: 32 },
      { suffix: 'medium', width: 48 },
      { suffix: 'large', width: 96 }
    ];

    for (const size of sizes) {
      const outPath = path.join(outputDir, `${uid}_${size.suffix}.png`);
      await sharp(tempPath)
        .resize(size.width, size.width, { fit: 'cover' })
        .png()
        .toFile(outPath);
    }

    const avatarUrl = `uploads/avatars/${uid}_large.png`;
    await updateAvatar(userId, avatarUrl);

    // 删除临时文件
    await fs.unlink(tempPath).catch(() => {});
    res.json({ message: '头像已更新', avatar_url: avatarUrl });
  } catch (err) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};

// 5. 上传背景图（裁剪 1200×300）
export const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未上传文件' });

    const uid = req.user.uid;
    const tempPath = req.file.path;
    const outputDir = path.join(PROJECT_ROOT, 'uploads', 'covers');
    await fs.mkdir(outputDir, { recursive: true });

    const outPath = path.join(outputDir, `${uid}_cover.png`);
    await sharp(tempPath)
      .resize(1200, 300, { fit: 'cover' })
      .png()
      .toFile(outPath);

    const coverUrl = `uploads/covers/${uid}_cover.png`;
    await updateCover(req.user.id, coverUrl);

    await fs.unlink(tempPath).catch(() => {});
    res.json({ message: '背景图已更新', cover_url: coverUrl });
  } catch (err) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};

// 获取某用户最近帖子
export const getUserRecentPosts = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    
    // 先通过 uid 获取用户内部 id
    const user = await findUserByUid(uid);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const posts = await getRecentPostsByUserId(user.id, Math.min(limit, 10)); // 最多10条
    res.json(posts);
  } catch (err) {
    next(err);
  }
};