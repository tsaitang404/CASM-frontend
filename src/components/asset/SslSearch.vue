<template>
  <div class="ssl-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="域名">
          <a-input v-model:value="form.domain" placeholder="请输入域名" allow-clear />
        </a-form-item>
        <a-form-item label="证书颁发机构">
          <a-input v-model:value="form.issuer" placeholder="请输入证书颁发机构" allow-clear />
        </a-form-item>
        <a-form-item label="到期状态">
          <a-select v-model:value="form.expirationStatus" placeholder="请选择" allowClear style="width: 200px">
            <a-select-option value="normal">正常</a-select-option>
            <a-select-option value="expiring">即将过期</a-select-option>
            <a-select-option value="expired">已过期</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    
    <div class="search-result">
      <a-table :dataSource="tableData" :columns="columns" bordered />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SslSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  domain: '',
  issuer: '',
  expirationStatus: undefined
})

const tableData = ref([])

const columns = [
  {
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: '证书颁发机构',
    dataIndex: 'issuer',
    key: 'issuer',
  },
  {
    title: '生效时间',
    dataIndex: 'validFrom',
    key: 'validFrom',
  },
  {
    title: '过期时间',
    dataIndex: 'validTo',
    key: 'validTo',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
]

const handleSearch = () => {
  // TODO: 实现搜索逻辑
}

const handleReset = () => {
  form.domain = ''
  form.issuer = ''
  form.expirationStatus = undefined
}
</script>

<style scoped>
.ssl-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
}
</style>