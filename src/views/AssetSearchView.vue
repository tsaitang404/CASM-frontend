<template>
  <div class="asset-search">
    <a-tabs v-model:activeKey="activeTab" type="card" class="asset-tabs">
      <a-tab-pane key="site" tab="站点搜索">
        <SiteSearch />
      </a-tab-pane>
      <a-tab-pane key="domain" tab="域名搜索">
        <DomainSearch />
      </a-tab-pane>
      <a-tab-pane key="ip" tab="IP搜索">
        <IpSearch />
      </a-tab-pane>
      <a-tab-pane key="ssl" tab="SSL证书搜索">
        <SslSearch />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SiteSearch from '../components/asset/SiteSearch.vue'
import DomainSearch from '../components/asset/DomainSearch.vue'
import IpSearch from '../components/asset/IpSearch.vue'
import SslSearch from '../components/asset/SslSearch.vue'

const activeTab = ref('site')
</script>

<style scoped>
.asset-search {
  padding: 20px;
}

.asset-tabs {
  background-color: #fff;
  border-radius: 4px;
}
</style>
