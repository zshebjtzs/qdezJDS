// server/controllers/forumController.js
import * as forumService from '../services/forumService.js';
import * as categoryService from '../services/categoryService.js';
import * as commentService from '../services/commentService.js';
import * as replyService from '../services/replyService.js';
import * as viewService from '../services/viewService.js';
import * as moderatorService from '../services/moderatorService.js';
import { isModerator } from '../services/moderatorService.js';
import pool from '../config/db.js';

// ---------- 板块相关 ----------

// 获取公开的板块列表
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// ---------- 帖子列表 ----------

// 获取指定板块的帖子列表（分页）
export const getPosts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortBy = req.query.sortBy || 'time';

    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    // 权限检查：内部板块仅 internal/admin/版主 可访问
    if (category.type === 'internal') {
      if (!req.user || (req.user.role !== 'internal' && req.user.role !== 'admin')) {
        if (!req.user || !(await isModerator(req.user.id, category.id))) {
          return res.status(403).json({ error: '无权访问内部板块' });
        }
      }
    }

    const result = await forumService.getPostsByCategory(category.id, req.user?.id, page, pageSize, sortBy);
    
    // 获取该板块版主 ID 列表（仍需要，用于前端判断版主权限）
    const modIds = await moderatorService.getModeratorsByCategory(category.id);
    
    res.json({
      categoryName: category.name,
      moderatorIds: modIds,
      ...result          // 展开 data, total, page, pageSize, totalPages
    });
  } catch (err) {
    next(err);
  }
};

// ---------- 帖子详情 ----------

// 获取帖子详情（不包含评论和回复，仅帖子本身信息）
export const getPostDetail = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await forumService.getPostById(postId);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    // 浏览权限检查
    if (!post.can_browse) {
      const isAuthor = req.user?.id === post.user_id;
      const isAdmin = req.user?.role === 'admin';
      const isMod = await isModerator(req.user?.id, category.id);
      if (!isAuthor && !isAdmin && !isMod) {
        return res.status(403).json({ error: '该帖子限制了浏览' });
      }
    }

    // 记录浏览（已登录用户）
    if (req.user) {
      await viewService.recordView(req.user.id, post.id);
    }

    const modIds = await moderatorService.getModeratorsByCategory(category.id);

    // 组装数据（不再包含 replies 列表，评论单独请求）
    const postData = {
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.user_id,
      username: post.username,
      authorUid: post.authorUid,          // 来自 getPostById 的扩展字段
      role: post.role, 
      authorAvatar: post.authorAvatar,
      department: post.department,
      forumType: post.forum_type,
      categoryId: post.category_id,
      canReply: !!post.can_reply,
      canBrowse: !!post.can_browse,
      viewCount: post.view_count,
      createdAt: post.created_at,
      moderatorIds: modIds
    };

    res.json(postData);
  } catch (err) {
    next(err);
  }
};

// ---------- 帖子操作 ----------

// 发帖
export const addPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { slug } = req.params;
    const user = req.user;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    // 权限验证：公开板块所有登录用户可发帖；内部板块仅 internal/admin/该板块版主可发
    if (category.type === 'internal') {
      if (user.role !== 'internal' && user.role !== 'admin' && !(await isModerator(user.id, category.id))) {
        return res.status(403).json({ error: '无权限在该板块发帖' });
      }
    }

    const forumType = category.type; // 发帖类型由板块决定
    const newPost = await forumService.createPost({
      title,
      content,
      userId: user.id,
      department: user.department,
      forumType,
      categoryId: category.id,
    });

    res.status(201).json({
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      userId: newPost.userId,
      username: user.username,
      department: user.department,
      forumType: newPost.forumType,
      categoryId: newPost.categoryId,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

// 修改帖子权限（can_reply, can_browse）
export const updatePostPermission = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { field, value } = req.body; // field: 'can_reply' or 'can_browse', value: boolean
    if (!['can_reply', 'can_browse'].includes(field)) {
      return res.status(400).json({ error: '无效字段' });
    }

    const post = await forumService.getPostById(postId);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    // 权限：只有管理员或该板块版主可以修改
    const isMod = await isModerator(req.user.id, category.id);
    if (req.user.role !== 'admin' && !isMod) {
      return res.status(403).json({ error: '无权限修改帖子设置' });
    }

    await forumService.updatePostPermission(postId, field, value ? 1 : 0);
    res.json({ message: '更新成功' });
  } catch (err) {
    next(err);
  }
};

// 删除帖子
export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await forumService.getPostById(postId);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    let canDelete = false;
    if (req.user.id === post.user_id) canDelete = true;
    if (req.user.role === 'admin') canDelete = true;
    if (await isModerator(req.user.id, category.id)) canDelete = true;

    if (!canDelete) return res.status(403).json({ error: '无权限删除此帖子' });

    await forumService.deletePost(postId);
    res.json({ message: '帖子已删除' });
  } catch (err) {
    next(err);
  }
};

// ---------- 评论接口 ----------

// 发表评论
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '评论内容不能为空' });

    const post = await forumService.getPostById(postId);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    // 检查帖子是否允许评论
    if (!post.can_reply) {
      return res.status(403).json({ error: '该帖已禁止评论' });
    }

    const commentId = await commentService.createComment(postId, req.user.id, content);
    res.status(201).json({ id: commentId, message: '评论成功' });
  } catch (err) {
    next(err);
  }
};

// 获取评论列表（分页）
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await commentService.getCommentsByPostId(postId, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ---------- 回复接口（针对评论） ----------

// 发表回复
export const addReply = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content, replyToUserId, parentReplyId } = req.body;
    if (!content) return res.status(400).json({ error: '回复内容不能为空' });
    if (!replyToUserId) return res.status(400).json({ error: '缺少被回复用户ID' });

    const comment = await commentService.getCommentById(commentId);
    if (!comment) return res.status(404).json({ error: '评论不存在' });

    // 通过评论找到帖子，检查帖子是否允许评论
    const post = await forumService.getPostById(comment.post_id);
    if (!post) return res.status(404).json({ error: '相关帖子不存在' });
    if (!post.can_reply) {
      return res.status(403).json({ error: '该帖已禁止评论' });
    }

    await replyService.createReply(commentId, req.user.id, replyToUserId, content, parentReplyId || null);
    res.status(201).json({ message: '回复成功' });
  } catch (err) {
    next(err);
  }
};

// 获取回复列表（分页）
export const getReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await replyService.getRepliesByCommentId(commentId, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// 辅助函数：通过帖子ID获取板块信息（用于权限判断）
async function getCategoryByPost(post) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [post.category_id]);
  return rows[0];
}

// ---------- 删除评论 ----------
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await commentService.getCommentById(commentId);
    if (!comment) return res.status(404).json({ error: '评论不存在' });

    // 获取帖子信息以判断板块权限
    const post = await forumService.getPostById(comment.post_id);
    if (!post) return res.status(404).json({ error: '相关帖子不存在' });
    const category = await getCategoryByPost(post);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    const isMod = await isModerator(req.user.id, category.id);
    if (req.user.id !== comment.user_id && req.user.role !== 'admin' && !isMod) {
      return res.status(403).json({ error: '无权限删除此评论' });
    }

    // 外键 CASCADE 自动删除该评论下的所有回复
    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ message: '评论已删除' });
  } catch (err) {
    next(err);
  }
};

// ---------- 删除回复 ----------
export const deleteReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const [replies] = await pool.query('SELECT * FROM replies WHERE id = ?', [replyId]);
    const reply = replies[0];
    if (!reply) return res.status(404).json({ error: '回复不存在' });

    const comment = await commentService.getCommentById(reply.comment_id);
    if (!comment) return res.status(404).json({ error: '所属评论不存在' });
    const post = await forumService.getPostById(comment.post_id);
    if (!post) return res.status(404).json({ error: '相关帖子不存在' });
    const category = await getCategoryByPost(post);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    const isMod = await isModerator(req.user.id, category.id);
    if (req.user.id !== reply.user_id && req.user.role !== 'admin' && !isMod) {
      return res.status(403).json({ error: '无权限删除此回复' });
    }

    // 外键 CASCADE 自动删除该回复下的所有二级回复
    await pool.query('DELETE FROM replies WHERE id = ?', [replyId]);
    res.json({ message: '回复已删除' });
  } catch (err) {
    next(err);
  }
};

export const getCategoryBanStatus = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.query(
      `SELECT 1 FROM bans 
       WHERE category_id = ? AND type = 'post' AND user_id IS NULL 
       AND (banned_until IS NULL OR banned_until > NOW()) LIMIT 1`,
      [categoryId]
    );
    res.json({ isBanned: rows.length > 0 });
  } catch (err) { next(err); }
};