/**
 * 将文本中的 URL 转换为可点击的链接（新标签页打开）
 * 先对文本进行 HTML 转义，再替换链接
 */
export function linkify(text) {
  if (!text) return ''
  
  // 转义 HTML 特殊字符
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  // 匹配 http:// 或 https:// 的 URL，直到空格或文本结束
  const urlPattern = /(https?:\/\/[^\s<]+)/g
  return escaped.replace(urlPattern, (url) => {
    // 确保 URL 合法，去除可能的尾部标点（简单处理）
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
}