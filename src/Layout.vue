<template>
  <div class="layout-root">
    <Sidebar :modelValue="currentView" @update:modelValue="val => currentView = val" />
    <div class="layout-main">
      <Topbar :title="viewNameMap[currentView]" />
      <div class="layout-content">
        <slot />
        <!-- 或 <router-view /> -->
      </div>
      <Footbar />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import Footbar from './components/Footbar.vue'

const currentView = ref('task')
const viewNameMap = {
  task: '任务管理',
  search: '资产搜索',
  monitor: '资产监控',
  group: '资产分组',
  policy: '策略配置',
  tags: '指纹管理',
  pocinfo: 'PoC信息',
  poc: '计划任务',
  'github-monitor': 'GitHub监控',
}
</script>

<style scoped>
.layout-root {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 180px; /* 侧栏宽度 */
  height: 100vh;
}
.layout-content {
  flex: 1;
  overflow: auto;
  background: #f7f8fa;
  padding: 24px;
}
</style>
