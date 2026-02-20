<template>
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="VIP卡管理" name="cards">
        <div class="table-toolbar">
          <div style="display: flex; align-items: center; gap: 12px;">
            <select v-model="filterType" class="filter-select" @change="handleSearch">
              <option value="">全部类型</option>
              <option value="yearly">年度卡</option>
              <option value="quarterly">季度卡</option>
              <option value="monthly">月度卡</option>
              <option value="trial">体验卡</option>
            </select>
            <select v-model="filterStatus" class="filter-select" @change="handleSearch">
              <option value="">全部状态</option>
              <option value="unused">未使用</option>
              <option value="used">已使用</option>
              <option value="expired">已过期</option>
            </select>
          </div>
          <button @click="showGenerateDialog = true" class="primary-btn" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); box-shadow: 0 4px 6px -1px rgb(245 158 11 / 0.3);">
            <el-icon style="font-size: 18px;"><Plus /></el-icon>
            生成VIP卡
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px;">
          <div class="content-card" style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center;">
                <el-icon style="font-size: 24px; color: #6366f1;"><Ticket /></el-icon>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats.total || 0 }}</div>
                <div style="font-size: 14px; color: #64748b;">总卡数</div>
              </div>
            </div>
          </div>
          <div class="content-card" style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center;">
                <el-icon style="font-size: 24px; color: #10b981;"><CircleCheck /></el-icon>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats.unused || 0 }}</div>
                <div style="font-size: 14px; color: #64748b;">未使用</div>
              </div>
            </div>
          </div>
          <div class="content-card" style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.1); display: flex; align-items: center; justify-content: center;">
                <el-icon style="font-size: 24px; color: #f59e0b;"><CircleCheck /></el-icon>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats.used || 0 }}</div>
                <div style="font-size: 14px; color: #64748b;">已使用</div>
              </div>
            </div>
          </div>
          <div class="content-card" style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); display: flex; align-items: center; justify-content: center;">
                <el-icon style="font-size: 24px; color: #ef4444;"><CircleClose /></el-icon>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 700; color: #1e293b;">{{ stats.expired || 0 }}</div>
                <div style="font-size: 14px; color: #64748b;">已过期</div>
              </div>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <el-table :data="cards" v-loading="loading">
            <el-table-column prop="card_number" label="卡号" min-width="200">
              <template #default="{ row }">
                <span style="font-family: monospace; font-size: 14px; color: #64748b;">{{ row.card_number }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="100" align="center">
              <template #default="{ row }">
                <span class="status-tag status-tag-info">{{ cardTypeLabel(row.card_type) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="duration_days" label="时长(天)" width="100" align="center">
              <template #default="{ row }">
                <span style="color: #64748b;">{{ row.duration_days }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <span :class="['status-tag', statusTagClass(row.status)]">{{ statusLabel(row.status) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="used_by_user_id" label="使用者ID" width="100" align="center">
              <template #default="{ row }">
                <span style="color: #64748b;">{{ row.used_by_user_id || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="使用时间" width="160">
              <template #default="{ row }">
                <span style="font-size: 14px; color: #64748b;">{{ row.used_at || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">
                <span style="font-size: 14px; color: #64748b;">{{ row.created_at }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <button v-if="row.status === 'unused'" @click="handleDisable(row)" class="icon-btn icon-btn-danger" title="禁用">
                  <el-icon style="font-size: 18px;"><CircleClose /></el-icon>
                </button>
                <span v-else style="color: #cbd5e1;">-</span>
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
              @current-change="fetchCards"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="消耗记录" name="logs">
        <div class="table-toolbar">
          <select v-model="logFilterType" class="filter-select" @change="handleLogSearch">
            <option value="">全部类型</option>
            <option value="yearly">年度卡</option>
            <option value="quarterly">季度卡</option>
            <option value="monthly">月度卡</option>
            <option value="trial">体验卡</option>
          </select>
        </div>

        <div class="table-wrapper">
          <el-table :data="logs" v-loading="loadingLogs">
            <el-table-column prop="card_number" label="卡号" min-width="180">
              <template #default="{ row }">
                <span style="font-family: monospace; font-size: 14px; color: #64748b;">{{ row.card_number }}</span>
              </template>
            </el-table-column>
            <el-table-column label="卡类型" width="100" align="center">
              <template #default="{ row }">
                <span class="status-tag status-tag-info">{{ cardTypeLabel(row.card_type) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="duration_days" label="时长(天)" width="100" align="center" />
            <el-table-column label="使用用户" width="120">
              <template #default="{ row }">
                <span style="color: #6366f1;">{{ row.username || `用户${row.user_id}` }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ip_address" label="IP地址" width="140" />
            <el-table-column label="卡生成时间" width="160">
              <template #default="{ row }">
                <span style="font-size: 14px; color: #64748b;">{{ row.card_created_at || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="消耗时间" width="160">
              <template #default="{ row }">
                <span style="font-size: 14px; color: #64748b;">{{ row.created_at }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-footer">
            <span style="font-size: 14px; color: #64748b;">共 {{ logTotal }} 条记录</span>
            <el-pagination
              v-model:current-page="logCurrentPage"
              :page-size="pageSize"
              :total="logTotal"
              layout="prev, pager, next"
              @current-change="fetchLogs"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showGenerateDialog" title="生成VIP卡" width="420px">
      <el-form :model="generateForm" label-width="80px" style="padding-top: 8px;">
        <el-form-item label="卡类型">
          <el-select v-model="generateForm.card_type" style="width: 100%;">
            <el-option label="年度卡 (365天)" value="yearly" />
            <el-option label="季度卡 (90天)" value="quarterly" />
            <el-option label="月度卡 (30天)" value="monthly" />
            <el-option label="体验卡 (3天)" value="trial" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="generateForm.count" :min="1" :max="100" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Ticket, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { api } from '@/utils/api'
import dayjs from 'dayjs'

const activeTab = ref('cards')
const loading = ref(false)
const cards = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const filterType = ref('')
const filterStatus = ref('')
const stats = ref<any>({})
const showGenerateDialog = ref(false)
const generating = ref(false)

const loadingLogs = ref(false)
const logs = ref<any[]>([])
const logTotal = ref(0)
const logCurrentPage = ref(1)
const logFilterType = ref('')

const generateForm = reactive({
  card_type: 'monthly',
  count: 10
})

const cardTypeLabel = (type: string) => {
  const labels: Record<string, string> = { yearly: '年度卡', quarterly: '季度卡', monthly: '月度卡', trial: '体验卡' }
  return labels[type] || type
}

const statusTagClass = (status: string) => {
  const classes: Record<string, string> = { unused: 'status-tag-success', used: 'status-tag-warning', expired: 'status-tag-danger' }
  return classes[status] || 'status-tag-info'
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = { unused: '未使用', used: '已使用', expired: '已过期' }
  return labels[status] || status
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

const fetchCards = async () => {
  loading.value = true
  try {
    const res = await api.getVIPCards({
      page: currentPage.value,
      card_type: filterType.value || undefined,
      status: filterStatus.value || undefined
    })
    cards.value = res.items
    total.value = res.total
  } catch (error) {
    console.error('获取VIP卡列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    stats.value = await api.getVIPCardStats()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchLogs = async () => {
  loadingLogs.value = true
  try {
    const res = await api.get('/vip-cards/redemption-logs', {
      page: logCurrentPage.value,
      card_type: logFilterType.value || undefined
    })
    logs.value = res.items
    logTotal.value = res.total
  } catch (error) {
    console.error('获取消耗记录失败:', error)
  } finally {
    loadingLogs.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchCards()
}

const handleLogSearch = () => {
  logCurrentPage.value = 1
  fetchLogs()
}

const handleGenerate = async () => {
  generating.value = true
  try {
    const res = await api.generateVIPCards(generateForm.card_type, generateForm.count)
    ElMessage.success(res.message)
    showGenerateDialog.value = false
    fetchCards()
    fetchStats()
  } catch (error) {
    console.error('生成失败:', error)
  } finally {
    generating.value = false
  }
}

const handleDisable = async (card: any) => {
  try {
    await ElMessageBox.confirm('确定要禁用该VIP卡吗？', '禁用确认', { type: 'warning' })
    await api.disableVIPCard(card.id)
    ElMessage.success('禁用成功')
    fetchCards()
    fetchStats()
  } catch {}
}

onMounted(() => {
  fetchCards()
  fetchStats()
  fetchLogs()
})
</script>
