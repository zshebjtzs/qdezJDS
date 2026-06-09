/**
 * 按热度或时间排序帖子列表
 * 热度公式：replyCount * 5 + viewCount * 1
 */
export const sortByTime = (posts) => {
  return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const sortByHot = (posts) => {
  return [...posts].sort((a, b) => {
    const hotA = (a.replyCount || 0) * 5 + (a.viewCount || 0)
    const hotB = (b.replyCount || 0) * 5 + (b.viewCount || 0)
    return hotB - hotA
  })
}