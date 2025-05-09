import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

// 创建 axios 实例
const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('Token')
    if (token) {
      config.headers.Token = token
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return response
    }
    
    // 统一处理错误响应
    if (res.code === 401) {
      message.error('登录已过期，请重新登录')
      localStorage.removeItem('Token')
      localStorage.removeItem('TokenTime')
      localStorage.removeItem('username')
      router.push('/login')
      return Promise.reject(new Error('未授权'))
    }
    
    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error('未授权，请重新登录')
          localStorage.removeItem('Token')
          localStorage.removeItem('TokenTime')
          localStorage.removeItem('username')
          router.push('/login')
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error('未知错误')
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接')
    } else {
      message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default http