<template>
  <div class="layout-root">
    <Sidebar :modelValue="currentView" @update:modelValue="val => currentView = val" />
    <div class="layout-main">
      <Topbar :title="viewNameMap[currentView]" />
      <div class="layout-content" ref="contentRef">
        <slot />
      </div>
      <Footbar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import Footbar from './components/Footbar.vue'

const currentView = ref('task')
const contentRef = ref(null)

// 调整内容区域大小的函数
const adjustContentSize = () => {
  if (!contentRef.value) return
  
  // 获取视口高度
  const viewportHeight = window.innerHeight
  
  // 获取Topbar和Footbar的实际高度
  const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 48
  const footbarHeight = document.querySelector('.footbar')?.offsetHeight || 40
  
  // 计算内容区域可用高度
  const availableHeight = viewportHeight - topbarHeight - footbarHeight
  
  // 设置内容区域高度
  contentRef.value.style.height = `${availableHeight}px`
}

onMounted(() => {
  // 初始调整
  setTimeout(adjustContentSize, 0)
  
  // 监听窗口大小变化
  window.addEventListener('resize', adjustContentSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustContentSize)
})

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
/* 重置可能继承的样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout-root {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 180px; /* 侧栏宽度 */
  height: 100vh;
  overflow: hidden;
}

.layout-content {
  flex: 1;
  background: #f7f8fa;
  padding: 24px;
  box-sizing: border-box;
  overflow: auto; /* 仅当内容超出时显示滚动条 */
}
</style>
