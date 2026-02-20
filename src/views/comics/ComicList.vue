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
            placeholder="搜索漫画标题或作者..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        
        <select v-model="filterStatus" class="filter-select" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="ongoing">连载中</option>
          <option value="completed">已完结</option>
        </select>
        
        <select v-model="filterAudit" class="filter-select" @change="handleSearch">
          <option value="">全部审核</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
      
      <button @click="$router.push('/comics/create')" class="primary-btn">
        <el-icon style="font-size: 18px;"><Plus /></el-icon>
        添加漫画
      </button>
    </div>

    <div class="table-wrapper">
      <el-table :data="comics" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="封面" width="90" align="center">
          <template #default="{ row }">
            <img
              :src="row.cover_url || 'https://via.placeholder.com/48x64'"
              style="width: 48px; height: 64px; object-fit: cover; border-radius: 8px;"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="160">
          <template #default="{ row }">
            <span style="font-weight: 500; color: #1e293b;">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="100">
          <template #default="{ row }">
            <span style="color: #64748b;">{{ row.author || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="90">
          <template #default="{ row }">
            <span class="status-tag status-tag-info">{{ row.category || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', row.status === 'ongoing' ? 'status-tag-success' : 'status-tag-info']">
              {{ row.status === 'ongoing' ? '连载中' : '已完结' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="90" align="center">
          <template #default="{ row }">
            <span :class="['status-tag', auditTagClass(row.audit_status)]">
              {{ auditLabel(row.audit_status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="total_views" label="阅读量" width="90" align="center">
          <template #default="{ row }">
            <span style="color: #64748b;">{{ formatNumber(row.total_views) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="chapter_count" label="章节" width="70" align="center">
          <template #default="{ row }">
            <span style="color: #64748b;">{{ row.chapter_count || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <button @click="$router.push(`/comics/${row.id}/edit`)" class="icon-btn icon-btn-primary" title="编辑">
                <el-icon style="font-size: 18px;"><Edit /></el-icon>
              </button>
              <button @click="$router.push(`/comics/${row.id}/chapters`)" class="icon-btn" style="color: #64748b;" title="章节管理">
                <el-icon style="font-size: 18px;"><List /></el-icon>
              </button>
              <button @click="handleAudit(row, 'approve')" class="icon-btn icon-btn-success" title="通过审核">
                <el-icon style="font-size: 18px;"><CircleCheck /></el-icon>
              </button>
              <button @click="handleDelete(row)" class="icon-btn icon-btn-danger" title="删除">
                <el-icon style="font-size: 18px;"><Delete /></el-icon>
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
          @current-change="fetchComics"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, List, CircleCheck, Delete } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

const loading = ref(false)
const comics = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const searchKeyword = ref('')
const filterStatus = ref('')
const filterAudit = ref('')

const auditTagClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'status-tag-warning',
    approved: 'status-tag-success',
    rejected: 'status-tag-danger'
  }
  return classes[status] || 'status-tag-info'
}

const auditLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labels[status] || status
}

const formatNumber = (num: number) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num?.toLocaleString() || '0'
}

const fetchComics = async () => {
  loading.value = true
  try {
    const res = await api.getComics({
      page: currentPage.value,
      keyword: searchKeyword.value || undefined,
      status: filterStatus.value || undefined,
      audit_status: filterAudit.value || undefined
    })
    comics.value = res.items
    total.value = res.total
  } catch (error) {
    console.error('获取漫画列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComics()
}

const handleAudit = async (comic: any, action: string) => {
  try {
    await api.auditComic(comic.id, action)
    ElMessage.success('审核成功')
    fetchComics()
  } catch (error) {
    console.error('审核失败:', error)
  }
}

const handleDelete = async (comic: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该漫画吗？此操作不可恢复。', '删除确认', { 
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    await api.deleteComic(comic.id)
    ElMessage.success('删除成功')
    fetchComics()
  } catch {}
}

onMounted(() => {
  fetchComics()
})
</script>
