<template>
  <div class="domain-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="域名">
          <a-input v-model:value="form.domain" placeholder="请输入域名" allow-clear />
        </a-form-item>
        <a-form-item label="解析记录">
          <a-input v-model:value="form.record" placeholder="请输入解析记录" allow-clear />
        </a-form-item>
        <a-form-item label="解析类型">
          <a-select v-model:value="form.type" placeholder="请选择解析类型" allow-clear style="width: 120px">
            <a-select-option value="A">A</a-select-option>
            <a-select-option value="CNAME">CNAME</a-select-option>
            <a-select-option value="MX">MX</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ips" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="来源">
          <a-input v-model:value="form.source" placeholder="请输入数据来源" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" :loading="loading">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport">导出</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    
    <div class="search-result">
      <a-table 
        :dataSource="tableData" 
        :columns="columns" 
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
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
import http from '../../plugins/http'

interface DomainData {
  _id: string
  domain: string
  type: string
  record: string
  ips: string[]
  source: string
  task_id: string
  create_time: string
}

const form = reactive({
  domain: '',
  record: '',
  type: undefined as string | undefined,
  ips: '',
  source: ''
})

const tableData = ref<DomainData[]>([])
const loading = ref(false)

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

const columns = [
  {
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
    width: 200,
    ellipsis: true
  },
  {
    title: '解析类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '解析记录',
    dataIndex: 'record',
    key: 'record',
    width: 200,
    ellipsis: true
  },
  {
    title: 'IP地址',
    dataIndex: 'ips',
    key: 'ips',
    width: 200,
    ellipsis: true,
    render: (ips: string[]) => ips?.join(', ') || '-'
  },
  {
    title: '来源',
    dataIndex: 'source',
    key: 'source',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180
  }
]

const handleSearch = async (pag?: TablePaginationConfig) => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.domain) params.append('domain', form.domain)
    if (form.record) params.append('record', form.record)
    if (form.type) params.append('type', form.type)
    if (form.ips) params.append('ips', form.ips)
    if (form.source) params.append('source', form.source)
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/domain/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('域名搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.domain = ''
  form.record = ''
  form.type = undefined
  form.ips = ''
  form.source = ''
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.domain) params.append('domain', form.domain)
    if (form.record) params.append('record', form.record)
    if (form.type) params.append('type', form.type)
    if (form.ips) params.append('ips', form.ips)
    if (form.source) params.append('source', form.source)

    const res = await http.get(`/domain/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `domain_export_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.success('导出成功')
  } catch (error) {
    console.error('导出错误:', error)
    message.error('导出失败')
  }
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