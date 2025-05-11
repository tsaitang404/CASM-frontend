<template>
  <div class="asset-site-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="URL">
          <a-input v-model:value="form.url" placeholder="请输入URL" allow-clear />
        </a-form-item>
        <a-form-item label="域名">
          <a-input v-model:value="form.domain" placeholder="请输入域名" allow-clear />
        </a-form-item>
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="网站标题">
          <a-input v-model:value="form.title" placeholder="请输入网站标题" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="form.status" placeholder="请选择站点状态" allow-clear style="width: 120px">
            <a-select-option value="normal">正常</a-select-option>
            <a-select-option value="unreachable">无法访问</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="指纹">
          <a-input v-model:value="form.fingerprint" placeholder="请输入指纹名称" allow-clear />
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
          <template v-if="column.key === 'url'">
            <a :href="record.url" target="_blank" rel="noopener noreferrer">{{ record.url }}</a>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'response_code'">
            <a-tag :color="getResponseCodeColor(record.response_code)">
              {{ record.response_code }}
            </a-tag>
          </template>
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag">{{ tag }}</a-tag>
          </template>
          <template v-if="column.key === 'operations'">
            <a-space>
              <a-button type="link" @click="viewDetails(record)">查看详情</a-button>
              <a-button type="link" @click="viewScreenshot(record)" v-if="record.screenshot_path">截图</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 站点截图对话框 -->
    <a-modal v-model:visible="screenshotVisible" :title="`网站截图 - ${currentScreenshotUrl || ''}`" :footer="null" width="800px">
      <img v-if="currentScreenshot" :src="currentScreenshot" alt="网站截图" style="width: 100%;" />
      <div v-else class="empty-screenshot">暂无截图</div>
    </a-modal>
    
    <!-- 站点详情对话框 -->
    <a-modal v-model:visible="detailVisible" :title="detailTitle" width="800px" :footer="null">
      <div v-if="currentDetail" class="detail-container">
        <div class="detail-header" v-if="currentDetail.screenshot_path">
          <img 
            :src="currentDetail.screenshot_path" 
            alt="站点截图" 
            class="site-screenshot"
            @click="viewFullScreenshot(currentDetail)"
          />
        </div>
        
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="URL" :span="2">
            <a :href="currentDetail.url" target="_blank" rel="noopener noreferrer">
              {{ currentDetail.url }}
              <span class="external-link-icon">
                <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
                  <path d="M888 728H738v-36h150a12 12 0 0 0 12-12V160a12 12 0 0 0-12-12H136a12 12 0 0 0-12 12v520a12 12 0 0 0 12 12h186v36H136c-26.5 0-48-21.5-48-48V160c0-26.5 21.5-48 48-48h752c26.5 0 48 21.5 48 48v520c0 26.5-21.5 48-48 48z" />
                  <path d="M623.5 421.5c-.5.5-1.1.9-1.6 1.1-.3.2-.6.4-1 .5-.4.2-.7.5-.9.8-.2.3-.4.6-.4.9 0 .4-.1.7-.1 1.1 0 .6.1 1.2.4 1.7.4.9 1.2 1.6 2.2 1.6h.1c2.5-.1 4.5-2.2 4.5-4.7s-2-4.6-4.5-4.6c-.7 0-1.5.2-2.1.6-.3.2-.5.4-.7.7-.1 0-.1 0-.1.1 0 .1-.1.1-.1.1l.1-.1c0 .1 0 .1-.1.1l.1-.1c0 .1 0 .1-.1.1l.1-.1c.3-.2.5-.5.7-.7.6-.4 1.3-.6 2.1-.6 2.5 0 4.5 2 4.5 4.6s-2 4.6-4.5 4.7h-.1c-1 0-1.8-.7-2.2-1.6-.3-.5-.4-1.1-.4-1.7 0-.4.1-.7.1-1.1 0-.3.2-.6.4-.9.2-.3.5-.6.9-.8.4-.1.7-.3 1-.5.5-.2 1.1-.6 1.6-1.1.4-.4.7-.8 1-1.3.6-1.2.8-2.5.6-3.8-.3-2.3-2-4.1-4.2-4.3h-.4c-.6 0-1.7.2-2.3.6-1 .5-1.8 1.3-2.4 2.3-.4.7-.6 1.4-.6 2.2v.1c0 1.1.4 2.2 1.1 3 .5.5 1 1 1.7 1.3.5.3 1.1.5 1.6.7.6.2 1.2.4 1.7.7.5.3.8.7 1.1 1.1.4.7.7 1.5.7 2.2 0 .4-.1.9-.2 1.3-.2.4-.4.8-.7 1.1-.3.3-.6.6-1 .8-.4.2-.8.3-1.2.3-.5 0-1-.1-1.5-.3-.4-.2-.7-.5-1-.8-.3-.3-.5-.7-.7-1.1-.1-.4-.2-.8-.2-1.3h-2c0 1.6.6 3.1 1.6 4.3.5.6 1.1 1 1.8 1.4.7.4 1.5.6 2.3.6 1 0 2-.3 2.9-.9.8-.5 1.5-1.3 2-2.2.5-.9.7-1.9.7-2.9 0-1-.2-2-.7-2.9-.3-.4-.6-.8-1-1.2z" />
                </svg>
              </span>
            </a>
          </a-descriptions-item>
          <a-descriptions-item label="域名">
            {{ currentDetail.domain || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ currentDetail.ip || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="网站标题">
            {{ currentDetail.title || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="HTTP响应码">
            <a-tag :color="getResponseCodeColor(currentDetail.response_code)">
              {{ currentDetail.response_code || '-' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="响应时间">
            {{ currentDetail.response_time ? `${currentDetail.response_time}ms` : '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="内容大小">
            {{ currentDetail.content_length ? `${Math.round(currentDetail.content_length / 1024)}KB` : '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="指纹信息" :span="2">
            <a-tag color="purple" v-if="currentDetail.fingerprint">
              {{ currentDetail.fingerprint }}
            </a-tag>
            <span v-else>-</span>
          </a-descriptions-item>
          <a-descriptions-item label="Favicon哈希">
            {{ currentDetail.favicon_hash || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="最后更新时间">
            {{ currentDetail.update_time || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="2">
            <div class="tag-list">
              <a-tag v-for="tag in currentDetail.tags || []" :key="tag">{{ tag }}</a-tag>
              <span v-if="!(currentDetail.tags || []).length">-</span>
            </div>
          </a-descriptions-item>
        </a-descriptions>
        
        <div v-if="currentDetail.headers || currentDetail.technologies" class="detail-section">
          <a-collapse>
            <a-collapse-panel key="1" header="HTTP响应头">
              <pre v-if="currentDetail.headers" class="code-block">{{ JSON.stringify(currentDetail.headers, null, 2) }}</pre>
              <p v-else>无响应头信息</p>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="使用技术">
              <div v-if="currentDetail.technologies && currentDetail.technologies.length" class="tag-list">
                <a-tag v-for="tech in currentDetail.technologies" :key="tech" color="blue">{{ tech }}</a-tag>
              </div>
              <p v-else>未检测到技术信息</p>
            </a-collapse-panel>
          </a-collapse>
        </div>
        
        <div class="detail-actions">
          <a-space>
            <a-button @click="detailVisible = false">关闭</a-button>
            <a-button 
              type="primary" 
              @click="viewScreenshot(currentDetail)" 
              v-if="currentDetail.screenshot_path"
            >查看截图</a-button>
            <a-button type="primary" @click="handleContentScan(currentDetail)">内容扫描</a-button>
            <a-button type="primary" @click="handleAddToMonitor(currentDetail)">添加到监控</a-button>
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
  name: 'AssetSiteSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '@/plugins/http'

interface SiteAsset {
  _id: string
  url: string
  domain: string
  ip: string
  title: string
  status: string
  fingerprint: string
  favicon_hash: string
  response_code: number
  response_time: number
  content_length: number
  tags: string[]
  update_time: string
  screenshot_path?: string
}

// 定义组件属性
interface Props {
  scopeId?: string // 可选的资产分组ID
  taskId?: string[] // 可选的任务ID列表
}

const props = defineProps<Props>()

// 表单数据
const form = reactive({
  url: '',
  domain: '',
  ip: '',
  title: '',
  status: undefined as string | undefined,
  fingerprint: ''
})

const tableData = ref<SiteAsset[]>([])
const loading = ref(false)
const screenshotVisible = ref(false)
const currentScreenshot = ref('')
const detailVisible = ref(false)
const detailTitle = ref('站点资产详情')
const currentDetail = ref(null)
const currentScreenshotUrl = ref('')

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
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 250,
    ellipsis: true,
    fixed: 'left'
  },
  {
    title: '域名',
    dataIndex: 'domain',
    key: 'domain',
    width: 150,
    ellipsis: true
  },
  {
    title: 'IP',
    dataIndex: 'ip',
    key: 'ip',
    width: 130
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '响应码',
    dataIndex: 'response_code',
    key: 'response_code',
    width: 100
  },
  {
    title: '响应时间',
    dataIndex: 'response_time',
    key: 'response_time',
    width: 100,
    render: (text: number) => `${text}ms`
  },
  {
    title: '大小',
    dataIndex: 'content_length',
    key: 'content_length',
    width: 100,
    render: (text: number) => `${Math.round(text / 1024)}KB`
  },
  {
    title: '指纹',
    dataIndex: 'fingerprint',
    key: 'fingerprint',
    width: 150,
    ellipsis: true
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
    dataIndex: 'update_time',
    key: 'update_time',
    width: 180
  }
]

// 获取站点状态的颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'green'
    case 'unreachable':
      return 'red'
    default:
      return 'default'
  }
}

// 获取站点状态的文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return '正常'
    case 'unreachable':
      return '无法访问'
    default:
      return status
  }
}

// 获取响应码的颜色
const getResponseCodeColor = (code: number) => {
  if (code >= 200 && code < 300) return 'green'
  if (code >= 300 && code < 400) return 'blue'
  if (code >= 400 && code < 500) return 'orange'
  if (code >= 500) return 'red'
  return 'default'
}

// 查询站点资产
const handleSearch = async (pag?: TablePaginationConfig) => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = new URLSearchParams()
    if (form.url) params.append('url', form.url)
    if (form.domain) params.append('domain', form.domain)
    if (form.ip) params.append('ip', form.ip)
    if (form.title) params.append('title', form.title)
    if (form.status) params.append('status', form.status)
    if (form.fingerprint) params.append('fingerprint', form.fingerprint)
    
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
    const res = await http.get(`/asset_site/?${params.toString()}`)
    
    // 处理响应 - 修复数据结构处理逻辑
    if (res.data && res.data.code === 200) {
      // 适配API响应结构，直接从顶层获取items而非从data.items获取
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = currentPage
      pagination.pageSize = pageSize
    } else {
      message.error(res.data.message || '获取站点资产数据失败')
    }
  } catch (error) {
    console.error('查询站点资产失败:', error)
    message.error('查询站点资产失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.url = ''
  form.domain = ''
  form.ip = ''
  form.title = ''
  form.status = undefined
  form.fingerprint = ''
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
    
    if (form.url) params.url = form.url
    if (form.domain) params.domain = form.domain
    if (form.ip) params.ip = form.ip
    if (form.title) params.title = form.title
    if (form.status) params.status = form.status
    if (form.fingerprint) params.fingerprint = form.fingerprint
    if (props.scopeId) params.scope_id = props.scopeId
    if (props.taskId && props.taskId.length > 0) {
      params.task_id = props.taskId
    }
    
    // 发送导出请求
    const res = await http.post('/batch_export/site/', params, {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `site_assets_${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success('导出成功')
  } catch (error) {
    console.error('导出站点资产失败:', error)
    message.error('导出站点资产失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetails = async (record: SiteAsset) => {
  detailTitle.value = `站点资产详情 - ${record.url}`
  currentDetail.value = null
  detailVisible.value = true
  
  try {
    // 获取站点详情
    const res = await http.get(`/asset_site/${record._id}/`)
    if (res.data && res.data.code === 200) {
      currentDetail.value = res.data.data || record
    } else {
      // 如果获取详情失败，使用列表中的数据
      currentDetail.value = record
    }
  } catch (error) {
    console.error('获取站点详情失败:', error)
    message.error('获取详情失败，显示基本信息')
    currentDetail.value = record
  }
}

// 查看截图(全屏模式)
const viewFullScreenshot = (record: any) => {
  if (record.screenshot_path) {
    currentScreenshotUrl.value = record.url
    currentScreenshot.value = record.screenshot_path
    screenshotVisible.value = true
  }
}

// 内容扫描
const handleContentScan = (record: any) => {
  message.info(`开始对 ${record.url} 进行内容扫描...`)
  // 这里可以添加实际的内容扫描逻辑，例如创建扫描任务
}

// 添加到监控
const handleAddToMonitor = (record: any) => {
  message.info(`已将 ${record.url} 添加到资产监控`)
  // 这里可以添加实际的添加监控逻辑
}

// 初始加载
handleSearch()
</script>

<style scoped>
.asset-site-search {
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

.empty-screenshot {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  color: #999;
  font-size: 16px;
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

.detail-header {
  margin-bottom: 16px;
  text-align: center;
}

.site-screenshot {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.site-screenshot:hover {
  opacity: 0.8;
}

.detail-section {
  margin-top: 20px;
}

.code-block {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 12px;
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

.external-link-icon {
  margin-left: 5px;
  color: #1890ff;
}
</style>