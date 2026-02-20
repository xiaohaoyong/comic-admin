<template>
  <div class="login-container">
    <div class="login-bg-blob" style="top: -160px; right: -160px; background: rgba(99, 102, 241, 0.2);"></div>
    <div class="login-bg-blob" style="bottom: -160px; left: -160px; background: rgba(139, 92, 246, 0.2);"></div>
    
    <div class="login-card">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);">
          <el-icon style="font-size: 32px; color: white;"><Picture /></el-icon>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 8px;">漫画管理后台</h1>
        <p style="font-size: 14px; color: #94a3b8;">请登录您的管理员账号</p>
      </div>
      
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="login">
          <el-input
            v-model="form.login"
            placeholder="用户名"
            size="large"
            autocomplete="username"
            :disabled="isLocked"
            class="login-input"
          >
            <template #prefix>
              <el-icon style="color: #64748b;"><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            autocomplete="current-password"
            :disabled="isLocked"
            class="login-input"
          >
            <template #prefix>
              <el-icon style="color: #64748b;"><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item v-if="showCaptcha" prop="captcha">
          <div style="display: flex; gap: 12px; width: 100%;">
            <el-input
              v-model="form.captcha"
              placeholder="验证码"
              size="large"
              style="flex: 1;"
              :disabled="isLocked"
              class="login-input"
            >
              <template #prefix>
                <el-icon style="color: #64748b;"><Key /></el-icon>
              </template>
            </el-input>
            <div 
              style="height: 40px; border-radius: 12px; cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: center; padding: 0 16px; font-size: 18px; font-weight: 700; letter-spacing: 0.1em; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #6366f1; min-width: 120px;"
              @click="refreshCaptcha"
              title="点击刷新"
            >
              {{ captchaCode }}
            </div>
          </div>
        </el-form-item>
        
        <el-form-item v-if="isLocked" style="margin-bottom: 16px;">
          <div style="width: 100%; text-align: center; padding: 12px 16px; border-radius: 12px; background: rgba(239, 68, 68, 0.1);">
            <el-icon style="color: #ef4444; margin-right: 8px;"><Warning /></el-icon>
            <span style="color: #ef4444; font-size: 14px;">登录失败次数过多，请 {{ lockCountdown }} 秒后重试</span>
          </div>
        </el-form-item>
        
        <el-form-item style="margin-bottom: 0;">
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="isLocked"
            style="width: 100%; height: 48px; font-size: 16px; font-weight: 500;"
            size="large"
          >
            {{ isLocked ? `锁定中 (${lockCountdown}s)` : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="failedAttempts > 0 && !isLocked" style="margin-top: 16px; text-align: center;">
        <span style="font-size: 14px; color: #f59e0b;">
          已失败 {{ failedAttempts }} 次，{{ maxAttempts - failedAttempts }} 次后将锁定
        </span>
      </div>
    </div>
    
    <div style="position: absolute; bottom: 24px; left: 0; right: 0; text-align: center;">
      <p style="font-size: 14px; color: #64748b;">© 2026 漫画平台 · 管理后台</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { Picture, User, Lock, Key, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const maxAttempts = 5
const lockDuration = 300
const failedAttempts = ref(0)
const isLocked = ref(false)
const lockCountdown = ref(0)
const captchaCode = ref('')
const showCaptcha = ref(false)

let lockTimer: ReturnType<typeof setInterval> | null = null

const form = reactive({
  login: '',
  password: '',
  captcha: ''
})

const rules = computed<FormRules>(() => ({
  login: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  ...(showCaptcha.value ? {
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 4, message: '验证码为4位', trigger: 'blur' }
    ]
  } : {})
}))

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = code
}

const refreshCaptcha = () => {
  generateCaptcha()
  form.captcha = ''
}

const startLockTimer = () => {
  isLocked.value = true
  lockCountdown.value = lockDuration
  
  lockTimer = setInterval(() => {
    lockCountdown.value--
    if (lockCountdown.value <= 0) {
      stopLockTimer()
      isLocked.value = false
      failedAttempts.value = 0
      showCaptcha.value = false
    }
  }, 1000)
}

const stopLockTimer = () => {
  if (lockTimer) {
    clearInterval(lockTimer)
    lockTimer = null
  }
}

const handleLogin = async () => {
  if (!formRef.value || isLocked.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (showCaptcha.value && form.captcha.toUpperCase() !== captchaCode.value) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }
    
    loading.value = true
    try {
      await authStore.login(form.login, form.password)
      ElMessage.success('登录成功')
      failedAttempts.value = 0
      router.push('/')
    } catch {
      failedAttempts.value++
      
      if (failedAttempts.value >= 3) {
        showCaptcha.value = true
        generateCaptcha()
      }
      
      if (failedAttempts.value >= maxAttempts) {
        startLockTimer()
        ElMessage.error(`登录失败次数过多，已锁定 ${lockDuration} 秒`)
      } else {
        ElMessage.error(`登录失败，还剩 ${maxAttempts - failedAttempts.value} 次机会`)
      }
      
      form.password = ''
      if (showCaptcha.value) {
        form.captcha = ''
        generateCaptcha()
      }
    } finally {
      loading.value = false
    }
  })
}

onUnmounted(() => {
  stopLockTimer()
})
</script>

<style scoped>
.login-input :deep(.el-input__wrapper) {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
}

.login-input :deep(.el-input__inner) {
  color: white !important;
}

.login-input :deep(.el-input__inner::placeholder) {
  color: #64748b !important;
}

.login-input :deep(.el-input__prefix) {
  color: #64748b !important;
}

.login-input :deep(.el-input__suffix) {
  color: #64748b !important;
}
</style>
