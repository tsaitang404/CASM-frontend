<template>
  <div class="task-list">
    <!-- 表格操作区域，根据hideOperations属性决定是否显示 -->
    <div class="table-operations" v-if="!hideOperations">
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
      row-key="_id"
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
              :disabled="['done', 'stop', 'error', 'completed', 'failed', 'paused'].includes(record.status)"
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
          <div>
            <a-tag
              v-for="key in getEnabledFeatures(record)"
              :key="key"
              :color="getFeatureTagColor(key)"
              style="margin-bottom: 4px;"
            >
              {{ featureNameMap[key] }}
            </a-tag>
          </div>
        </template>
        
        <template v-else-if="column.dataIndex === 'target'">
          <a-tooltip :title="record.target">
            {{ truncateText(record.target) }}
          </a-tooltip>
        </template>
        
        <template v-else-if="column.dataIndex === 'statistics'">
          <div class="stat-bar stat-bar-table stat-bar-table-rows">
            <div class="stat-item stat-site" @click="openStatModal('site', record._id)">
              <span class="stat-label">站点</span>
              <span class="stat-value">{{ record.statistic?.site_cnt || record.statistics?.site_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-domain" @click="openStatModal('domain', record._id)">
              <span class="stat-label">域名</span>
              <span class="stat-value">{{ record.statistic?.domain_cnt || record.statistics?.domain_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-wih" @click="openStatModal('wih', record._id)">
              <span class="stat-label">WIH</span>
              <span class="stat-value">{{ record.statistic?.wih_cnt || record.statistics?.wih_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-ip" @click="openStatModal('ip', record._id)">
              <span class="stat-label">IP</span>
              <span class="stat-value">{{ record.statistic?.ip_cnt || record.statistics?.ip_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-cip" @click="openStatModal('cip', record._id)">
              <span class="stat-label">整数IP</span>
              <span class="stat-value">{{ record.statistic?.cip_cnt || record.statistics?.cip_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-service" @click="openStatModal('service', record._id)">
              <span class="stat-label">服务</span>
              <span class="stat-value">{{ record.statistic?.service_cnt || record.statistics?.service_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-npoc" @click="openStatModal('npoc_service', record._id)">
              <span class="stat-label">服务识别</span>
              <span class="stat-value">{{ record.statistic?.npoc_service_cnt || record.statistics?.npoc_service_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-cert" @click="openStatModal('cert', record._id)">
              <span class="stat-label">证书</span>
              <span class="stat-value">{{ record.statistic?.cert_cnt || record.statistics?.cert_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-fileleak" @click="openStatModal('fileleak', record._id)">
              <span class="stat-label">泄露</span>
              <span class="stat-value">{{ record.statistic?.fileleak_cnt || record.statistics?.fileleak_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-url" @click="openStatModal('url', record._id)">
              <span class="stat-label">URL</span>
              <span class="stat-value">{{ record.statistic?.url_cnt || record.statistics?.url_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-vuln" @click="openStatModal('vuln', record._id)">
              <span class="stat-label">漏洞</span>
              <span class="stat-value">{{ record.statistic?.vuln_cnt || record.statistics?.vuln_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-nuclei" @click="openStatModal('nuclei_result', record._id)">
              <span class="stat-label">Nuclei</span>
              <span class="stat-value">{{ record.statistic?.nuclei_result_cnt || record.statistics?.nuclei_result_cnt || 0 }}</span>
            </div>
            <div class="stat-item stat-finger" @click="openStatModal('stat_finger', record._id)">
              <span class="stat-label">指纹</span>
              <span class="stat-value">{{ record.statistic?.stat_finger_cnt || record.statistics?.stat_finger_cnt || 0 }}</span>
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
import type { Task } from '../../types/task'
import http from '../../plugins/http'
import { 
  getTaskStatusColor, 
  getTaskStatusText, 
  calculateProgress,
  truncateText,
  formatTaskStatistic 
} from '../../utils/taskHelper'
import DomainSearch from '../asset/DomainSearch.vue'
import IpSearch from '../asset/IpSearch.vue'
import SiteSearch from '../asset/SiteSearch.vue'
import ServiceSearch from '../asset/ServiceSearch.vue'  // 添加 ServiceSearch 导入
import VulnList from '../asset/VulnList.vue'
import WihList from '../asset/WihList.vue'
import SslList from '../asset/SslList.vue'
import CipList from '../asset/CipList.vue'
import FileleakList from '../asset/FileleakList.vue'
import UrlList from '../asset/UrlList.vue'
import NucleiResultList from '../asset/NucleiResultList.vue'
import StatFingerList from '../asset/StatFingerList.vue'

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
  hideOperations?: boolean // 新增属性，用于控制是否隐藏操作区域
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
    minWidth: 150,
  },
  {
    title: '目标',
    dataIndex: 'target',
    width: 200,
    minWidth: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    minWidth: 80,
  },
  {
    title: '功能',
    dataIndex: 'progress',
    width: 260,
    minWidth: 200,
  },
  {
    title: '统计信息',
    dataIndex: 'statistics',
    width: 600,
    minWidth: 500,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 170,
    minWidth: 150,
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',  
    width: 170,
    minWidth: 150,
  },
  {
    title: '结束时间',
    dataIndex: 'end_time',
    width: 170,
    minWidth: 150,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    minWidth: 180,
    fixed: 'right'
  }
]

const rowSelection = {
  type: 'checkbox',
  selectedRowKeys: props.selectedRowKeys,
  onChange: (selectedRowKeys: string[], selectedRows: Task[]) => {
    emit('update:selectedRowKeys', selectedRowKeys)
  },
  onSelectAll: (selected: boolean, selectedRows: Task[], changeRows: Task[]) => {
    const keys = selected ? props.tasks?.map(row => row._id) || [] : []
    emit('update:selectedRowKeys', keys)
  },
  onSelect: (record: Task, selected: boolean, selectedRows: Task[]) => {
    emit('update:selectedRowKeys', selectedRows.map(row => row._id))
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
    await http.get(`/task/stop/${record._id}`)
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
  service: ServiceSearch,
  vuln: VulnList,
  wih: WihList,
  cert: SslList,
  cip: CipList,
  fileleak: FileleakList,
  url: UrlList,
  nuclei_result: NucleiResultList,
  stat_finger: StatFingerList,
  npoc_service: ServiceSearch  // 添加服务识别的组件映射
}

const statTypeTitleMap: Record<string, string> = {
  domain: '域名列表',
  ip: 'IP列表',
  site: '站点列表',
  service: '服务列表',
  vuln: '漏洞列表',
  wih: 'Web信息收集列表',
  cert: 'SSL证书列表',
  cip: '整数IP列表', 
  fileleak: '文件泄露列表',
  url: 'URL列表',
  nuclei_result: 'Nuclei检测结果',
  stat_finger: '指纹统计列表',
  npoc_service: '服务识别'  // 添加服务识别的标题映射
}

// 功能名映射
const featureNameMap: Record<string, string> = {
  domain_brute: '域名爆破',
  alt_dns: 'DNS生成',
  dns_query_plugin: 'DNS解析',
  casm_search: '历史查询',
  port_scan: '端口扫描',
  service_detection: '服务识别',
  os_detection: '操作系统识别',
  ssl_cert: 'SSL证书',
  skip_scan_cdn_ip: '跳过CDN IP',
  site_identify: '站点识别',
  search_engines: '搜索引擎',
  site_spider: '站点爬虫',
  site_capture: '站点截图',
  file_leak: '文件泄露',
  findvhost: '虚拟主机',
  nuclei_scan: 'Nuclei扫描',
  web_info_hunter: 'Web信息猎手'
}

const featureTagColorMap: Record<string, string> = {
  domain_brute: 'purple',
  alt_dns: 'geekblue',
  dns_query_plugin: 'cyan',
  casm_search: 'volcano',
  port_scan: 'orange',
  service_detection: 'blue',
  os_detection: 'gold',
  ssl_cert: 'green',
  skip_scan_cdn_ip: 'lime',
  site_identify: 'magenta',
  search_engines: 'red',
  site_spider: 'cyan',
  site_capture: 'blue',
  file_leak: 'volcano',
  findvhost: 'gold',
  nuclei_scan: 'green',
  web_info_hunter: 'geekblue'
}

function getFeatureTagColor(key: string) {
  return featureTagColorMap[key] || 'default'
}

function getEnabledFeatures(record: any) {
  if (!record.options) return []
  return Object.keys(record.options).filter(key => record.options[key] && featureNameMap[key])
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
.stat-bar-table {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 500px;
  max-width: 100%;
  overflow-x: auto;
  padding: 4px;
}

.stat-bar-table .stat-item {
  flex: 0 0 80px;
  width: 80px;
  height: 70px;
  min-width: 80px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-bar-table .stat-label {
  font-size: 13px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  font-weight: 500;
}

.stat-bar-table .stat-value {
  font-size: 16px;
  font-weight: 600;
}

/* 统计项的背景色和文字颜色 */
.stat-bar-table .stat-domain {
  background: #f0e6ff;
  color: #531dab;
}
.stat-bar-table .stat-wih {
  background: #fff7e6;
  color: #d46b08;
}
.stat-bar-table .stat-ip {
  background: #f6ffed;
  color: #389e0d;
}
.stat-bar-table .stat-cip {
  background: #e6f7ff;
  color: #1890ff;
}
.stat-bar-table .stat-service {
  background: #f0f5ff;
  color: #2f54eb;
}
.stat-bar-table .stat-npoc {
  background: #fff2e8;
  color: #d4380d;
}
.stat-bar-table .stat-cert {
  background: #fcffe6;
  color: #5b8c00;
}
.stat-bar-table .stat-fileleak {
  background: #fff0f6;
  color: #eb2f96;
}
.stat-bar-table .stat-url {
  background: #fafafa;
  color: #262626;
}
.stat-bar-table .stat-vuln {
  background: #fff1f0;
  color: #cf1322;
}
.stat-bar-table .stat-nuclei {
  background: #f9ffe6;
  color: #7cb305;
}
.stat-bar-table .stat-finger {
  background: #e6fffb;
  color: #13c2c2;
}

.stat-bar-table .stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>