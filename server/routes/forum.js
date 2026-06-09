// server/routes/forum.js
import express from 'express';
import {
  getCategories,
  getPosts,
  getPostDetail,
  addPost,
  addReply,
  updatePostPermission,
  deletePost
} from '../controllers/forumController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 公开的板块列表（所有人可看，后续可根据角色过滤）
router.get('/categories', getCategories);

// 板块帖子列表（需按情况认证）
router.get('/:slug/posts', authMiddleware, getPosts);

// 获取帖子详情
router.get('/:slug/posts/:postId', authMiddleware, getPostDetail);

// 发帖
router.post('/:slug/posts', authMiddleware, addPost);

// 回复帖子
router.post('/:slug/posts/:postId/replies', authMiddleware, addReply);

// 修改帖子权限
router.patch('/:slug/posts/:postId/permission', authMiddleware, updatePostPermission);

// 删除帖子
router.delete('/:slug/posts/:postId', authMiddleware, deletePost);

export default router;