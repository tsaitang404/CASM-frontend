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
  name: 'ServiceSearch'
})
</script>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
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

const columns = [
  {
    title: '服务名称',
    dataIndex: 'service_name',
    key: 'service_name',
    width: 150
  },
  {
    title: '服务信息',
    dataIndex: 'service_info',
    key: 'service_info',
    width: 500,
    render: (info: any[]) => {
      return info?.map(item => 
        `${item.ip}:${item.port_id} (${item.product || '-'} ${item.version || '-'})`
      ).join(', ') || '-'
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

// 初始加载
handleSearch()
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
}
</style>