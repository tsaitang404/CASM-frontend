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
        <a-button @click="handleRefresh">
          <ReloadOutlined /> 刷新
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
          <div class="stat-bar stat-bar-table stat-bar-table-rows">
            <div class="stat-item stat-domain" @click="openStatModal('domain', record._id)">
              <span class="stat-label">域名</span>
              <span class="stat-value">{{ record.statistic?.domain_cnt || record.statistics?.domain_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-wih" @click="openStatModal('wih', record._id)">
              <span class="stat-label">WIH</span>
              <span class="stat-value">{{ record.statistic?.wih_cnt || record.statistics?.wih_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-port" @click="openStatModal('port', record._id)">
              <span class="stat-label">端口</span>
              <span class="stat-value">{{ record.statistic?.port_cnt || record.statistics?.port_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-ip" @click="openStatModal('ip', record._id)">
              <span class="stat-label">IP</span>
              <span class="stat-value">{{ record.statistic?.ip_cnt || record.statistics?.ip_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-service" @click="openStatModal('service', record._id)">
              <span class="stat-label">服务</span>
              <span class="stat-value">{{ record.statistic?.service_cnt || record.statistics?.service_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-vuln" @click="openStatModal('vuln', record._id)">
              <span class="stat-label">漏洞</span>
              <span class="stat-value">{{ record.statistic?.vuln_cnt || record.statistics?.vuln_cnt || 0 }}</span>
            </div>
          </div>
        </template>
      </template>
    </a-table>
    <!-- 统计项弹窗 -->
    <a-modal v-model:open="statModalVisible" :title="statModalTitle" width="900px" :footer="null" @cancel="closeStatModal">
      <component :is="currentListComponent" v-if="currentListComponent" :taskId="currentTaskId" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
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
import DomainSearch from '@/components/asset/DomainSearch.vue'
import IpSearch from '@/components/asset/IpSearch.vue'
import SiteSearch from '@/components/asset/SiteSearch.vue'
import ServiceList from '@/components/asset/ServiceList.vue'
import VulnList from '@/components/asset/VulnList.vue'
import WihList from '@/components/asset/WihList.vue'

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
    // 按接口文档，重启任务应为 POST /task/restart/，参数为 { task_id: [id] }
    await http.post('/task/restart/', {
      task_id: [record._id]
    })
    message.success('重启任务成功')
    setTimeout(() => {
      emit('reload')
    }, 500)
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
        setTimeout(() => {
          emit('reload')
        }, 500)
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
        setTimeout(() => {
          emit('reload')
        }, 500)
      } catch (error) {
        message.error('批量删除任务失败')
      }
    }
  })
}

const handleRefresh = () => {
  emit('reload')
}

const statModalVisible = ref(false)
const currentStatType = ref('')
const currentTaskId = ref('')

const statTypeMap: Record<string, any> = {
  domain: DomainSearch,
  ip: IpSearch,
  site: SiteSearch,
  service: ServiceList,
  vuln: VulnList,
  wih: WihList
  // 端口、证书等可后续补充
}

const statTypeTitleMap: Record<string, string> = {
  domain: '域名列表',
  ip: 'IP列表',
  site: '站点列表',
  service: '服务列表',
  vuln: '漏洞列表',
  wih: 'Web信息收集列表',
  port: '端口列表' // 如有端口列表组件可补充
}

const openStatModal = (type: string, taskId: string) => {
  currentStatType.value = type
  currentTaskId.value = taskId
  statModalVisible.value = true
}
const closeStatModal = () => {
  statModalVisible.value = false
}
const currentListComponent = computed(() => statTypeMap[currentStatType.value] || null)
const statModalTitle = computed(() => statTypeTitleMap[currentStatType.value] || '详情')
</script>

<style scoped>
.task-list {
  width: 100%;
}

.table-operations {
  margin-bottom: 16px;
}

/* 其他样式继承自 task-manage.css */
.stat-bar-table .stat-item {
  min-width: 40px;
  max-width: 60px;
  width: 40px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 8px;
  margin: 4px 4px 4px 0;
  background: #fafbfc;
  transition: box-shadow 0.2s;
}
.stat-bar-table .stat-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #f0f5ff;
}
.stat-bar-table .stat-label {
  font-size: 13px;
  margin-bottom: 2px;
}
.stat-bar-table .stat-value {
  font-size: 18px;
  font-weight: bold;
}

.stat-bar-table .stat-domain {
  background: #f9f0ff;
  color: #722ed1;
}
.stat-bar-table .stat-wih {
  background: #fffbe6;
  color: #faad14;
}
.stat-bar-table .stat-port {
  background: #fff0f6;
  color: #eb2f96;
}
.stat-bar-table .stat-ip {
  background: #f6ffed;
  color: #52c41a;
}
.stat-bar-table .stat-service {
  background: #f0f5ff;
  color: #2f54eb;
}
.stat-bar-table .stat-vuln {
  background: #fff1f0;
  color: #f5222d;
}
.stat-bar-table .stat-item {
  /* 保证文字颜色优先于背景色 */
  transition: box-shadow 0.2s, background 0.2s, color 0.2s;
}
.stat-bar-table .stat-item:hover {
  filter: brightness(0.97);
}
</style>