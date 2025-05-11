<template>
  <div class="wih-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="记录类型">
          <a-input v-model:value="form.record_type" placeholder="请输入记录类型" allow-clear />
        </a-form-item>
        <a-form-item label="内容">
          <a-input v-model:value="form.content" placeholder="请输入内容" allow-clear />
        </a-form-item>
        <a-form-item label="来源JS">
          <a-input v-model:value="form.source" placeholder="请输入来源JS" allow-clear />
        </a-form-item>
        <a-form-item label="站点">
          <a-input v-model:value="form.site" placeholder="请输入站点" allow-clear />
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
        :scroll="{ x: 1000 }"
        bordered 
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WihSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface WihData {
  _id: string
  record_type: string
  content: string
  source: string
  site: string
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的WIH数据
}

const props = defineProps<Props>()

const form = reactive({
  record_type: '',
  content: '',
  source: '',
  site: ''
})

const tableData = ref<WihData[]>([])
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
    title: '记录类型',
    dataIndex: 'record_type',
    key: 'record_type',
    width: 100,
    fixed: 'left'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 250,
    ellipsis: true
  },
  {
    title: '来源JS',
    dataIndex: 'source',
    key: 'source',
    width: 300,
    ellipsis: true
  },
  {
    title: '站点',
    dataIndex: 'site',
    key: 'site',
    width: 180,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180,
    render: (text: string) => text ? new Date(text).toLocaleString() : '-'
  }
]

const handleSearch = async (pag?: TablePaginationConfig) => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.record_type) params.append('record_type', form.record_type)
    if (form.content) params.append('content', form.content)
    if (form.source) params.append('source', form.source)
    if (form.site) params.append('site', form.site)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/wih/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('WIH搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.record_type = ''
  form.content = ''
  form.source = ''
  form.site = ''
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.record_type) params.append('record_type', form.record_type)
    if (form.content) params.append('content', form.content)
    if (form.source) params.append('source', form.source)
    if (form.site) params.append('site', form.site)

    const res = await http.get(`/wih/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wih_export_${new Date().getTime()}.txt`
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
.wih-search {
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