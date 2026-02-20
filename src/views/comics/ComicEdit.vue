<template>
  <div class="space-y-5">
    <div class="bg-white rounded-2xl shadow-card p-5">
      <div class="flex items-center gap-4">
        <button
          @click="$router.back()"
          class="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <el-icon class="text-lg"><ArrowLeft /></el-icon>
          返回
        </button>
        <div class="h-6 w-px bg-slate-200"></div>
        <h2 class="text-lg font-semibold text-slate-800">{{ isEdit ? '编辑漫画' : '添加漫画' }}</h2>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-card p-6">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="max-w-2xl">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入漫画标题" />
        </el-form-item>
        
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" class="w-full" clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="封面URL" prop="cover_url">
          <el-input v-model="form.cover_url" placeholder="请输入封面图片URL" />
        </el-form-item>
        
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入漫画简介"
          />
        </el-form-item>
        
        <el-form-item label="免费章节" prop="free_chapters_count">
          <el-input-number v-model="form.free_chapters_count" :min="0" :max="100" />
          <span class="ml-3 text-slate-500 text-sm">前N章免费</span>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="ongoing">连载中</el-radio>
            <el-radio value="completed">已完结</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="推荐">
          <el-switch v-model="form.is_featured" />
          <span class="ml-3 text-slate-500 text-sm">设为精选推荐</span>
        </el-form-item>
        
        <el-form-item class="pt-4">
          <el-button type="primary" @click="handleSubmit" :loading="loading" class="px-8">
            {{ isEdit ? '保存修改' : '创建漫画' }}
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const categories = ref<{id: number, name: string}[]>([])

const isEdit = computed(() => !!route.params.id)
const comicId = computed(() => Number(route.params.id))

const form = reactive({
  title: '',
  author: '',
  category_id: null as number | null,
  cover_url: '',
  description: '',
  free_chapters_count: 3,
  status: 'ongoing',
  is_featured: false
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

const fetchCategories = async () => {
  try {
    const res = await api.getCategories()
    categories.value = res
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchComic = async () => {
  if (!isEdit.value) return
  
  try {
    const res = await api.getComic(comicId.value)
    form.title = res.title || ''
    form.author = res.author || ''
    form.category_id = res.category_id || null
    form.cover_url = res.cover_url || ''
    form.description = res.description || ''
    form.free_chapters_count = res.free_chapters_count || 3
    form.status = res.status || 'ongoing'
    form.is_featured = res.is_featured || false
  } catch (error) {
    ElMessage.error('获取漫画信息失败')
    router.back()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      if (isEdit.value) {
        await api.updateComic(comicId.value, {
          title: form.title,
          author: form.author,
          category_id: form.category_id,
          cover_url: form.cover_url,
          description: form.description,
          free_chapters_count: form.free_chapters_count,
          status: form.status,
          is_featured: form.is_featured
        })
        ElMessage.success('保存成功')
      } else {
        await api.createComic({
          title: form.title,
          author: form.author,
          category_id: form.category_id,
          cover_url: form.cover_url,
          description: form.description,
          free_chapters_count: form.free_chapters_count,
          is_featured: form.is_featured
        })
        ElMessage.success('创建成功')
      }
      router.push('/comics')
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  fetchCategories()
  fetchComic()
})
</script>
