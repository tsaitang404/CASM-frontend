<template>
  <a-layout-sider 
    :width="collapsed ? 70 : 240" 
    :collapsed="collapsed"
    :collapsedWidth="70"
    theme="dark" 
    class="ant-fixed-sidemenu"
  >
    <div class="logo-word">
      <img v-if="!collapsed" src="/wlogo.svg" alt="logo" style="height: 42px; vertical-align: middle;" />
      <img v-else src="/favicon.ico" alt="logo" style="height: 48px; width: 48px; vertical-align: middle;" class="centered-logo" />
    </div>
    <a-menu theme="dark" mode="inline" :selected-keys="[modelValue]" style="font-size: 18px;" @select="handleSelect">
      <a-menu-item key="task" style="height: 56px; line-height: 56px;" :title="collapsed ? '任务管理' : ''">
        <div class="menu-item-content">
          <ion-icon name="albums"></ion-icon>
          <span v-show="!collapsed">任务管理</span>
        </div>
      </a-menu-item>
      <a-menu-item key="search" style="height: 56px; line-height: 56px;" :title="collapsed ? '资产搜索' : ''">
        <div class="menu-item-content">
          <ion-icon name="search"></ion-icon>
          <span v-show="!collapsed">资产搜索</span>
        </div>
      </a-menu-item>
      <a-menu-item key="monitor" style="height: 56px; line-height: 56px;" :title="collapsed ? '资产监控' : ''">
        <div class="menu-item-content">
          <ion-icon name="pulse"></ion-icon>
          <span v-show="!collapsed">资产监控</span>
        </div>
      </a-menu-item>
      <a-menu-item key="group" style="height: 56px; line-height: 56px;" :title="collapsed ? '资产分组' : ''">
        <div class="menu-item-content">
          <ion-icon name="file-tray-stacked"></ion-icon>
          <span v-show="!collapsed">资产分组</span>
        </div>
      </a-menu-item>
      <a-menu-item key="policy" style="height: 56px; line-height: 56px;" :title="collapsed ? '策略配置' : ''">
        <div class="menu-item-content">
          <ion-icon name="locate"></ion-icon>
          <span v-show="!collapsed">策略配置</span>
        </div>
      </a-menu-item>
      <a-menu-item key="tags" style="height: 56px; line-height: 56px;" :title="collapsed ? '指纹管理' : ''">
        <div class="menu-item-content">
          <ion-icon name="finger-print"></ion-icon>
          <span v-show="!collapsed">指纹管理</span>
        </div>
      </a-menu-item>
      <a-menu-item key="pocinfo" style="height: 56px; line-height: 56px;" :title="collapsed ? 'PoC信息' : ''">
        <div class="menu-item-content">
          <ion-icon name="shield-checkmark"></ion-icon>
          <span v-show="!collapsed">PoC信息</span>
        </div>
      </a-menu-item>
      <a-menu-item key="poc" style="height: 56px; line-height: 56px;" :title="collapsed ? '计划任务' : ''">
        <div class="menu-item-content">
          <ion-icon name="calendar-number"></ion-icon>
          <span v-show="!collapsed">计划任务</span>
        </div>
      </a-menu-item>
      <a-menu-item key="github-monitor" style="height: 56px; line-height: 56px;" :title="collapsed ? 'GitHub监控' : ''">
        <div class="menu-item-content">
          <ion-icon name="logo-github"></ion-icon>
          <span v-show="!collapsed">GitHub监控</span>
        </div>
      </a-menu-item>
      <a-menu-item key="npoc-service" style="height: 56px; line-height: 56px;" :title="collapsed ? '服务识别' : ''">
        <div class="menu-item-content">
          <ion-icon name="scan"></ion-icon>
          <span v-show="!collapsed">服务识别</span>
        </div>
      </a-menu-item>
    </a-menu>
    
    <div class="status-link" :class="{ 'collapsed': collapsed }">
      <a @click="handleSelect({ key: 'status' })">
        <ion-icon name="stats-chart"></ion-icon>
        <span v-show="!collapsed">系统状态</span>
      </a>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])

function handleSelect({ key }) {
  emit('update:modelValue', key)
  
  // 根据菜单项的key路由到对应的页面
  const routeMap = {
    'task': '/task',
    'search': '/search',
    'monitor': '/monitor',
    'group': '/group',
    'policy': '/policy',
    'tags': '/tags',
    'pocinfo': '/pocinfo',
    'poc': '/poc',
    'github-monitor': '/github-monitor',
    'npoc-service': '/npoc-service',
    'status': '/status'
  }
  
  // 如果路由映射表中有对应的路由，则进行跳转
  if (routeMap[key]) {
    router.push(routeMap[key])
  }
}
</script>

<style scoped>
.status-link {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: #001529;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-link.collapsed {
  padding: 16px 0;
  text-align: center;
}

.status-link a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
}

.status-link a:hover {
  color: #fff;
}

.status-link ion-icon {
  font-size: 18px;
}
</style>

<style>
@import '@/assets/styles/components/sidebar.css';
</style>
