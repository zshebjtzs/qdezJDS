// server/routes/forum.js
import express from 'express';
import {
  getCategories,
  getPosts,
  getPostDetail,
  addPost,
  updatePostPermission,
  deletePost,
  addComment,
  getComments,
  addReply,
  getReplies
} from '../controllers/forumController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 获取板块列表（无需认证）
router.get('/categories', getCategories);

// 独立评论和回复路由，避免与 :slug 冲突
router.post('/comments/:commentId/replies', authMiddleware, addReply);
router.get('/comments/:commentId/replies', authMiddleware, getReplies);

// 帖子相关
router.get('/:slug/posts', authMiddleware, getPosts);
router.get('/:slug/posts/:postId', authMiddleware, getPostDetail);
router.post('/:slug/posts', authMiddleware, addPost);
router.patch('/:slug/posts/:postId/permission', authMiddleware, updatePostPermission);
router.delete('/:slug/posts/:postId', authMiddleware, deletePost);

// 评论路由
router.post('/:slug/posts/:postId/comments', authMiddleware, addComment);
router.get('/:slug/posts/:postId/comments', authMiddleware, getComments);

export default router;