<template>
  <div class="login">
    <form @submit.prevent="handleLogin">
      <h2>登录</h2>
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit">登录</button>
      <p v-if="error" style="color:red">{{ error }}</p>
    </form>
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
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('username', data.data.username)
      router.push('/')
    } else {
      error.value = data.message || '用户名或密码错误'
    }
  } catch (e) {
    error.value = '网络错误'
  }
}
</script>

<style scoped>
.login {
  width: 300px;
  margin: 100px auto;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px #eee;
}
.login input {
  display: block;
  width: 100%;
  margin-bottom: 16px;
  padding: 8px;
}
.login button {
  width: 100%;
  padding: 8px;
}
</style>