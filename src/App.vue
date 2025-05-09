<script setup lang="ts">
import { ref, computed, watch, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './Layout.vue'
import Login from './views/Login.vue'

// 使用markRaw包装异步组件以避免不必要的响应式包装
const asyncComponents = {
  task: markRaw(() => import('./views/TaskManageView.vue')),
  search: markRaw(() => import('./views/AssetSearchView.vue')),
  monitor: markRaw(() => import('./views/AssetMonitorView.vue')),
  group: markRaw(() => import('./views/AssetGroupView.vue')),
  policy: markRaw(() => import('./views/PolicyConfigView.vue')),
  tags: markRaw(() => import('./views/FingerManageView.vue')),
  pocinfo: markRaw(() => import('./views/PocInfoView.vue')),
  poc: markRaw(() => import('./views/TaskScheduleView.vue')),
  'github-manage': markRaw(() => import('./views/GithubManageView.vue')),
  'github-monitor': markRaw(() => import('./views/GithubMonitorView.vue'))
}

const route = useRoute()
const activeKey = ref('task')
const componentError = ref(false)
const loading = ref(false)

// 计算当前应该显示的组件
const CurrentView = computed(() => {
  const key = route.path.replace('/', '') || 'task'
  return asyncComponents[key] || null
})

// 计算是否显示登录页
const isLoginPage = computed(() => route.path === '/login')

// 页面标题映射
const titleMap = {
  task: '任务管理',
  search: '资产搜索',
  monitor: '资产监控',
  group: '资产分组',
  policy: '策略配置',
  tags: '指纹管理',
  pocinfo: 'PoC信息',
  poc: '计划任务',
  'github-manage': 'GitHub管理',
  'github-monitor': 'GitHub监控',
  home: '首页'
}

// 监听路由变化以更新页面标题
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
    <template v-if="isLoginPage">
      <Login />
    </template>
    <template v-else>
      <Layout>
        <Suspense>
          <template #default>
            <component
              :is="CurrentView"
              v-if="CurrentView"
              @error="componentError = true"
            />
            <div v-else-if="componentError" class="error-view">
              加载失败，请刷新页面重试
            </div>
            <div v-else class="loading-view">
              <a-spin size="large" />
            </div>
          </template>
          <template #fallback>
            <div class="loading-view">
              <a-spin size="large" />
            </div>
          </template>
        </Suspense>
      </Layout>
    </template>
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
