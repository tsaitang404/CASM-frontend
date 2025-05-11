<template>
  <div class="asset-search">
    <a-card class="search-card">
      <h2 class="page-title">资产综合检索</h2>
      <a-tabs v-model:activeKey="activeTab" type="card">
        <a-tab-pane key="ip" tab="IP资产">
          <AssetIPSearch />
        </a-tab-pane>
        <a-tab-pane key="domain" tab="域名资产">
          <AssetDomainSearch />
        </a-tab-pane>
        <a-tab-pane key="site" tab="站点资产">
          <AssetSiteSearch />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AssetIPSearch from '../components/asset/AssetIPSearch.vue'
import AssetDomainSearch from '../components/asset/AssetDomainSearch.vue'
import AssetSiteSearch from '../components/asset/AssetSiteSearch.vue'

// 默认显示IP资产页签
const activeTab = ref('ip')
</script>

<style scoped>
.asset-search {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

:deep(.ant-card-body) {
  padding: 24px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

:deep(.ant-tabs-tab) {
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
}

:deep(.ant-tabs-tab-active) {
  background: #e6f7ff;
  border-bottom-color: #e6f7ff;
}

:deep(.ant-tabs-tab-btn) {
  font-weight: 500;
}
</style>
