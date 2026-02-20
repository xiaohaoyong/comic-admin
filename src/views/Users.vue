<template>
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="table-toolbar">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="position: relative;">
          <el-icon style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;">
            <Search />
          </el-icon>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索用户名或邮箱..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        
        <select v-model="filterVip" class="filter-select" @change="handleSearch">
          <option value="">全部用户</option>
          <option value="true">VIP用户</option>
          <option value="false">普通用户</option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="users" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="username" label="用户名" width="140">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">
                {{ row.username?.charAt(0)?.toUpperCase() }}
              </div>
              <span style="font-weight: 500; color: #1e293b;">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200">
          <template #default="{ row }">
            <span style="color: #64748b;">{{ row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮箱验证" width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', row.email_verified ? 'status-tag-success' : 'status-tag-warning']">
              {{ row.email_verified ? '已验证' : '未验证' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="90" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #6366f1;">{{ row.points?.toLocaleString() || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP" width="160">
          <template #default="{ row }">
            <div v-if="row.is_vip">
              <span class="status-tag status-tag-warning">VIP</span>
              <span style="font-size: 12px; color: #94a3b8; margin-left: 8px;">{{ row.vip_expire_time ? formatDate(row.vip_expire_time) : '' }}</span>
            </div>
            <span v-else style="color: #94a3b8;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', row.is_active ? 'status-tag-success' : 'status-tag-danger']">
              {{ row.is_active ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            <span style="font-size: 14px; color: #64748b;">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <button @click="handleEdit(row)" class="icon-btn icon-btn-primary" title="编辑">
                <el-icon style="font-size: 18px;"><Edit /></el-icon>
              </button>
              <button @click="handleToggleStatus(row)" :class="['icon-btn', row.is_active ? 'icon-btn-danger' : 'icon-btn-success']" :title="row.is_active ? '禁用' : '启用'">
                <el-icon style="font-size: 18px;">
                  <CircleClose v-if="row.is_active" />
                  <CircleCheck v-else />
                </el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <span style="font-size: 14px; color: #64748b;">共 {{ total }} 条记录</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchUsers"
        />
      </div>
    </div>

    <el-dialog v-model="showEditDialog" title="编辑用户" width="480px">
      <el-form :model="editForm" label-width="80px" style="padding-top: 8px;">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="editForm.points" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="VIP">
          <div style="display: flex; align-items: center; gap: 16px;">
            <el-switch v-model="editForm.is_vip" active-text="开启" inactive-text="关闭" />
            <div v-if="editForm.is_vip" style="display: flex; align-items: center; gap: 8px;">
              <el-input-number v-model="editForm.vip_days" :min="1" :max="3650" style="width: 120px;" />
              <span style="color: #64748b; font-size: 14px;">天</span>
            </div>
          </div>
          <div v-if="editForm.is_vip && editForm.current_vip_expire" style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
            当前到期: {{ editForm.current_vip_expire }}
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="editForm.is_active" active-text="正常" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Edit, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { api } from '@/utils/api'
import dayjs from 'dayjs'

const loading = ref(false)
const users = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const searchKeyword = ref('')
const filterVip = ref<boolean | ''>('')
const showEditDialog = ref(false)
const saving = ref(false)

const editForm = reactive({
  id: 0,
  username: '',
  points: 0,
  is_active: true,
  is_vip: false,
  vip_days: 30,
  current_vip_expire: ''
})

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.getUsers({
      page: currentPage.value,
      keyword: searchKeyword.value || undefined,
      is_vip: filterVip.value || undefined
    })
    users.value = res.items
    total.value = res.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const handleEdit = (user: any) => {
  editForm.id = user.id
  editForm.username = user.username
  editForm.points = user.points
  editForm.is_active = user.is_active
  editForm.is_vip = user.is_vip
  editForm.vip_days = 30
  editForm.current_vip_expire = user.vip_expire_time || ''
  showEditDialog.value = true
}

const handleSaveEdit = async () => {
  saving.value = true
  try {
    await api.updateUser(editForm.id, {
      points: editForm.points,
      is_active: editForm.is_active,
      is_vip: editForm.is_vip,
      vip_days: editForm.is_vip ? editForm.vip_days : undefined
    })
    ElMessage.success('保存成功')
    showEditDialog.value = false
    fetchUsers()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const handleToggleStatus = async (user: any) => {
  try {
    await api.updateUser(user.id, { is_active: !user.is_active })
    ElMessage.success(user.is_active ? '已禁用' : '已启用')
    fetchUsers()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
