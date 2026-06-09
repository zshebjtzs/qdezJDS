// src/utils/download.js
export async function downloadFile(url, filename) {
  const token = localStorage.getItem('token');
  // 如果传入的 url 是相对路径（如 /api/cloud/...），baseURL 已经配置，无需额外处理
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}