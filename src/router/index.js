import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/home',
    name: 'Home',
    redirect: '/home/about',
    component: () => import('@/views/HomePage.vue'),
    meta: { requiresAuth: false },
    children: [
      { path: 'about', name: 'About', component: () => import('@/components/publicHome/About.vue') },
      { path: 'activity', name: 'Activity', component: () => import('@/components/publicHome/Activity.vue') },
    ],
  },
  { path: '/', redirect: '/home' },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginPage.vue'), meta: { requiresAuth: false } },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/views/ForumPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forum/:slug',
    name: 'PostList',
    component: () => import('@/components/forum/postList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forum/:slug/:postId',
    name: 'PostSingle',
    component: () => import('@/components/forum/postSingle.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forum/:slug/new',
    name: 'PostEdit',
    component: () => import('@/components/forum/postEdit.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/cloud', name: 'Cloud', component: () => import('@/views/CloudPage.vue'), meta: { requiresAuth: true, requiresInternal: true } },
  {
    path: '/user/:uid',
    name: 'UserInfo',
    component: () => import('@/components/layout/userInfo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/legal/terms',
    name: 'LegalTerms',
    component: () => import('@/components/legal/legalView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/legal/privacy',
    name: 'LegalPrivacy',
    component: () => import('@/components/legal/legalView.vue'),
    meta: { requiresAuth: false }
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresInternal = to.meta.requiresInternal

  if (userStore.token && !userStore.userInfo) {
    userStore.logout()
    if (requiresAuth) return next({ name: 'Login' })
    else return next()
  }

  if (requiresAuth && !userStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 内部权限检查：允许 internal 或 admin 角色访问
  if (requiresInternal) {
    const role = userStore.userInfo?.role
    if (role !== 'internal' && role !== 'admin') {
      return next({ name: 'Home' })
    }
  }

  next()
})

export default router