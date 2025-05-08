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
  height: 64px; /* 从56px增大到64px */
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 101;
}

.topbar-left {
  display: flex;
  align-items: center;
  font-size: 20px; /* 从18px增大到20px */
  font-weight: 500;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; /* 从36px增大到40px */
  height: 40px; /* 从36px增大到40px */
  border: 1px solid #dddddd;
  background: transparent;
  cursor: pointer;
  margin-right: 16px; /* 从12px增大到16px */
  margin-left: 16px; /* 从12px增大到16px */
  border-radius: 5px; /* 从4px增大到5px */
  transition: background-color 0.2s, border-color 0.2s;
}

.menu-btn:hover {
  background-color: #f5f5f5;
  border-color: #cccccc;
}

.menu-btn ion-icon {
  font-size: 28px; /* 从24px增大到28px */
  color: #555;
}

.title-text {
  font-size: 20px; /* 从18px增大到20px */
  font-weight: 500;
}

.topbar-right {
  display: flex;
  align-items: center;
  margin-right: 16px; /* 从12px增大到16px */
}

.avatar {
  width: 40px; /* 从36px增大到40px */
  height: 40px; /* 从36px增大到40px */
  border-radius: 50%;
  margin-right: 16px;
  border: 2px solid #409eff; /* 从1px增大到2px */
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.avatar:hover {
  box-shadow: 0 0 0 2px #e6f0fa; /* 从3px减小到2px */
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
  padding: 24px 28px 16px 28px; /* 从32px 36px 20px 36px减小 */
  border-radius: 8px; /* 从12px减小到8px */
  min-width: 240px; /* 从260px减小到240px */
  box-shadow: 0 3px 16px rgba(0,0,0,0.12);
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
  margin-bottom: 14px; /* 从18px减小到14px */
}

.modal-avatar {
  width: 46px; /* 从54px减小到46px */
  height: 46px; /* 从54px减小到46px */
  border-radius: 50%;
  border: 1px solid #409eff; /* 从2px减小到1px */
  margin-bottom: 6px; /* 从8px减小到6px */
}

.user-info-title {
  font-size: 16px; /* 从19px减小到16px */
  font-weight: 600;
  margin-bottom: 2px;
}

.user-info-desc {
  font-size: 12px; /* 从14px减小到12px */
  color: #888;
  margin-bottom: 2px;
}

.user-info-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 从10px减小到8px */
  margin-bottom: 12px; /* 从18px减小到12px */
}

.action-btn,
.close-btn {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 0; /* 从7px减小到6px */
  font-size: 13px; /* 从15px减小到13px */
  border-radius: 3px; /* 从4px减小到3px */
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
  gap: 8px; /* 从12px减小到8px */
  margin-bottom: 8px; /* 从10px减小到8px */
}

.form-group {
  width: 100%;
}

.pwd-form input {
  width: 100%;
  padding: 6px 8px; /* 从8px 10px减小到6px 8px */
  font-size: 13px; /* 从15px减小到13px */
  border: 1px solid #d9d9d9;
  border-radius: 3px; /* 从4px减小到3px */
  outline: none;
  box-sizing: border-box;
  transition: border 0.2s;
}

.pwd-form input:focus {
  border: 1px solid #409eff; /* 从1.5px减小到1px */
}

.form-btns {
  display: flex;
  gap: 8px; /* 从10px减小到8px */
}

.form-btns .action-btn {
  flex: 1;
}

.error-msg {
  color: red;
  font-size: 12px; /* 从14px减小到12px */
  margin-top: 8px; /* 从10px减小到8px */
}
</style>
