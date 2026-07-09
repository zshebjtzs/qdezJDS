// {{ FILE_PATH }}
import { defineStore } from 'pinia';
import request from '@/api/request';

/**
 * {{ DESCRIPTION }}
 */
export const use{{ STORE_NAME }} = defineStore('{{ STORE_ID }}', {
  // ---------- 状态 ----------
  state: () => ({
    // 列表数据
    items: [],
    // 加载状态
    loading: false,
    // 错误信息
    errorMsg: '',
    // 分页信息
    currentPage: 1,
    totalPages: 1,
    total: 0,
    // 搜索关键词
    searchQuery: '',
    // 是否正在搜索
    isSearching: false,
  }),

  // ---------- 计算属性 ----------
  getters: {
    // 是否为空
    isEmpty: (state) => state.items.length === 0 && !state.loading,
    // 是否有错误
    hasError: (state) => !!state.errorMsg,
  },

  // ---------- 操作 ----------
  actions: {
    /**
     * 获取分页列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {string} q - 搜索关键词
     */
    async fetchItems(page = 1, pageSize = 20, q = '') {
      this.loading = true;
      this.errorMsg = '';
      try {
        const params = { page, pageSize };
        if (q) params.q = q;
        // 替换为实际 API 路径
        const res = await request.get('/api/path', { params });
        this.items = res.data || [];
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.total = res.total;
      } catch (err) {
        console.error('获取列表失败', err);
        this.errorMsg = '加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建新记录
     * @param {Object} data - 数据对象
     */
    async createItem(data) {
      await request.post('/api/path', data);
      // 刷新当前页
      await this.fetchItems(this.currentPage, 20, this.searchQuery);
    },

    /**
     * 删除记录
     * @param {number} id - 记录 ID
     */
    async deleteItem(id) {
      await request.delete(`/api/path/${id}`);
      // 刷新当前页
      await this.fetchItems(this.currentPage, 20, this.searchQuery);
    },

    /**
     * 执行搜索
     * @param {string} q - 搜索关键词
     */
    doSearch(q) {
      this.searchQuery = q;
      this.isSearching = true;
      this.fetchItems(1, 20, q);
    },

    /**
     * 清除搜索
     */
    clearSearch() {
      this.searchQuery = '';
      this.isSearching = false;
      this.fetchItems(1, 20);
    },

    /**
     * 切换页码
     * @param {number} page - 页码
     */
    goToPage(page) {
      this.fetchItems(page, 20, this.searchQuery);
    },
  },
});