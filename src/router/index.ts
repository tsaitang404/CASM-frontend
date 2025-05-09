import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 异步加载路由组件
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/task',
    name: 'task',
    component: () => import('../views/TaskManageView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/AssetSearchView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/monitor',
    name: 'monitor',
    component: () => import('../views/AssetMonitorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/group',
    name: 'group',
    component: () => import('../views/AssetGroupView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/policy',
    name: 'policy',
    component: () => import('../views/PolicyConfigView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('../views/FingerManageView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pocinfo',
    name: 'pocinfo',
    component: () => import('../views/PocInfoView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/poc',
    name: 'poc',
    component: () => import('../views/TaskScheduleView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/github-monitor',
    name: 'github-monitor',
    component: () => import('../views/GithubMonitorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/status',
    name: 'status',
    component: () => import('../views/StatusView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/task/detail/:id',
    name: 'TaskDetail',
    component: () => import('../views/TaskdetailView.vue'),
    meta: { requiresAuth: true }
  }
]

// 简单的日志函数，避免使用可能被修改的console.log
const safeLog = (message: string) => {
  try {
    if (window.console && typeof window.console.log === 'function') {
      window.console.log(message);
    }
  } catch (e) {
    // 忽略日志错误
  }
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局路由守卫，统一处理登录/登出跳转逻辑
router.beforeEach(async (to, from, next) => {
  // 先通过一个立即执行函数直接清除过期或无效的token
  (function clearInvalidToken() {
    try {
      const savedTokenTime = localStorage.getItem('TokenTime')
      if (savedTokenTime) {
        // 检查token是否超过24小时
        const tokenTime = parseInt(savedTokenTime)
        const now = new Date().getTime()
        if (now - tokenTime > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('Token')
          localStorage.removeItem('TokenTime')
          localStorage.removeItem('username')
        }
      } else if (localStorage.getItem('Token')) {
        // 有token但没有时间戳，为token设置时间戳
        localStorage.setItem('TokenTime', String(new Date().getTime()))
      }
    } catch (e) {
      localStorage.removeItem('Token')
      localStorage.removeItem('TokenTime')
      localStorage.removeItem('username')
    }
  })();
  
  const token = localStorage.getItem('Token')
  
  // 访问登录页时的处理
  if (to.meta.guest) {
    // 如果没有 token，直接进入登录页
    if (!token) {
      next()
      return
    }
    
    // 有 token 则验证有效性
    try {
      const res = await fetch('/api/user/info', {
        headers: { 'Token': token }
      })
      
      if (!res.ok) {
        throw new Error('API请求失败')
      }
      
      const data = await res.json()
      
      if (data && data.code === 200) {
        // token 有效，跳转到主页
        next('/home')
      } else {
        throw new Error('无效的Token')
      }
    } catch (e) {
      // token 无效，清除 token 并留在登录页
      localStorage.removeItem('Token')
      localStorage.removeItem('TokenTime')
      localStorage.removeItem('username')
      next()
    }
    return
  }
  
  // 访问需要登录的页面
  if (to.meta.requiresAuth) {
    if (!token) {
      // 无 token，跳转到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    
    // 有 token 则验证有效性
    try {
      const res = await fetch('/api/user/info', {
        headers: { 'Token': token }
      })
      
      if (!res.ok) {
        throw new Error('API请求失败')
      }
      
      const data = await res.json()
      
      if (data && data.code === 200) {
        // token 有效，允许访问
        next()
      } else {
        throw new Error('无效的Token')
      }
    } catch (e) {
      // token 无效，清除 token 并跳转到登录页
      localStorage.removeItem('Token')
      localStorage.removeItem('TokenTime')
      localStorage.removeItem('username')
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
    return
  }
  
  // 其他页面，默认放行
  next()
})

export default router
