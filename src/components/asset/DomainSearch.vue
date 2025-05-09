<template>
  <div class="domain-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="域名">
          <a-input v-model:value="form.domain" placeholder="请输入域名" allow-clear />
        </a-form-item>
        <a-form-item label="注册商">
          <a-input v-model:value="form.registrar" placeholder="请输入注册商" allow-clear />
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
  name: 'DomainSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  domain: '',
  registrar: ''
})

const tableData = ref([])

const columns = [
  {
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: '注册商',
    dataIndex: 'registrar',
    key: 'registrar',
  },
  {
    title: '注册日期',
    dataIndex: 'registrationDate',
    key: 'registrationDate',
  },
  {
    title: '到期日期',
    dataIndex: 'expirationDate',
    key: 'expirationDate',
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
  form.registrar = ''
}
</script>

<style scoped>
.domain-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
}
</style>