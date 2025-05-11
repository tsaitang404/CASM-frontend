<template>
  <div class="cip-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="C段地址">
          <a-input v-model:value="form.cidr_ip" placeholder="请输入C段地址" allow-clear />
        </a-form-item>
        <a-form-item label="IP数量">
          <a-input v-model:value="form.ip_count" placeholder="请输入IP数量" allow-clear />
        </a-form-item>
        <a-form-item label="域名数量">
          <a-input v-model:value="form.domain_count" placeholder="请输入域名数量" allow-clear />
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
        :scroll="{ x: 1200 }"
        bordered 
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CipSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface CipData {
  _id: string
  cidr_ip: string
  ip_count: number
  domain_count: number
  ip_list: string[]
  domain_list: string[]
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的C段数据
}

const props = defineProps<Props>()

const form = reactive({
  cidr_ip: '',
  ip_count: '',
  domain_count: ''
})

const tableData = ref<CipData[]>([])
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
    title: 'C段地址', 
    dataIndex: 'cidr_ip', 
    key: 'cidr_ip', 
    width: 180,
    fixed: 'left'
  },
  { 
    title: 'IP数量', 
    dataIndex: 'ip_count', 
    key: 'ip_count', 
    width: 100,
    sorter: true 
  },
  { 
    title: '域名数量', 
    dataIndex: 'domain_count', 
    key: 'domain_count', 
    width: 100,
    sorter: true 
  },
  { 
    title: 'IP列表', 
    dataIndex: 'ip_list', 
    key: 'ip_list',
    width: 300,
    ellipsis: true,
    render: (text: string[]) => text?.join(', ') || '-'
  },
  { 
    title: '域名列表', 
    dataIndex: 'domain_list', 
    key: 'domain_list', 
    width: 300,
    ellipsis: true,
    render: (text: string[]) => text?.join(', ') || '-'
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180,
    fixed: 'right'
  }
]

const handleSearch = async (pag?: TablePaginationConfig) => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.cidr_ip) params.append('cidr_ip', form.cidr_ip)
    if (form.ip_count) params.append('ip_count', form.ip_count)
    if (form.domain_count) params.append('domain_count', form.domain_count)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/cip/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('C段IP搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.cidr_ip = ''
  form.ip_count = ''
  form.domain_count = ''
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.cidr_ip) params.append('cidr_ip', form.cidr_ip)
    if (form.ip_count) params.append('ip_count', form.ip_count)
    if (form.domain_count) params.append('domain_count', form.domain_count)

    const res = await http.get(`/cip/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cip_export_${new Date().getTime()}.txt`
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

// 监听任务ID变化，重新加载数据
watch(() => props.taskId, (newTaskId, oldTaskId) => {
  if (newTaskId && newTaskId !== oldTaskId) {
    pagination.current = 1; // 重置为第一页
    handleSearch();
  }
}, { immediate: true })

// 初始加载（如果没有taskId的情况）
if (!props.taskId) {
  handleSearch()
}
</script>

<style scoped>
.cip-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
  overflow-x: auto;
}

:deep(.ant-table-wrapper) {
  overflow-x: auto;
}

:deep(.ant-table-header),
:deep(.ant-table-body) {
  overflow-y: auto !important;
}

:deep(.ant-table-cell-ellipsis) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-table-fixed) {
  background: #fff;
}

:deep(.ant-table-cell) {
  vertical-align: top;
}
</style>