<template>
  <div style="display: flex; flex-direction: column; gap: 20px;">
    <div class="content-card">
      <div class="content-card-header">
        <h2 style="font-size: 18px; font-weight: 600; color: #1e293b;">系统参数设置</h2>
        <button @click="handleInit" class="primary-btn" style="padding: 8px 16px; font-size: 14px;">
          <el-icon style="margin-right: 6px;"><Refresh /></el-icon>
          初始化默认配置
        </button>
      </div>
    </div>

    <div class="content-card">
      <div class="content-card-body">
        <div v-loading="loading" style="display: flex; flex-direction: column; gap: 16px;">
          <div v-for="group in configGroups" :key="group.title" style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">{{ group.title }}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
              <div v-for="config in group.items" :key="config.key" style="background: #f8fafc; border-radius: 12px; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-weight: 500; color: #1e293b;">{{ config.description }}</span>
                  <span style="font-size: 12px; color: #94a3b8;">{{ config.key }}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <el-input-number
                    v-if="isNumericConfig(config.key)"
                    v-model="config.value"
                    :min="0"
                    style="flex: 1;"
                    @change="() => handleUpdate(config)"
                  />
                  <el-input
                    v-else
                    v-model="config.value"
                    style="flex: 1;"
                    @blur="() => handleUpdate(config)"
                  />
                  <el-icon v-if="config.saving" class="is-loading" style="color: #6366f1;"><Loading /></el-icon>
                  <el-icon v-else-if="config.saved" style="color: #10b981;"><CircleCheck /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Loading, CircleCheck } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

interface ConfigItem {
  key: string
  value: string
  description: string
  updated_at: string | null
  saving?: boolean
  saved?: boolean
}

const loading = ref(false)
const configs = ref<ConfigItem[]>([])

const isNumericConfig = (key: string) => {
  return ['points_initial', 'points_daily_signin', 'points_read_chapter', 'vip_trial_days', 'vip_monthly_days', 'vip_quarterly_days', 'vip_yearly_days'].includes(key)
}

const configGroups = computed(() => {
  const pointsConfigs = configs.value.filter(c => c.key.startsWith('points_'))
  const vipConfigs = configs.value.filter(c => c.key.startsWith('vip_'))
  const otherConfigs = configs.value.filter(c => !c.key.startsWith('points_') && !c.key.startsWith('vip_'))
  
  const groups = []
  if (pointsConfigs.length > 0) {
    groups.push({ title: '积分配置', items: pointsConfigs })
  }
  if (vipConfigs.length > 0) {
    groups.push({ title: 'VIP配置', items: vipConfigs })
  }
  if (otherConfigs.length > 0) {
    groups.push({ title: '其他配置', items: otherConfigs })
  }
  return groups
})

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await api.getConfigs()
    configs.value = res.map((c: ConfigItem) => ({ ...c, value: isNumericConfig(c.key) ? Number(c.value) : c.value }))
  } catch (error) {
    console.error('获取配置失败:', error)
  } finally {
    loading.value = false
  }
}

const handleUpdate = async (config: ConfigItem) => {
  config.saving = true
  config.saved = false
  try {
    await api.updateConfig(config.key, { value: String(config.value) })
    config.saved = true
    setTimeout(() => { config.saved = false }, 2000)
  } catch (error) {
    console.error('更新配置失败:', error)
  } finally {
    config.saving = false
  }
}

const handleInit = async () => {
  try {
    await api.initConfigs()
    ElMessage.success('初始化成功')
    fetchConfigs()
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

onMounted(() => {
  fetchConfigs()
})
</script>
