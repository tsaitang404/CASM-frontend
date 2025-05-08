<template>
  <div class="topbar">
    <div class="topbar-left">{{ title }}</div>
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
  }
})
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
    const res = await fetch('/api/user/change_pass', {
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
      
      // 弹出提示并跳转
      alert('密码修改成功，请使用新密码重新登录')
      
      // 重定向到登录页面，并传递密码已修改的标志
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
    fetch('/api/user/logout', {
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

<style scoped>
.topbar {
  width: 100%;
  height: 48px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px #f0f1f2;
  z-index: 101;
}
.topbar-left {
  font-size: 18px;
  font-weight: 500;
}
.topbar-right {
  display: flex;
  align-items: center;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid #409eff;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.avatar:hover {
  box-shadow: 0 0 0 3px #e6f0fa;
}
.username {
  display: none;
}
.user-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.user-info-content {
  background: #fff;
  padding: 32px 36px 20px 36px;
  border-radius: 12px;
  min-width: 260px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-info-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}
.modal-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px solid #409eff;
  margin-bottom: 8px;
}
.user-info-title {
  font-size: 19px;
  font-weight: 600;
  margin-bottom: 2px;
}
.user-info-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 2px;
}
.user-info-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}
.action-btn,
.close-btn {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 0;
  font-size: 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.action-btn {
  background: #f5f5f5;
  color: #333;
}
.action-btn.logout {
  background: #ff4d4f;
  color: #fff;
}
.action-btn:hover {
  background: #e6e6e6;
}
.action-btn.logout:hover {
  background: #ff7875;
}
.close-btn {
  background: #409eff;
  color: #fff;
  margin-top: 2px;
  align-self: center;
}
.close-btn:hover {
  background: #66b1ff;
}
.pwd-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
}
.form-group {
  width: 100%;
}
.pwd-form input {
  width: 100%;
  padding: 8px 10px;
  font-size: 15px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  transition: border 0.2s;
}
.pwd-form input:focus {
  border: 1.5px solid #409eff;
}
.form-btns {
  display: flex;
  gap: 10px;
}
.form-btns .action-btn {
  flex: 1;
}
.error-msg {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
</style>
