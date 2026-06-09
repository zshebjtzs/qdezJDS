// src/api/cloud.js
import request from './request'

// ==================== 私有网盘 ====================
export const getPrivateFiles = () => {
  return request.get('/cloud/private')
}

export const uploadPrivateFile = (formData) => {
  return request.post('/cloud/private', formData)
}

export const deletePrivateFile = (fileId) => {
  return request.delete(`/cloud/private/${fileId}`)
}

// 私有文件下载（返回 blob 流，由调用方处理）
export const downloadPrivateFile = (fileId) => {
  return request.get(`/cloud/private/${fileId}/download`, {
    responseType: 'blob'
  })
}

// ==================== 公共网盘 ====================
// 获取指定部门的公共文件列表
export const getPublicFiles = (department) => {
  return request.get(`/cloud/public/${department}`)
}

// 上传公共文件（需额外传递 department 字段）
export const uploadPublicFile = (formData) => {
  return request.post('/cloud/public', formData)
}

// 删除公共文件
export const deletePublicFile = (fileId) => {
  return request.delete(`/cloud/public/${fileId}`)
}

// 下载公共文件
export const downloadPublicFile = (fileId) => {
  return request.get(`/cloud/public/${fileId}/download`, {
    responseType: 'blob'
  })
}