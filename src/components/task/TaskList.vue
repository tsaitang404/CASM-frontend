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
      :dataSource="tasks"
      :columns="columns"
      :loading="loading"
      :rowSelection="rowSelection"
      :pagination="pagination"
      @change="handleTableChange"
      :row-key="(record) => record._id"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="handleView(record)">查看</a-button>
            <a-button 
              type="link" 
              @click="handleRestart(record)"
              :disabled="!['stop', 'error', 'done'].includes(record.status)"
            >
              重启
            </a-button>
            <a-button 
              type="link" 
              @click="handleStop(record)"
              :disabled="!['waiting', 'running'].includes(record.status)"
              danger
            >
              停止
            </a-button>
            <a-button type="link" @click="handleDelete(record)" danger>删除</a-button>
          </a-space>
        </template>
        
        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="getTaskStatusColor(record.status)">
            {{ getTaskStatusText(record.status) }}
          </a-tag>
        </template>
        
        <template v-else-if="column.dataIndex === 'progress'">
          <a-progress 
            :percent="calculateProgress(record)" 
            :status="record.status === 'error' ? 'exception' : undefined"
            size="small"
          />
        </template>
        
        <template v-else-if="column.dataIndex === 'target'">
          <a-tooltip :title="record.target">
            {{ truncateText(record.target) }}
          </a-tooltip>
        </template>
        
        <template v-else-if="column.dataIndex === 'statistics'">
          {{ formatTaskStatistic(record) }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { PauseCircleOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import type { Task } from '@/types/task'
import http from '@/plugins/http'
import { 
  getTaskStatusColor, 
  getTaskStatusText, 
  calculateProgress,
  truncateText,
  formatTaskStatistic 
} from '@/utils/taskHelper'

const router = useRouter()

const props = defineProps<{
  tasks: Task[]
  loading: boolean
  selectedRowKeys: string[]
  pagination: {
    current: number
    pageSize: number
    total: number
  }
}>()

const emit = defineEmits<{
  (e: 'update:selectedRowKeys', keys: string[]): void
  (e: 'reload'): void
  (e: 'tableChange', pagination: any, filters: any, sorter: any): void
}>()

const columns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '目标',
    dataIndex: 'target',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  },
  {
    title: '进度',
    dataIndex: 'progress',
    width: 150,
  },
  {
    title: '统计信息',
    dataIndex: 'statistics',
    width: 250,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 170,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right'
  }
]

const rowSelection = {
  selectedRowKeys: props.selectedRowKeys,
  onChange: (keys: string[]) => {
    emit('update:selectedRowKeys', keys)
  }
}

const handleTableChange = (pagination: any, filters: any, sorter: any) => {
  emit('tableChange', pagination, filters, sorter)
}

const handleView = (record: Task) => {
  // 导航到任务详情页
  router.push(`/task-detail/${record._id}`)
}

const handleRestart = async (record: Task) => {
  try {
    await http.post(`/task/restart/${record._id}`)
    message.success('重启任务成功')
    emit('reload')
  } catch (error) {
    message.error('重启任务失败')
  }
}

const handleStop = async (record: Task) => {
  try {
    await http.post(`/task/stop/${record._id}`)
    message.success('停止任务成功')
    emit('reload')
  } catch (error) {
    message.error('停止任务失败')
  }
}

const handleDelete = (record: Task) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该任务吗？此操作不可恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await http.post('/task/delete/', {
          task_id: [record._id],
          del_task_data: false
        })
        message.success('删除任务成功')
        emit('reload')
      } catch (error) {
        message.error('删除任务失败')
      }
    }
  })
}

const handleBatchStop = () => {
  Modal.confirm({
    title: '确认停止',
    content: `确定要停止选中的 ${props.selectedRowKeys.length} 个任务吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await http.post('/task/batch_stop/', {
          task_id: props.selectedRowKeys
        })
        message.success('批量停止任务成功')
        emit('update:selectedRowKeys', [])
        emit('reload')
      } catch (error) {
        message.error('批量停止任务失败')
      }
    }
  })
}

const handleBatchRestart = async () => {
  Modal.confirm({
    title: '确认重启',
    content: `确定要重启选中的 ${props.selectedRowKeys.length} 个任务吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await http.post('/task/batch_restart/', {
          task_id: props.selectedRowKeys
        })
        message.success('批量重启任务成功')
        emit('update:selectedRowKeys', [])
        emit('reload')
      } catch (error) {
        message.error('批量重启任务失败')
      }
    }
  })
}

const handleBatchDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${props.selectedRowKeys.length} 个任务吗？此操作不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await http.post('/task/delete/', {
          task_id: props.selectedRowKeys,
          del_task_data: false
        })
        message.success('批量删除任务成功')
        emit('update:selectedRowKeys', [])
        emit('reload')
      } catch (error) {
        message.error('批量删除任务失败')
      }
    }
  })
}
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