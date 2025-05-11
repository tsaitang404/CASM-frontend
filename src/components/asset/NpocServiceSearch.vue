<template>
  <div class="npoc-service-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="服务协议">
          <a-input v-model:value="form.scheme" placeholder="请输入服务协议" allow-clear />
        </a-form-item>
        <a-form-item label="主机名">
          <a-input v-model:value="form.host" placeholder="请输入主机名" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="目标URL">
          <a-input v-model:value="form.target" placeholder="请输入目标URL" allow-clear />
        </a-form-item>
        <a-form-item label="服务器">
          <a-input v-model:value="form.server" placeholder="请输入服务器标识" allow-clear />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="form.title" placeholder="请输入页面标题" allow-clear />
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
  name: 'NpocServiceSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, watch, h } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface NpocServiceData {
  _id: string
  scheme: string
  host: string
  port: string
  target: string
  server: string
  title: string
  banner: string
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的NPOC服务数据
}

const props = defineProps<Props>()

const form = reactive({
  scheme: '',
  host: '',
  port: '',
  target: '',
  server: '',
  title: ''
})

const tableData = ref<NpocServiceData[]>([])
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
    title: '协议',
    dataIndex: 'scheme',
    key: 'scheme',
    width: 100,
    fixed: 'left'
  },
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
    width: 180,
    ellipsis: true
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 80
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: 250,
    ellipsis: true,
    customRender: ({ text }) => {
      if (!text) return '-'
      return text.startsWith('http') 
        ? h('a', { href: text, target: '_blank', rel: 'noopener noreferrer' }, text)
        : text
    }
  },
  {
    title: '服务器',
    dataIndex: 'server',
    key: 'server',
    width: 150,
    ellipsis: true
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
    ellipsis: true
  },
  {
    title: '横幅信息',
    dataIndex: 'banner',
    key: 'banner',
    width: 300,
    ellipsis: true
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
    if (form.scheme) params.append('scheme', form.scheme)
    if (form.host) params.append('host', form.host)
    if (form.port) params.append('port', form.port)
    if (form.target) params.append('target', form.target)
    if (form.server) params.append('server', form.server)
    if (form.title) params.append('title', form.title)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/npoc_service/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('NPOC服务搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.scheme = ''
  form.host = ''
  form.port = ''
  form.target = ''
  form.server = ''
  form.title = ''
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.scheme) params.append('scheme', form.scheme)
    if (form.host) params.append('host', form.host)
    if (form.port) params.append('port', form.port)
    if (form.target) params.append('target', form.target)
    if (form.server) params.append('server', form.server)
    if (form.title) params.append('title', form.title)

    const res = await http.get(`/npoc_service/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `npoc_service_export_${new Date().getTime()}.txt`
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
.npoc-service-search {
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