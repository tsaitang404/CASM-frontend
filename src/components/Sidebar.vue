<template>
  <a-layout-sider width="180" theme="dark" class="ant-fixed-sidemenu">
    <div class="logo-word">
      <img src="/wlogo.svg" alt="logo" style="height: 24px; vertical-align: middle;" />
    </div>
    <a-menu theme="dark" mode="inline" :selected-keys="[modelValue]" style="font-size: 13px;" @select="handleSelect">
      <a-menu-item key="task" style="height: 36px; line-height: 36px;">
        <ion-icon name="albums"></ion-icon>
        任务管理
      </a-menu-item>
      <a-menu-item key="search" style="height: 36px; line-height: 36px;">
        <ion-icon name="search"></ion-icon>
        资产搜索
      </a-menu-item>
      <a-menu-item key="monitor" style="height: 36px; line-height: 36px;">
        <ion-icon name="pulse"></ion-icon>
        资产监控
      </a-menu-item>
      <a-menu-item key="group" style="height: 36px; line-height: 36px;">
        <ion-icon name="file-tray-stacked"></ion-icon>
        资产分组
      </a-menu-item>
      <a-menu-item key="policy" style="height: 36px; line-height: 36px;">
        <ion-icon name="locate"></ion-icon>
        策略配置
      </a-menu-item>
      <a-menu-item key="tags" style="height: 36px; line-height: 36px;">
        <ion-icon name="finger-print"></ion-icon>
        指纹管理
      </a-menu-item>
      <a-menu-item key="pocinfo" style="height: 36px; line-height: 36px;">
        <ion-icon name="shield-checkmark"></ion-icon>
        PoC信息
      </a-menu-item>
      <a-menu-item key="poc" style="height: 36px; line-height: 36px;">
        <ion-icon name="calendar-number"></ion-icon>
        计划任务
      </a-menu-item>
      <a-menu-item key="github-monitor" style="height: 36px; line-height: 36px;">
        <ion-icon name="logo-github"></ion-icon>
        GitHub监控
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
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
  min-width: 180px !important;
  max-width: 180px !important;
  width: 180px !important;
}
.logo-word {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin: 0;
}
</style>
