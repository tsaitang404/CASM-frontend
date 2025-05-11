<template>
  <div class="nuclei-result-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="检测名称">
          <a-input v-model:value="form.name" placeholder="请输入检测名称" allow-clear />
        </a-form-item>
        <a-form-item label="漏洞类型">
          <a-input v-model:value="form.type" placeholder="请输入漏洞类型" allow-clear />
        </a-form-item>
        <a-form-item label="URL">
          <a-input v-model:value="form.matched" placeholder="请输入URL" allow-clear />
        </a-form-item>
        <a-form-item label="IP地址">
          <a-input v-model:value="form.host" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="风险等级">
          <a-select v-model:value="form.severity" placeholder="请选择风险等级" allow-clear style="width: 120px">
            <a-select-option value="critical">严重</a-select-option>
            <a-select-option value="high">高危</a-select-option>
            <a-select-option value="medium">中危</a-select-option>
            <a-select-option value="low">低危</a-select-option>
            <a-select-option value="info">信息</a-select-option>
          </a-select>
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
  name: 'NucleiResultSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, watch, h } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface NucleiResultData {
  _id: string
  name: string
  type: string
  matched: string
  host: string
  port: number
  severity: string
  description: string
  template_id: string
  info: Record<string, any>
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的Nuclei扫描结果
}

const props = defineProps<Props>()

const form = reactive({
  name: '',
  type: '',
  matched: '',
  host: '',
  severity: undefined as string | undefined
})

const tableData = ref<NucleiResultData[]>([])
const loading = ref(false)

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'red'
    case 'high':
      return '#ff4d4f'
    case 'medium':
      return 'orange'
    case 'low':
      return 'blue'
    case 'info':
      return 'green'
    default:
      return 'default'
  }
}

const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'critical':
      return '严重'
    case 'high':
      return '高危'
    case 'medium':
      return '中危'
    case 'low':
      return '低危'
    case 'info':
      return '信息'
    default:
      return severity || '-'
  }
}

const columns = [
  {
    title: '检测名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true,
    fixed: 'left'
  },
  {
    title: '风险等级',
    dataIndex: 'severity',
    key: 'severity',
    width: 100,
    customRender: ({ text }) => 
      h('a-tag', { color: getSeverityColor(text) }, getSeverityText(text))
  },
  {
    title: '漏洞类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: 'URL',
    dataIndex: 'matched',
    key: 'matched',
    width: 300,
    ellipsis: true,
    customRender: ({ text }) => text ? 
      h('a', { href: text, target: '_blank', rel: 'noopener noreferrer' }, text) : '-'
  },
  {
    title: 'IP地址',
    dataIndex: 'host',
    key: 'host',
    width: 130
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 80
  },
  {
    title: '模板ID',
    dataIndex: 'template_id',
    key: 'template_id',
    width: 150,
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
    if (form.name) params.append('name', form.name)
    if (form.type) params.append('type', form.type)
    if (form.matched) params.append('matched', form.matched)
    if (form.host) params.append('host', form.host)
    if (form.severity) params.append('severity', form.severity)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/nuclei_result/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('Nuclei扫描结果搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.name = ''
  form.type = ''
  form.matched = ''
  form.host = ''
  form.severity = undefined
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.name) params.append('name', form.name)
    if (form.type) params.append('type', form.type)
    if (form.matched) params.append('matched', form.matched)
    if (form.host) params.append('host', form.host)
    if (form.severity) params.append('severity', form.severity)

    const res = await http.get(`/nuclei_result/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nuclei_result_export_${new Date().getTime()}.txt`
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
.nuclei-result-search {
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