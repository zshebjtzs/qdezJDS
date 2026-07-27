// src/stores/cloud.js
import { defineStore } from 'pinia';
import request from '@/api/request'; // 直接使用 axios 实例

export const useCloudStore = defineStore('cloud', {
  state: () => ({
    // 私有网盘当前页数据
    privateFiles: [],
    privateLoading: false,
    privatePage: 1,
    privateTotalPages: 1,
    privateTotal: 0,
    privateQuery: '', // 当前搜索词

    // 公共网盘当前页数据
    publicFiles: [],
    publicLoading: false,
    publicPage: 1,
    publicTotalPages: 1,
    publicTotal: 0,
    publicQuery: '',
    currentDepartment: 'art',

    // 上传进度（两端共享）
    isUploading: false,
    uploadProgress: 0,
  }),

  actions: {
    // 私有网盘：获取文件列表（分页+搜索）
    async fetchPrivateFiles(page = 1, pageSize = 20, q = '') {
      this.privateLoading = true;
      this.privateQuery = q;
      try {
        const res = await request.get('/cloud/private', {
          params: { page, pageSize, q }
        });
        this.privateFiles = res.data || [];
        this.privatePage = res.page;
        this.privateTotalPages = res.totalPages;
        this.privateTotal = res.total;
      } catch (err) {
        console.error('获取私有文件失败', err);
      } finally {
        this.privateLoading = false;
      }
    },

    // 上传私有文件，成功后刷新当前页
    async uploadPrivateFile(file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'private');
      this.isUploading = true;
      this.uploadProgress = 0;
      try {
        await request.post('/cloud/private', formData, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.uploadProgress = percent;
          }
        });
        await this.fetchPrivateFiles(this.privatePage, 20, this.privateQuery);
      } finally {
        // 上传完成后至少停留 500ms，让进度条可见
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    },

    // 删除私有文件，成功后刷新当前页
    async removePrivateFile(fileId) {
      await request.delete(`/cloud/private/${fileId}`);
      await this.fetchPrivateFiles(this.privatePage, 20, this.privateQuery);
    },

    // 公共网盘：获取文件列表（分页+搜索）
    async fetchPublicFiles(department, page = 1, pageSize = 20, q = '') {
      this.publicLoading = true;
      this.currentDepartment = department;
      this.publicQuery = q;
      try {
        const res = await request.get(`/cloud/public/${department}`, {
          params: { page, pageSize, q }
        });
        this.publicFiles = res.data || [];
        this.publicPage = res.page;
        this.publicTotalPages = res.totalPages;
        this.publicTotal = res.total;
      } catch (err) {
        console.error('获取公共文件失败', err);
      } finally {
        this.publicLoading = false;
      }
    },

    // 上传公共文件，成功后刷新当前部门当前页
    async uploadPublicFile(file, department) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'public');
      formData.append('department', department);
      this.isUploading = true;
      this.uploadProgress = 0;
      try {
        await request.post('/cloud/public', formData, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.uploadProgress = percent;
          }
        });
        await this.fetchPublicFiles(department, this.publicPage, 20, this.publicQuery);
      } finally {
        // 上传完成后至少停留 500ms，让进度条可见
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    },

    // 删除公共文件，成功后刷新当前部门当前页
    async removePublicFile(fileId, department) {
      await request.delete(`/cloud/public/${fileId}`);
      await this.fetchPublicFiles(department, this.publicPage, 20, this.publicQuery);
    },

    // 切换部门
    setDepartment(dept) {
      this.currentDepartment = dept;
    }
  }
});