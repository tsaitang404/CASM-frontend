<template>
  <div class="ip-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="归属地">
          <a-input v-model:value="form.location" placeholder="请输入归属地" allow-clear />
        </a-form-item>
        <a-form-item label="运营商">
          <a-input v-model:value="form.isp" placeholder="请输入运营商" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
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
        bordered 
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
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
import http from '@/plugins/http'

interface IpAsset {
  _id: string
  ip: string
  location: string
  isp: string
  ports: string[]
  lastScan: string
}

// 查询表单
const form = reactive({
  ip: '',
  location: '',
  isp: '',
  port: ''
})

// 表格数据
const tableData = ref<IpAsset[]>([])
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
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: '归属地',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: '运营商',
    dataIndex: 'isp',
    key: 'isp',
  },
  {
    title: '开放端口',
    dataIndex: 'ports',
    key: 'ports',
    customRender: ({ text }: { text: string[] }) => text?.join(', ') || '-'
  },
  {
    title: '最后扫描时间',
    dataIndex: 'lastScan',
    key: 'lastScan',
  },
]

// 搜索IP资产
const handleSearch = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.ip) params.append('ip', form.ip)
    if (form.location) params.append('location', form.location)
    if (form.isp) params.append('isp', form.isp)
    if (form.port) params.append('port', form.port)
    params.append('page', String(pagination.current))
    params.append('size', String(pagination.pageSize))

    const res = await http.get(`/asset_ip/?${params.toString()}`)
    const { code, message: msg, items, total } = res.data
    if (code === 200) {
      tableData.value = items || []
      pagination.total = total || 0
    } else {
      throw new Error(msg || '查询失败')
    }
  } catch (error) {
    console.error('IP搜索错误:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.ip = ''
  form.location = ''
  form.isp = ''
  form.port = ''
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