<template>
  <div class="asset-ip-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="服务名称">
          <a-input v-model:value="form.service_name" placeholder="请输入服务名称" allow-clear />
        </a-form-item>
        <a-form-item label="协议">
          <a-select v-model:value="form.protocol" placeholder="请选择协议" allow-clear style="width: 120px">
            <a-select-option value="tcp">TCP</a-select-option>
            <a-select-option value="udp">UDP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作系统">
          <a-input v-model:value="form.os" placeholder="请输入操作系统" allow-clear />
        </a-form-item>
        <a-form-item label="地区">
          <a-input v-model:value="form.country" placeholder="请输入国家/地区" allow-clear />
        </a-form-item>
        <a-form-item label="运营商">
          <a-input v-model:value="form.isp" placeholder="请输入运营商" allow-clear />
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
        :scroll="{ x: 1200 }"
        bordered 
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ports'">
            <a-tag v-for="port in record.ports" :key="port" color="blue">
              {{ port }}
            </a-tag>
          </template>
          <template v-if="column.key === 'services'">
            <a-tag v-for="service in record.services" :key="service" :color="getServiceColor(service)">
              {{ service }}
            </a-tag>
          </template>
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag">
              {{ tag }}
            </a-tag>
          </template>
          <template v-if="column.key === 'operations'">
            <a-button type="link" @click="viewDetails(record)">查看详情</a-button>
          </template>
          <template v-if="column.key === 'port_info'">
            <template v-if="record.port_info && record.port_info.length">
              <div class="tag-list">
                <a-tag 
                  v-for="port in record.port_info" 
                  :key="port.port_id" 
                  :color="getPortColor(port.port_id)" 
                  style="margin-bottom: 4px;"
                >
                  {{ port.port_id }}/{{ port.protocol || 'tcp' }}
                </a-tag>
              </div>
            </template>
            <template v-else-if="record.ports && record.ports.length">
              <div class="tag-list">
                <a-tag 
                  v-for="port in record.ports" 
                  :key="port" 
                  :color="getPortColor(port)"
                >
                  {{ port }}
                </a-tag>
              </div>
            </template>
            <template v-else>-</template>
          </template>
          <template v-if="column.key === 'domain'">
            <template v-if="record.domain && record.domain.length">
              <div class="tag-list">
                <a-tag 
                  v-for="domain in record.domain" 
                  :key="domain" 
                  :color="getDomainColor(domain)"
                >
                  {{ domain }}
                </a-tag>
              </div>
            </template>
            <template v-else>-</template>
          </template>
        </template>
      </a-table>
    </div>
    
    <!-- IP详情对话框 -->
    <a-modal v-model:visible="detailVisible" :title="detailTitle" width="800px" :footer="null">
      <div v-if="currentDetail" class="detail-container">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="IP地址" :span="2">
            {{ currentDetail.ip }}
          </a-descriptions-item>
          <a-descriptions-item label="IP类型">
            {{ currentDetail.ip_type || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="操作系统">
            {{ currentDetail.os || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="国家/地区">
            {{ currentDetail.country || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="省份">
            {{ currentDetail.province || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="城市">
            {{ currentDetail.city || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="运营商">
            {{ currentDetail.isp || (currentDetail.geo_asn?.organization || '-') }}
          </a-descriptions-item>
          <a-descriptions-item label="最后更新时间" :span="2">
            {{ currentDetail.update_time || currentDetail.update_date || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="关联域名" :span="2">
            <div class="tag-list">
              <a-tag 
                v-for="domain in currentDetail.domains || currentDetail.domain || []" 
                :key="domain" 
                :color="getDomainColor(domain)"
              >
                {{ domain }}
              </a-tag>
              <span v-if="!(currentDetail.domains || currentDetail.domain || []).length">-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="开放端口" :span="2">
            <div class="tag-list">
              <template v-if="currentDetail.port_info && currentDetail.port_info.length">
                <a-tooltip v-for="port in currentDetail.port_info" :key="port.port_id" :title="`${port.service_name || '未知服务'}${port.product ? ' - ' + port.product : ''}${port.version ? ' ' + port.version : ''}`">
                  <a-tag color="green" style="margin-bottom: 5px;">
                    {{ port.port_id }}/{{ port.protocol || 'tcp' }}
                  </a-tag>
                </a-tooltip>
              </template>
              <template v-else-if="currentDetail.ports && currentDetail.ports.length">
                <a-tag v-for="port in currentDetail.ports" :key="port" color="green">
                  {{ port }}
                </a-tag>
              </template>
              <span v-else>-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="服务" :span="2">
            <div class="tag-list">
              <template v-if="currentDetail.port_info && currentDetail.port_info.length">
                <a-tag v-for="port in currentDetail.port_info.filter(p => p.service_name)" :key="port.port_id" color="purple">
                  {{ port.service_name }}{{ port.product ? ` (${port.product}${port.version ? ' ' + port.version : ''})` : '' }}
                </a-tag>
              </template>
              <template v-else-if="currentDetail.services && currentDetail.services.length">
                <a-tag v-for="service in currentDetail.services" :key="service" color="purple">
                  {{ service }}
                </a-tag>
              </template>
              <span v-else>-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <div class="tag-list">
              <a-tag v-for="tag in currentDetail.tags || []" :key="tag">{{ tag }}</a-tag>
              <span v-if="!(currentDetail.tags || []).length">-</span>
            </div>
          </a-descriptions-item>
        </a-descriptions>

        <div class="detail-actions">
          <a-space>
            <a-button @click="detailVisible = false">关闭</a-button>
            <a-button type="primary" @click="handlePortScan(currentDetail)" v-if="currentDetail.ip">端口扫描</a-button>
            <a-button type="primary" @click="handleAddToMonitor(currentDetail)" v-if="currentDetail.ip">添加到监控</a-button>
          </a-space>
        </div>
      </div>
      <div v-else class="detail-loading">
        <a-spin size="large" />
        <div class="loading-text">正在加载详情...</div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AssetIPSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '@/plugins/http'

interface IpAsset {
  _id: string
  ip: string
  domain?: string[]         // 修改为可选数组
  port_info?: Array<{       // 新增字段：端口详情数组
    port_id: number
    service_name: string
    version: string
    product: string
    protocol: string
  }>
  os_info?: Record<string, any> // 新增字段：操作系统信息
  ip_type?: string          // 新增字段：IP类型
  geo_asn?: {               // 新增字段：ASN信息
    number: number
    organization: string
  }
  geo_city?: Record<string, any> // 新增字段：地理位置信息
  cdn_name?: string         // 新增字段：CDN名称
  task_id?: string          // 关联任务ID
  scope_id?: string         // 资产组ID
  save_date?: string        // 保存日期
  update_date?: string      // 更新日期
  // 以下是原有字段，保留做兼容
  ports?: number[]
  services?: string[]
  os?: string
  country?: string
  province?: string
  city?: string
  isp?: string
  tags?: string[]
  update_time?: string
  domains?: string[]
}

// 定义组件属性
interface Props {
  scopeId?: string // 可选的资产分组ID
  taskId?: string[] // 可选的任务ID列表
}

const props = defineProps<Props>()

// 表单数据
const form = reactive({
  ip: '',
  port: '',
  service_name: '',
  protocol: undefined as string | undefined,
  os: '',
  country: '',
  province: '',
  city: '',
  isp: ''
})

const tableData = ref<IpAsset[]>([])
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
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
    width: 140,
    fixed: 'left'
  },
  {
    title: 'IP类型',
    dataIndex: 'ip_type',
    key: 'ip_type',
    width: 100
  },
  {
    title: '关联域名',
    dataIndex: 'domain',
    key: 'domain',
    width: 180,
    ellipsis: true,
    customRender: ({ text }) => {
      if (!text || text.length === 0) return '-'
      return text.join(', ')
    }
  },
  {
    title: '端口信息',
    dataIndex: 'port_info',
    key: 'port_info',
    width: 200,
    ellipsis: true
  },
  {
    title: '运营商',
    dataIndex: 'geo_asn',
    key: 'geo_asn',
    width: 180,
    ellipsis: true,
    customRender: ({ text }) => {
      return text?.organization || '-'
    }
  },
  {
    title: 'ASN',
    dataIndex: 'geo_asn',
    key: 'asn_number',
    width: 100,
    customRender: ({ text }) => {
      return text?.number || '-'
    }
  },
  {
    title: '国家/地区',
    dataIndex: 'geo_city',
    key: 'country',
    width: 100,
    customRender: ({ text, record }) => {
      return record.country || (text && text.country) || '-'
    }
  },
  {
    title: '省份',
    dataIndex: 'geo_city',
    key: 'province',
    width: 100,
    customRender: ({ text, record }) => {
      return record.province || (text && text.province) || '-'
    }
  },
  {
    title: '城市',
    dataIndex: 'geo_city',
    key: 'city',
    width: 100,
    customRender: ({ text, record }) => {
      return record.city || (text && text.city) || '-'
    }
  },
  {
    title: 'CDN名称',
    dataIndex: 'cdn_name',
    key: 'cdn_name',
    width: 120,
    customRender: ({ text }) => text || '-'
  },
  {
    title: '任务ID',
    dataIndex: 'task_id',
    key: 'task_id',
    width: 200,
    ellipsis: true
  },
  {
    title: '分组ID',
    dataIndex: 'scope_id',
    key: 'scope_id',
    width: 200,
    ellipsis: true
  },
  {
    title: '保存日期',
    dataIndex: 'save_date',
    key: 'save_date',
    width: 180
  },
  {
    title: '更新日期',
    dataIndex: 'update_date',
    key: 'update_date',
    width: 180
  }
]

// 查询IP资产
const handleSearch = async (pag?: TablePaginationConfig) => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = new URLSearchParams()
    if (form.ip) params.append('ip', form.ip)
    if (form.port) params.append('port', form.port)
    if (form.service_name) params.append('service', form.service_name)
    if (form.protocol) params.append('protocol', form.protocol)
    if (form.os) params.append('os', form.os)
    if (form.country) params.append('country', form.country)
    if (form.province) params.append('province', form.province)
    if (form.city) params.append('city', form.city)
    if (form.isp) params.append('isp', form.isp)
    
    // 添加分页参数
    const currentPage = pag?.current || pagination.current
    const pageSize = pag?.pageSize || pagination.pageSize
    params.append('page', currentPage.toString())
    params.append('size', pageSize.toString())
    
    // 添加资产分组和任务ID筛选
    if (props.scopeId) params.append('scope_id', props.scopeId)
    if (props.taskId && props.taskId.length > 0) {
      props.taskId.forEach(id => params.append('task_id', id))
    }
    
    // 发送请求
    const res = await http.get(`/asset_ip/?${params.toString()}`)
    
    // 处理响应
    if (res.data && res.data.code === 200) {
      // 适配API响应结构，直接从顶层获取items而非从data.items获取
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = currentPage
      pagination.pageSize = pageSize
    } else {
      message.error(res.data.message || '获取IP资产数据失败')
    }
  } catch (error) {
    console.error('查询IP资产失败:', error)
    message.error('查询IP资产失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.ip = ''
  form.port = ''
  form.service_name = ''
  form.protocol = undefined
  form.os = ''
  form.country = ''
  form.province = ''
  form.city = ''
  form.isp = ''
  pagination.current = 1
  handleSearch()
}

// 处理表格分页、排序变化
const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch(pag)
}

// 导出数据
const handleExport = async () => {
  try {
    loading.value = true
    
    // 构建导出参数
    const params: Record<string, any> = {
      format: 'csv'
    }
    
    if (form.ip) params.ip = form.ip
    if (form.port) params.port = form.port
    if (form.service_name) params.service = form.service_name
    if (form.protocol) params.protocol = form.protocol
    if (form.os) params.os = form.os
    if (form.country) params.country = form.country
    if (form.province) params.province = form.province
    if (form.city) params.city = form.city
    if (form.isp) params.isp = form.isp
    if (props.scopeId) params.scope_id = props.scopeId
    if (props.taskId && props.taskId.length > 0) {
      params.task_id = props.taskId
    }
    
    // 发送导出请求
    const res = await http.post('/batch_export/ip/', params, {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ip_assets_${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success('导出成功')
  } catch (error) {
    console.error('导出IP资产失败:', error)
    message.error('导出IP资产失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetails = async (record: any) => {
  detailTitle.value = `IP资产详情 - ${record.ip}`
  currentDetail.value = record
  detailVisible.value = true
  
  try {
    // 根据API文档，没有单个IP资产详情的接口，因此使用通用查询接口获取更详细数据
    const params = new URLSearchParams()
    params.append('ip', record.ip)
    params.append('page', '1')
    params.append('size', '1')
    
    const res = await http.get(`/asset_ip/?${params.toString()}`)
    
    if (res.data && res.data.code === 200 && res.data.items && res.data.items.length > 0) {
      // 如果找到了更详细的信息，使用它
      currentDetail.value = res.data.items[0]
    }
    // 如果查询失败或没有结果，保留原始记录数据
  } catch (error) {
    console.error('获取IP详情失败:', error)
    // 保留原始记录数据，不显示错误消息
    // 因为我们已经有基本数据
  }
}

// 端口扫描
const handlePortScan = (record: any) => {
  message.info(`开始对 ${record.ip} 进行端口扫描...`)
  // 这里可以添加实际的端口扫描逻辑，例如创建扫描任务
}

// 添加到监控
const handleAddToMonitor = (record: any) => {
  message.info(`已将 ${record.ip} 添加到资产监控`)
  // 这里可以添加实际的添加监控逻辑
}

// 详情相关状态
const detailVisible = ref(false)
const detailTitle = ref('IP资产详情')
const currentDetail = ref(null)

// 根据端口号获取标签颜色
const getPortColor = (port: number) => {
  // 常用端口及颜色映射
  if (port === 80 || port === 443) return 'blue' // HTTP/HTTPS
  if (port === 22) return 'purple' // SSH
  if (port === 21) return 'cyan' // FTP
  if (port === 25 || port === 465 || port === 587) return 'green' // SMTP
  if (port === 3306) return 'orange' // MySQL
  if (port === 5432) return 'gold' // PostgreSQL
  if (port === 1433) return 'geekblue' // MSSQL
  if (port === 6379) return 'red' // Redis
  if (port === 27017) return 'lime' // MongoDB
  if (port === 8080 || port === 8443) return 'volcano' // 常用Web端口
  if (port === 53) return 'magenta' // DNS
  if (port === 3389) return 'pink' // RDP
  
  // 按端口范围分配颜色
  if (port < 1000) return 'blue'
  if (port < 5000) return 'green'
  if (port < 10000) return 'orange'
  if (port < 20000) return 'purple'
  if (port < 40000) return 'cyan'
  
  return 'default' // 默认颜色
}

// 根据服务获取标签颜色
const getServiceColor = (service: string) => {
  // 常见服务类型颜色映射
  const serviceColorMap: Record<string, string> = {
    'http': 'blue',
    'https': 'green',
    'ssh': 'purple',
    'ftp': 'cyan',
    'smtp': 'orange',
    'mysql': 'gold',
    'postgresql': 'geekblue',
    'mssql': 'lime',
    'redis': 'red',
    'mongodb': 'volcano',
    'dns': 'magenta',
    'rdp': 'pink'
  }
  
  return serviceColorMap[service.toLowerCase()] || 'default'
}

// 根据域名获取标签颜色
const getDomainColor = (domain: string) => {
  // 根据顶级域名分配不同的颜色
  if (domain.endsWith('.com')) return 'blue'
  if (domain.endsWith('.cn')) return 'red'
  if (domain.endsWith('.org')) return 'green'
  if (domain.endsWith('.net')) return 'purple'
  if (domain.endsWith('.io')) return 'volcano'
  if (domain.endsWith('.gov')) return 'gold'
  if (domain.endsWith('.edu')) return 'cyan'
  if (domain.endsWith('.mil')) return 'magenta'
  
  // 根据子域名级别分配颜色
  const parts = domain.split('.').length
  if (parts > 3) return 'orange' // 多级子域名
  if (parts === 3) return 'lime' // 常规子域名
  
  return 'default' // 默认颜色
}

// 初始加载
handleSearch()
</script>

<style scoped>
.asset-ip-search {
  width: 100%;
}

.search-form {
  margin-bottom: 20px;
  background: #f8f8f8;
  padding: 16px;
  border-radius: 4px;
}

.search-result {
  width: 100%;
  overflow-x: auto;
}

:deep(.ant-form-item) {
  margin-bottom: 12px;
}

:deep(.ant-table-cell) {
  vertical-align: top;
}

.detail-container {
  max-height: 600px;
  overflow-y: auto;
}

.detail-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.loading-text {
  margin-top: 16px;
  color: #999;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.detail-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>