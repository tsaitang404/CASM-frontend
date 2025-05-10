<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-container">
          <img src="/logo.svg" alt="CASM Logo" class="logo" />
        </div>
        <h1 class="system-title">网络空间测绘系统</h1>
      </div>
      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <div class="input-icon">
              <i class="icon-user"></i>
            </div>
            <input v-model="username" placeholder="请输入用户名" required />
          </div>
          <div class="input-group">
            <div class="input-icon">
              <i class="icon-lock"></i>
            </div>
            <input v-model="password" type="password" placeholder="请输入密码" required />
          </div>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登 录' }}
          </button>
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="passwordChanged" class="info-message">密码已被修改，请使用新密码登录</p>
        </form>
      </div>
    </div>
    <div class="login-footer">
      <p>© 2025 CASM 资产安全管理系统</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const passwordChanged = ref(false)
const router = useRouter()
const route = useRoute()

// 检查是否从密码修改页面跳转过来
onMounted(() => {
  if (route.query.passwordChanged === 'true') {
    passwordChanged.value = true
  }
})

const handleLogin = async () => {
  error.value = ''
  passwordChanged.value = false
  
  if (!username.value || !password.value) {
    error.value = '用户名和密码不能为空'
    return
  }
  
  isLoading.value = true
  
  try {
    const res = await fetch('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value.trim(),
        password: password.value
      })
    })
    
    const data = await res.json()
    
    if (data.code === 200) {
      localStorage.setItem('Token', data.data.token)
      localStorage.setItem('username', data.data.username)
      router.push('/home')
    } else {
      // 提供更详细的错误信息
      if (data.code === 401) {
        error.value = '用户名或密码错误'
      } else if (data.message && data.message !== 'success') {
        error.value = data.message
      } else {
        error.value = '登录失败，请重试 (错误代码: ' + data.code + ')'
      }
    }
  } catch (e) {
    error.value = '网络错误，请检查网络连接'
    console.error('登录请求出错:', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
@import '@/assets/styles/views/login.css';
</style>