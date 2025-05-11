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
      <a-tab-pane key="url" tab="URL搜索">
        <UrlSearch />
      </a-tab-pane>
      <a-tab-pane key="ssl" tab="SSL证书搜索">
        <SslSearch />
      </a-tab-pane>
      <a-tab-pane key="service" tab="服务搜索">
        <ServiceSearch />
      </a-tab-pane>
      <a-tab-pane key="npoc" tab="NPOC服务搜索">
        <NpocServiceSearch />
      </a-tab-pane>
      <a-tab-pane key="cip" tab="C段IP搜索">
        <CipSearch />
      </a-tab-pane>
      <a-tab-pane key="wih" tab="WIH搜索">
        <WihSearch />
      </a-tab-pane>
      <a-tab-pane key="fileleak" tab="文件泄漏搜索">
        <FileleakSearch />
      </a-tab-pane>
      <a-tab-pane key="vuln" tab="漏洞搜索">
        <VulnSearch />
      </a-tab-pane>
      <a-tab-pane key="nuclei" tab="Nuclei结果搜索">
        <NucleiResultSearch />
      </a-tab-pane>
      <a-tab-pane key="finger" tab="指纹统计搜索">
        <StatFingerSearch />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SiteSearch from '../components/asset/SiteSearch.vue'
import DomainSearch from '../components/asset/DomainSearch.vue'
import IpSearch from '../components/asset/IpSearch.vue'
import UrlSearch from '../components/asset/UrlSearch.vue'
import SslSearch from '../components/asset/SslSearch.vue'
import ServiceSearch from '../components/asset/ServiceSearch.vue'
import NpocServiceSearch from '../components/asset/NpocServiceSearch.vue'
import CipSearch from '../components/asset/CipSearch.vue'
import WihSearch from '../components/asset/WihSearch.vue'
import FileleakSearch from '../components/asset/FileleakSearch.vue'
import VulnSearch from '../components/asset/VulnSearch.vue'
import NucleiResultSearch from '../components/asset/NucleiResultSearch.vue'
import StatFingerSearch from '../components/asset/StatFingerSearch.vue'

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

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 16px;
}

:deep(.ant-tabs-content-holder) {
  padding: 0;
}

:deep(.ant-tabs-nav-wrap) {
  overflow-x: auto;
}
</style>
