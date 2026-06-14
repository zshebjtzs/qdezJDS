// server/services/replyService.js
import pool from '../config/db.js';

// 创建回复
export const createReply = async (commentId, userId, replyToUserId, content, parentReplyId = null) => {
  const [result] = await pool.query(
    `INSERT INTO replies (comment_id, user_id, reply_to_user_id, parent_reply_id, content)
     VALUES (?, ?, ?, ?, ?)`,
    [commentId, userId, replyToUserId, parentReplyId, content]
  );
  return result.insertId;
};

// 分页获取某个评论下的所有回复（扁平列表，按时间正序）
export const getRepliesByCommentId = async (commentId, page = 1, pageSize = 10) => {
  const baseQuery = `
    SELECT 
      r.id, r.content, r.created_at AS createdAt,
      r.user_id AS userId,
      r.reply_to_user_id AS replyToUserId,
      r.parent_reply_id AS parentReplyId,
      u.username, u.uid AS authorUid, u.role, u.avatar_url AS authorAvatar,
      tu.username AS replyToUserName
    FROM replies r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN users tu ON r.reply_to_user_id = tu.id
    WHERE r.comment_id = ?
    ORDER BY r.created_at ASC
  `;
  const { paginate } = await import('../utils/pagination.js');
  return paginate({ baseQuery, params: [commentId], page, pageSize });
};