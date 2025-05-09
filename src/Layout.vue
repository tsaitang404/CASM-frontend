<template>
  <div class="layout-root">
    <Sidebar :modelValue="currentView" @update:modelValue="val => currentView = val" :collapsed="sidebarCollapsed" />
    <div class="layout-main" :class="{ 'collapsed': sidebarCollapsed }">
      <Topbar :title="viewNameMap[currentView]" @toggle-sidebar="toggleSidebar" :sidebarCollapsed="sidebarCollapsed" />
      <div class="layout-content" ref="contentRef">
        <!-- 使用router-view显示对应路由的组件内容 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      <Footbar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import Footbar from './components/Footbar.vue'

const router = useRouter()
const route = useRoute()
const currentView = ref('task')
const contentRef = ref(null)
const sidebarCollapsed = ref(false) // 控制侧边栏折叠状态

// 根据当前路由路径更新currentView
watch(() => route.path, (newPath) => {
  // 移除前导斜杠，将路径转换为对应的菜单key
  const path = newPath.substring(1)
  if (path && viewNameMap[path]) {
    currentView.value = path
  }
}, { immediate: true })

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

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
  home: '首页'
}
</script>

<style>
@import '@/assets/styles/layouts/layout.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
