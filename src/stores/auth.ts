import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const adminInfo = ref<any>(null)

  const isLoggedIn = computed(() => !!token.value && !!adminInfo.value)

  const login = async (login: string, password: string) => {
    const res = await api.adminLogin(login, password)
    token.value = res.access_token
    localStorage.setItem('admin_token', res.access_token)
    adminInfo.value = await api.getAdminInfo()
  }

  const fetchAdminInfo = async () => {
    if (!token.value) return
    try {
      adminInfo.value = await api.getAdminInfo()
    } catch {
      logout()
    }
  }

  const logout = () => {
    token.value = null
    adminInfo.value = null
    localStorage.removeItem('admin_token')
  }

  if (token.value) {
    fetchAdminInfo()
  }

  return {
    token,
    adminInfo,
    isLoggedIn,
    login,
    logout,
    fetchAdminInfo
  }
})
