<template>
  <div class="domain-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="域名">
          <a-input v-model:value="form.domain" placeholder="请输入域名" allow-clear />
        </a-form-item>
        <a-form-item label="记录类型">
          <a-input v-model:value="form.type" placeholder="请输入记录类型" allow-clear />
        </a-form-item>
        <a-form-item label="解析值">
          <a-input v-model:value="form.value" placeholder="请输入解析值" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" :loading="loading">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="search-result">
      <a-table 
        :dataSource="tableData" 
        :columns="columns"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
        bordered
      />
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
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '@/plugins/http'

interface DomainAsset {
  _id: string
  domain: string
  type: string
  value: string
  source: string
  update_date: string
}

// 查询表单
const form = reactive({
  domain: '',
  type: '',
  value: ''
})

// 表格数据
const tableData = ref<DomainAsset[]>([])
const loading = ref(false)

// 分页配置
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

// 表格列定义
const columns = [
  {
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
  },
  {
    title: '记录类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '解析值',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: '来源',
    dataIndex: 'source',
    key: 'source',
  },
  {
    title: '更新时间',
    dataIndex: 'update_date',
    key: 'update_date',
  }
]

// 搜索域名资产
const handleSearch = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.domain) params.append('domain', form.domain)
    if (form.type) params.append('type', form.type)
    if (form.value) params.append('value', form.value)
    params.append('page', String(pagination.current))
    params.append('size', String(pagination.pageSize))

    const { code, message: msg, items, total } = await http.get(`/asset_domain/?${params.toString()}`)
    
    if (code === 200) {
      tableData.value = items || []
      pagination.total = total || 0
    } else {
      throw new Error(msg || '查询失败')
    }
  } catch (error) {
    console.error('域名搜索错误:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.domain = ''
  form.type = ''
  form.value = ''
  pagination.current = 1
  handleSearch()
}

// 处理表格分页、排序、筛选变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  handleSearch()
}

// 初始加载
handleSearch()
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