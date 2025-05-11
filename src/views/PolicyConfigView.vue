<template>
  <div class="policy-config-container">
    <!-- 头部搜索区域 -->
    <div class="header-section">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchForm.name"
            placeholder="请输入策略名称"
            @search="handleSearch"
            allow-clear
          />
        </a-col>
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
            <a-button type="primary" @click="showAddModal">
              <template #icon><PlusOutlined /></template>
              添加策略
            </a-button>
            <a-popconfirm
              v-if="selectedRowKeys.length > 0"
              title="确定要删除选中的策略吗？"
              @confirm="handleBatchDelete"
              okText="确定"
              cancelText="取消"
            >
              <a-button danger>
                <template #icon><DeleteOutlined /></template>
                批量删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 表格展示区域 -->
    <div class="table-section">
      <a-table
        :dataSource="tableData"
        :columns="columns"
        :rowSelection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange,
        }"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        rowKey="_id"
        bordered
      >
        <!-- 操作列自定义渲染 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除此策略吗？"
                @confirm="() => handleDelete(record._id)"
                okText="确定"
                cancelText="取消"
              >
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加/编辑策略弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :width="900"
      :confirmLoading="modalLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="策略名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入策略名称" />
        </a-form-item>
        <a-form-item label="策略描述" name="desc">
          <a-textarea v-model:value="formData.desc" placeholder="请输入策略描述" rows="2" />
        </a-form-item>

        <!-- 策略配置选项卡 -->
        <a-tabs v-model:activeKey="activeTabKey">
          <!-- 域名配置 -->
          <a-tab-pane key="domain" tab="域名配置">
            <div class="option-section">
              <div class="option-group">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="域名爆破">
                      <a-switch v-model:checked="formData.policy.domain_config.domain_brute" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="爆破类型">
                      <a-select v-model:value="formData.policy.domain_config.domain_brute_type">
                        <a-select-option value="small">小字典</a-select-option>
                        <a-select-option value="medium">中字典</a-select-option>
                        <a-select-option value="big">大字典</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="DNS字典智能生成">
                      <a-switch v-model:checked="formData.policy.domain_config.alt_dns" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="历史查询">
                      <a-switch v-model:checked="formData.policy.domain_config.casm_search" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="域名插件查询">
                      <a-switch v-model:checked="formData.policy.domain_config.dns_query_plugin" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-tab-pane>

          <!-- IP配置 -->
          <a-tab-pane key="ip" tab="IP配置">
            <div class="option-section">
              <div class="option-group">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="端口扫描">
                      <a-switch v-model:checked="formData.policy.ip_config.port_scan" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="扫描类型">
                      <a-select v-model:value="formData.policy.ip_config.port_scan_type">
                        <a-select-option value="test">测试</a-select-option>
                        <a-select-option value="top100">TOP100</a-select-option>
                        <a-select-option value="top1000">TOP1000</a-select-option>
                        <a-select-option value="all">全部</a-select-option>
                        <a-select-option value="custom">自定义</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8" v-if="formData.policy.ip_config.port_scan_type === 'custom'">
                    <a-form-item label="自定义端口">
                      <a-input
                        v-model:value="formData.policy.ip_config.port_custom"
                        placeholder="例如: 80,443,8080-8090"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="服务识别">
                      <a-switch v-model:checked="formData.policy.ip_config.service_detection" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="操作系统识别">
                      <a-switch v-model:checked="formData.policy.ip_config.os_detection" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="跳过CDN IP扫描">
                      <a-switch v-model:checked="formData.policy.ip_config.skip_scan_cdn_ip" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="SSL证书获取">
                      <a-switch v-model:checked="formData.policy.ip_config.ssl_cert" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="16">
                    <a-form-item label="排除端口">
                      <a-input
                        v-model:value="formData.policy.ip_config.exclude_ports"
                        placeholder="例如: 8000-9000,50000"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="超时时间类别">
                      <a-select v-model:value="formData.policy.ip_config.host_timeout_type">
                        <a-select-option value="default">默认</a-select-option>
                        <a-select-option value="custom">自定义</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="8" v-if="formData.policy.ip_config.host_timeout_type === 'custom'">
                    <a-form-item label="主机超时时间(秒)">
                      <a-input-number
                        v-model:value="formData.policy.ip_config.host_timeout"
                        :min="1"
                        :max="3600"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="探测报文并行度">
                      <a-input-number
                        v-model:value="formData.policy.ip_config.port_parallelism"
                        :min="1"
                        :max="100"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="最少发包速率">
                      <a-input-number
                        v-model:value="formData.policy.ip_config.port_min_rate"
                        :min="1"
                        :max="1000"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-tab-pane>

          <!-- 站点配置 -->
          <a-tab-pane key="site" tab="站点配置">
            <div class="option-section">
              <div class="option-group">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="站点识别">
                      <a-switch v-model:checked="formData.policy.site_config.site_identify" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="站点截图">
                      <a-switch v-model:checked="formData.policy.site_config.site_capture" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="调用搜索引擎">
                      <a-switch v-model:checked="formData.policy.site_config.search_engines" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="站点爬虫">
                      <a-switch v-model:checked="formData.policy.site_config.site_spider" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="Nuclei扫描">
                      <a-switch v-model:checked="formData.policy.site_config.nuclei_scan" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="JS信息收集">
                      <a-switch v-model:checked="formData.policy.site_config.web_info_hunter" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-tab-pane>

          <!-- 其他配置 -->
          <a-tab-pane key="other" tab="其他配置">
            <div class="option-section">
              <div class="option-group">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item label="文件泄露">
                      <a-switch v-model:checked="formData.policy.file_leak" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item label="Npoc服务检测">
                      <a-switch v-model:checked="formData.policy.npoc_service_detection" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-tab-pane>

          <!-- 资产组关联 -->
          <a-tab-pane key="scope" tab="资产组关联">
            <div class="option-section">
              <div class="option-group">
                <a-form-item label="关联资产组">
                  <a-select
                    v-model:value="formData.policy.scope_config.scope_id"
                    placeholder="请选择关联的资产组"
                    allowClear
                    :loading="assetScopeLoading"
                  >
                    <a-select-option v-for="scope in assetScopes" :key="scope._id" :value="scope._id">
                      {{ scope.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </div>
            </div>
          </a-tab-pane>

          <!-- POC插件配置 -->
          <a-tab-pane key="poc" tab="POC插件">
            <div class="option-section">
              <div class="option-group">
                <a-space direction="vertical" style="width: 100%">
                  <a-alert 
                    message="请选择需要启用的POC插件"
                    type="info" 
                    show-icon 
                    style="margin-bottom: 16px"
                  />
                  
                  <a-input-search 
                    placeholder="搜索POC插件" 
                    style="width: 300px; margin-bottom: 16px"
                    v-model:value="pocSearchKeyword"
                    @search="filterPocPlugins"
                    allowClear
                  />
                  
                  <a-table
                    :dataSource="filteredPocPlugins"
                    :columns="pocColumns"
                    :pagination="{ pageSize: 5 }"
                    size="small"
                    bordered
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'enable'">
                        <a-switch
                          :checked="getPocPluginStatus(record.plugin_name)"
                          @change="(checked) => togglePocPlugin(record.plugin_name, checked)"
                        />
                      </template>
                    </template>
                  </a-table>
                </a-space>
              </div>
            </div>
          </a-tab-pane>

          <!-- 弱口令插件配置 -->
          <a-tab-pane key="brute" tab="弱口令插件">
            <div class="option-section">
              <div class="option-group">
                <a-space direction="vertical" style="width: 100%">
                  <a-alert 
                    message="请选择需要启用的弱口令插件"
                    type="info" 
                    show-icon 
                    style="margin-bottom: 16px"
                  />
                  
                  <a-input-search 
                    placeholder="搜索弱口令插件" 
                    style="width: 300px; margin-bottom: 16px"
                    v-model:value="bruteSearchKeyword"
                    @search="filterBrutePlugins"
                    allowClear
                  />
                  
                  <a-table
                    :dataSource="filteredBrutePlugins"
                    :columns="bruteColumns"
                    :pagination="{ pageSize: 5 }"
                    size="small"
                    bordered
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'enable'">
                        <a-switch
                          :checked="getBrutePluginStatus(record.plugin_name)"
                          @change="(checked) => toggleBrutePlugin(record.plugin_name, checked)"
                        />
                      </template>
                    </template>
                  </a-table>
                </a-space>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-form>
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
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import http from '../plugins/http'

// 类型定义
interface PolicyData {
  _id: string
  name: string
  desc: string
  update_date: string
  policy: {
    domain_config: {
      domain_brute: boolean
      domain_brute_type: string
      alt_dns: boolean
      casm_search: boolean
      dns_query_plugin: boolean
    }
    ip_config: {
      port_scan: boolean
      port_scan_type: string
      service_detection: boolean
      os_detection: boolean
      ssl_cert: boolean
      skip_scan_cdn_ip: boolean
      port_custom: string
      host_timeout_type: string
      host_timeout: number
      port_parallelism: number
      port_min_rate: number
      exclude_ports: string
    }
    site_config: {
      site_identify: boolean
      site_capture: boolean
      search_engines: boolean
      site_spider: boolean
      nuclei_scan: boolean
      web_info_hunter: boolean
    }
    scope_config: {
      scope_id: string
    }
    file_leak: boolean
    npoc_service_detection: boolean
    poc_config: Array<{
      plugin_name: string
      vul_name?: string
      enable: boolean
    }>
    brute_config: Array<{
      plugin_name: string
      vul_name?: string
      enable: boolean
    }>
  }
}

interface AssetScope {
  _id: string
  name: string
}

// 表格相关数据
const tableData = ref<PolicyData[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])

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
  name: '',
  page: 1,
  size: 10
})

// 表格列定义
const columns = [
  {
    title: '策略名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '策略描述',
    dataIndex: 'desc',
    key: 'desc',
    ellipsis: true
  },
  {
    title: '更新时间',
    dataIndex: 'update_date',
    key: 'update_date',
    width: '150px'
  },
  {
    title: '操作',
    key: 'action',
    width: '150px',
    fixed: 'right'
  }
]

// 模态窗相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const formRef = ref()
const modalType = ref<'add' | 'edit'>('add')
const modalTitle = computed(() => modalType.value === 'add' ? '添加策略' : '编辑策略')

// 资产组数据
const assetScopes = ref<AssetScope[]>([])
const assetScopeLoading = ref(false)

// 激活的选项卡
const activeTabKey = ref('domain')

// POC插件相关
const pocPlugins = ref([
  { plugin_name: 'springboot_actuator_unauthorized', vul_name: 'Spring Boot Actuator未授权访问' },
  { plugin_name: 'apache_solr_rce', vul_name: 'Apache Solr远程代码执行' },
  { plugin_name: 'thinkphp_rce', vul_name: 'ThinkPHP远程代码执行' },
  { plugin_name: 'jboss_rce', vul_name: 'JBoss远程代码执行' },
  { plugin_name: 'weblogic_rce', vul_name: 'Weblogic远程代码执行' }
])
const pocSearchKeyword = ref('')
const pocColumns = [
  {
    title: '插件名称',
    dataIndex: 'plugin_name',
    key: 'plugin_name'
  },
  {
    title: '漏洞名称',
    dataIndex: 'vul_name',
    key: 'vul_name'
  },
  {
    title: '启用',
    key: 'enable',
    width: '80px',
    align: 'center'
  }
]
const filteredPocPlugins = computed(() => {
  if (!pocSearchKeyword.value) return pocPlugins.value
  const keyword = pocSearchKeyword.value.toLowerCase()
  return pocPlugins.value.filter(
    plugin => 
      plugin.plugin_name.toLowerCase().includes(keyword) || 
      plugin.vul_name?.toLowerCase().includes(keyword)
  )
})

// 弱口令插件相关
const brutePlugins = ref([
  { plugin_name: 'tomcat_weak_password', vul_name: 'Tomcat默认弱口令' },
  { plugin_name: 'jenkins_weak_password', vul_name: 'Jenkins默认弱口令' },
  { plugin_name: 'mysql_weak_password', vul_name: 'MySQL默认弱口令' },
  { plugin_name: 'redis_weak_password', vul_name: 'Redis默认弱口令' }
])
const bruteSearchKeyword = ref('')
const bruteColumns = [
  {
    title: '插件名称',
    dataIndex: 'plugin_name',
    key: 'plugin_name'
  },
  {
    title: '漏洞名称',
    dataIndex: 'vul_name',
    key: 'vul_name'
  },
  {
    title: '启用',
    key: 'enable',
    width: '80px',
    align: 'center'
  }
]
const filteredBrutePlugins = computed(() => {
  if (!bruteSearchKeyword.value) return brutePlugins.value
  const keyword = bruteSearchKeyword.value.toLowerCase()
  return brutePlugins.value.filter(
    plugin => 
      plugin.plugin_name.toLowerCase().includes(keyword) || 
      plugin.vul_name?.toLowerCase().includes(keyword)
  )
})

// 表单数据和规则
const initialFormData = {
  _id: '',
  name: '',
  desc: '',
  policy: {
    domain_config: {
      domain_brute: true,
      domain_brute_type: 'big',
      alt_dns: true,
      casm_search: true,
      dns_query_plugin: false
    },
    ip_config: {
      port_scan: true,
      port_scan_type: 'top100',
      service_detection: true,
      os_detection: false,
      ssl_cert: true,
      skip_scan_cdn_ip: true,
      port_custom: '80,443',
      host_timeout_type: 'default',
      host_timeout: 900,
      port_parallelism: 32,
      port_min_rate: 60,
      exclude_ports: ''
    },
    site_config: {
      site_identify: true,
      site_capture: true,
      search_engines: false,
      site_spider: false,
      nuclei_scan: false,
      web_info_hunter: false
    },
    scope_config: {
      scope_id: ''
    },
    file_leak: false,
    npoc_service_detection: false,
    poc_config: [],
    brute_config: []
  }
}

const formData = reactive(JSON.parse(JSON.stringify(initialFormData)))

const formRules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' },
    { min: 2, max: 50, message: '策略名称长度必须为2-50个字符', trigger: 'blur' }
  ],
  desc: [
    { max: 200, message: '策略描述最多200个字符', trigger: 'blur' }
  ]
}

// 初始化
onMounted(() => {
  fetchPolicyList()
  fetchAssetScopes()
})

// 获取策略列表
const fetchPolicyList = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchForm.name) params.append('name', searchForm.name)
    params.append('page', String(searchForm.page))
    params.append('size', String(searchForm.size))

    const res = await http.get(`/policy/?${params.toString()}`)
    if (res.data.code === 200) {
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = res.data.page || searchForm.page
      pagination.pageSize = res.data.size || searchForm.size
    } else {
      message.error(res.data.message || '获取策略列表失败')
    }
  } catch (error) {
    console.error('获取策略列表出错:', error)
    message.error('获取策略列表失败')
  } finally {
    loading.value = false
  }
}

// 获取资产分组列表
const fetchAssetScopes = async () => {
  assetScopeLoading.value = true
  try {
    const res = await http.get('/asset_scope/?size=100')
    if (res.data.code === 200) {
      assetScopes.value = res.data.items || []
    } else {
      message.error(res.data.message || '获取资产分组失败')
    }
  } catch (error) {
    console.error('获取资产分组出错:', error)
    message.error('获取资产分组失败')
  } finally {
    assetScopeLoading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  searchForm.page = 1
  fetchPolicyList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.page = 1
  fetchPolicyList()
}

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  searchForm.page = pag.current || 1
  searchForm.size = pag.pageSize || 10
  fetchPolicyList()
}

// 表格选择变化
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

// 显示添加模态窗
const showAddModal = () => {
  modalType.value = 'add'
  activeTabKey.value = 'domain'
  resetFormData()
  modalVisible.value = true
}

// 编辑处理
const handleEdit = (record: PolicyData) => {
  modalType.value = 'edit'
  activeTabKey.value = 'domain'
  
  // 深拷贝记录数据到表单
  Object.assign(formData, JSON.parse(JSON.stringify(record)))
  
  // 确保所有配置项存在
  ensureConfigExists(formData.policy)
  
  modalVisible.value = true
}

// 确保配置项存在
const ensureConfigExists = (policy: any) => {
  // 域名配置
  if (!policy.domain_config) {
    policy.domain_config = initialFormData.policy.domain_config
  } else {
    Object.keys(initialFormData.policy.domain_config).forEach(key => {
      if (policy.domain_config[key] === undefined) {
        policy.domain_config[key] = initialFormData.policy.domain_config[key as keyof typeof initialFormData.policy.domain_config]
      }
    })
  }
  
  // IP配置
  if (!policy.ip_config) {
    policy.ip_config = initialFormData.policy.ip_config
  } else {
    Object.keys(initialFormData.policy.ip_config).forEach(key => {
      if (policy.ip_config[key] === undefined) {
        policy.ip_config[key] = initialFormData.policy.ip_config[key as keyof typeof initialFormData.policy.ip_config]
      }
    })
  }
  
  // 站点配置
  if (!policy.site_config) {
    policy.site_config = initialFormData.policy.site_config
  } else {
    Object.keys(initialFormData.policy.site_config).forEach(key => {
      if (policy.site_config[key] === undefined) {
        policy.site_config[key] = initialFormData.policy.site_config[key as keyof typeof initialFormData.policy.site_config]
      }
    })
  }
  
  // 资产组配置
  if (!policy.scope_config) {
    policy.scope_config = initialFormData.policy.scope_config
  }
  
  // 其他配置
  if (policy.file_leak === undefined) policy.file_leak = initialFormData.policy.file_leak
  if (policy.npoc_service_detection === undefined) policy.npoc_service_detection = initialFormData.policy.npoc_service_detection
  
  // 插件配置
  if (!policy.poc_config) policy.poc_config = []
  if (!policy.brute_config) policy.brute_config = []
}

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, JSON.parse(JSON.stringify(initialFormData)))
}

// 删除处理
const handleDelete = async (id: string) => {
  try {
    const res = await http.post('/policy/delete/', {
      policy_id: [id]
    })
    
    if (res.data.code === 200) {
      message.success('删除策略成功')
      fetchPolicyList()
    } else {
      message.error(res.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除策略出错:', error)
    message.error('删除失败')
  }
}

// 批量删除处理
const handleBatchDelete = async () => {
  try {
    const res = await http.post('/policy/delete/', {
      policy_id: selectedRowKeys.value
    })
    
    if (res.data.code === 200) {
      message.success('批量删除策略成功')
      selectedRowKeys.value = []
      fetchPolicyList()
    } else {
      message.error(res.data.message || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除策略出错:', error)
    message.error('批量删除失败')
  }
}

// 模态窗确认
const handleModalOk = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    modalLoading.value = true
    
    // 准备插件配置
    preparePocConfig()
    prepareBruteConfig()
    
    if (modalType.value === 'add') {
      // 添加策略
      const params = {
        name: formData.name,
        desc: formData.desc,
        policy: formData.policy
      }
      
      const res = await http.post('/policy/add/', params)
      
      if (res.data.code === 200) {
        message.success('添加策略成功')
        modalVisible.value = false
        fetchPolicyList()
      } else {
        message.error(res.data.message || '添加策略失败')
      }
    } else {
      // 编辑策略
      const params = {
        policy_id: formData._id,
        policy_data: {
          name: formData.name,
          desc: formData.desc,
          policy: formData.policy
        }
      }
      
      const res = await http.post('/policy/edit/', params)
      
      if (res.data.code === 200) {
        message.success('更新策略成功')
        modalVisible.value = false
        fetchPolicyList()
      } else {
        message.error(res.data.message || '更新策略失败')
      }
    }
  } catch (error) {
    console.error('表单验证或提交出错:', error)
  } finally {
    modalLoading.value = false
  }
}

// 模态窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  resetFormData()
}

// 准备POC插件配置
const preparePocConfig = () => {
  // 确保当前选择的POC插件都在配置中
  const currentPocConfig = formData.policy.poc_config || []
  
  // 遍历所有插件，维护启用状态
  pocPlugins.value.forEach(plugin => {
    const existingConfig = currentPocConfig.find(p => p.plugin_name === plugin.plugin_name)
    if (existingConfig) {
      // 已存在的配置保持不变
    } else {
      // 不存在则添加默认配置(禁用)
      currentPocConfig.push({
        plugin_name: plugin.plugin_name,
        vul_name: plugin.vul_name,
        enable: false
      })
    }
  })
  
  formData.policy.poc_config = currentPocConfig
}

// 准备弱口令插件配置
const prepareBruteConfig = () => {
  // 确保当前选择的弱口令插件都在配置中
  const currentBruteConfig = formData.policy.brute_config || []
  
  // 遍历所有插件，维护启用状态
  brutePlugins.value.forEach(plugin => {
    const existingConfig = currentBruteConfig.find(p => p.plugin_name === plugin.plugin_name)
    if (existingConfig) {
      // 已存在的配置保持不变
    } else {
      // 不存在则添加默认配置(禁用)
      currentBruteConfig.push({
        plugin_name: plugin.plugin_name,
        vul_name: plugin.vul_name,
        enable: false
      })
    }
  })
  
  formData.policy.brute_config = currentBruteConfig
}

// 获取POC插件启用状态
const getPocPluginStatus = (pluginName: string): boolean => {
  const config = formData.policy.poc_config?.find(p => p.plugin_name === pluginName)
  return config ? config.enable : false
}

// 切换POC插件启用状态
const togglePocPlugin = (pluginName: string, checked: boolean) => {
  let configs = formData.policy.poc_config || []
  const index = configs.findIndex(p => p.plugin_name === pluginName)
  
  if (index >= 0) {
    configs[index].enable = checked
  } else {
    const plugin = pocPlugins.value.find(p => p.plugin_name === pluginName)
    if (plugin) {
      configs.push({
        plugin_name: pluginName,
        vul_name: plugin.vul_name,
        enable: checked
      })
    }
  }
  
  formData.policy.poc_config = configs
}

// 获取弱口令插件启用状态
const getBrutePluginStatus = (pluginName: string): boolean => {
  const config = formData.policy.brute_config?.find(p => p.plugin_name === pluginName)
  return config ? config.enable : false
}

// 切换弱口令插件启用状态
const toggleBrutePlugin = (pluginName: string, checked: boolean) => {
  let configs = formData.policy.brute_config || []
  const index = configs.findIndex(p => p.plugin_name === pluginName)
  
  if (index >= 0) {
    configs[index].enable = checked
  } else {
    const plugin = brutePlugins.value.find(p => p.plugin_name === pluginName)
    if (plugin) {
      configs.push({
        plugin_name: pluginName,
        vul_name: plugin.vul_name,
        enable: checked
      })
    }
  }
  
  formData.policy.brute_config = configs
}

// 过滤POC插件
const filterPocPlugins = () => {
  // 由computed属性filteredPocPlugins自动处理
}

// 过滤弱口令插件
const filterBrutePlugins = () => {
  // 由computed属性filteredBrutePlugins自动处理
}
</script>

<style scoped>
.policy-config-container {
  padding: var(--spacing-large);
}

.header-section {
  margin-bottom: var(--spacing-large);
  background-color: white;
  padding: 16px;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-light);
}

.table-section {
  background-color: white;
  padding: 16px;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-light);
}

.option-section {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  margin-top: var(--spacing-medium);
}

.option-group {
  padding: var(--spacing-medium);
  border-bottom: 1px dashed var(--border-color);
}

.option-group:last-child {
  border-bottom: none;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-tabs-content-holder) {
  padding: 8px 0;
}
</style>
