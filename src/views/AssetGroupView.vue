<template>
  <div class="asset-group-container">
    <!-- 标题和操作按钮 -->
    <div class="group-header">
      <h2>资产分组管理</h2>
      <div>
        <a-button type="primary" @click="handleAddGroup">
          <template #icon><PlusOutlined /></template>
          添加分组
        </a-button>
      </div>
    </div>

    <!-- 使用资产分组搜索组件 -->
    <a-card class="group-card">
      <asset-group-search ref="searchComp" :refresh-key="refreshKey" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import AssetGroupSearch from '../components/asset/AssetGroupSearch.vue'

// 定义组件引用，用于调用组件方法
const searchComp = ref()
const refreshKey = ref(0)

// 添加分组
const handleAddGroup = () => {
  searchComp.value?.showAddModal()
}

// 刷新数据方法（提供给父组件调用）
const refreshData = () => {
  refreshKey.value++
}

// 暴露给父组件的方法
defineExpose({
  refreshData
})
</script>

<style scoped>
.asset-group-container {
  padding: 24px;
}

.group-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-card {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .asset-group-container {
    padding: 16px;
  }
  
  .group-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
