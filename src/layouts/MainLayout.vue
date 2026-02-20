<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(99 102 241 / 0.3);">
            <el-icon style="color: white; font-size: 20px;"><Picture /></el-icon>
          </div>
          <span style="color: white; font-weight: 600; font-size: 18px;">漫画后台</span>
        </div>
      </div>

      <nav class="admin-sidebar-nav">
        <div style="padding: 0 4px; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(148, 163, 184, 0.5);">主菜单</span>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <el-icon style="font-size: 20px;"><component :is="item.icon" /></el-icon>
            <span style="font-weight: 500;">{{ item.title }}</span>
          </router-link>
        </div>
      </nav>

      <div class="admin-sidebar-footer">
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 12px; transition: background 0.2s; cursor: pointer;" class="hover:bg-white/5">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
            {{ authStore.adminInfo?.username?.charAt(0)?.toUpperCase() }}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="color: white; font-weight: 500; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ authStore.adminInfo?.username }}
            </div>
            <div style="font-size: 12px; color: #94a3b8;">管理员</div>
          </div>
          <button 
            @click="handleLogout" 
            class="icon-btn"
            style="color: #94a3b8;"
          >
            <el-icon style="font-size: 18px;"><SwitchButton /></el-icon>
          </button>
        </div>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <h1 style="font-size: 20px; font-weight: 600; color: #1e293b;">{{ pageTitle }}</h1>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="icon-btn" style="color: #94a3b8;">
            <el-icon style="font-size: 20px;"><Bell /></el-icon>
          </button>
        </div>
      </header>

      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  DataAnalysis, 
  Picture, 
  User, 
  Ticket, 
  Lock,
  Bell,
  SwitchButton,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { path: '/', title: '数据概览', icon: DataAnalysis },
  { path: '/comics', title: '漫画管理', icon: Picture },
  { path: '/users', title: '用户管理', icon: User },
  { path: '/vip-cards', title: 'VIP卡管理', icon: Ticket },
  { path: '/rbac', title: '权限管理', icon: Lock },
  { path: '/config', title: '系统设置', icon: Setting },
]

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '数据概览',
    '/comics': '漫画管理',
    '/comics/create': '添加漫画',
    '/users': '用户管理',
    '/vip-cards': 'VIP卡管理',
    '/rbac': '权限管理',
    '/config': '系统设置'
  }
  
  if (route.path.includes('/comics/') && route.path.includes('/edit')) {
    return '编辑漫画'
  }
  if (route.path.includes('/comics/') && route.path.includes('/chapters')) {
    return '章节管理'
  }
  
  return titles[route.path] || '管理后台'
})

const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
