// utils/permissions.js
import { isModerator } from '../services/moderatorService.js';

export const canManagePost = async (userId, post, categoryId) => {
  if (userId === post.user_id) return true; // 作者本人
  if (post.userRole === 'admin') return false; // 管理员帖子只能管理员自己删？原设定：管理员删任意，但要保护管理员的帖子？待确认，先允许管理员控制全局
  // 检查用户角色
  const user = await getCurrentUser(userId); // 为了避免重复查询，可以在中间件中传入
};

// 更简单实用：在控制器中直接使用 req.user
export const isCategoryModerator = async (userId, categoryId) => {
  return await isModerator(userId, categoryId);
};