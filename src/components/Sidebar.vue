<template>
  <a-layout-sider width="180" theme="dark" class="ant-fixed-sidemenu">
    <div class="logo-word">
      <img src="/wlogo.svg" alt="logo" style="height: 24px; vertical-align: middle;" />
    </div>
    <a-menu theme="dark" mode="inline" :selected-keys="['task']" style="font-size: 13px;">
      <a-menu-item key="task" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="profile" style="font-size: 16px;" /></template>
        任务管理
      </a-menu-item>
      <a-menu-item key="search" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="search" style="font-size: 16px;" /></template>
        资产搜索
      </a-menu-item>
      <a-menu-item key="monitor" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="eye" style="font-size: 16px;" /></template>
        资产监控
      </a-menu-item>
      <a-menu-item key="group" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="appstore" style="font-size: 16px;" /></template>
        资产分组
      </a-menu-item>
      <a-menu-item key="policy" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="setting" style="font-size: 16px;" /></template>
        策略配置
      </a-menu-item>
      <a-menu-item key="tags" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="tags" style="font-size: 16px;" /></template>
        指纹管理
      </a-menu-item>
      <a-menu-item key="pocinfo" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="info-circle" style="font-size: 16px;" /></template>
        PoC信息
      </a-menu-item>
      <a-menu-item key="poc" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="schedule" style="font-size: 16px;" /></template>
        计划任务
      </a-menu-item>
      <a-menu-item key="github" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="github" style="font-size: 16px;" /></template>
        GitHub管理
      </a-menu-item>
      <a-menu-item key="github-monitor" style="height: 36px; line-height: 36px;">
        <template #icon><a-icon type="alert" style="font-size: 16px;" /></template>
        GitHub监控
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
// 侧边栏暂不需要逻辑
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
