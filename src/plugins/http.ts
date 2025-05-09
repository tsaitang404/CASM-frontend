import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

// 创建axios实例
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
    // 从localStorage获取token
    const token = localStorage.getItem('Token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Token'] = token
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果返回的状态码为401，说明token已过期或无效
    if (res.code === 401) {
      message.error('登录已过期，请重新登录')
      // 清除token
      localStorage.removeItem('Token')
      localStorage.removeItem('TokenTime')
      localStorage.removeItem('username')
      // 跳转到登录页
      router.push('/login')
      return Promise.reject(new Error('Token已过期'))
    }
    
    return res
  },
  (error) => {
    message.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 封装GET请求
export const get = (url: string, params = {}) => {
  return http.get(url, { params })
}

// 封装POST请求
export const post = (url: string, data = {}) => {
  return http.post(url, data)
}

export default http