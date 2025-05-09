<template>
  <div class="task-list">
    <!-- 表格操作区域 -->
    <div class="table-operations">
      <a-space>
        <a-button type="danger" :disabled="!selectedRowKeys.length" @click="handleBatchStop">
          <PauseCircleOutlined /> 批量停止
        </a-button>
        <a-button type="danger" :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
          <DeleteOutlined /> 批量删除
        </a-button>
        <a-button :disabled="!selectedRowKeys.length" @click="handleBatchRestart">
          <ReloadOutlined /> 批量重启
        </a-button>
      </a-space>
    </div>
    
    <!-- 任务列表表格 -->
    <a-table
      :columns="columns"
      :data-source="tasks"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
      row-key="_id"
      size="middle"
      :components="resizableComponents"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a @click="handleViewDetail(record)">{{ record.name }}</a>
        </template>
        
        <template v-if="column.key === 'target'">
          <a-tooltip :title="record.target">
            {{ truncateText(record.target, 30) }}
          </a-tooltip>
        </template>
        
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template v-if="column.key === 'options'">
          <a-space>
            <a-tag v-if="record.options?.domain_brute" color="blue">域名爆破</a-tag>
            <a-tag v-if="record.options?.port_scan" color="green">端口扫描</a-tag>
            <a-tag v-if="record.options?.service_detection" color="cyan">服务识别</a-tag>
            <a-tag v-if="record.options?.nuclei_scan" color="orange">Nuclei</a-tag>
            <a-tooltip title="查看全部选项">
              <EyeOutlined @click="handleViewOptions(record)" />
            </a-tooltip>
          </a-space>
        </template>
        
        <template v-if="column.key === 'statistic'">
          <a-space direction="vertical" size="small">
            <span>站点数: {{ record.statistic?.site_cnt || 0 }}</span>
            <span>域名数: {{ record.statistic?.domain_cnt || 0 }}</span>
            <span>WIH数: {{ record.statistic?.wih_cnt || 0 }}</span>
          </a-space>
        </template>
        
        <template v-if="column.key === 'action'">
          <a-space>
            <a-tooltip title="查看详情">
              <a @click="handleViewDetail(record)"><EyeOutlined /></a>
            </a-tooltip>
            <a-tooltip title="导出任务">
              <a @click="handleExport(record)"><DownloadOutlined /></a>
            </a-tooltip>
            <a-tooltip v-if="record.status === 'running' || record.status === 'waiting'" title="停止任务">
              <a @click="handleStop(record)"><PauseCircleOutlined /></a>
            </a-tooltip>
            <a-tooltip v-if="record.status === 'done' || record.status === 'stop' || record.status === 'error'" title="重启任务">
              <a @click="handleRestart(record)"><ReloadOutlined /></a>
            </a-tooltip>
            <a-tooltip title="同步到资产组">
              <a @click="handleSync(record)"><PartitionOutlined /></a>
            </a-tooltip>
            <a-tooltip v-if="record.status === 'done' || record.status === 'stop' || record.status === 'error'" title="删除任务">
              <a @click="handleDelete(record)"><DeleteOutlined /></a>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { 
  PauseCircleOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  EyeOutlined,
  PartitionOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { useResizableTable } from '@/composables/useResizableTable'
import { getStatusColor, getStatusText, truncateText } from '@/utils/taskHelper'
import type { Task } from '@/types/task'

interface Props {
  tasks: Task[]
  loading: boolean
  pagination: {
    current: number
    pageSize: number
    total: number
  }
}

interface Emits {
  (e: 'update:selectedRowKeys', keys: string[]): void
  (e: 'stop', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'restart', task: Task): void
  (e: 'export', task: Task): void
  (e: 'sync', task: Task): void
  (e: 'view-detail', task: Task): void
  (e: 'view-options', task: Task): void
  (e: 'batch-stop'): void
  (e: 'batch-delete'): void
  (e: 'batch-restart'): void
  (e: 'change', pagination: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 选中的行
const selectedRowKeys = ref<string[]>([])

// 表格列定义
const columns: TableColumnsType = [
  { 
    title: '任务名称', 
    dataIndex: 'name', 
    key: 'name', 
    ellipsis: true,
    resizable: true,
    width: 150
  },
  { 
    title: '任务目标', 
    dataIndex: 'target', 
    key: 'target', 
    ellipsis: true,
    resizable: true,
    width: 200 
  },
  { 
    title: '任务状态', 
    dataIndex: 'status', 
    key: 'status', 
    width: 120,
    resizable: true 
  },
  { 
    title: '任务选项', 
    dataIndex: 'options', 
    key: 'options',
    resizable: true,
    width: 200
  },
  { 
    title: '统计数据', 
    dataIndex: 'statistic', 
    key: 'statistic', 
    width: 100,
    resizable: true
  },
  { 
    title: '操作', 
    dataIndex: 'action', 
    key: 'action', 
    width: 210, 
    fixed: 'right',
    align: 'center'
  }
]

// 可调整列宽相关
const { resizableComponents } = useResizableTable()

// 表格选择变化
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys
  emit('update:selectedRowKeys', keys)
}

// 表格分页变化
const handleTableChange = (pagination: any) => {
  emit('change', pagination)
}

// 任务操作事件处理
const handleStop = (task: Task) => emit('stop', task)
const handleDelete = (task: Task) => emit('delete', task)
const handleRestart = (task: Task) => emit('restart', task)
const handleExport = (task: Task) => emit('export', task)
const handleSync = (task: Task) => emit('sync', task)
const handleViewDetail = (task: Task) => emit('view-detail', task)
const handleViewOptions = (task: Task) => emit('view-options', task)

// 批量操作事件处理
const handleBatchStop = () => emit('batch-stop')
const handleBatchDelete = () => emit('batch-delete')
const handleBatchRestart = () => emit('batch-restart')
</script>

<style scoped>
.task-list {
  width: 100%;
}

.table-operations {
  margin-bottom: 16px;
}

/* 其他样式继承自 task-manage.css */
</style>