import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
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
    path: '/task-detail/:id',
    name: 'TaskDetail',
    component: () => import('../views/TaskdetailView.vue'),
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
    path: '/github-manage',
    name: 'github-manage',
    component: () => import('../views/GithubManageView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/status',
    name: 'status',
    component: () => import('../views/StatusView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/npoc-service',
    name: 'npoc-service',
    component: () => import('../views/NpocServiceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/celery-task-test',
    name: 'celeryTaskTest',
    component: () => import('../views/CeleryTaskTestView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('Token')
  
  // 访问登录页时的处理
  if (to.meta.guest) {
    if (!token) {
      next()
    } else {
      next('/task')
    }
    return
  }
  
  // 访问需要登录的页面
  if (to.meta.requiresAuth) {
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router
