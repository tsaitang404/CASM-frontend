<template>
  <a-layout-sider 
    :width="collapsed ? 48 : 180" 
    :collapsed="collapsed"
    :collapsedWidth="48"
    theme="dark" 
    class="ant-fixed-sidemenu"
  >
    <div class="logo-word">
      <img v-if="!collapsed" src="/wlogo.svg" alt="logo" style="height: 24px; vertical-align: middle;" />
      <img v-else src="/favicon.ico" alt="logo" style="height: 32px; width: 32px; vertical-align: middle;" class="centered-logo" />
    </div>
    <a-menu theme="dark" mode="inline" :selected-keys="[modelValue]" style="font-size: 13px;" @select="handleSelect">
      <a-menu-item key="task" style="height: 36px; line-height: 36px;" :title="collapsed ? '任务管理' : ''">
        <div class="menu-item-content">
          <ion-icon name="albums"></ion-icon>
          <span v-show="!collapsed">任务管理</span>
        </div>
      </a-menu-item>
      <a-menu-item key="search" style="height: 36px; line-height: 36px;" :title="collapsed ? '资产搜索' : ''">
        <div class="menu-item-content">
          <ion-icon name="search"></ion-icon>
          <span v-show="!collapsed">资产搜索</span>
        </div>
      </a-menu-item>
      <a-menu-item key="monitor" style="height: 36px; line-height: 36px;" :title="collapsed ? '资产监控' : ''">
        <div class="menu-item-content">
          <ion-icon name="pulse"></ion-icon>
          <span v-show="!collapsed">资产监控</span>
        </div>
      </a-menu-item>
      <a-menu-item key="group" style="height: 36px; line-height: 36px;" :title="collapsed ? '资产分组' : ''">
        <div class="menu-item-content">
          <ion-icon name="file-tray-stacked"></ion-icon>
          <span v-show="!collapsed">资产分组</span>
        </div>
      </a-menu-item>
      <a-menu-item key="policy" style="height: 36px; line-height: 36px;" :title="collapsed ? '策略配置' : ''">
        <div class="menu-item-content">
          <ion-icon name="locate"></ion-icon>
          <span v-show="!collapsed">策略配置</span>
        </div>
      </a-menu-item>
      <a-menu-item key="tags" style="height: 36px; line-height: 36px;" :title="collapsed ? '指纹管理' : ''">
        <div class="menu-item-content">
          <ion-icon name="finger-print"></ion-icon>
          <span v-show="!collapsed">指纹管理</span>
        </div>
      </a-menu-item>
      <a-menu-item key="pocinfo" style="height: 36px; line-height: 36px;" :title="collapsed ? 'PoC信息' : ''">
        <div class="menu-item-content">
          <ion-icon name="shield-checkmark"></ion-icon>
          <span v-show="!collapsed">PoC信息</span>
        </div>
      </a-menu-item>
      <a-menu-item key="poc" style="height: 36px; line-height: 36px;" :title="collapsed ? '计划任务' : ''">
        <div class="menu-item-content">
          <ion-icon name="calendar-number"></ion-icon>
          <span v-show="!collapsed">计划任务</span>
        </div>
      </a-menu-item>
      <a-menu-item key="github-monitor" style="height: 36px; line-height: 36px;" :title="collapsed ? 'GitHub监控' : ''">
        <div class="menu-item-content">
          <ion-icon name="logo-github"></ion-icon>
          <span v-show="!collapsed">GitHub监控</span>
        </div>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
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
}
</script>

<style scoped>
.ant-layout-sider {
  height: 100vh;
  background: #001529;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.logo-word {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin: 0;
  overflow: hidden;
}

.centered-logo {
  display: block;
  margin: 0 auto;
}

/* 菜单项内容布局 */
.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 图标基础样式 */
ion-icon {
  font-size: 18px;
  margin-right: 8px;
  width: 20px;
  text-align: center;
}

/* 确保菜单项宽度与侧边栏一致 */
:deep(.ant-menu) {
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.ant-menu-item) {
  width: 100% !important;
  margin: 0 !important;
  padding-left: 24px !important;
  padding-right: 16px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
}

/* 非折叠状态下的样式 */
:deep(.ant-menu:not(.ant-menu-inline-collapsed) .menu-item-content) {
  justify-content: flex-start;
  padding-left: 0;
}

/* 折叠状态下的菜单项样式 */
:deep(.ant-menu.ant-menu-inline-collapsed > .ant-menu-item) {
  padding: 0 !important;
  text-align: center !important;
  justify-content: center !important;
}

:deep(.ant-menu.ant-menu-inline-collapsed .menu-item-content) {
  justify-content: center !important;
  padding-left: 0 !important;
}

:deep(.ant-menu.ant-menu-inline-collapsed .menu-item-content ion-icon) {
  margin-right: 0 !important;
}

/* 修复激活菜单项图标与底色错位问题 */
:deep(.ant-menu-item.ant-menu-item-selected) {
  background-color: #1890ff !important;
}

:deep(.ant-menu-item.ant-menu-item-selected .menu-item-content) {
  position: relative;
  z-index: 1;
}

:deep(.ant-menu-inline-collapsed .ant-menu-item.ant-menu-item-selected) {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.ant-menu-inline-collapsed .ant-menu-item.ant-menu-item-selected .menu-item-content) {
  width: 100%;
  justify-content: center;
}
</style>
