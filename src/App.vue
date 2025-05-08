<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './Layout.vue'
import Login from './views/Login.vue'
import TaskManageView from './views/TaskManageView.vue'
import AssetSearchView from './views/AssetSearchView.vue'
import AssetMonitorView from './views/AssetMonitorView.vue'
import AssetGroupView from './views/AssetGroupView.vue'
import PolicyConfigView from './views/PolicyConfigView.vue'
import FingerManageView from './views/FingerManageView.vue'
import PocInfoView from './views/PocInfoView.vue'
import TaskScheduleView from './views/TaskScheduleView.vue'
import GithubManageView from './views/GithubManageView.vue'
import GithubMonitorView from './views/GithubMonitorView.vue'

const route = useRoute()
const activeKey = ref('task')

const viewMap = {
  task: TaskManageView,
  search: AssetSearchView,
  monitor: AssetMonitorView,
  group: AssetGroupView,
  policy: PolicyConfigView,
  tags: FingerManageView,
  pocinfo: PocInfoView,
  poc: TaskScheduleView,
  github: GithubManageView,
  'github-monitor': GithubMonitorView,
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

const CurrentView = computed(() => viewMap[activeKey.value] || TaskManageView)

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
  <Login v-if="isLoginPage" />
  <Layout v-else>
    <component :is="CurrentView" />
  </Layout>
</template>

<style scoped>
/* 可根据需要调整全局样式 */
</style>
