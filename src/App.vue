<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './Layout.vue'
import Login from './views/Login.vue'

// 使用异步组件导入替代直接导入
const TaskManageView = () => import('./views/TaskManageView.vue').catch(err => {
  console.error('Failed to load TaskManageView:', err)
  return {
    template: '<div class="error-view">加载失败，请刷新页面重试</div>'
  }
})
const AssetSearchView = () => import('./views/AssetSearchView.vue')
const AssetMonitorView = () => import('./views/AssetMonitorView.vue')
const AssetGroupView = () => import('./views/AssetGroupView.vue')
const PolicyConfigView = () => import('./views/PolicyConfigView.vue')
const FingerManageView = () => import('./views/FingerManageView.vue')
const PocInfoView = () => import('./views/PocInfoView.vue')
const TaskScheduleView = () => import('./views/TaskScheduleView.vue')
const GithubManageView = () => import('./views/GithubManageView.vue')
const GithubMonitorView = () => import('./views/GithubMonitorView.vue')

const route = useRoute()
const activeKey = ref('task')
const componentError = ref(false)
const loading = ref(false)

const viewMap = {
  task: () => import('./views/TaskManageView.vue').catch(err => {
    console.error('Failed to load TaskManageView:', err)
    componentError.value = true
    return {
      template: '<div class="error-view">加载失败，请刷新页面重试</div>'
    }
  }),
  search: () => import('./views/AssetSearchView.vue'),
  monitor: () => import('./views/AssetMonitorView.vue'),
  group: () => import('./views/AssetGroupView.vue'),
  policy: () => import('./views/PolicyConfigView.vue'),
  tags: () => import('./views/FingerManageView.vue'),
  pocinfo: () => import('./views/PocInfoView.vue'),
  poc: () => import('./views/TaskScheduleView.vue'),
  github: () => import('./views/GithubManageView.vue'),
  'github-monitor': () => import('./views/GithubMonitorView.vue'),
}

const titleMap = {
  task: '任务管理',
  search: '资产搜索',
  monitor: '资产监控',
  group: '资产分组',
  policy: '策略配置',
  tags: '指纹管理',
  pocinfo: 'PoC信息',
  poc: '计划任务',
  github: 'GitHub管理',
  'github-monitor': 'GitHub监控',
}

const CurrentView = computed(() => {
  loading.value = true
  return viewMap[activeKey.value]?.().finally(() => {
    loading.value = false
  })
})

// 计算当前是否显示登录页
const isLoginPage = computed(() => {
  return route.path === '/login'
})

onMounted(() => {
  document.title = isLoginPage.value ? '登录' : (titleMap[activeKey.value] || '管理平台')
})

watch(route, (newRoute) => {
  if (newRoute.path === '/login') {
    document.title = '登录'
  } else {
    document.title = titleMap[activeKey.value] || '管理平台'
  }
})

watch(activeKey, (newKey) => {
  if (!isLoginPage.value) {
    document.title = titleMap[newKey] || '管理平台'
  }
})
</script>

<template>
  <!-- 根据路由路径动态决定显示登录页还是主应用布局 -->
  <div class="compact-layout">
    <Login v-if="isLoginPage" />
    <Layout v-else>
      <Suspense>
        <template #default>
          <div v-if="componentError" class="error-view">
            加载失败，请刷新页面重试
          </div>
          <div v-else-if="loading" class="loading-view">
            <a-spin size="large" />
          </div>
          <component v-else :is="CurrentView" />
        </template>
        <template #fallback>
          <div class="loading-view">
            <a-spin size="large" />
          </div>
        </template>
      </Suspense>
    </Layout>
  </div>
</template>

<style>
@import '@/assets/base.css';

/* 全局紧凑布局样式 */
html, body {
  font-size: var(--font-base);
}

:root {
  --content-padding: var(--spacing-medium);
  --element-spacing: var(--spacing-small);
}

.error-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #ff4d4f;
  font-size: 16px;
}

.loading-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
