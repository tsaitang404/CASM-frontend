<template>
  <div class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <ion-icon :name="sidebarCollapsed ? 'menu-outline' : 'close-outline'"></ion-icon>
      </button>
      <span class="title-text">{{ title }}</span>
    </div>
    <div class="topbar-right">
      <img class="avatar" src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" alt="avatar" @click="showUserInfo = true" />
      <!-- 用户信息弹窗 -->
      <div v-if="showUserInfo" class="user-info-modal" @click.self="showUserInfo = false">
        <div class="user-info-content">
          <div class="user-info-header">
            <img class="modal-avatar" src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" alt="avatar" />
            <div class="user-info-title">Admin</div>
            <div class="user-info-desc">系统管理员</div>
          </div>
          <div v-if="!showPwdForm" class="user-info-actions">
            <button class="action-btn" @click="showPwdForm = true">修改密码</button>
            <button class="action-btn logout" @click="onLogout">注销</button>
          </div>
          <form v-else class="pwd-form" @submit.prevent="onPwdSubmit">
            <div class="form-group">
              <input v-model="oldPwd" type="password" placeholder="当前密码" required autocomplete="current-password" />
            </div>
            <div class="form-group">
              <input v-model="newPwd1" type="password" placeholder="新密码" required autocomplete="new-password" />
            </div>
            <div class="form-group">
              <input v-model="newPwd2" type="password" placeholder="确认新密码" required autocomplete="new-password" />
            </div>
            <div class="form-btns">
              <button class="action-btn" type="submit">确认</button>
              <button class="action-btn" type="button" @click="onPwdCancel">取消</button>
            </div>
            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({
  title: {
    type: String,
    default: 'CASM 系统'
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

// 定义要发出的事件
defineEmits(['toggle-sidebar'])

const showUserInfo = ref(false)
const showPwdForm = ref(false)
const oldPwd = ref('')
const newPwd1 = ref('')
const newPwd2 = ref('')
const router = useRouter()
const errorMsg = ref('')
const isSubmitting = ref(false)

async function onPwdSubmit() {
  // 重置错误信息
  errorMsg.value = ''
  
  // 验证新密码
  if (newPwd1.value !== newPwd2.value) {
    errorMsg.value = '两次新密码输入不一致'
    return
  }
  
  // 验证密码不为空
  if (!oldPwd.value || !newPwd1.value) {
    errorMsg.value = '密码不能为空'
    return
  }
  
  // 验证新密码长度
  if (newPwd1.value.length < 8) {
    errorMsg.value = '新密码长度不能少于8个字符'
    return
  }
  
  isSubmitting.value = true
  const token = localStorage.getItem('Token')
  
  try {
    const res = await fetch('/user/change_pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token || ''
      },
      body: JSON.stringify({
        old_password: oldPwd.value.trim(),
        new_password: newPwd1.value,
        check_password: newPwd2.value
      })
    })
    
    const data = await res.json()
    if (data.code === 200) {
      // 清除表单
      oldPwd.value = ''
      newPwd1.value = ''
      newPwd2.value = ''
      showPwdForm.value = false
      
      // 清除认证信息
      localStorage.removeItem('Token')
      localStorage.removeItem('username')
      
      // 直接重定向到登录页面，并传递密码已修改的标志
      router.push({ 
        path: '/login', 
        query: { passwordChanged: 'true' } 
      })
    } else {
      // 显示具体的错误信息
      if (data.code === 303) {
        errorMsg.value = '旧密码错误'
      } else {
        errorMsg.value = data.message || '密码修改失败'
      }
    }
  } catch (e) {
    errorMsg.value = '网络错误，请稍后再试'
    console.error('密码修改请求出错:', e)
  } finally {
    isSubmitting.value = false
  }
}

function onPwdCancel() {
  showPwdForm.value = false
  oldPwd.value = ''
  newPwd1.value = ''
  newPwd2.value = ''
}
function onLogout() {
  console.log('logout')
  const token = localStorage.getItem('Token')
  // 先调用后端的注销接口
  if (token) {
    fetch('/user/logout', {
      method: 'GET',
      headers: {
        'Token': token
      }
    }).finally(() => {
      // 无论成功失败都清除本地Token并重定向到登录页
      localStorage.removeItem('Token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    })
  } else {
    // 如果没有token，直接跳转登录页
    window.location.href = '/login'
  }
}
</script>

<style>
@import '@/assets/styles/components/topbar.css';
</style>
