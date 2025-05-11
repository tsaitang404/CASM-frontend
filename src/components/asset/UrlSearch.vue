<template>
  <div class="url-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="URL">
          <a-input v-model:value="form.url" placeholder="请输入URL" allow-clear />
        </a-form-item>
        <a-form-item label="站点">
          <a-input v-model:value="form.site" placeholder="请输入站点" allow-clear />
        </a-form-item>
        <a-form-item label="IP">
          <a-input v-model:value="form.fld" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="状态码">
          <a-input v-model:value="form.status_code" placeholder="请输入状态码" allow-clear />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="form.title" placeholder="请输入标题" allow-clear />
        </a-form-item>
        <a-form-item label="来源">
          <a-input v-model:value="form.source" placeholder="请输入来源" allow-clear />
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
  name: 'UrlSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface UrlData {
  _id: string
  url: string
  fld: string
  site: string
  content_length: number
  status_code: number
  title: string
  source: string
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的URL数据
}

const props = defineProps<Props>()

const form = reactive({
  url: '',
  site: '',
  fld: '',
  status_code: '',
  title: '',
  source: ''
})

const tableData = ref<UrlData[]>([])
const loading = ref(false)

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) {
    return 'green'
  } else if (status >= 300 && status < 400) {
    return 'blue'
  } else if (status >= 400 && status < 500) {
    return 'orange'
  } else if (status >= 500) {
    return 'red'
  }
  return 'default'
}

const columns = [
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 350,
    ellipsis: true,
    fixed: 'left',
    render: (text: string) => {
      return text ? (
        <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
      ) : '-'
    }
  },
  {
    title: '站点',
    dataIndex: 'site',
    key: 'site',
    width: 150,
    ellipsis: true
  },
  {
    title: 'IP地址',
    dataIndex: 'fld',
    key: 'fld',
    width: 130
  },
  {
    title: '状态码',
    dataIndex: 'status_code',
    key: 'status_code',
    width: 100,
    render: (text: number) => (
      <a-tag color={getStatusColor(text)}>{text}</a-tag>
    )
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
    ellipsis: true
  },
  {
    title: '大小',
    dataIndex: 'content_length',
    key: 'content_length',
    width: 100,
    render: (text: number) => text ? `${Math.round(text / 1024 * 100) / 100} KB` : '-'
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
    if (form.url) params.append('url', form.url)
    if (form.site) params.append('site', form.site)
    if (form.fld) params.append('fld', form.fld)
    if (form.status_code) params.append('status_code', form.status_code)
    if (form.title) params.append('title', form.title)
    if (form.source) params.append('source', form.source)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/url/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('URL搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.url = ''
  form.site = ''
  form.fld = ''
  form.status_code = ''
  form.title = ''
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
    if (form.url) params.append('url', form.url)
    if (form.site) params.append('site', form.site)
    if (form.fld) params.append('fld', form.fld)
    if (form.status_code) params.append('status_code', form.status_code)
    if (form.title) params.append('title', form.title)
    if (form.source) params.append('source', form.source)

    const res = await http.get(`/url/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `url_export_${new Date().getTime()}.txt`
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
.url-search {
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