// server/controllers/cloudController.js
import upload from '../middlewares/upload.js';
import { getPrivateFiles, getPublicFiles, createFileRecord, getFileById, deleteFileRecord } from '../services/cloudService.js';
import path from 'path';
import fs from 'fs/promises';
import { PROJECT_ROOT } from '../config/paths.js';
import { toUTF8 } from '../utils/encoding.js';

async function moveFile(tempPath, targetDir, fileName) {
  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, fileName);
  await fs.rename(tempPath, targetPath);
  return targetPath;
}

async function deletePhysicalFile(relativePath) {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  try {
    await fs.unlink(fullPath);
  } catch (err) {
    throw err;
  }
}

export const uploadFile = (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || '文件上传失败' });
    }
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }

    try {
      const { type, department } = req.body;
      const userId = req.user?.id;
      const userDept = req.user?.department;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({ error: '未认证用户' });
      }

      let targetRelativeDir = '';
      if (type === 'private') {
        if (userRole !== 'internal' && userRole !== 'admin') {
          return res.status(403).json({ error: '仅内部成员或管理员可上传私有文件' });
        }
        targetRelativeDir = `uploads/private/${userId}`;
      } else if (type === 'public') {
        if (userRole !== 'internal' && userRole !== 'admin') {
          return res.status(403).json({ error: '仅内部成员或管理员可上传公共文件' });
        }
        if (userRole !== 'admin') {
          if (!department || userDept !== department) {
            return res.status(403).json({ error: '只能上传到本部门公共网盘' });
          }
        }
        targetRelativeDir = `uploads/public/${department}`;
      } else {
        return res.status(400).json({ error: '无效的type' });
      }

      const targetAbsoluteDir = path.join(PROJECT_ROOT, targetRelativeDir);
      const tempFilePath = req.file.path;
      const fileName = req.file.filename;
      const finalPath = await moveFile(tempFilePath, targetAbsoluteDir, fileName);
      const relativePath = path.relative(PROJECT_ROOT, finalPath).replace(/\\/g, '/');

      const originalName = toUTF8(req.file.originalname);

      const fileRecord = await createFileRecord({
        fileName: fileName,
        originalName: originalName,
        filePath: relativePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        type,
        ownerId: userId,
        department: type === 'public' ? department : null,
      });

      res.json({ message: '上传成功', fileId: fileRecord.id });
    } catch (error) {
      if (req.file?.path) {
        try { await fs.unlink(req.file.path); } catch (e) { }
      }
      next(error);
    }
  });
};

export const getPrivateList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const q = req.query.q || '';
    const result = await getPrivateFiles(req.user.id, page, pageSize, q);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getPublicList = async (req, res, next) => {
  try {
    const { department } = req.params;
    if (!['art', 'mech', 'soft'].includes(department)) {
      return res.status(400).json({ error: '无效的部门' });
    }
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const q = req.query.q || '';
    const result = await getPublicFiles(department, page, pageSize, q);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const user = req.user;
    if (file.type === 'private') {
      if (file.owner_id !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: '无权限下载此文件' });
      }
    } else if (file.type === 'public') {
      if (user.role !== 'internal' && user.role !== 'admin') {
        return res.status(403).json({ error: '仅内部成员或管理员可下载公共文件' });
      }
    } else {
      return res.status(400).json({ error: '未知文件类型' });
    }

    const filePath = path.join(PROJECT_ROOT, file.file_path);

    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: '文件不存在于磁盘' });
    }

    const encodedFilename = encodeURIComponent(file.original_name);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.download(filePath);
  } catch (err) {
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await getFileById(fileId);
    if (!file) return res.status(404).json({ error: '文件不存在' });

    const user = req.user;
    let canDelete = false;

    if (file.type === 'private') {
      if (file.owner_id === user.id || user.role === 'admin') canDelete = true;
    } else if (file.type === 'public') {
      if (user.role === 'admin') canDelete = true;
      if (file.owner_id === user.id && user.department === file.department) canDelete = true;
    }

    if (!canDelete) {
      return res.status(403).json({ error: '无权限删除此文件' });
    }

    await deleteFileRecord(fileId);
    try {
      await deletePhysicalFile(file.file_path);
    } catch (err) {
      throw err;
    }

    res.json({ message: '删除成功' });
  } catch (err) {
    next(err);
  }
};