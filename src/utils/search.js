// src/utils/search.js
/**
 * 简单文本匹配过滤（区分大小写）
 * @param {Array} files - 文件对象数组
 * @param {string} query - 搜索关键字
 * @returns {Array} 匹配的文件对象数组
 */
export function searchFiles(files, query) {
  if (!query) return files
  return files.filter(file => file.original_name.includes(query))
}