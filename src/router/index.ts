import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/sys_x9k2m7p4/'),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'comics',
          name: 'Comics',
          component: () => import('@/views/comics/ComicList.vue')
        },
        {
          path: 'comics/create',
          name: 'ComicCreate',
          component: () => import('@/views/comics/ComicEdit.vue')
        },
        {
          path: 'comics/:id/edit',
          name: 'ComicEdit',
          component: () => import('@/views/comics/ComicEdit.vue')
        },
        {
          path: 'comics/:id/chapters',
          name: 'Chapters',
          component: () => import('@/views/comics/ChapterList.vue')
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/Users.vue')
        },
        {
          path: 'vip-cards',
          name: 'VIPCards',
          component: () => import('@/views/VIPCards.vue')
        },
        {
          path: 'rbac',
          name: 'RBAC',
          component: () => import('@/views/RBAC.vue')
        },
        {
          path: 'config',
          name: 'SystemConfig',
          component: () => import('@/views/SystemConfig.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.token && !authStore.adminInfo) {
    await authStore.fetchAdminInfo()
  }
  
  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isLoggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
