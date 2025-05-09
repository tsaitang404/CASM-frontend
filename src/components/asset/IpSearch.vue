<template>
  <div class="ip-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="归属地">
          <a-input v-model:value="form.location" placeholder="请输入归属地" allow-clear />
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
  name: 'IpSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  ip: '',
  location: ''
})

const tableData = ref([])

const columns = [
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: '归属地',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: '运营商',
    dataIndex: 'isp',
    key: 'isp',
  },
  {
    title: '开放端口',
    dataIndex: 'ports',
    key: 'ports',
  },
  {
    title: '最后扫描时间',
    dataIndex: 'lastScan',
    key: 'lastScan',
  },
]

const handleSearch = () => {
  // TODO: 实现搜索逻辑
}

const handleReset = () => {
  form.ip = ''
  form.location = ''
}
</script>

<style scoped>
.ip-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
}
</style>