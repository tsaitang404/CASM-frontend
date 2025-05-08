<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div style="display: flex; min-height: 100vh;">
    <Sidebar />
    <div style="flex: 1; margin-left: 240px;">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* 可根据需要调整全局样式 */
</style>
