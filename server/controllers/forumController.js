// server/controllers/forumController.js
import * as forumService from '../services/forumService.js';
import * as categoryService from '../services/categoryService.js';
import * as replyService from '../services/replyService.js';
import * as viewService from '../services/viewService.js';
import * as moderatorService from '../services/moderatorService.js';
import { isModerator } from '../services/moderatorService.js';

// 获取公开的板块列表
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// 获取指定板块的帖子列表
export const getPosts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) return res.status(404).json({ error: '板块不存在' });

    // 权限检查...
    const posts = await forumService.getPostsByCategory(category.id, req.user?.id);
    
    // 获取该板块版主 ID 列表
    const modIds = await moderatorService.getModeratorsByCategory(category.id); // 需引入此服务
    
    // 将 canReply/canBrowse 数字转换为布尔值
    const postsMapped = posts.map(p => ({
      ...p,
      canReply: !!p.canReply,
      canBrowse: !!p.canBrowse
    }));

    res.json({
      categoryName: category.name,
      moderatorIds: modIds,
      posts: postsMapped
    });
  } catch (err) {
    next(err);
  }
};

// 获取帖子详情（含回复）
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

    const replies = await replyService.getRepliesByPostId(post.id);
    const modIds = await moderatorService.getModeratorsByCategory(category.id);

    // 组装数据，关键：使用驼峰命名
    const postData = {
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.user_id,      // 必须映射为 userId
      username: post.username,
      authorUid: post.authorUid,
      role: post.role,           // 发帖人的角色
      authorAvatar: post.authorAvatar,
      department: post.department,
      forumType: post.forum_type,
      categoryId: post.category_id,
      canReply: !!post.can_reply,
      canBrowse: !!post.can_browse,
      viewCount: post.view_count,
      createdAt: post.created_at,
      moderatorIds: modIds,      // 必须存在，数组
      replies: replies.map(r => ({
        id: r.id,
        content: r.content,
        userId: r.userId,
        username: r.username,
        authorUid: r.authorUid,
        role: r.role,
        authorAvatar: r.authorAvatar,
        department: r.department,
        createdAt: r.createdAt,
      })),
    };

    res.json(postData);
  } catch (err) {
    next(err);
  }
};

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

// 创建回复
export const addReply = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '回复内容不能为空' });

    const post = await forumService.getPostById(postId);
    if (!post) return res.status(404).json({ error: '帖子不存在' });

    // 检查帖子是否允许回复
    if (!post.can_reply) {
        const isModeratorOrAdmin = req.user.role === 'admin'
            || await isModerator(req.user.id, post.category_id);
        if (!isModeratorOrAdmin) return res.status(403).json({ error: '该帖已禁止回复' });
    }

    const reply = await replyService.createReply(postId, req.user.id, content);
    res.status(201).json({ id: reply.id, message: '回复成功' });
  } catch (err) {
    next(err);
  }
};