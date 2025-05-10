<template>
  <div class="ip-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="服务名称">
          <a-input v-model:value="form.serviceName" placeholder="请输入服务名称" allow-clear />
        </a-form-item>
        <a-form-item label="操作系统">
          <a-input v-model:value="form.osName" placeholder="请输入操作系统" allow-clear />
        </a-form-item>
        <a-form-item label="IP类型">
          <a-select v-model:value="form.ipType" placeholder="请选择IP类型" allow-clear style="width: 120px">
            <a-select-option value="PUBLIC">公网</a-select-option>
            <a-select-option value="PRIVATE">内网</a-select-option>
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
        bordered 
      />
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
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface IpData {
  _id: string
  ip: string
  domain: string[]
  port_info: Array<{
    port_id: number
    service_name: string
    product: string
    version: string
  }>
  os_info: {
    name: string
    accuracy: number
  }
  ip_type: string
  cdn_name: string
  geo_asn: {
    number: number
    organization: string
  }
  geo_city: {
    region_name: string
    country: string
  }
  task_id: string
  create_time: string
}

const form = reactive({
  ip: '',
  port: '',
  serviceName: '',
  osName: '',
  ipType: undefined as string | undefined
})

const tableData = ref<IpData[]>([])
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
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 150
  },
  {
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
    width: 200,
    ellipsis: true,
    render: (domains: string[]) => domains?.join(', ') || '-'
  },
  {
    title: '端口信息',
    dataIndex: 'port_info',
    key: 'port_info',
    width: 300,
    ellipsis: true,
    render: (ports: any[]) => ports?.map(p => `${p.port_id}(${p.service_name})`).join(', ') || '-'
  },
  {
    title: '操作系统',
    dataIndex: ['os_info', 'name'],
    key: 'os_name',
    width: 120
  },
  {
    title: 'IP类型',
    dataIndex: 'ip_type',
    key: 'ip_type',
    width: 100,
    render: (text: string) => text === 'PUBLIC' ? '公网' : '内网'
  },
  {
    title: '地理位置',
    dataIndex: ['geo_city', 'region_name'],
    key: 'region_name',
    width: 150
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
    if (form.ip) params.append('ip', form.ip)
    if (form.port) params.append('port_info.port_id', form.port)
    if (form.serviceName) params.append('port_info.service_name', form.serviceName)
    if (form.osName) params.append('os_info.name', form.osName)
    if (form.ipType) params.append('ip_type', form.ipType)
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/ip/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('IP搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.ip = ''
  form.port = ''
  form.serviceName = ''
  form.osName = ''
  form.ipType = undefined
  pagination.current = 1
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

const handleExport = async () => {
  try {
    const params = new URLSearchParams()
    if (form.ip) params.append('ip', form.ip)
    if (form.port) params.append('port_info.port_id', form.port)
    if (form.serviceName) params.append('port_info.service_name', form.serviceName)
    if (form.osName) params.append('os_info.name', form.osName)
    if (form.ipType) params.append('ip_type', form.ipType)

    const res = await http.get(`/ip/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ip_export_${new Date().getTime()}.txt`
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