<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/components/layout/MainLayout.vue'

const route = useRoute()
const layout = computed(() => {
  // 登录页面使用空白布局（无导航栏）
  if (route.name === 'Login') return 'div'
  // 其他页面使用主布局
  return MainLayout
})


//如果 token 存在但 userInfo 为空，尝试自动获取用户信息（需要后端接口）
const userStore = useUserStore()
onMounted(() => {
  if (userStore.token && !userStore.userInfo) {
    // 可以调用获取用户信息的 API，如果没有则登出
    userStore.logout()
  }
})

</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<style scoped>

</style>
