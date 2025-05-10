<template>
  <div class="task-manage-container">
    <div class="header-actions">
      <a-button type="primary" @click="showTaskCreateModal">
        <PlusOutlined /> 新建任务
      </a-button>
    </div>

    <div class="operation-bar">
      <a-button 
        type="primary" 
        danger 
        :disabled="!selectedRowKeys.length"
        @click="handleBatchStop"
      >
        批量停止
      </a-button>
      <a-button 
        type="primary"
        :disabled="!selectedRowKeys.length"
        @click="handleBatchRestart"
      >
        批量重启
      </a-button>
      <a-button 
        danger 
        :disabled="!selectedRowKeys.length"
        @click="handleBatchDelete"
      >
        批量删除
      </a-button>
    </div>

    <!-- 搜索组件 -->
    <TaskSearch @search="handleSearch" @reset="handleSearchReset" />
    
    <!-- 任务列表组件 -->
    <TaskList
      :tasks="taskList"
      :loading="loading"
      :pagination="pagination"
      :selectedRowKeys="selectedRowKeys"
      @update:selectedRowKeys="handleSelectionChange"
      @reload="loadTaskList"
      @change="handleTableChange"
      @stop="stopTask"
      @delete="deleteTask"
      @restart="restartTask"
      @export="exportTask"
      @sync="showSyncTaskModal"
      @view-detail="showTaskDetail"
      @view-options="showTaskOptions"
      @batch-stop="handleBatchStop"
      @batch-delete="handleBatchDelete"
      @batch-restart="handleBatchRestart"
    />

    <!-- 新建任务组件弹窗 -->
    <TaskCreate 
      v-model:open="createTaskModalVisible"
      v-model:modelValue="taskForm"
      @success="handleTaskCreateSuccess"
      @cancel="handleTaskCreateCancel"
    />

    <!-- 同步任务到资产组弹窗 -->
    <a-modal
      v-model:open="syncTaskModalVisible"
      title="同步任务到资产组"
      @ok="handleSyncTask"
      @cancel="syncTaskModalVisible = false"
      :confirm-loading="confirmSyncLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="资产组">
          <a-select
            v-model="selectedScopeId"
            placeholder="请选择要同步到的资产组"
            :loading="scopeLoading"
            show-search
            :filter-option="filterScopeOption"
          >
            <a-select-option v-for="scope in assetScopes" :key="scope._id" :value="scope._id">
              {{ scope.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 任务选项详情弹窗 -->
    <a-modal
      v-model:open="taskOptionsModalVisible"
      title="任务选项详情"
      :footer="null"
      width="700px"
    >
      <TaskOptions :options="currentTaskOptions" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskSearch from '@/components/task/TaskSearch.vue'
import TaskCreate from '@/components/task/TaskCreate.vue'
import TaskOptions from '@/components/task/TaskOptions.vue'
import http from '@/plugins/http'  // 修改这一行，从正确的路径导入

// 类型定义
interface Task {
  _id: string
  name: string
  status: string
  options: Record<string, any>
}

interface ApiResponse<T> {
  code: number
  message?: string
  data?: T
  items?: T
  total?: number
  page?: number
  size?: number
}

interface AssetScope {
  _id: string
  name: string
}

interface PaginationProps {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
}

interface TaskListResponse {
  data: Task[]
  total: number
}

// 状态管理
const state = reactive({
  loading: false,
  data: [] as Task[],
  queryParams: {
    name: '',
    target: '',
    status: undefined as string | undefined
  }
})

// 响应式变量
const router = useRouter()
const loading = ref(false)
const taskList = ref<Task[]>([])
const selectedRowKeys = ref<string[]>([])
const refreshInterval = ref<number | null>(null)
const autoRefresh = ref(true)

// 处理选择行变化
const handleSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

const createTaskModalVisible = ref(false)
const confirmLoading = ref(false)
const syncTaskModalVisible = ref(false)
const taskOptionsModalVisible = ref(false)
const confirmSyncLoading = ref(false)
const assetScopes = ref<AssetScope[]>([])
const scopeLoading = ref(false)
const selectedScopeId = ref<string | null>(null)
const searchForm = ref({})
const taskFormRef = ref<FormInstance>()
const currentTaskOptions = reactive<Record<string, any>>({})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

// 任务表单数据
const taskForm = reactive({
  name: '',
  target: '',
  domain_brute_type: 'big',
  port_scan_type: 'top100',
  domain_brute: true,
  alt_dns: true,
  dns_query_plugin: true,
  casm_search: true,
  port_scan: true,
  service_detection: true,
  os_detection: true,
  ssl_cert: true,
  skip_scan_cdn_ip: true,
  site_identify: true,
  search_engines: true,
  site_spider: false,
  site_capture: true,
  file_leak: true,
  findvhost: true,
  nuclei_scan: true,
  web_info_hunter: true
})

// 工具函数
const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    waiting: '#faad14',
    running: '#1890ff',
    done: '#52c41a',
    stop: '#ff4d4f',
    error: '#ff4d4f'
  }
  return colors[status] || '#000000'
}

const getTaskStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    waiting: '等待中',
    running: '运行中',
    done: '已完成',
    stop: '已停止',
    error: '错误'
  }
  return texts[status] || status
}

const formatTaskStatistic = (task: Task): string => {
  if (!task.options) return ''
  const stats = []
  if (task.options.domains_count) stats.push(`域名数：${task.options.domains_count}`)
  if (task.options.ips_count) stats.push(`IP数：${task.options.ips_count}`)
  if (task.options.ports_count) stats.push(`端口数：${task.options.ports_count}`)
  return stats.join(' | ')
}

// API 相关函数
const fetchTaskList = async (params: { page: number; pageSize: number }): Promise<TaskListResponse> => {
  try {
    // 构建查询参数，确保包含所有必要的查询条件
    const queryParams = {
      page: params.page,
      size: params.pageSize,
      name: state.queryParams.name || '',
      target: state.queryParams.target || '',
      ...state.queryParams  // 保留其他可能的查询参数
    }

    // 移除空值
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '' || queryParams[key] === undefined || queryParams[key] === null) {
        delete queryParams[key]
      }
    })

    // 打印查询参数和绑定值
    console.log('当前查询参数:', queryParams)
    console.log('状态中的查询条件:', state.queryParams)
    console.log('搜索表单绑定值:', searchForm.value)

    const { data } = await http.get('/task/', {
      params: queryParams
    })
    
    return {
      data: Array.isArray(data.items) ? data.items : [],
      total: data.total || 0
    }
  } catch (error) {
    throw new Error('获取任务列表失败')
  }
}

// 加载任务列表
const loadTaskList = async () => {
  try {
    loading.value = true
    selectedRowKeys.value = [] // 重置选择项
    const result = await fetchTaskList({
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    taskList.value = result.data
    pagination.total = result.total
  } catch (error) {
    console.error('加载任务列表失败:', error)
    message.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 自动刷新相关
const startAutoRefresh = () => {
  if (refreshInterval.value) return
  refreshInterval.value = window.setInterval(() => {
    if (autoRefresh.value && !loading.value) {
      loadTaskList()
    }
  }, 30000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 事件处理函数
const handleSearch = (values?: Record<string, any>) => {
  console.log('搜索表单提交的值:', values)
  pagination.current = 1
  if (values) {
    state.queryParams = { ...state.queryParams, ...values }
  }
  console.log('更新后的查询条件:', state.queryParams)
  loadTaskList()
}

const handleSearchReset = () => {
  pagination.current = 1
  state.queryParams = {
    name: '',
    target: '',
    status: undefined
  }
  console.log('重置后的查询条件:', state.queryParams)
  loadTaskList()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadTaskList()
}

// 任务操作相关函数
const stopTask = async (task: Task) => {
  try {
    await http.post(`/task/stop/${task._id}`)
    message.success('停止任务成功')
    loadTaskList()
  } catch (error) {
    console.error('停止任务失败:', error)
    message.error('停止任务失败')
  }
}

const deleteTask = async (task: Task) => {
  try {
    await http.post('/task/delete/', {
      task_id: [task._id],
      del_task_data: false
    })
    message.success('删除任务成功')
    loadTaskList()
  } catch (error) {
    console.error('删除任务失败:', error)
    message.error('删除任务失败')
  }
}

const restartTask = async (task: Task) => {
  try {
    await http.post(`/task/restart/${task._id}`)
    message.success('重启任务成功')
    loadTaskList()
  } catch (error) {
    console.error('重启任务失败:', error)
    message.error('重启任务失败')
  }
}

const exportTask = async (task: Task) => {
  try {
    const response = await http.get(`/task/export/${task._id}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `task_${task.name}_${task._id}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('导出任务失败:', error)
    message.error('导出任务失败')
  }
}

const showTaskDetail = (task: Task) => {
  router.push(`/task/detail/${task._id}`)
}

const showTaskOptions = (task: Task) => {
  Object.assign(currentTaskOptions, task.options)
  taskOptionsModalVisible.value = true
}

const handleTaskCreateSuccess = () => {
  createTaskModalVisible.value = false
  message.success('创建任务成功')
  loadTaskList()
}

const handleTaskCreateCancel = () => {
  createTaskModalVisible.value = false
}

const handleBatchStop = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要停止的任务')
    return
  }

  try {
    await http.post('/task/batch_stop/', {
      task_id: selectedRowKeys.value
    })
    message.success('批量停止任务成功')
    selectedRowKeys.value = []
    loadTaskList()
  } catch (error) {
    console.error('批量停止任务失败:', error)
    message.error('批量停止任务失败')
  }
}

const handleBatchDelete = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的任务')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个任务吗？此操作不可恢复。`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await http.post('/task/delete/', {
          task_id: selectedRowKeys.value,
          del_task_data: false
        })
        message.success('批量删除任务成功')
        selectedRowKeys.value = []
        loadTaskList()
      } catch (error) {
        console.error('批量删除任务失败:', error)
        message.error('批量删除任务失败')
      }
    }
  })
}

const handleBatchRestart = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要重启的任务')
    return
  }

  try {
    await http.post('/task/batch_restart/', {
      task_id: selectedRowKeys.value
    })
    message.success('批量重启任务成功')
    selectedRowKeys.value = []
    loadTaskList()
  } catch (error) {
    console.error('批量重启任务失败:', error)
    message.error('批量重启任务失败')
  }
}

const showTaskCreateModal = () => {
  Object.assign(taskForm, {
    name: '',
    target: '',
    domain_brute_type: 'big',
    port_scan_type: 'top100',
    domain_brute: true,
    alt_dns: true,
    dns_query_plugin: true,
    casm_search: true,
    port_scan: true,
    service_detection: true,
    os_detection: true,
    ssl_cert: true,
    skip_scan_cdn_ip: true,
    site_identify: true,
    search_engines: true,
    site_spider: false,
    site_capture: true,
    file_leak: true,
    findvhost: true,
    nuclei_scan: true,
    web_info_hunter: true
  })
  createTaskModalVisible.value = true
}

const filterScopeOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 同步任务相关函数
const showSyncTaskModal = (task: Task) => {
  currentTaskId.value = task._id // 使用ref来存储当前任务ID
  loadAssetScopes() // 加载资产组列表
  syncTaskModalVisible.value = true
}

const loadAssetScopes = async () => {
  try {
    scopeLoading.value = true
    const { data } = await http.get('/asset/scopes')
    if (data.code === 200 && data.items) {
      assetScopes.value = data.items
    }
  } catch (error) {
    console.error('加载资产组列表失败:', error)
    message.error('加载资产组列表失败')
  } finally {
    scopeLoading.value = false
  }
}

const currentTaskId = ref<string>('')

const handleSyncTask = async () => {
  if (!selectedScopeId.value) {
    message.warning('请选择要同步到的资产组')
    return
  }

  try {
    confirmSyncLoading.value = true
    await http.post('/task/sync/', {
      task_id: currentTaskId.value,
      scope_id: selectedScopeId.value
    })
    message.success('同步任务成功')
    syncTaskModalVisible.value = false
    selectedScopeId.value = null
    loadTaskList()
  } catch (error) {
    console.error('同步任务失败:', error)
    message.error('同步任务失败')
  } finally {
    confirmSyncLoading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  loadTaskList()
  startAutoRefresh()
  window.addEventListener('online', loadTaskList)
  window.addEventListener('offline', () => {
    message.warning('网络连接已断开，请检查网络')
  })
})

onUnmounted(() => {
  stopAutoRefresh()
  window.removeEventListener('online', loadTaskList)
  window.removeEventListener('offline', () => {})
})

// 监听器
watch(() => state.queryParams, () => {
  pagination.current = 1
  loadTaskList()
}, { deep: true })

watch(autoRefresh, (newVal) => {
  if (newVal) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})
</script>

<style>
@import '@/assets/styles/views/task-manage.css';
</style>
