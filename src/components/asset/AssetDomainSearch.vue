<template>
  <div class="asset-domain-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="域名">
          <a-input v-model:value="form.domain" placeholder="请输入域名关键字" allow-clear />
        </a-form-item>
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入关联IP" allow-clear />
        </a-form-item>
        <a-form-item label="CNAME">
          <a-input v-model:value="form.cname" placeholder="请输入CNAME记录" allow-clear />
        </a-form-item>
        <a-form-item label="NS记录">
          <a-input v-model:value="form.ns" placeholder="请输入NS记录" allow-clear />
        </a-form-item>
        <a-form-item label="MX记录">
          <a-input v-model:value="form.mx" placeholder="请输入MX记录" allow-clear />
        </a-form-item>
        <a-form-item label="使用CDN">
          <a-select v-model:value="form.cdn" placeholder="是否使用CDN" allow-clear style="width: 120px">
            <a-select-option :value="true">是</a-select-option>
            <a-select-option :value="false">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="注册商">
          <a-input v-model:value="form.registrar" placeholder="请输入注册商" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="form.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="inactive">不活跃</a-select-option>
          </a-select>
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
        :scroll="{ x: 1300 }"
        bordered 
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ips'">
            <a-tag v-for="ip in record.ips || []" :key="ip" :color="getIpColor(ip)">
              {{ ip }}
            </a-tag>
          </template>
          <template v-if="column.key === 'ns'">
            <div>
              <div v-for="(ns, index) in record.ns || []" :key="index">
                {{ ns }}
              </div>
            </div>
          </template>
          <template v-if="column.key === 'mx'">
            <div>
              <div v-for="(mx, index) in record.mx || []" :key="index">
                {{ mx }}
              </div>
            </div>
          </template>
          <template v-if="column.key === 'cdn'">
            <a-tag :color="record.cdn ? 'green' : 'default'">
              {{ record.cdn ? '是' : '否' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags || []" :key="tag">
              {{ tag }}
            </a-tag>
          </template>
          <template v-if="column.key === 'update_date'">
            {{ record.update_date || '-' }}
          </template>
          <template v-if="column.key === 'domain'">
            {{ record.domain }}
          </template>
        </template>
      </a-table>
    </div>

    <!-- 域名详情对话框 -->
    <a-modal v-model:visible="detailVisible" :title="detailTitle" width="800px" :footer="null">
      <div v-if="currentDetail" class="detail-container">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="域名" :span="2">
            {{ currentDetail.domain }}
          </a-descriptions-item>
          <a-descriptions-item label="CNAME记录">
            {{ currentDetail.cname || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="使用CDN">
            <a-tag :color="currentDetail.cdn ? 'green' : 'default'">
              {{ currentDetail.cdn ? '是' : '否' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="注册商">
            {{ currentDetail.registrar || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建日期">
            {{ currentDetail.creation_date || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="过期日期">
            {{ currentDetail.expiration_date || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="最后更新时间">
            {{ currentDetail.update_date || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="IP地址" :span="2">
            <div class="tag-list">
              <a-tag v-for="ip in currentDetail.ips || []" :key="ip" :color="getIpColor(ip)">
                {{ ip }}
              </a-tag>
              <span v-if="!(currentDetail.ips || []).length">-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="NS记录" :span="2">
            <div class="detail-list">
              <div v-for="(ns, index) in currentDetail.ns || []" :key="index">{{ ns }}</div>
              <span v-if="!(currentDetail.ns || []).length">-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="MX记录" :span="2">
            <div class="detail-list">
              <div v-for="(mx, index) in currentDetail.mx || []" :key="index">{{ mx }}</div>
              <span v-if="!(currentDetail.mx || []).length">-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <div class="tag-list">
              <a-tag v-for="tag in currentDetail.tags || []" :key="tag">{{ tag }}</a-tag>
              <span v-if="!(currentDetail.tags || []).length">-</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="子域名" :span="2">
            <div class="tag-list" v-if="subdomains.length">
              <a-tag v-for="subdomain in subdomains" :key="subdomain" color="green">
                {{ subdomain }}
              </a-tag>
            </div>
            <span v-else>-</span>
          </a-descriptions-item>
        </a-descriptions>
        
        <div class="detail-actions">
          <a-space>
            <a-button @click="detailVisible = false">关闭</a-button>
            <a-button type="primary" @click="handleDomainScan(currentDetail)" v-if="currentDetail.domain">子域名扫描</a-button>
            <a-button type="primary" @click="handleAddToMonitor(currentDetail)" v-if="currentDetail.domain">添加到监控</a-button>
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
  name: 'AssetDomainSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '@/plugins/http'

interface DomainAsset {
  _id: string
  domain: string
  ips: string[]       // 修改: 从 ip 改为 ips
  record?: string[]   // 新增: API 返回的记录数组
  type?: string       // 新增: 记录类型
  fld?: string        // 新增: 一级域名
  source?: string     // 新增: 来源
  cname?: string
  ns?: string[]
  mx?: string[]
  cdn?: boolean
  registrar?: string
  creation_date?: string
  expiration_date?: string
  tags?: string[]
  task_id: string
  scope_id?: string   // 新增: 资产分组ID
  save_date?: string  // 新增: 保存日期
  update_date: string // 修改: 改为可选，实际返回的是update_date而不是update_time
}

// 定义组件属性
interface Props {
  scopeId?: string // 可选的资产分组ID
  taskId?: string[] // 可选的任务ID列表
}

const props = defineProps<Props>()

// 表单数据
const form = reactive({
  domain: '',
  ip: '',
  cname: '',
  ns: '',
  mx: '',
  cdn: undefined as boolean | undefined,
  registrar: '',
  status: undefined as string | undefined
})

const tableData = ref<DomainAsset[]>([])
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
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
    width: 180,
    fixed: 'left',
    ellipsis: true
  },
  {
    title: 'IP地址',
    dataIndex: 'ips',
    key: 'ips',
    width: 200,
    ellipsis: true
  },
  {
    title: 'CNAME',
    dataIndex: 'cname',
    key: 'cname',
    width: 180,
    ellipsis: true
  },
  {
    title: 'NS记录',
    dataIndex: 'ns',
    key: 'ns',
    width: 200,
    ellipsis: true
  },
  {
    title: 'MX记录',
    dataIndex: 'mx',
    key: 'mx',
    width: 200,
    ellipsis: true
  },
  {
    title: '使用CDN',
    dataIndex: 'cdn',
    key: 'cdn',
    width: 100
  },
  {
    title: '注册商',
    dataIndex: 'registrar',
    key: 'registrar',
    width: 150,
    ellipsis: true
  },
  {
    title: '创建日期',
    dataIndex: 'creation_date',
    key: 'creation_date',
    width: 120
  },
  {
    title: '过期日期',
    dataIndex: 'expiration_date',
    key: 'expiration_date',
    width: 120
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 150,
    ellipsis: true
  },
  {
    title: '更新时间',
    dataIndex: 'update_date',
    key: 'update_date',
    width: 180
  }
]

// 获取域名标签颜色
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

// 获取IP标签颜色
const getIpColor = (ip: string) => {
  // 根据IP地址段分配颜色
  if (ip.startsWith('10.')) return 'purple' // 私有IP
  if (ip.startsWith('172.16.') || ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return 'purple' // 私有IP
  if (ip.startsWith('192.168.')) return 'purple' // 私有IP
  if (ip.startsWith('127.')) return 'cyan' // 本地回环
  
  // 根据IP第一段分配颜色
  const firstOctet = parseInt(ip.split('.')[0], 10)
  if (firstOctet < 100) return 'blue'
  if (firstOctet < 150) return 'green'
  if (firstOctet < 200) return 'orange'
  
  return 'geekblue' // 默认颜色
}

// 查询域名资产
const handleSearch = async (pag?: TablePaginationConfig) => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = new URLSearchParams()
    if (form.domain) params.append('domain', form.domain)
    if (form.ip) params.append('ip', form.ip)
    if (form.cname) params.append('cname', form.cname)
    if (form.ns) params.append('ns', form.ns)
    if (form.mx) params.append('mx', form.mx)
    if (form.cdn !== undefined) params.append('cdn', form.cdn.toString())
    if (form.registrar) params.append('registrar', form.registrar)
    if (form.status) params.append('status', form.status)
    
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
    const res = await http.get(`/asset_domain/?${params.toString()}`)
    
    // 处理响应 - 修复数据结构处理逻辑
    if (res.data && res.data.code === 200) {
      // 适配API响应结构，直接从顶层获取items而非从data.items获取
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = currentPage
      pagination.pageSize = pageSize
    } else {
      message.error(res.data.message || '获取域名资产数据失败')
    }
  } catch (error) {
    console.error('查询域名资产失败:', error)
    message.error('查询域名资产失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.domain = ''
  form.ip = ''
  form.cname = ''
  form.ns = ''
  form.mx = ''
  form.cdn = undefined
  form.registrar = ''
  form.status = undefined
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
    
    if (form.domain) params.domain = form.domain
    if (form.ip) params.ip = form.ip
    if (form.cname) params.cname = form.cname
    if (form.ns) params.ns = form.ns
    if (form.mx) params.mx = form.mx
    if (form.cdn !== undefined) params.cdn = form.cdn
    if (form.registrar) params.registrar = form.registrar
    if (form.status) params.status = form.status
    if (props.scopeId) params.scope_id = props.scopeId
    if (props.taskId && props.taskId.length > 0) {
      params.task_id = props.taskId
    }
    
    // 发送导出请求
    const res = await http.post('/batch_export/domain/', params, {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `domain_assets_${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success('导出成功')
  } catch (error) {
    console.error('导出域名资产失败:', error)
    message.error('导出域名资产失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 详情相关状态
const detailVisible = ref(false)
const detailTitle = ref('域名资产详情')
const currentDetail = ref(null)
const subdomains = ref<string[]>([])

// 查看详情
const viewDetails = async (record: DomainAsset) => {
  detailTitle.value = `域名资产详情 - ${record.domain}`
  currentDetail.value = null
  subdomains.value = []
  detailVisible.value = true
  
  try {
    // 获取域名详情
    const res = await http.get(`/asset_domain/${record._id}/`)
    if (res.data && res.data.code === 200) {
      currentDetail.value = res.data.data || record
      
      // 获取子域名列表
      try {
        const subRes = await http.get(`/asset_domain/subdomains/${record.domain}/`)
        if (subRes.data && subRes.data.code === 200 && subRes.data.items) {
          subdomains.value = subRes.data.items.map((item: any) => item.domain) || []
        }
      } catch (subError) {
        console.error('获取子域名列表失败:', subError)
      }
    } else {
      // 如果获取详情失败，使用列表中的数据
      currentDetail.value = record
    }
  } catch (error) {
    console.error('获取域名详情失败:', error)
    message.error('获取详情失败，显示基本信息')
    currentDetail.value = record
  }
}

// 子域名扫描
const handleDomainScan = (record: any) => {
  message.info(`开始对 ${record.domain} 进行子域名扫描...`)
  // 这里可以添加实际的子域名扫描逻辑，例如创建扫描任务
}

// 添加到监控
const handleAddToMonitor = (record: any) => {
  message.info(`已将 ${record.domain} 添加到资产监控`)
  // 这里可以添加实际的添加监控逻辑
}

// 初始加载
handleSearch()
</script>

<style scoped>
.asset-domain-search {
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

.detail-list {
  max-height: 150px;
  overflow-y: auto;
}

.detail-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>