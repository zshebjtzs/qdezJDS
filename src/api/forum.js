// src/api/forum.js
import request from './request'

// 获取板块列表
export const getCategories = () => {
  return request.get('/forum/categories')
}

// 获取指定板块的帖子列表
export const getPostsByCategory = (slug) => {
  return request.get(`/forum/${slug}/posts`)
}

// 获取单个帖子详情
export const getPostDetail = (slug, postId) => {
  return request.get(`/forum/${slug}/posts/${postId}`)
}

// 发帖
export const createPost = (slug, title, content) => {
  return request.post(`/forum/${slug}/posts`, { title, content })
}

// 回复帖子
export const addReply = (slug, postId, content) => {
  return request.post(`/forum/${slug}/posts/${postId}/replies`, { content })
}

// 修改帖子权限（管理员/版主）
export const updatePostPermission = (slug, postId, field, value) => {
  return request.patch(`/forum/${slug}/posts/${postId}/permission`, { field, value })
}

// 删除帖子
export const deletePost = (slug, postId) => {
  return request.delete(`/forum/${slug}/posts/${postId}`)
}

// 可选：获取指定板块版主列表（前端用于显示红色名字）
// 如果帖子详情已经附带 moderatorIds，可以不用此接口
export const getModerators = (categoryId) => {
  return request.get(`/forum/moderators/${categoryId}`) // 如果后端没有此接口，可先用帖子详情返回的数据
}