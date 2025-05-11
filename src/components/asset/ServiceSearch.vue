<template>
  <div class="service-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="服务名称">
          <a-input v-model:value="form.service_name" placeholder="请输入服务名称" allow-clear />
        </a-form-item>
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="产品名称">
          <a-input v-model:value="form.product" placeholder="请输入产品名称" allow-clear />
        </a-form-item>
        <a-form-item label="版本">
          <a-input v-model:value="form.version" placeholder="请输入版本" allow-clear />
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
  name: 'ServiceSearch'
})
</script>

<script lang="ts" setup>
import { ref, reactive, h, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface ServiceInfo {
  _id: string
  service_name: string
  service_info: Array<{
    ip: string
    port_id: number
    product: string
    version: string
  }>
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的服务数据
}

const props = defineProps<Props>()

const form = reactive({
  service_name: '',
  ip: '',
  port: '',
  product: '',
  version: ''
})

const tableData = ref<ServiceInfo[]>([])
const loading = ref(false)

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

const getRandomColor = () => {
  const colors = [
    { bg: '#e6f7ff', text: '#1890ff' }, // 蓝色
    { bg: '#f6ffed', text: '#52c41a' }, // 绿色
    { bg: '#fff7e6', text: '#fa8c16' }, // 橙色
    { bg: '#f9f0ff', text: '#722ed1' }, // 紫色
    { bg: '#fff0f6', text: '#eb2f96' }, // 粉色
    { bg: '#f4ffb8', text: '#7cb305' }, // 黄绿色
    { bg: '#fff2e8', text: '#fa541c' }, // 红橙色
    { bg: '#e6fffb', text: '#13c2c2' }  // 青色
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const columns = [
  {
    title: '服务名称',
    dataIndex: 'service_name',
    key: 'service_name',
    width: 150,
    fixed: 'left'
  },
  {
    title: '服务信息',
    dataIndex: 'service_info',
    key: 'service_info',
    width: 500,
    customRender: ({ text: info }) => {
      if (!info || !Array.isArray(info) || info.length === 0) return '-'
      return h('div', { 
        class: 'service-info-bar'
      }, info.map(item => {
        const color = getRandomColor()
        return h('div', {
          class: 'service-item',
          style: {
            padding: '4px 8px',
            margin: '2px',
            borderRadius: '4px',
            display: 'inline-block',
            fontSize: '13px',
            background: color.bg,
            color: color.text,
            cursor: 'pointer',
            transition: 'all 0.3s'
          }
        }, `${item.ip}:${item.port_id} (${item.product || '-'} ${item.version || '-'})`)
      }))
    }
  },
  {
    title: '实例数',
    dataIndex: 'service_info',
    key: 'instance_count',
    width: 100,
    render: (info: any[]) => info?.length || 0
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
    if (form.service_name) params.append('service_name', form.service_name)
    if (form.ip) params.append('service_info.ip', form.ip)
    if (form.port) params.append('service_info.port_id', form.port)
    if (form.product) params.append('service_info.product', form.product)
    if (form.version) params.append('service_info.version', form.version)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/service/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('服务搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.service_name = ''
  form.ip = ''
  form.port = ''
  form.product = ''
  form.version = ''
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.service_name) params.append('service_name', form.service_name)
    if (form.ip) params.append('service_info.ip', form.ip)
    if (form.port) params.append('service_info.port_id', form.port)
    if (form.product) params.append('service_info.product', form.product)
    if (form.version) params.append('service_info.version', form.version)

    const res = await http.get(`/service/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `service_export_${new Date().getTime()}.txt`
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
.service-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
  overflow-x: auto;
}

.service-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.service-info-bar .service-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

:deep(.port-item:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>