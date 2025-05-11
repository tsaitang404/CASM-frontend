<template>
  <div class="stat-finger-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="指纹名称">
          <a-input v-model:value="form.name" placeholder="请输入指纹名称" allow-clear />
        </a-form-item>
        <a-form-item label="指纹类型">
          <a-input v-model:value="form.type" placeholder="请输入指纹类型" allow-clear />
        </a-form-item>
        <a-form-item label="标签">
          <a-input v-model:value="form.tag" placeholder="请输入标签" allow-clear />
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
  name: 'StatFingerSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, h, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '../../plugins/http'

interface FingerData {
  _id: string
  name: string
  type: string
  count: number
  sites: Array<{
    url: string
    title: string
  }>
  tags: string[]
  task_id: string
  create_time: string
}

// 定义组件属性
interface Props {
  taskId?: string // 可选的任务ID属性，用于过滤指定任务的指纹统计数据
}

const props = defineProps<Props>()

const form = reactive({
  name: '',
  type: '',
  tag: ''
})

const tableData = ref<FingerData[]>([])
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
    { bg: '#f0f5ff', text: '#2f54eb' }, // 蓝色
    { bg: '#f6ffed', text: '#52c41a' }, // 绿色
    { bg: '#fff7e6', text: '#fa8c16' }, // 橙色
    { bg: '#f9f0ff', text: '#722ed1' }, // 紫色
    { bg: '#fff0f6', text: '#eb2f96' }, // 粉色
    { bg: '#fcffe6', text: '#7cb305' }, // 黄绿色
    { bg: '#fff2e8', text: '#fa541c' }, // 红橙色
    { bg: '#e6fffb', text: '#13c2c2' }  // 青色
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const columns = [
  {
    title: '指纹名称',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    ellipsis: true,
    fixed: 'left'
  },
  {
    title: '指纹类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: '数量',
    dataIndex: 'count',
    key: 'count',
    width: 80,
    sorter: true
  },
  {
    title: '站点列表',
    dataIndex: 'sites',
    key: 'sites',
    width: 300,
    ellipsis: true,
    render: (sites: Array<{ url: string, title: string }>) => {
      if (!sites || !sites.length) return '-'
      
      return <div>
        {sites.slice(0, 3).map(site => (
          <div key={site.url} style={{ marginBottom: '5px' }}>
            <a href={site.url} target="_blank" rel="noopener noreferrer" title={site.title || site.url}>
              {site.url}
            </a>
          </div>
        ))}
        {sites.length > 3 && <div>...等 {sites.length} 个站点</div>}
      </div>
    }
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 200,
    customRender: ({ text }) => {
      if (!text || !Array.isArray(text) || text.length === 0) return '-'
      return h('div', { 
        style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }
      }, text.map(tag => {
        const color = getRandomColor()
        return h('div', {
          style: {
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            background: color.bg,
            color: color.text
          }
        }, tag)
      }))
    }
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
    if (form.tag) params.append('tag', form.tag)
    
    // 如果提供了任务ID，则添加到查询参数中
    if (props.taskId) {
      params.append('task_id', props.taskId)
    }
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))

    const res = await http.get(`/stat_finger/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = page
      pagination.pageSize = size
    } else {
      throw new Error(res.data.message || '查询失败')
    }
  } catch (error) {
    console.error('指纹统计搜索错误:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  form.name = ''
  form.type = ''
  form.tag = ''
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
    if (form.tag) params.append('tag', form.tag)

    const res = await http.get(`/stat_finger/export/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stat_finger_export_${new Date().getTime()}.txt`
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
.stat-finger-search {
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