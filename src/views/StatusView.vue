<template>
  <div class="status-view">
    <div class="status-card">
      <!-- 系统状态卡片 -->
      <a-card class="system-info" title="系统状态">
        <a-row :gutter="24">
          <a-col :span="24">
            <div class="status-item">
              <span class="label">MongoDB:</span>
              <a-tag :color="mongoStatus === 'running' ? 'success' : 'error'">
                {{ mongoStatus === 'running' ? '运行中' : '停止' }}
              </a-tag>
            </div>

            <div class="status-item">
              <span class="label">RabbitMQ:</span>
              <a-tag :color="rabbitStatus === 'running' ? 'success' : 'error'">
                {{ rabbitStatus === 'running' ? '运行中' : '停止' }}
              </a-tag>
            </div>

            <div class="status-item">
              <span class="label">扫描节点:</span>
              <a-tag :color="workerCount > 0 ? 'success' : 'warning'">
                {{ workerCount }} 个工作节点
              </a-tag>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 任务队列状态卡片 -->
      <a-card title="任务队列状态" style="margin-top: 24px;">
        <a-table 
          :columns="queueColumns" 
          :data-source="queueStats"
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getQueueStatusColor(record.status)">
                {{ getQueueStatusText(record.status) }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- 工作节点状态卡片 -->
      <a-card title="工作节点状态" style="margin-top: 24px;">
        <a-table 
          :columns="workerColumns" 
          :data-source="workerStats"
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getWorkerStatusColor(record.status)">
                {{ getWorkerStatusText(record.status) }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'

// 系统状态数据
const mongoStatus = ref('running')
const rabbitStatus = ref('running')
const workerCount = ref(0)

// 队列状态数据
const queueStats = ref([])
const queueColumns = [
  {
    title: '队列名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: '待处理任务',
    dataIndex: 'pending',
    key: 'pending',
    width: 120,
  },
  {
    title: '工作进程数',
    dataIndex: 'workers',
    key: 'workers',
    width: 120,
  }
]

// 工作节点状态数据
const workerStats = ref([])
const workerColumns = [
  {
    title: '节点ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '主机名',
    dataIndex: 'hostname',
    key: 'hostname',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: '当前任务',
    dataIndex: 'current_task',
    key: 'current_task',
    width: 200,
  }
]

// 获取系统状态
const getSystemStatus = async () => {
  try {
    const token = localStorage.getItem('Token')
    if (!token) {
      message.error('您尚未登录或登录已过期')
      return
    }

    const response = await fetch('/api/status/', {
      headers: {
        'Token': token
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        message.error('登录已过期，请重新登录')
        return
      }
      throw new Error(`请求失败 (${response.status})`)
    }

    const data = await response.json()
    if (data.code === 200) {
      mongoStatus.value = data.data.mongo_status
      rabbitStatus.value = data.data.rabbit_status
      workerCount.value = data.data.worker_count || 0
    } else {
      throw new Error(data.message || '获取系统状态失败')
    }
  } catch (error) {
    message.error('获取系统状态失败：' + (error as Error).message)
    console.error('获取系统状态错误:', error)
  }
}

// 获取队列状态
const getQueueStats = async () => {
  try {
    const token = localStorage.getItem('Token')
    if (!token) {
      message.error('您尚未登录或登录已过期')
      return
    }

    const response = await fetch('/api/scheduler/queues/', {
      headers: {
        'Token': token
      }
    })

    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`)
    }

    const data = await response.json()
    if (data.code === 200) {
      queueStats.value = data.data || []
    } else {
      throw new Error(data.message || '获取队列状态失败')
    }
  } catch (error) {
    message.error('获取队列状态失败：' + (error as Error).message)
    console.error('获取队列状态错误:', error)
  }
}

// 获取工作节点状态
const getWorkerStats = async () => {
  try {
    const token = localStorage.getItem('Token')
    if (!token) {
      message.error('您尚未登录或登录已过期')
      return
    }

    const response = await fetch('/api/scheduler/workers/', {
      headers: {
        'Token': token
      }
    })

    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`)
    }

    const data = await response.json()
    if (data.code === 200) {
      workerStats.value = data.data || []
    } else {
      throw new Error(data.message || '获取工作节点状态失败')
    }
  } catch (error) {
    message.error('获取工作节点状态失败：' + (error as Error).message)
    console.error('获取工作节点状态错误:', error)
  }
}

// 获取队列状态颜色
const getQueueStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'running':
      return 'success'
    case 'stopped':
      return 'error'
    case 'paused':
      return 'warning'
    default:
      return 'default'
  }
}

// 获取队列状态文本
const getQueueStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'running':
      return '运行中'
    case 'stopped':
      return '已停止'
    case 'paused':
      return '已暂停'
    default:
      return '未知'
  }
}

// 获取工作节点状态颜色
const getWorkerStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'online':
      return 'success'
    case 'offline':
      return 'error'
    case 'busy':
      return 'warning'
    default:
      return 'default'
  }
}

// 获取工作节点状态文本
const getWorkerStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    case 'busy':
      return '繁忙'
    default:
      return '未知'
  }
}

// 定时刷新数据
let timer: number
const startTimer = () => {
  timer = window.setInterval(() => {
    getSystemStatus()
    getQueueStats()
    getWorkerStats()
  }, 30000) // 每30秒刷新一次
}

onMounted(() => {
  getSystemStatus()
  getQueueStats()
  getWorkerStats()
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.status-view {
  padding: 24px;
}

.status-card {
  max-width: 1200px;
  margin: 0 auto;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item .label {
  width: 100px;
  color: rgba(0, 0, 0, 0.65);
  margin-right: 16px;
}

:deep(.ant-card-head) {
  min-height: 48px;
}

:deep(.ant-card-head-title) {
  padding: 12px 0;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}
</style>