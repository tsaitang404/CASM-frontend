<template>
  <div class="site-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="网站URL">
          <a-input v-model:value="form.site" placeholder="请输入网站URL" allow-clear />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="form.title" placeholder="请输入网站标题" allow-clear />
        </a-form-item>
        <a-form-item label="状态码">
          <a-input v-model:value="form.status" placeholder="请输入状态码" allow-clear />
        </a-form-item>
        <a-form-item label="标签">
          <a-input v-model:value="form.tag" placeholder="请输入标签" allow-clear />
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
        @change="handleTableChange"
        :loading="loading"
        bordered
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SiteSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '@/plugins/http'

interface SiteAsset {
  _id: string
  site: string
  title: string
  status: string
  tag: string[]
  update_date: string
}

// 查询表单
const form = reactive({
  site: '',
  title: '',
  status: '',
  tag: ''
})

// 表格数据
const tableData = ref<SiteAsset[]>([])
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
    title: '网站URL',
    dataIndex: 'site',
    key: 'site',
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '状态码',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '标签',
    dataIndex: 'tag',
    key: 'tag',
    customRender: ({ text }: { text: string[] }) => text?.join(', ') || '-'
  },
  {
    title: '更新时间',
    dataIndex: 'update_date',
    key: 'update_date',
  }
]

// 搜索站点资产
const handleSearch = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.site) params.append('site', form.site)
    if (form.title) params.append('title', form.title)
    if (form.status) params.append('status', form.status)
    if (form.tag) params.append('tag', form.tag)
    params.append('page', String(pagination.current))
    params.append('size', String(pagination.pageSize))

    const res = await http.get(`/asset_site/?${params.toString()}`)
    const { code, message: msg, items, total } = res.data
    if (code === 200) {
      tableData.value = items || []
      pagination.total = total || 0
      // 不再抛出异常，空数据为正常情况
    } else {
      throw new Error(msg || '查询失败')
    }
  } catch (error) {
    console.error('站点搜索错误:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.site = ''
  form.title = ''
  form.status = ''
  form.tag = ''
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
.site-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
}
</style>