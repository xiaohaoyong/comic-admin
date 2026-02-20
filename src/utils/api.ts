import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const ADMIN_PREFIX = 'mng_a7f3k9x2'

const instance = axios.create({
  baseURL: `/api/${ADMIN_PREFIX}`,
  timeout: 30000
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    } else {
      ElMessage.error(error.response?.data?.detail || '请求失败')
    }
    return Promise.reject(error)
  }
)

export const api: Record<string, (...args: any[]) => Promise<any>> = {
  get: (url: string) => instance.get(url),
  post: (url: string, data?: any) => instance.post(url, data),
  put: (url: string, data?: any) => instance.put(url, data),
  delete: (url: string) => instance.delete(url),

  adminLogin: (login: string, password: string) =>
    instance.post('/auth/login', null, { params: { login, password } }),

  getAdminInfo: () => instance.get('/auth/me'),

  getStats: () => instance.get('/stats/overview'),

  getUsers: (params: any) => instance.get('/users', { params }),
  getUser: (id: number) => instance.get(`/users/${id}`),
  updateUser: (id: number, data: any) => instance.put(`/users/${id}`, null, { params: data }),
  deleteUser: (id: number) => instance.delete(`/users/${id}`),

  getComics: (params: any) => instance.get('/comics', { params }),
  getComic: (id: number) => instance.get(`/comics/${id}`),
  getCategories: () => instance.get('/categories'),
  createComic: (data: any) => instance.post('/comics', null, { params: data }),
  updateComic: (id: number, data: any) => instance.put(`/comics/${id}`, null, { params: data }),
  deleteComic: (id: number) => instance.delete(`/comics/${id}`),
  auditComic: (id: number, action: string, reason?: string) =>
    instance.post(`/comics/${id}/audit`, null, { params: { action, reason } }),

  createChapter: (comicId: number, data: any) =>
    instance.post(`/comics/${comicId}/chapters`, null, { params: data }),
  updateChapter: (id: number, data: any) =>
    instance.put(`/chapters/${id}`, null, { params: data }),
  deleteChapter: (id: number) => instance.delete(`/chapters/${id}`),

  generateVIPCards: (cardType: string, count: number) =>
    instance.post('/vip-cards/generate', null, { params: { card_type: cardType, count } }),
  getVIPCards: (params: any) => instance.get('/vip-cards', { params }),
  disableVIPCard: (id: number) => instance.put(`/vip-cards/${id}/disable`),
  getVIPCardStats: () => instance.get('/vip-cards/stats'),

  getConfigs: () => instance.get('/config'),
  updateConfig: (key: string, data: any) => instance.put(`/config/${key}`, data),
  initConfigs: () => instance.post('/config/init')
}
