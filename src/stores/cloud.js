// src/stores/cloud.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getPrivateFiles,
  uploadPrivateFile,
  deletePrivateFile,
  getPublicFiles,
  uploadPublicFile,
  deletePublicFile
} from '@/api/cloud'

export const useCloudStore = defineStore('cloud', () => {
  // ========== 私有网盘 ==========
  const privateFiles = ref([])
  const loading = ref(false)

  const fetchPrivateFiles = async () => {
    loading.value = true
    try {
      const res = await getPrivateFiles()
      privateFiles.value = res
    } catch (err) {
      console.error('获取私有文件失败', err)
    } finally {
      loading.value = false
    }
  }

  const uploadPrivateFileAction = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'private')
    await uploadPrivateFile(formData)
    await fetchPrivateFiles()   // 上传后仅刷新私有
  }

  const removePrivateFile = async (fileId) => {
    await deletePrivateFile(fileId)
    await fetchPrivateFiles()
  }

  // ========== 公共网盘（分部门缓存） ==========
  // 三个部门的数据缓存
  const publicFilesMap = ref({
    art: [],
    mech: [],
    soft: []
  })
  const publicLoading = ref(false)
  const currentDepartment = ref('art')

  // 当前部门文件列表（computed）
  const currentPublicFiles = computed(() => publicFilesMap.value[currentDepartment.value] || [])

  // 加载所有公共部门文件（初次加载）
  const fetchAllPublicFiles = async () => {
    publicLoading.value = true
    try {
      const [art, mech, soft] = await Promise.all([
        getPublicFiles('art'),
        getPublicFiles('mech'),
        getPublicFiles('soft')
      ])
      publicFilesMap.value = { art, mech, soft }
    } catch (err) {
      console.error('获取公共文件失败', err)
    } finally {
      publicLoading.value = false
    }
  }

  // 刷新单个部门（上传后或手动刷新）
  const refreshPublicDepartment = async (department) => {
    try {
      const files = await getPublicFiles(department)
      publicFilesMap.value[department] = files
    } catch (err) {
      console.error('刷新公共文件失败', err)
    }
  }

  // 上传公共文件
  const uploadPublicFileAction = async (file, department) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'public')
    formData.append('department', department)
    await uploadPublicFile(formData)
    // 上传后仅刷新当前部门
    await refreshPublicDepartment(department)
  }

  // 删除公共文件
  const removePublicFile = async (fileId, department) => {
    await deletePublicFile(fileId)
    // 删除后刷新所在部门
    await refreshPublicDepartment(department)
  }

  // 切换部门（仅改 currentDepartment，不发请求）
  const setDepartment = (dept) => {
    currentDepartment.value = dept
  }

  return {
    // 私有
    privateFiles,
    loading,
    fetchPrivateFiles,
    uploadPrivateFileAction,
    removePrivateFile,
    // 公共
    publicFilesMap,
    publicLoading,
    currentDepartment,
    currentPublicFiles,
    fetchAllPublicFiles,
    refreshPublicDepartment,
    uploadPublicFileAction,
    removePublicFile,
    setDepartment
  }
})