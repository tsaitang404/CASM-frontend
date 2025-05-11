<template>
  <div class="celery-task-test">
    <h2>Celery任务测试</h2>
    
    <!-- 任务类型选择 -->
    <div class="task-type-select">
      <a-form-item label="任务类型">
        <a-select v-model:value="taskForm.task_type" placeholder="请选择任务类型">
          <a-select-option v-for="(label, value) in taskTypes" :key="value" :value="value">
            {{ label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </div>

    <!-- 任务配置表单 -->
    <div class="task-form">
      <a-form :model="taskForm" layout="vertical">
        <a-form-item label="任务名称">
          <a-input v-model:value="taskForm.data.name" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="目标">
          <a-input v-model:value="taskForm.data.target" placeholder="请输入目标" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="createTask">创建任务</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 任务列表 -->
    <div class="task-list">
      <h3>任务列表</h3>
      <a-table :dataSource="tasks" :columns="columns" :loading="loading">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="viewTaskDetail(record)">查看</a-button>
              <a-button type="link" danger @click="revokeTask(record)" 
                v-if="record.status === 'PENDING' || record.status === 'STARTED'">
                终止
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 任务详情弹窗 -->
    <a-modal
      v-model:open="detailModal.visible"
      :title="'任务详情 - ' + detailModal.data.name"
      :width="1200"
      :footer="null"
    >
      <a-tabs v-model:activeKey="detailModal.activeTab">
        <!-- 基本信息标签页 -->
        <a-tab-pane key="task_info" tab="基本信息">
          <a-descriptions bordered>
            <a-descriptions-item label="任务ID" :span="2">{{ detailModal.data.celery_id }}</a-descriptions-item>
            <a-descriptions-item label="状态">{{ detailModal.data.status }}</a-descriptions-item>
            <a-descriptions-item label="名称" :span="3">{{ detailModal.data.name }}</a-descriptions-item>
            <a-descriptions-item label="目标" :span="3">{{ detailModal.data.target }}</a-descriptions-item>
            <a-descriptions-item label="类型">{{ detailModal.data.type }}</a-descriptions-item>
            <a-descriptions-item label="任务标签">{{ detailModal.data.task_tag }}</a-descriptions-item>
            <a-descriptions-item label="内部ID">{{ detailModal.data.task_id }}</a-descriptions-item>
            <a-descriptions-item label="开始时间" :span="1.5">{{ detailModal.data.start_time }}</a-descriptions-item>
            <a-descriptions-item label="结束时间" :span="1.5">{{ detailModal.data.end_time }}</a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>

        <a-tab-pane v-for="tab in ['domain', 'ip', 'site', 'service', 'cert', 'url', 'fileleak', 'vuln', 'nuclei_result', 'stat_finger', 'wih', 'cip']" 
          :key="tab" 
          :tab="getTabTitle(tab)"
        >
          <div class="table-container">
            <a-spin :spinning="detailModal.loading" tip="加载中...">
              <!-- 如果是 IP 标签页，使用 IpSearch 组件 -->
              <template v-if="tab === 'ip'">
                <IpSearch v-if="detailModal.data.task_id" :taskId="detailModal.data.task_id" />
                <a-alert v-else message="没有任务ID信息" type="warning" show-icon />
              </template>
              <!-- 其他标签页使用原有表格 -->
              <a-table
                v-else
                :dataSource="detailModal.results?.[tab]?.items || []"
                :columns="getColumns(tab)"
                :pagination="{
                  current: detailModal.pagination[tab],
                  pageSize: 10,
                  total: detailModal.results?.[tab]?.total || 0,
                  onChange: (page) => handlePageChange(tab, page)
                }"
                :rowKey="record => record._id || Math.random().toString(36).substr(2, 9)"
              />
            </a-spin>
          </div>
        </a-tab-pane>

      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import http from '../plugins/http'
import IpSearch from '../components/asset/IpSearch.vue'

const taskTypes = ref({})

// 获取任务类型列表
const fetchTaskTypes = async () => {
  try {
    const response = await http.get('/celery_task/types/')
    if (response.data.code === 200) {
      taskTypes.value = response.data.data.task_types
    } else {
      message.error(response.data.message || '获取任务类型失败')
    }
  } catch (error) {
    console.error('Error fetching task types:', error)
    message.error('获取任务类型失败，请检查网络连接')
  }
}

const tasks = ref([])
const loading = ref(false)

const taskForm = ref({
  task_type: '',
  data: {
    name: '',
    target: '',
    type: 'domain',
    task_tag: 'task',
    options: {
      domain_brute: true,
      domain_brute_type: 'small',
      port_scan: true,
      site_identify: true
    }
  }
})

const columns = [
  { title: '任务ID', dataIndex: 'celery_id', key: 'celery_id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'task_type', key: 'task_type' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '开始时间', dataIndex: 'start_time', key: 'start_time' },
  { title: '操作', key: 'action' }
]

// 获取任务列表
const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await http.get('/celery_task/')
    if (response.data.code === 200) {
      tasks.value = response.data.data.items
    } else {
      message.error(response.data.message || '获取任务列表失败')
    }
  } catch (error) {
    message.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 创建任务
const createTask = async () => {
  try {
    const response = await http.post('/celery_task/', taskForm.value)
    if (response.data.code === 200) {
      message.success('任务创建成功')
      fetchTasks()
    } else {
      message.error(response.data.message || '创建任务失败')
    }
  } catch (error) {
    message.error('创建任务失败')
  }
}

// 终止任务
const revokeTask = async (task) => {
  try {
    const response = await http.post('/celery_task/revoke/', {
      celery_id: task.celery_id,
      terminate: true
    })
    if (response.data.code === 200) {
      message.success('任务已终止')
      fetchTasks()
    } else {
      message.error(response.data.message || '终止任务失败')
    }
  } catch (error) {
    message.error('终止任务失败')
  }
}

// 任务详情弹窗数据
const detailModal = ref({
  visible: false,
  activeTab: 'task_info',
  loading: false,  // 添加 loading 属性
  data: {
    celery_id: '',
    status: '',
    task_id: '',
    name: '',
    target: '',
    type: '',
    task_tag: '',
    start_time: '',
    end_time: '',
    task_type: ''
  },
  results: {}, // 初始化为空对象而不是 null
  availableTabs: ['task_info'],
  pagination: {
    domain: 1,
    ip: 1,
    site: 1,
    service: 1,
    cert: 1,
    url: 1,
    fileleak: 1,
    vuln: 1,
    nuclei_result: 1,
    stat_finger: 1,
    wih: 1,
    cip: 1
  }
})

// 定义各数据类型的表格列
const domainColumns = [
  { title: '域名', dataIndex: 'domain', key: 'domain' },
  { title: '记录类型', dataIndex: 'record_type', key: 'record_type' },
  { title: '解析值', dataIndex: 'value', key: 'value' },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time' }
]

const ipColumns = [
  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
  { title: '端口', dataIndex: 'port', key: 'port' },
  { title: '协议', dataIndex: 'protocol', key: 'protocol' },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time' }
]

const siteColumns = [
  { title: 'URL', dataIndex: 'url', key: 'url' },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '状态码', dataIndex: 'status_code', key: 'status_code' },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time' }
]

const serviceColumns = [
  { title: 'IP', dataIndex: 'ip', key: 'ip' },
  { title: '端口', dataIndex: 'port', key: 'port' },
  { title: '服务名称', dataIndex: 'name', key: 'name' },
  { title: '版本', dataIndex: 'version', key: 'version' }
]

const certColumns = [
  { title: '域名', dataIndex: 'domain', key: 'domain' },
  { title: '证书主题', dataIndex: 'subject', key: 'subject' },
  { title: '颁发者', dataIndex: 'issuer', key: 'issuer' },
  { title: '有效期', dataIndex: 'valid_period', key: 'valid_period' }
]

const urlColumns = [
  { title: 'URL', dataIndex: 'url', key: 'url' },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '状态码', dataIndex: 'status_code', key: 'status_code' }
]

const fileleakColumns = [
  { title: 'URL', dataIndex: 'url', key: 'url' },
  { title: '文件类型', dataIndex: 'type', key: 'type' },
  { title: '发现时间', dataIndex: 'find_time', key: 'find_time' }
]

const vulnColumns = [
  { title: '漏洞名称', dataIndex: 'name', key: 'name' },
  { title: '风险等级', dataIndex: 'level', key: 'level' },
  { title: '目标', dataIndex: 'target', key: 'target' }
]

const nucleiColumns = [
  { title: '模板名称', dataIndex: 'template', key: 'template' },
  { title: '匹配类型', dataIndex: 'type', key: 'type' },
  { title: '目标', dataIndex: 'target', key: 'target' }
]

const statFingerColumns = [
  { title: '指纹名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '数量', dataIndex: 'count', key: 'count' }
]

const wihColumns = [
  { title: 'URL', dataIndex: 'url', key: 'url' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '内容', dataIndex: 'content', key: 'content' }
]

const cipColumns = [
  { title: 'CIDR', dataIndex: 'cidr', key: 'cidr' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time' }
]

// 获取标签页标题
const getTabTitle = (tab: string) => {
  const titleMap = {
    domain: '域名数据',
    ip: 'IP数据',
    site: '站点数据',
    service: '服务数据',
    cert: '证书数据',
    url: 'URL数据',
    fileleak: '文件泄露数据',
    vuln: '漏洞数据',
    nuclei_result: 'Nuclei扫描结果',
    stat_finger: '指纹统计数据',
    wih: 'WIH数据',
    cip: 'CIDR数据'
  }
  return titleMap[tab] || tab
}

// 获取表格列配置
const getColumns = (tab: string) => {
  const columnsMap = {
    domain: domainColumns,
    ip: ipColumns,
    site: siteColumns,
    service: serviceColumns,
    cert: certColumns,
    url: urlColumns,
    fileleak: fileleakColumns,
    vuln: vulnColumns,
    nuclei_result: nucleiColumns,
    stat_finger: statFingerColumns,
    wih: wihColumns,
    cip: cipColumns
  }
  return columnsMap[tab] || []
}

// 处理分页变化
const handlePageChange = async (type: string, page: number) => {
  detailModal.value.pagination[type] = page
  await fetchTaskResults(detailModal.value.data.celery_id, type, page)
}

// 获取任务结果
const fetchTaskResults = async (celeryId: string, type: string = 'task_info', page: number = 1) => {
  try {
    detailModal.value.loading = true
    
    // 如果是基本信息,调用 celery_task 详情接口
    if (type === 'task_info') {
      const response = await http.get(`/celery_task/${celeryId}/`)
      if (response.data.code === 0 || response.data.code === 200) { // 处理两种可能的成功状态码
        // 保存原始的 task_id (如果有的话)
        const originalTaskId = detailModal.value.data.task_id
        
        // 更新任务数据
        detailModal.value.data = response.data.data || {}
        
        // 如果返回数据中没有 task_id，但我们之前有保存，就使用之前保存的
        if (!detailModal.value.data.task_id && originalTaskId) {
          detailModal.value.data.task_id = originalTaskId
          console.warn('Restored missing task_id from original data')
        }
        
        // 确保 results 对象已初始化
        if (!detailModal.value.results) {
          detailModal.value.results = {}
        }
        
        // 更新可用标签页
        if (detailModal.value.data.task_type) {
          updateAvailableTabs(detailModal.value.data.task_type)
          // 初始化各类型数据
          await initializeResultsData(detailModal.value.data.task_type)
        }
      } else {
        message.error(response.data.msg || response.data.message || '获取任务详情失败')
      }
      return
    }

    // 其他类型数据从对应的 API 获取
    const apiMap = {
      domain: '/domain/',
      ip: '/ip/',
      site: '/site/',
      service: '/service/',
      cert: '/cert/',
      url: '/url/',
      fileleak: '/fileleak/',
      vuln: '/vuln/',
      nuclei_result: '/nuclei_result/',
      stat_finger: '/stat_finger/',
      wih: '/wih/',
      cip: '/cip/'
    }

    if (!apiMap[type]) {
      console.error('Unsupported data type:', type)
      return
    }

    // 确保 results 对象已存在
    if (!detailModal.value.results) {
      detailModal.value.results = {}
    }

    // 如果当前类型的数据不存在，初始化一个空数组
    if (!detailModal.value.results[type]) {
      detailModal.value.results[type] = {
        items: [],
        total: 0
      }
    }

    // 确保有 task_id
    if (!detailModal.value.data || !detailModal.value.data.task_id) {
      console.error('Missing task_id in detailModal.data')
      detailModal.value.results[type] = { items: [], total: 0 }
      return
    }

    const response = await http.get(apiMap[type], {
      params: {
        task_id: detailModal.value.data.task_id,
        page,
        size: 10
      }
    })

    const responseCode = response.data.code
    if (responseCode === 200 || responseCode === 0) { // 处理两种可能的成功状态码
      // 检查 response.data.data 是否存在
      const responseData = response.data.data || {}
      
      detailModal.value.results[type] = {
        items: Array.isArray(responseData.items) ? responseData.items : [],
        total: responseData.total || 0
      }
    } else {
      console.warn(`Failed to fetch ${type} data: Non-success code ${responseCode}`)
      message.error(response.data.message || response.data.msg || '获取任务结果失败')
      // 设置为空数组而不是 null，避免渲染错误
      detailModal.value.results[type] = { items: [], total: 0 }
    }
  } catch (error) {
    console.error('Error fetching task results:', error)
    message.error(`获取${type}数据失败`)
    
    // 确保即使出错也有一个有效的数据结构
    if (!detailModal.value.results) detailModal.value.results = {}
    detailModal.value.results[type] = { items: [], total: 0 }
  } finally {
    detailModal.value.loading = false
  }
}

// 检查任务有哪些可用的数据类型
const checkAvailableData = async (taskId: string, taskType: string) => {
  try {
    // 设置每个任务类型对应的 API 路径
    const apiMap = {
      domain: '/domain/',
      ip: '/ip/',
      site: '/site/',
      service: '/service/',
      cert: '/cert/',
      url: '/url/',
      fileleak: '/fileleak/',
      vuln: '/vuln/',
      nuclei_result: '/nuclei_result/',
      stat_finger: '/stat_finger/',
      wih: '/wih/',
      cip: '/cip/'
    }

    // 根据任务类型确定需要检查的数据类型
    const checkTypes = {
      domain_task: ['domain', 'ip', 'site', 'service', 'cert', 'url', 'fileleak', 'vuln', 'nuclei_result', 'stat_finger', 'wih', 'cip'],
      ip_task: ['ip', 'service', 'site', 'url', 'vuln', 'nuclei_result', 'stat_finger', 'wih'],
      run_risk_cruising: ['vuln'],
      domain_exec_task: ['domain', 'ip', 'site'],
      ip_exec_task: ['ip', 'service', 'site'],
      github_task_task: ['wih'],
      github_task_monitor: ['wih'],
      asset_site_update: ['site'],
      add_asset_site_task: ['site'],
      asset_wih_update: ['wih']
    }

    const typesToCheck = checkTypes[taskType] || []
    
    // 初始化 results 对象
    detailModal.value.results = {}
    
    // 初始化所有可能的数据类型为 null
    for (const type in apiMap) {
      detailModal.value.results[type] = null
    }

    // 检查每种数据类型是否有数据
    for (const type of typesToCheck) {
      try {
        const response = await http.get(apiMap[type], {
          params: {
            task_id: taskId,
            page: 1,
            size: 1
          }
        })
        
        if (response.data.code === 200) {
          // 无论是否有数据，都初始化该类型的结果对象
          detailModal.value.results[type] = {
            items: [],
            total: response.data.data.total || 0
          }
        }
      } catch (error) {
        console.warn(`Failed to check ${type} data:`, error)
        // 即使请求失败，也设置一个空的结果对象
        detailModal.value.results[type] = {
          items: [],
          total: 0
        }
      }
    }

  } catch (error) {
    console.error('Error checking available data:', error)
    message.error('检查可用数据类型失败')
  }
}

// 根据任务类型确定可用的标签页
const updateAvailableTabs = (taskType: string) => {
  const tabMapping = {
    domain_task: ['domain', 'ip', 'site', 'service', 'cert', 'url', 'fileleak', 'vuln', 'nuclei_result', 'stat_finger', 'wih', 'cip'],
    ip_task: ['ip', 'service', 'site', 'url', 'vuln', 'nuclei_result', 'stat_finger', 'wih'],
    run_risk_cruising: ['vuln'],
    domain_exec_task: ['domain', 'ip', 'site'],
    ip_exec_task: ['ip', 'service', 'site'],
    github_task_task: ['wih'],
    github_task_monitor: ['wih'],
    asset_site_update: ['site'],
    add_asset_site_task: ['site'],
    asset_wih_update: ['wih']
  }

  // 重置可用标签页，基本信息标签页始终可用
  detailModal.value.availableTabs = ['task_info']

  // 根据任务类型添加额外的标签页
  if (tabMapping[taskType]) {
    detailModal.value.availableTabs.push(...tabMapping[taskType])
  }

  // 初始化每个可用标签页的结果对象
  detailModal.value.results = {}
  detailModal.value.availableTabs.forEach(tab => {
    if (tab !== 'task_info') {
      detailModal.value.results[tab] = {
        items: [],
        total: 0
      }
    }
  })
}

// 初始化结果数据
const initializeResultsData = async (taskType: string) => {
  // 根据任务类型设置需要检查的数据类型
  const checkTypes = {
    domain_task: ['domain', 'ip', 'site', 'service', 'cert', 'url', 'fileleak', 'vuln', 'nuclei_result', 'stat_finger', 'wih', 'cip'],
    ip_task: ['ip', 'service', 'site', 'url', 'vuln', 'nuclei_result', 'stat_finger', 'wih'],
    run_risk_cruising: ['vuln'],
    domain_exec_task: ['domain', 'ip', 'site'],
    ip_exec_task: ['ip', 'service', 'site'],
    github_task_task: ['wih'],
    github_task_monitor: ['wih'],
    asset_site_update: ['site'],
    add_asset_site_task: ['site'],
    asset_wih_update: ['wih']
  }

  const typesToCheck = checkTypes[taskType] || []
  
  // 初始化 results 对象
  detailModal.value.results = {}
  
  // 为每个可能的数据类型初始化结果对象
  typesToCheck.forEach(type => {
    detailModal.value.results[type] = {
      items: [],
      total: 0
    }
  })

  // 并行获取所有类型的初始数据
  const fetchPromises = typesToCheck.map(type => 
    http.get(`/${type}/`, {
      params: {
        task_id: detailModal.value.data.task_id,
        page: 1,
        size: 10
      }
    }).then(response => {
      if (response.data.code === 200) {
        detailModal.value.results[type] = {
          items: response.data.data.items || [],
          total: response.data.data.total || 0
        }
      }
    }).catch(error => {
      console.warn(`Failed to fetch ${type} data:`, error)
    })
  )

  await Promise.allSettled(fetchPromises)
}

// 初始化详情弹窗数据
const initDetailModal = (task) => {
  // 保存任务相关的ID
  const taskId = task.task_id || task._id || task.id
  const celeryId = task.celery_id
  
  detailModal.value = {
    visible: true,
    activeTab: 'task_info',
    loading: false,
    data: { 
      ...task,
      // 确保关键字段存在
      task_id: taskId,
      celery_id: celeryId
    },
    availableTabs: ['task_info'],
    results: {},
    pagination: {
      domain: 1,
      ip: 1,
      site: 1,
      service: 1,
      cert: 1,
      url: 1,
      fileleak: 1,
      vuln: 1,
      nuclei_result: 1,
      stat_finger: 1,
      wih: 1,
      cip: 1
    }
  }

  // 根据任务类型设置可用标签页
  const tabMapping = {
    domain_task: ['domain', 'ip', 'site', 'service', 'cert', 'url', 'fileleak', 'vuln', 'nuclei_result', 'stat_finger', 'wih', 'cip'],
    ip_task: ['ip', 'service', 'site', 'url', 'vuln', 'nuclei_result', 'stat_finger', 'wih'],
    run_risk_cruising: ['vuln'],
    domain_exec_task: ['domain', 'ip', 'site'],
    ip_exec_task: ['ip', 'service', 'site'],
    github_task_task: ['wih'],
    github_task_monitor: ['wih'],
    asset_site_update: ['site'],
    add_asset_site_task: ['site'],
    asset_wih_update: ['wih']
  }

  if (tabMapping[task.task_type]) {
    detailModal.value.availableTabs.push(...tabMapping[task.task_type])
  }

  // 为每个可用标签初始化结果对象
  detailModal.value.availableTabs.forEach(tab => {
    if (tab !== 'task_info') {
      detailModal.value.results[tab] = {
        items: [],
        total: 0
      }
    }
  })
}

// 查看任务详情
const viewTaskDetail = async (task) => {
  try {
    console.log('Opening task detail:', task)
    // 保存任务 ID 信息，确保即使 API 返回的数据结构不一致，也有可用的任务 ID
    const taskId = task.task_id || task._id || task.id
    const celeryId = task.celery_id
    
    // 初始化弹窗数据
    initDetailModal(task)
    
    // 确保 task_id 字段存在
    if (taskId) {
      detailModal.value.data.task_id = taskId
    }
    
    console.log('Available tabs:', detailModal.value.availableTabs)
    // 获取完整的任务信息
    await fetchTaskResults(celeryId, 'task_info')
  } catch (error) {
    console.error('Error in viewTaskDetail:', error)
    message.error('获取任务详情失败')
  }
}

// 监听标签页切换
watch(() => detailModal.value.activeTab, async (newVal) => {
  if (newVal && newVal !== 'task_info') {
    detailModal.value.loading = true
    try {
      // 确保 task_id 存在，如果不存在则尝试用其他 ID 字段代替
      if (!detailModal.value.data.task_id && detailModal.value.data.celery_id) {
        console.warn('Missing task_id, using celery_id as fallback')
        await fetchTaskResults(detailModal.value.data.celery_id, 'task_info')
        // 如果还是没有 task_id，则显示错误信息
        if (!detailModal.value.data.task_id) {
          throw new Error('Missing task_id in task data')
        }
      }
      
      const page = detailModal.value.pagination[newVal] || 1
      await fetchTaskResults(detailModal.value.data.celery_id, newVal, page)
    } catch (error) {
      console.error('Error during tab switch:', error)
      message.error(`加载${getTabTitle(newVal)}失败: ${error.message}`)
      // 确保错误情况下也有一个有效的数据结构
      if (!detailModal.value.results[newVal]) {
        detailModal.value.results[newVal] = { items: [], total: 0 }
      }
    } finally {
      detailModal.value.loading = false
    }
  }
})

onMounted(() => {
  fetchTaskTypes() // 加载任务类型
  fetchTasks() // 加载任务列表
})
</script>

<style scoped>
.celery-task-test {
  padding: 24px;
}

.task-type-select, .task-form {
  margin-bottom: 24px;
}

.task-list {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
}

:deep(.ant-descriptions-bordered .ant-descriptions-item-label) {
  background-color: #fafafa;
  width: 120px;
}

:deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
  word-break: break-all;
}

:deep(.ant-modal-body) {
  max-height: 80vh;
  overflow-y: auto;
}

:deep(.ant-table-wrapper) {
  margin-top: 16px;
}
</style>