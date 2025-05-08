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
          <button type="submit">登 录</button>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
    <div class="login-footer">
      <p>© 2025 CASM 资产安全管理系统</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  try {
    // 假设后端接口为 /api/user/login
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await res.json()
    if (data.code === 200) {
      localStorage.setItem('Token', data.data.token)
      localStorage.setItem('username', data.data.username)
      // 使用Vue Router进行跳转，而不是直接修改location
      router.push('/home')
    } else {
      // 只有 message 存在且不是 'success' 时才显示 message，否则显示默认错误
      error.value = (data.message && data.message !== 'success') ? data.message : '用户名或密码错误'
    }
  } catch (e) {
    error.value = '网络错误'
  }
}
</script>

<style scoped>
/* 整体页面样式 */
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

/* 登录容器 */
.login-container {
  width: 400px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  padding: 0;
}

/* 登录头部 */
.login-header {
  padding: 30px 40px 20px;
  text-align: center;
  background: #f7f9fc;
  border-bottom: 1px solid #eaedf2;
}

/* Logo 样式 */
.logo-container {
  margin-bottom: 16px;
}

.logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

/* 系统标题 */
.system-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 登录表单区域 */
.login-form {
  padding: 30px 40px 40px;
}

/* 输入框组合样式 */
.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

/* 用户图标和锁图标的简单实现 */
.icon-user:before {
  content: "👤";
}

.icon-lock:before {
  content: "🔒";
}

/* 输入框样式 */
.login-form input {
  width: 100%;
  padding: 12px 12px 12px 38px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.login-form input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 按钮样式 */
.login-form button {
  width: 100%;
  padding: 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
  letter-spacing: 6px;
}

.login-form button:hover {
  background: #66b1ff;
}

/* 错误信息样式 */
.error-message {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

/* 页脚样式 */
.login-footer {
  margin-top: 20px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
  .login-container {
    width: 100%;
    max-width: 360px;
  }
  
  .login-header, .login-form {
    padding-left: 25px;
    padding-right: 25px;
  }
}
</style>