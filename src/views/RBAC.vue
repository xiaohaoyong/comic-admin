<template>
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="content-card" style="overflow: hidden;">
      <el-tabs v-model="activeTab" style="padding: 0 24px;">
        <el-tab-pane label="角色管理" name="roles">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <button @click="showRoleDialog = true" class="primary-btn">
              <el-icon style="font-size: 18px;"><Plus /></el-icon>
              新建角色
            </button>
          </div>

          <el-table :data="roles" v-loading="loadingRoles">
            <el-table-column prop="name" label="角色名称" width="150">
              <template #default="{ row }">
                <span style="font-weight: 500; color: #1e293b;">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="角色代码" width="180">
              <template #default="{ row }">
                <span style="font-family: monospace; font-size: 14px; color: #64748b;">{{ row.code }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200">
              <template #default="{ row }">
                <span style="color: #64748b;">{{ row.description || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="权限数" width="100" align="center">
              <template #default="{ row }">
                <span class="status-tag" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
                  {{ row.permissions?.length || 0 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="管理员数" width="100" align="center">
              <template #default="{ row }">
                <span style="color: #64748b;">{{ row.admin_count || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                  <button @click="editPermissions(row)" class="icon-btn icon-btn-primary" title="权限配置">
                    <el-icon style="font-size: 18px;"><Key /></el-icon>
                  </button>
                  <button v-if="row.code !== 'super_admin'" @click="editRole(row)" class="icon-btn" style="color: #64748b;" title="编辑">
                    <el-icon style="font-size: 18px;"><Edit /></el-icon>
                  </button>
                  <button v-if="row.code !== 'super_admin'" @click="deleteRole(row)" class="icon-btn icon-btn-danger" title="删除">
                    <el-icon style="font-size: 18px;"><Delete /></el-icon>
                  </button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="管理员列表" name="admins">
          <el-table :data="admins" v-loading="loadingAdmins">
            <el-table-column prop="username" label="用户名" width="160">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">
                    {{ row.username?.charAt(0)?.toUpperCase() }}
                  </div>
                  <span style="font-weight: 500; color: #1e293b;">{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="角色" width="150">
              <template #default="{ row }">
                <span v-if="row.role_name" class="status-tag" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
                  {{ row.role_name }}
                </span>
                <span v-else style="color: #94a3b8;">未分配</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <span :class="['status-tag', row.is_active ? 'status-tag-success' : 'status-tag-danger']">
                  {{ row.is_active ? '正常' : '禁用' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最后登录" width="180">
              <template #default="{ row }">
                <span style="font-size: 14px; color: #64748b;">{{ row.last_login ? formatDate(row.last_login) : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <button @click="assignRole(row)" class="icon-btn icon-btn-primary" title="分配角色">
                  <el-icon style="font-size: 18px;"><UserFilled /></el-icon>
                </button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showRoleDialog" :title="editingRole ? '编辑角色' : '新建角色'" width="450px">
      <el-form :model="roleForm" label-width="80px" style="padding-top: 8px;">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item v-if="!editingRole" label="角色代码">
          <el-input v-model="roleForm.code" placeholder="如: content_manager" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRole" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPermDialog" title="分配权限" width="520px">
      <div v-if="currentRole" style="margin-bottom: 16px;">
        <span style="color: #64748b;">角色：</span>
        <span style="font-weight: 500; color: #1e293b;">{{ currentRole.name }}</span>
      </div>
      <div style="max-height: 384px; overflow-y: auto;">
        <el-checkbox-group v-model="selectedPermissions" style="display: flex; flex-direction: column; gap: 12px;">
          <div v-for="perm in permissions" :key="perm.id" style="display: flex; align-items: center; padding: 12px; border-radius: 12px; background: #f8fafc;">
            <el-checkbox :label="perm.id">
              <span style="font-weight: 500; color: #475569;">{{ perm.name }}</span>
              <span style="font-size: 14px; margin-left: 8px; color: #94a3b8;">{{ perm.code }}</span>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showPermDialog = false">取消</el-button>
        <el-button type="primary" @click="savePermissions" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAssignDialog" title="分配角色" width="420px">
      <div v-if="currentAdmin" style="margin-bottom: 16px; padding: 16px; border-radius: 12px; background: #f8fafc;">
        <span style="color: #64748b;">管理员：</span>
        <span style="font-weight: 500; color: #1e293b;">{{ currentAdmin.username }}</span>
      </div>
      <el-select v-model="assignRoleId" placeholder="选择角色" style="width: 100%;">
        <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
      </el-select>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAssignRole" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Key, UserFilled } from '@element-plus/icons-vue'
import { api } from '@/utils/api'
import dayjs from 'dayjs'

const activeTab = ref('roles')
const loadingRoles = ref(false)
const loadingAdmins = ref(false)
const saving = ref(false)
const roles = ref<any[]>([])
const admins = ref<any[]>([])
const permissions = ref<any[]>([])

const showRoleDialog = ref(false)
const showPermDialog = ref(false)
const showAssignDialog = ref(false)
const editingRole = ref<any>(null)
const currentRole = ref<any>(null)
const currentAdmin = ref<any>(null)
const selectedPermissions = ref<number[]>([])
const assignRoleId = ref<number | null>(null)

const roleForm = reactive({ name: '', code: '', description: '' })

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const fetchRoles = async () => {
  loadingRoles.value = true
  try { roles.value = await api.get('/rbac/roles') } catch (e) { console.error(e) }
  finally { loadingRoles.value = false }
}

const fetchAdmins = async () => {
  loadingAdmins.value = true
  try { admins.value = await api.get('/rbac/admins') } catch (e) { console.error(e) }
  finally { loadingAdmins.value = false }
}

const fetchPermissions = async () => {
  try { permissions.value = await api.get('/rbac/permissions') } catch (e) { console.error(e) }
}

const editRole = (role: any) => {
  editingRole.value = role
  Object.assign(roleForm, { name: role.name, code: role.code, description: role.description || '' })
  showRoleDialog.value = true
}

const editPermissions = (role: any) => {
  currentRole.value = role
  selectedPermissions.value = role.permissions?.map((p: any) => p.id) || []
  showPermDialog.value = true
}

const saveRole = async () => {
  saving.value = true
  try {
    if (editingRole.value) await api.put(`/rbac/roles/${editingRole.value.id}`, roleForm)
    else await api.post('/rbac/roles', roleForm)
    ElMessage.success('保存成功')
    showRoleDialog.value = false
    editingRole.value = null
    Object.assign(roleForm, { name: '', code: '', description: '' })
    fetchRoles()
  } catch (e: any) { ElMessage.error(e.data?.detail || '保存失败') }
  finally { saving.value = false }
}

const savePermissions = async () => {
  if (!currentRole.value) return
  saving.value = true
  try {
    await api.put(`/rbac/roles/${currentRole.value.id}/permissions`, { permission_ids: selectedPermissions.value })
    ElMessage.success('权限保存成功')
    showPermDialog.value = false
    fetchRoles()
  } catch (e: any) { ElMessage.error(e.data?.detail || '保存失败') }
  finally { saving.value = false }
}

const deleteRole = async (role: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '删除确认', { type: 'warning' })
    await api.delete(`/rbac/roles/${role.id}`)
    ElMessage.success('删除成功')
    fetchRoles()
  } catch (e: any) { if (e.data?.detail) ElMessage.error(e.data.detail) }
}

const assignRole = (admin: any) => {
  currentAdmin.value = admin
  assignRoleId.value = admin.role_id
  showAssignDialog.value = true
}

const saveAssignRole = async () => {
  if (!currentAdmin.value) return
  saving.value = true
  try {
    await api.put(`/rbac/admins/${currentAdmin.value.id}/role`, { role_id: assignRoleId.value })
    ElMessage.success('角色分配成功')
    showAssignDialog.value = false
    fetchAdmins()
  } catch (e: any) { ElMessage.error(e.data?.detail || '保存失败') }
  finally { saving.value = false }
}

onMounted(() => { fetchRoles(); fetchAdmins(); fetchPermissions() })
</script>
