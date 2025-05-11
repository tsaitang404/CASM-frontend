<template>
  <div class="poc-info-container">
    <!-- 头部操作区域 -->
    <div class="header-section">
      <a-row :gutter="16" align="middle">
        <a-col :span="18">
          <a-form layout="inline" :model="searchForm">
            <a-form-item label="POC名称">
              <a-input
                v-model:value="searchForm.plugin_name"
                placeholder="请输入POC名称"
                allow-clear
                @pressEnter="handleSearch"
              />
            </a-form-item>
            <a-form-item label="应用名称">
              <a-input
                v-model:value="searchForm.app_name"
                placeholder="请输入应用名称"
                allow-clear
                @pressEnter="handleSearch"
              />
            </a-form-item>
            <a-form-item label="漏洞名称">
              <a-input
                v-model:value="searchForm.vul_name"
                placeholder="请输入漏洞名称"
                allow-clear
                @pressEnter="handleSearch"
              />
            </a-form-item>
            <a-form-item label="插件类别">
              <a-select
                v-model:value="searchForm.plugin_type"
                placeholder="请选择插件类别"
                style="width: 120px"
                allow-clear
              >
                <a-select-option value="poc">POC</a-select-option>
                <a-select-option value="brute">弱口令</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  <template #icon><SearchOutlined /></template>
                  搜索
                </a-button>
                <a-button @click="resetSearch">
                  <template #icon><ReloadOutlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="6" style="text-align: right">
          <a-space>
            <a-button type="primary" @click="handleSync" :loading="syncLoading">
              <template #icon><SyncOutlined /></template>
              同步POC
            </a-button>
            <a-popconfirm
              title="确定要清空所有POC数据吗？此操作不可恢复！"
              @confirm="handleClear"
              okText="确定"
              cancelText="取消"
            >
              <a-button danger type="primary">
                <template #icon><DeleteOutlined /></template>
                清空POC
              </a-button>
            </a-popconfirm>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 统计信息卡片 -->
    <div class="stats-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <AppstoreOutlined />
                总POC数量
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number">{{ statistics.total }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <BugOutlined />
                漏洞利用POC
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number">{{ statistics.pocCount }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <KeyOutlined />
                弱口令插件
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number">{{ statistics.bruteCount }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <ClockCircleOutlined />
                最后更新
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-text">{{ statistics.lastUpdate || '无数据' }}</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 表格展示区域 -->
    <div class="table-section">
      <a-table
        :dataSource="tableData"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        rowKey="_id"
        bordered
      >
        <!-- 自定义渲染 -->
        <template #bodyCell="{ column, record }">
          <!-- 插件类型渲染 -->
          <template v-if="column.dataIndex === 'plugin_type'">
            <a-tag :color="record.plugin_type === 'poc' ? 'blue' : 'orange'">
              {{ record.plugin_type === 'poc' ? 'POC' : '弱口令' }}
            </a-tag>
          </template>
          
          <!-- 协议渲染 -->
          <template v-if="column.dataIndex === 'scheme'">
            <a-tag :color="getSchemeColor(record.scheme)">{{ record.scheme }}</a-tag>
          </template>
          
          <!-- 分类渲染 -->
          <template v-if="column.dataIndex === 'category'">
            <a-tag color="purple">{{ record.category || '未分类' }}</a-tag>
          </template>
          
          <!-- 详情按钮 -->
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="showDetails(record)">查看详情</a-button>
          </template>
        </template>
      </a-table>
    </div>
    
    <!-- POC详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      :title="`POC详情: ${currentDetail.plugin_name || ''}`"
      width="700px"
      footer={null}
      :after-close="() => (currentDetail = {})"
    >
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="插件ID">
          {{ currentDetail.plugin_name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="应用名称">
          {{ currentDetail.app_name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="漏洞名称">
          {{ currentDetail.vul_name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="插件类型">
          <a-tag :color="currentDetail.plugin_type === 'poc' ? 'blue' : 'orange'">
            {{ currentDetail.plugin_type === 'poc' ? 'POC' : '弱口令' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="协议">
          <a-tag :color="getSchemeColor(currentDetail.scheme)">{{ currentDetail.scheme || '-' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="分类">
          <a-tag color="purple">{{ currentDetail.category || '未分类' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{ currentDetail.update_date || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="描述">
          {{ currentDetail.description || '-' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  SyncOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BugOutlined,
  KeyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import http from '../plugins/http'

// 类型定义
interface PocInfo {
  _id: string
  plugin_name: string
  app_name: string
  vul_name: string
  plugin_type: string
  scheme: string
  update_date: string
  category: string
  description: string
}

// 表格数据
const tableData = ref<PocInfo[]>([])
const loading = ref(false)
const syncLoading = ref(false)

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref<Partial<PocInfo>>({})

// 统计信息
const statistics = reactive({
  total: 0,
  pocCount: 0,
  bruteCount: 0,
  lastUpdate: ''
})

// 分页配置
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  showQuickJumper: true
})

// 搜索表单
const searchForm = reactive({
  plugin_name: '',
  app_name: '',
  vul_name: '',
  plugin_type: undefined,
  page: 1,
  size: 10
})

// 表格列定义
const columns = [
  {
    title: '插件ID',
    dataIndex: 'plugin_name',
    key: 'plugin_name',
    ellipsis: true,
    width: 200
  },
  {
    title: '应用名称',
    dataIndex: 'app_name',
    key: 'app_name',
    ellipsis: true,
    width: 150
  },
  {
    title: '漏洞名称',
    dataIndex: 'vul_name',
    key: 'vul_name',
    ellipsis: true,
    width: 200
  },
  {
    title: '插件类型',
    dataIndex: 'plugin_type',
    key: 'plugin_type',
    width: 100
  },
  {
    title: '协议',
    dataIndex: 'scheme',
    key: 'scheme',
    width: 100
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 120
  },
  {
    title: '更新时间',
    dataIndex: 'update_date',
    key: 'update_date',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right'
  }
]

// 初始化
onMounted(() => {
  fetchPocList()
  calculateStatistics()
})

// 获取POC列表
const fetchPocList = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchForm.plugin_name) params.append('plugin_name', searchForm.plugin_name)
    if (searchForm.app_name) params.append('app_name', searchForm.app_name)
    if (searchForm.vul_name) params.append('vul_name', searchForm.vul_name)
    if (searchForm.plugin_type) params.append('plugin_type', searchForm.plugin_type)
    params.append('page', String(searchForm.page))
    params.append('size', String(searchForm.size))

    const res = await http.get(`/poc/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = res.data.page || searchForm.page
      pagination.pageSize = res.data.size || searchForm.size
    } else {
      message.error(res.data.message || '获取POC列表失败')
    }
  } catch (error) {
    console.error('获取POC列表出错:', error)
    message.error('获取POC列表失败')
  } finally {
    loading.value = false
  }
}

// 计算统计信息
const calculateStatistics = async () => {
  try {
    // 获取所有POC数量
    const resAll = await http.get('/poc/?size=1')
    if (resAll.data.code === 200) {
      statistics.total = resAll.data.total || 0

      // 获取POC类型数量
      const resPoc = await http.get('/poc/?plugin_type=poc&size=1')
      if (resPoc.data.code === 200) {
        statistics.pocCount = resPoc.data.total || 0
      }

      // 获取弱口令插件数量
      const resBrute = await http.get('/poc/?plugin_type=brute&size=1')
      if (resBrute.data.code === 200) {
        statistics.bruteCount = resBrute.data.total || 0
      }

      // 获取最后更新时间
      if (resAll.data.items && resAll.data.items.length > 0) {
        // 按更新时间排序，获取最新的记录
        const resSorted = await http.get('/poc/?size=1&sort_field=update_date&sort_order=desc')
        if (resSorted.data.code === 200 && resSorted.data.items && resSorted.data.items.length > 0) {
          statistics.lastUpdate = resSorted.data.items[0].update_date || '-'
        }
      }
    }
  } catch (error) {
    console.error('获取统计信息出错:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  searchForm.page = 1
  fetchPocList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.plugin_name = ''
  searchForm.app_name = ''
  searchForm.vul_name = ''
  searchForm.plugin_type = undefined
  searchForm.page = 1
  handleSearch()
}

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  searchForm.page = pag.current || 1
  searchForm.size = pag.pageSize || 10
  fetchPocList()
}

// 同步POC
const handleSync = async () => {
  syncLoading.value = true
  try {
    const res = await http.get('/poc/sync/')
    if (res.data.code === 200) {
      message.success(`POC同步成功，共同步 ${res.data.plugin_cnt} 个插件`)
      fetchPocList()
      calculateStatistics()
    } else {
      message.error(res.data.message || 'POC同步失败')
    }
  } catch (error) {
    console.error('POC同步出错:', error)
    message.error('POC同步失败')
  } finally {
    syncLoading.value = false
  }
}

// 清空POC
const handleClear = async () => {
  loading.value = true
  try {
    const res = await http.get('/poc/delete/')
    if (res.data.code === 200) {
      message.success(`POC清空成功，共删除 ${res.data.delete_cnt} 条记录`)
      fetchPocList()
      calculateStatistics()
    } else {
      message.error(res.data.message || 'POC清空失败')
    }
  } catch (error) {
    console.error('POC清空出错:', error)
    message.error('POC清空失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const showDetails = (record: PocInfo) => {
  currentDetail.value = { ...record }
  detailVisible.value = true
}

// 获取协议标签颜色
const getSchemeColor = (scheme: string) => {
  const colorMap: Record<string, string> = {
    http: 'green',
    https: 'green',
    ssh: 'blue',
    ftp: 'orange',
    telnet: 'red',
    smtp: 'purple',
    redis: 'volcano',
    mysql: 'geekblue'
  }
  return colorMap[scheme?.toLowerCase()] || 'default'
}
</script>

<style scoped>
.poc-info-container {
  padding: 24px;
}

.header-section {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stats-section {
  margin-bottom: 16px;
}

.table-section {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stat-content {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.stat-text {
  font-size: 16px;
  font-weight: 500;
}

.stat-unit {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
