// src/api/forum.js
import request from './request'

// 获取板块列表
export const getCategories = () => {
  return request.get('/forum/categories')
}

// 获取指定板块的帖子列表（支持分页）
export const getPostsByCategory = (slug, page = 1, pageSize = 10, sortBy = 'time') => {
  return request.get(`/forum/${slug}/posts`, { params: { page, pageSize, sortBy } })
}

// 获取单个帖子详情
export const getPostDetail = (slug, postId) => {
  return request.get(`/forum/${slug}/posts/${postId}`)
}

// 发帖
export const createPost = (slug, title, content) => {
  return request.post(`/forum/${slug}/posts`, { title, content })
}

// 修改帖子权限（管理员/版主）
export const updatePostPermission = (slug, postId, field, value) => {
  return request.patch(`/forum/${slug}/posts/${postId}/permission`, { field, value })
}

// 删除帖子
export const deletePost = (slug, postId) => {
  return request.delete(`/forum/${slug}/posts/${postId}`)
}

// ---------- 新版评论与回复接口 ----------

// 获取帖子的评论列表（分页）
export const getComments = (slug, postId, page = 1, pageSize = 10) => {
  return request.get(`/forum/${slug}/posts/${postId}/comments`, { params: { page, pageSize } })
}

// 发表评论
export const addComment = (slug, postId, content) => {
  return request.post(`/forum/${slug}/posts/${postId}/comments`, { content })
}

// 获取某个评论的回复列表（分页）
export const getReplies = (commentId, page = 1, pageSize = 10) => {
  return request.get(`/forum/comments/${commentId}/replies`, { params: { page, pageSize } })
}

// 发表回复（针对评论或回复）
export const addReply = (commentId, { content, replyToUserId, parentReplyId }) => {
  return request.post(`/forum/comments/${commentId}/replies`, { content, replyToUserId, parentReplyId })
}

// 获取版主信息（保留，当前未使用）
export const getModerators = (categoryId) => {
  return request.get(`/forum/moderators/${categoryId}`)
}