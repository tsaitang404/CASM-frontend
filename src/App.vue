<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
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

const CurrentView = computed(() => viewMap[activeKey.value] || TaskManageView)
</script>

<template>
  <div style="display: flex; min-height: 100vh;">
    <Sidebar v-model="activeKey" />
    <div style="flex: 1; margin-left: 180px; padding: 24px;">
      <component :is="CurrentView" />
    </div>
  </div>
</template>

<style scoped>
/* 可根据需要调整全局样式 */
</style>
