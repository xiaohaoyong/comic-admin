<template>
  <div class="space-y-5">
    <div class="bg-white rounded-2xl shadow-card p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            class="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <el-icon class="text-lg"><ArrowLeft /></el-icon>
            返回
          </button>
          <div class="h-6 w-px bg-slate-200"></div>
          <h2 class="text-lg font-semibold text-slate-800">{{ comicTitle }} - 章节管理</h2>
        </div>
        <button
          @click="showAddDialog = true"
          class="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-md"
        >
          <el-icon class="text-lg"><Plus /></el-icon>
          添加章节
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-card overflow-hidden">
      <el-table :data="chapters" v-loading="loading" class="w-full">
        <el-table-column prop="chapter_number" label="章节号" width="100" align="center">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.chapter_number }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <span class="text-slate-700">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VIP专属" width="100" align="center">
          <template #default="{ row }">
            <span
              :class="[
                'px-2.5 py-1 text-xs font-medium rounded-full',
                row.is_vip_only ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              ]"
            >
              {{ row.is_vip_only ? 'VIP' : '免费' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="阅读量" width="100" align="center">
          <template #default="{ row }">
            <span class="text-slate-600">{{ row.view_count || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <button
                @click="handleEdit(row)"
                class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="编辑"
              >
                <el-icon class="text-lg"><Edit /></el-icon>
              </button>
              <button
                @click="handleDelete(row)"
                class="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="删除"
              >
                <el-icon class="text-lg"><Delete /></el-icon>
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showAddDialog" :title="editingChapter ? '编辑章节' : '添加章节'" width="560px">
      <el-form :model="chapterForm" :rules="chapterRules" ref="chapterFormRef" label-width="100px" class="pt-2">
        <el-form-item label="章节号" prop="chapter_number">
          <el-input-number v-model="chapterForm.chapter_number" :min="1" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="chapterForm.title" placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="图片URL" prop="image_urls">
          <el-input
            v-model="imageUrlsText"
            type="textarea"
            :rows="4"
            placeholder="每行一个图片URL"
          />
        </el-form-item>
        <el-form-item label="VIP专属">
          <el-switch v-model="chapterForm.is_vip_only" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

const route = useRoute()
const comicId = computed(() => Number(route.params.id))

const loading = ref(false)
const chapters = ref<any[]>([])
const comicTitle = ref('')
const showAddDialog = ref(false)
const editingChapter = ref<any>(null)
const submitting = ref(false)
const chapterFormRef = ref<FormInstance>()

const imageUrlsText = ref('')

const chapterForm = reactive({
  chapter_number: 1,
  title: '',
  image_urls: [] as string[],
  is_vip_only: false
})

const chapterRules: FormRules = {
  chapter_number: [{ required: true, message: '请输入章节号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

watch(imageUrlsText, (val) => {
  chapterForm.image_urls = val.split('\n').filter(url => url.trim())
})

const fetchChapters = async () => {
  loading.value = true
  try {
    const res = await api.getComic(comicId.value)
    comicTitle.value = res.title
    chapters.value = res.chapters || []
  } catch (error) {
    console.error('获取章节列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (chapter: any) => {
  editingChapter.value = chapter
  Object.assign(chapterForm, {
    chapter_number: chapter.chapter_number,
    title: chapter.title,
    image_urls: chapter.image_urls || [],
    is_vip_only: chapter.is_vip_only
  })
  imageUrlsText.value = (chapter.image_urls || []).join('\n')
  showAddDialog.value = true
}

const handleSubmit = async () => {
  if (!chapterFormRef.value) return
  
  await chapterFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (editingChapter.value) {
        await api.updateChapter(editingChapter.value.id, chapterForm)
        ElMessage.success('更新成功')
      } else {
        await api.createChapter(comicId.value, chapterForm)
        ElMessage.success('添加成功')
      }
      showAddDialog.value = false
      resetForm()
      fetchChapters()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (chapter: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该章节吗？', '删除确认', { type: 'warning' })
    await api.deleteChapter(chapter.id)
    ElMessage.success('删除成功')
    fetchChapters()
  } catch {}
}

const resetForm = () => {
  editingChapter.value = null
  Object.assign(chapterForm, {
    chapter_number: chapters.value.length + 1,
    title: '',
    image_urls: [],
    is_vip_only: false
  })
  imageUrlsText.value = ''
}

watch(showAddDialog, (val) => {
  if (!val) {
    resetForm()
  }
})

onMounted(() => {
  fetchChapters()
})
</script>
