<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
      <div class="stat-card stat-card-purple">
        <div style="position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
              <el-icon style="font-size: 24px; color: white;"><User /></el-icon>
            </div>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.8);">
              <el-icon style="font-size: 16px;"><Top /></el-icon>
              +12.5%
            </span>
          </div>
          <div style="font-size: 30px; font-weight: 700; color: white; margin-bottom: 4px;">
            {{ formatNumber(stats.users?.total || 0) }}
          </div>
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">总用户数</div>
        </div>
      </div>

      <div class="stat-card stat-card-amber">
        <div style="position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
              <el-icon style="font-size: 24px; color: white;"><Star /></el-icon>
            </div>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.8);">
              <el-icon style="font-size: 16px;"><Top /></el-icon>
              +8.3%
            </span>
          </div>
          <div style="font-size: 30px; font-weight: 700; color: white; margin-bottom: 4px;">
            {{ formatNumber(stats.users?.active_vip || 0) }}
          </div>
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">VIP用户</div>
        </div>
      </div>

      <div class="stat-card stat-card-green">
        <div style="position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
              <el-icon style="font-size: 24px; color: white;"><Picture /></el-icon>
            </div>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.8);">
              <el-icon style="font-size: 16px;"><Top /></el-icon>
              +5.2%
            </span>
          </div>
          <div style="font-size: 30px; font-weight: 700; color: white; margin-bottom: 4px;">
            {{ formatNumber(stats.comics?.total || 0) }}
          </div>
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">漫画总数</div>
        </div>
      </div>

      <div class="stat-card stat-card-pink">
        <div style="position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
              <el-icon style="font-size: 24px; color: white;"><View /></el-icon>
            </div>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.8);">
              <el-icon style="font-size: 16px;"><Top /></el-icon>
              +15.8%
            </span>
          </div>
          <div style="font-size: 30px; font-weight: 700; color: white; margin-bottom: 4px;">
            {{ formatViews(stats.comics?.total_views || 0) }}
          </div>
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">总阅读量</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
      <div class="content-card">
        <div class="content-card-header">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b;">VIP卡统计</h3>
          <el-button link type="primary" @click="$router.push('/vip-cards')">
            查看详情
            <el-icon style="margin-left: 4px;"><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="content-card-body">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="text-align: center; padding: 20px; border-radius: 12px; background: #f8fafc;">
              <div style="font-size: 24px; font-weight: 700; color: #6366f1; margin-bottom: 4px;">{{ stats.vip_cards?.total || 0 }}</div>
              <div style="font-size: 14px; color: #64748b;">总卡数</div>
            </div>
            <div style="text-align: center; padding: 20px; border-radius: 12px; background: #ecfdf5;">
              <div style="font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 4px;">{{ stats.vip_cards?.unused || 0 }}</div>
              <div style="font-size: 14px; color: #64748b;">未使用</div>
            </div>
            <div style="text-align: center; padding: 20px; border-radius: 12px; background: #fffbeb;">
              <div style="font-size: 24px; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">{{ stats.vip_cards?.used || 0 }}</div>
              <div style="font-size: 14px; color: #64748b;">已使用</div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="content-card-header">
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b;">快捷操作</h3>
        </div>
        <div class="content-card-body">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button @click="$router.push('/comics/create')" class="action-btn action-btn-purple">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
                <el-icon style="font-size: 20px;"><Plus /></el-icon>
              </div>
              <span>添加新漫画</span>
              <el-icon style="margin-left: auto; font-size: 18px;"><ArrowRight /></el-icon>
            </button>
            <button @click="$router.push('/vip-cards')" class="action-btn action-btn-amber">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
                <el-icon style="font-size: 20px;"><Ticket /></el-icon>
              </div>
              <span>生成VIP卡</span>
              <el-icon style="margin-left: auto; font-size: 18px;"><ArrowRight /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
import { User, Star, Picture, View, Plus, Ticket, ArrowRight, Top } from '@element-plus/icons-vue'

const stats = ref<any>({})

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatViews = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

onMounted(async () => {
  try {
    stats.value = await api.getStats()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
})
</script>
