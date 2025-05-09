<template>
  <div class="task-manage-container">
    <div class="header-actions">
      <a-button type="primary" @click="showCreateTaskModal">
        <PlusOutlined />
        新建任务
      </a-button>
    </div>
    
    <!-- 搜索过滤区域 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="queryParams">
        <a-row :gutter="[16, 16]" style="width: 100%">
          <!-- 基本查询条件 -->
          <a-col :span="6">
            <a-form-item label="任务名称">
              <a-input v-model="queryParams.name" placeholder="请输入任务名称" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务目标">
              <a-input v-model="queryParams.target" placeholder="请输入任务目标" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务状态">
              <a-select v-model="queryParams.status" placeholder="请选择任务状态" allow-clear>
                <a-select-option value="waiting">等待中</a-select-option>
                <a-select-option value="running">运行中</a-select-option>
                <a-select-option value="done">已完成</a-select-option>
                <a-select-option value="stop">已停止</a-select-option>
                <a-select-option value="error">失败</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="任务标签">
              <a-select v-model="queryParams.task_tag" placeholder="请选择任务标签" allow-clear>
                <a-select-option value="task">常规任务</a-select-option>
                <a-select-option value="risk_cruising">侦查任务</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <!-- 高级搜索区域，默认折叠 -->
          <template v-if="showAdvanced">
            <!-- 选项配置查询 -->
            <a-col :span="6">
              <a-form-item label="域名爆破类型">
                <a-select v-model="queryParams['options.domain_brute_type']" placeholder="请选择" allow-clear>
                  <a-select-option value="small">小字典</a-select-option>
                  <a-select-option value="medium">中字典</a-select-option>
                  <a-select-option value="big">大字典</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="端口扫描类型">
                <a-select v-model="queryParams['options.port_scan_type']" placeholder="请选择" allow-clear>
                  <a-select-option value="top100">Top100</a-select-option>
                  <a-select-option value="top1000">Top1000</a-select-option>
                  <a-select-option value="all">全部</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <!-- 选项开关筛选 -->
            <a-col :span="6">
              <a-form-item label="域名爆破">
                <a-select v-model="queryParams['options.domain_brute']" placeholder="请选择" allow-clear>
                  <a-select-option :value="true">开启</a-select-option>
                  <a-select-option :value="false">关闭</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="端口扫描">
                <a-select v-model="queryParams['options.port_scan']" placeholder="请选择" allow-clear>
                  <a-select-option :value="true">开启</a-select-option>
                  <a-select-option :value="false">关闭</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            
            <!-- 统计数据查询 -->
            <a-col :span="8">
              <a-form-item label="站点数量">
                <a-row :gutter="8">
                  <a-col :span="8">
                    <a-select v-model="queryParams.siteCountCompare" placeholder="比较" allow-clear>
                      <a-select-option value="eq">等于</a-select-option>
                      <a-select-option value="gt">大于</a-select-option>
                      <a-select-option value="lt">小于</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="16">
                    <a-input-number v-model="queryParams.siteCountValue" placeholder="数量" style="width: 100%" />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="域名数量">
                <a-row :gutter="8">
                  <a-col :span="8">
                    <a-select v-model="queryParams.domainCountCompare" placeholder="比较" allow-clear>
                      <a-select-option value="eq">等于</a-select-option>
                      <a-select-option value="gt">大于</a-select-option>
                      <a-select-option value="lt">小于</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="16">
                    <a-input-number v-model="queryParams.domainCountValue" placeholder="数量" style="width: 100%" />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="WIH数量">
                <a-row :gutter="8">
                  <a-col :span="8">
                    <a-select v-model="queryParams.wihCountCompare" placeholder="比较" allow-clear>
                      <a-select-option value="eq">等于</a-select-option>
                      <a-select-option value="gt">大于</a-select-option>
                      <a-select-option value="lt">小于</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="16">
                    <a-input-number v-model="queryParams.wihCountValue" placeholder="数量" style="width: 100%" />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
          </template>
          
          <!-- 查询按钮区域 -->
          <a-col :span="24" style="text-align: right;">
            <a-space>
              <a-button type="primary" @click="handleQuery">
                <SearchOutlined /> 查询
              </a-button>
              <a-button @click="resetQuery">
                <ReloadOutlined /> 重置
              </a-button>
              <a-button type="link" @click="toggleAdvanced">
                {{ showAdvanced ? '收起' : '展开' }} <component :is="showAdvanced ? 'UpOutlined' : 'DownOutlined'" />
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    
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
      :columns="columns"
      :data-source="taskList"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
      row-key="_id"
      size="middle"
      :components="resizableComponents"
    >
      <!-- 任务名称列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a @click="showTaskDetail(record)">{{ record.name }}</a>
        </template>
        
        <!-- 任务目标列 -->
        <template v-if="column.key === 'target'">
          <a-tooltip :title="record.target">
            {{ truncateText(record.target, 30) }}
          </a-tooltip>
        </template>
        
        <!-- 任务状态列 -->
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <!-- 任务选项列 -->
        <template v-if="column.key === 'options'">
          <a-space>
            <a-tag v-if="record.options?.domain_brute" color="blue">域名爆破</a-tag>
            <a-tag v-if="record.options?.port_scan" color="green">端口扫描</a-tag>
            <a-tag v-if="record.options?.service_detection" color="cyan">服务识别</a-tag>
            <a-tag v-if="record.options?.nuclei_scan" color="orange">Nuclei</a-tag>
            <a-tooltip title="查看全部选项">
              <EyeOutlined @click="showTaskOptions(record)" />
            </a-tooltip>
          </a-space>
        </template>
        
        <!-- 统计数据列 -->
        <template v-if="column.key === 'statistic'">
          <a-space direction="vertical" size="small">
            <span>站点数: {{ record.statistic?.site_cnt || 0 }}</span>
            <span>域名数: {{ record.statistic?.domain_cnt || 0 }}</span>
            <span>WIH数: {{ record.statistic?.wih_cnt || 0 }}</span>
          </a-space>
        </template>
        
        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <a-space>
            <a-tooltip title="查看详情">
              <a @click="showTaskDetail(record)"><EyeOutlined /></a>
            </a-tooltip>
            <a-tooltip title="导出任务">
              <a @click="exportTask(record)"><DownloadOutlined /></a>
            </a-tooltip>
            <a-tooltip v-if="record.status === 'running' || record.status === 'waiting'" title="停止任务">
              <a @click="stopTask(record)"><PauseCircleOutlined /></a>
            </a-tooltip>
            <a-tooltip v-if="record.status === 'done' || record.status === 'stop' || record.status === 'error'" title="重启任务">
              <a @click="restartTask(record)"><ReloadOutlined /></a>
            </a-tooltip>
            <a-tooltip title="同步到资产组">
              <a @click="showSyncTaskModal(record)"><PartitionOutlined /></a>
            </a-tooltip>
            <a-tooltip v-if="record.status === 'done' || record.status === 'stop' || record.status === 'error'" title="删除任务">
              <a @click="deleteTask(record)"><DeleteOutlined /></a>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新建任务弹窗 -->
    <a-modal
      v-model="createTaskModalVisible"
      title="新建任务"
      @ok="handleCreateTask"
      @cancel="handleCancel"
      :confirm-loading="confirmLoading"
      width="600px"
      :bodyStyle="{ padding: '24px' }"
    >
      <a-form :model="taskForm" :rules="rules" ref="taskFormRef" layout="vertical">
        <!-- 基本信息 -->
        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item name="name" label="任务名称">
              <a-input v-model="taskForm.name" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="target" label="目标">
              <a-input v-model="taskForm.target" placeholder="请输入目标IP/域名" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item name="domain_brute_type" label="域名爆破类型">
              <a-select v-model="taskForm.domain_brute_type">
                <a-select-option value="small">小字典</a-select-option>
                <a-select-option value="medium">中字典</a-select-option>
                <a-select-option value="big">大字典</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="port_scan_type" label="端口扫描类型">
              <a-select v-model="taskForm.port_scan_type">
                <a-select-option value="top100">Top100</a-select-option>
                <a-select-option value="top1000">Top1000</a-select-option>
                <a-select-option value="all">全部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 扫描选项 -->
        <div class="option-section">
          <div class="option-header">扫描选项</div>
          
          <div class="option-group">
            <div class="group-title">信息收集</div>
            <div class="options">
              <a-checkbox v-model="taskForm.domain_brute">域名爆破</a-checkbox>
              <a-checkbox v-model="taskForm.alt_dns">DNS生成</a-checkbox>
              <a-checkbox v-model="taskForm.dns_query_plugin">DNS解析</a-checkbox>
              <a-checkbox v-model="taskForm.casm_search">搜索</a-checkbox>
            </div>
          </div>
          
          <div class="option-group">
            <div class="group-title">端口扫描</div>
            <div class="options">
              <a-checkbox v-model="taskForm.port_scan">端口扫描</a-checkbox>
              <a-checkbox v-model="taskForm.service_detection">服务识别</a-checkbox>
              <a-checkbox v-model="taskForm.os_detection">系统识别</a-checkbox>
              <a-checkbox v-model="taskForm.ssl_cert">SSL证书</a-checkbox>
            </div>
          </div>
          
          <div class="option-group">
            <div class="group-title">站点扫描</div>
            <div class="options">
              <a-checkbox v-model="taskForm.site_identify">站点识别</a-checkbox>
              <a-checkbox v-model="taskForm.search_engines">搜索引擎</a-checkbox>
              <a-checkbox v-model="taskForm.site_spider">站点爬虫</a-checkbox>
              <a-checkbox v-model="taskForm.site_capture">站点截图</a-checkbox>
            </div>
          </div>
          
          <div class="option-group">
            <div class="group-title">安全扫描</div>
            <div class="options">
              <a-checkbox v-model="taskForm.skip_scan_cdn_ip">跳过CDN</a-checkbox>
              <a-checkbox v-model="taskForm.file_leak">文件泄露</a-checkbox>
              <a-checkbox v-model="taskForm.findvhost">虚拟主机</a-checkbox>
              <a-checkbox v-model="taskForm.nuclei_scan">Nuclei</a-checkbox>
              <a-checkbox v-model="taskForm.web_info_hunter">Web信息</a-checkbox>
            </div>
          </div>
        </div>
      </a-form>
    </a-modal>

    <!-- 同步任务到资产组弹窗 -->
    <a-modal
      v-model="syncTaskModalVisible"
      title="同步任务到资产组"
      @ok="handleSyncTask"
      @cancel="syncTaskModalVisible = false"
      :confirm-loading="confirmSyncLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="资产组">
          <a-select
            v-model="selectedScopeId"
            placeholder="请选择要同步到的资产组"
            :loading="scopeLoading"
            show-search
            :filter-option="filterScopeOption"
          >
            <a-select-option v-for="scope in assetScopes" :key="scope._id" :value="scope._id">
              {{ scope.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 任务选项详情弹窗 -->
    <a-modal
      v-model="taskOptionsModalVisible"
      title="任务选项详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="域名爆破">{{ currentTaskOptions.domain_brute ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="域名爆破类型">{{ currentTaskOptions.domain_brute_type }}</a-descriptions-item>
        <a-descriptions-item label="端口扫描">{{ currentTaskOptions.port_scan ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="端口扫描类型">{{ currentTaskOptions.port_scan_type }}</a-descriptions-item>
        <a-descriptions-item label="服务识别">{{ currentTaskOptions.service_detection ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="服务弱口令爆破">{{ currentTaskOptions.service_brute ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="操作系统识别">{{ currentTaskOptions.os_detection ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="站点识别">{{ currentTaskOptions.site_identify ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="文件泄露扫描">{{ currentTaskOptions.file_leak ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="DNS字典智能生成">{{ currentTaskOptions.alt_dns ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="搜索引擎调用">{{ currentTaskOptions.search_engines ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="站点爬虫">{{ currentTaskOptions.site_spider ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="历史查询">{{ currentTaskOptions.casm_search ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="域名插件查询">{{ currentTaskOptions.dns_query_plugin ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="跳过CDN IP端口扫描">{{ currentTaskOptions.skip_scan_cdn_ip ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="Nuclei扫描">{{ currentTaskOptions.nuclei_scan ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="Host碰撞检测">{{ currentTaskOptions.findvhost ? '开启' : '关闭' }}</a-descriptions-item>
        <a-descriptions-item label="Web信息猎手">{{ currentTaskOptions.web_info_hunter ? '开启' : '关闭' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import { PlusOutlined, SearchOutlined, ReloadOutlined, PauseCircleOutlined, DeleteOutlined, EyeOutlined, PartitionOutlined, UpOutlined, DownOutlined, DownloadOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';

interface ApiResponse<T> {
  code: number;
  message?: string;
  items?: T[];
  total?: number;
  data?: T;
}

interface TaskForm {
  name: string;
  target: string;
  domain_brute_type: string;
  port_scan_type: string;
  domain_brute: boolean;
  alt_dns: boolean;
  dns_query_plugin: boolean;
  casm_search: boolean;
  port_scan: boolean;
  service_detection: boolean;
  os_detection: boolean;
  ssl_cert: boolean;
  skip_scan_cdn_ip: boolean;
  site_identify: boolean;
  search_engines: boolean;
  site_spider: boolean;
  site_capture: boolean;
  file_leak: boolean;
  findvhost: boolean;
  nuclei_scan: boolean;
  web_info_hunter: boolean;
}

interface TaskOptions {
  domain_brute?: boolean;
  domain_brute_type?: string;
  port_scan?: boolean;
  port_scan_type?: string;
  service_detection?: boolean;
  service_brute?: boolean;
  os_detection?: boolean;
  site_identify?: boolean;
  file_leak?: boolean;
  alt_dns?: boolean;
  search_engines?: boolean;
  site_spider?: boolean;
  casm_search?: boolean;
  dns_query_plugin?: boolean;
  skip_scan_cdn_ip?: boolean;
  nuclei_scan?: boolean;
  findvhost?: boolean;
  web_info_hunter?: boolean;
}

interface Task {
  _id: string;
  name: string;
  target: string;
  status: string;
  options: TaskOptions;
  statistic?: {
    site_cnt?: number;
    domain_cnt?: number;
    wih_cnt?: number;
  };
}

interface AssetScope {
  _id: string;
  name: string;
}

// 表单引用
const taskFormRef = ref<any>(null);

// 控制弹窗显示
const createTaskModalVisible = ref(false);
const confirmLoading = ref(false);
const syncTaskModalVisible = ref(false);
const taskOptionsModalVisible = ref(false);
const confirmSyncLoading = ref(false);

// 初始化选中行的数组
const selectedRowKeys = ref<string[]>([]);

// 任务表单数据
const taskForm = reactive<TaskForm>({
  name: '',
  target: '',
  domain_brute_type: 'big',
  port_scan_type: 'top100',
  domain_brute: true,
  alt_dns: true,
  dns_query_plugin: true,
  casm_search: true,
  port_scan: true,
  service_detection: true,
  os_detection: true,
  ssl_cert: true,
  skip_scan_cdn_ip: true,
  site_identify: true,
  search_engines: true,
  site_spider: false,
  site_capture: true,
  file_leak: true,
  findvhost: true,
  nuclei_scan: true,
  web_info_hunter: true
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1, max: 50, message: '任务名称长度应为1-50个字符', trigger: 'blur' }
  ],
  target: [
    { required: true, message: '请输入目标IP/域名', trigger: 'blur' }
  ],
  domain_brute_type: [
    { required: true, message: '请选择域名爆破类型', trigger: 'change' }
  ],
  port_scan_type: [
    { required: true, message: '请选择端口扫描类型', trigger: 'change' }
  ]
};

// 查询参数
const queryParams = reactive({
  name: '',
  target: '',
  status: '',
  task_tag: '',
  'options.domain_brute_type': '',
  'options.port_scan_type': '',
  'options.domain_brute': '',
  'options.port_scan': '',
  siteCountCompare: '',
  siteCountValue: null,
  domainCountCompare: '',
  domainCountValue: null,
  wihCountCompare: '',
  wihCountValue: null
});

// 任务列表数据
const taskList = ref<Task[]>([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// 资产组数据
const assetScopes = ref<AssetScope[]>([]);
const scopeLoading = ref(false);
const selectedScopeId = ref<string | null>(null);

// 当前任务选项
const currentTaskOptions = reactive<TaskOptions>({});

// 显示高级搜索
const showAdvanced = ref(false);

// 表格列配置
const columns: TableColumnsType = [
  { 
    title: '任务名称', 
    dataIndex: 'name', 
    key: 'name', 
    ellipsis: true,
    resizable: true,
    width: 150
  },
  { 
    title: '任务目标', 
    dataIndex: 'target', 
    key: 'target', 
    ellipsis: true,
    resizable: true,
    width: 200 
  },
  { 
    title: '任务状态', 
    dataIndex: 'status', 
    key: 'status', 
    width: 120,
    resizable: true 
  },
  { 
    title: '任务选项', 
    dataIndex: 'options', 
    key: 'options',
    resizable: true,
    width: 200
  },
  { 
    title: '统计数据', 
    dataIndex: 'statistic', 
    key: 'statistic', 
    width: 100,
    resizable: true
  },
  { 
    title: '操作', 
    dataIndex: 'action', 
    key: 'action', 
    width: 210, 
    fixed: 'right',
    align: 'center'
  }
];

// 可调整列宽表格组件
const VueResizeableHeader = (props: any) => {
  let dragging = false;
  let startX = 0;
  let startWidth = 0;
  let column: any = null;
  let table: HTMLElement | null = null;

  const handleMousedown = (e: MouseEvent, col: any) => {
    dragging = true;
    startX = e.clientX;
    column = col;
    startWidth = parseInt(col.width || col.minWidth || 80);

    // 查找表格DOM元素
    let currentEle = e.target as HTMLElement;
    while (currentEle && currentEle.tagName !== 'TABLE') {
      currentEle = currentEle.parentElement as HTMLElement;
    }
    table = currentEle;
    
    // 添加全局事件监听
    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('mouseup', handleMouseup);
    
    // 阻止默认行为和事件冒泡
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMousemove = (e: MouseEvent) => {
    if (!dragging) return;
    // 计算宽度变化
    const offset = e.clientX - startX;
    const newWidth = Math.max(startWidth + offset, 50);
    
    if (column) {
      column.width = newWidth;
      
      if (table) {
        // 更新表格宽度
        const tableWidth = parseInt(table.style.width || '0');
        if (tableWidth) {
          table.style.width = `${tableWidth + offset}px`;
        }
      }
    }
  };

  const handleMouseup = () => {
    dragging = false;
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  };

  // 在组件销毁时移除事件监听
  const onBeforeUnmount = () => {
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  };

  // 创建拖拽把手
  const renderResizeHandle = (col: any) => {
    if (!col) return null;
    if (col.resizable !== false) {
      return h('span', {
        class: 'resize-handle',
        onClick: (e: MouseEvent) => { e.stopPropagation(); },
        onMousedown: (e: MouseEvent) => { handleMousedown(e, col); }
      });
    }
    return null;
  };

  // 渲染表头
  const renderHeader = (props: any) => {
    const col = props.column;
    const resizeHandle = renderResizeHandle(col);
    
    return h('th', {
      ...props,
      class: `${props.class || ''} resizable-column`,
    }, [
      h('div', { class: 'ant-table-header-content' }, props.children),
      resizeHandle
    ]);
  };

  return renderHeader(props);
};

// 注册可调整列宽组件
const resizableComponents = {
  header: {
    cell: VueResizeableHeader
  }
};

// 显示创建任务弹窗
const showCreateTaskModal = () => {
  console.log('点击了新建任务按钮');
  createTaskModalVisible.value = true;
};

// 处理取消
const handleCancel = () => {
  createTaskModalVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  if (taskFormRef.value) {
    taskFormRef.value.resetFields();
  }
};

// 处理创建任务
const handleCreateTask = () => {
  if (!taskFormRef.value) {
    console.error('表单引用不存在');
    return;
  }
  
  taskFormRef.value.validate()
    .then(() => {
      confirmLoading.value = true;
      
      // 重构提交的数据结构，将选项集中到options对象中
      const taskData = {
        name: taskForm.name,
        target: taskForm.target,
        options: {
          domain_brute_type: taskForm.domain_brute_type,
          port_scan_type: taskForm.port_scan_type,
          domain_brute: taskForm.domain_brute,
          alt_dns: taskForm.alt_dns,
          dns_query_plugin: taskForm.dns_query_plugin,
          casm_search: taskForm.casm_search,
          port_scan: taskForm.port_scan,
          service_detection: taskForm.service_detection,
          os_detection: taskForm.os_detection,
          ssl_cert: taskForm.ssl_cert,
          skip_scan_cdn_ip: taskForm.skip_scan_cdn_ip,
          site_identify: taskForm.site_identify,
          search_engines: taskForm.search_engines,
          site_spider: taskForm.site_spider,
          site_capture: taskForm.site_capture,
          file_leak: taskForm.file_leak,
          findvhost: taskForm.findvhost,
          nuclei_scan: taskForm.nuclei_scan,
          web_info_hunter: taskForm.web_info_hunter
        }
      };
      
      console.log('提交表单数据:', JSON.stringify(taskData));
      
      // 从localStorage获取认证Token
      const token = localStorage.getItem('Token');
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录');
        confirmLoading.value = false;
        return;
      }
      
      // 发送API请求
      return fetch('/api/task/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token
        },
        body: JSON.stringify(taskData)
      });
    })
    .then((response: Response | undefined) => {
      if (!response) return; // 如果前面的逻辑返回了，这里就跳过
      if (!response.ok) {
        return response.json().then((err: ApiResponse<any>) => {
          throw new Error(err.message || '网络请求失败');
        }).catch(() => {
          throw new Error(`请求失败 (${response.status})`);
        });
      }
      return response.json();
    })
    .then((data: ApiResponse<any> | undefined) => {
      if (!data) return; // 如果前面的逻辑返回了，这里就跳过
      if (data.code === 401) {
        message.error('登录已过期，请重新登录');
        return;
      }
      
      message.success('创建任务成功');
      createTaskModalVisible.value = false;
      resetForm();
      fetchTaskList();
    })
    .catch((error: Error) => {
      message.error('创建任务失败: ' + error.message);
    })
    .then(() => {
      confirmLoading.value = false;
    });
};

// 显示同步任务弹窗
const showSyncTaskModal = (record: Task) => {
  selectedScopeId.value = null;
  syncTaskModalVisible.value = true;
};

// 处理同步任务
const handleSyncTask = () => {
  if (!selectedScopeId.value) {
    message.error('请选择资产组');
    return;
  }
  
  confirmSyncLoading.value = true;
  
  // 发送API请求
  fetch(`/api/task/sync/${selectedScopeId.value}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ taskId: selectedRowKeys.value })
  })
  .then((response: Response) => {
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    return response.json();
  })
  .then((data: ApiResponse<any>) => {
    message.success('同步任务成功');
    syncTaskModalVisible.value = false;
  })
  .catch((error: Error) => {
    message.error('同步任务失败: ' + error.message);
  })
  .then(() => {
    confirmSyncLoading.value = false;
  });
};

// 显示任务选项详情弹窗
const showTaskOptions = (record: Task) => {
  Object.assign(currentTaskOptions, record.options);
  taskOptionsModalVisible.value = true;
};

// 处理查询
const handleQuery = () => {
  fetchTaskList(1, pagination.pageSize);
};

// 重置查询
const resetQuery = () => {
  Object.keys(queryParams).forEach((key: string) => {
    (queryParams as any)[key] = '';
  });
  queryParams.siteCountValue = null;
  queryParams.domainCountValue = null;
  queryParams.wihCountValue = null;
};

// 切换高级搜索
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value;
};

// 表格选择变化
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

// 获取任务列表
const fetchTaskList = (page: number = pagination.current, pageSize: number = pagination.pageSize) => {
  loading.value = true;
  
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    loading.value = false;
    return;
  }
  
  // 构建查询参数
  const queryObject: any = {
    page,
    size: pageSize
  };
  
  // 添加基本筛选条件（仅添加有值的参数）
  if (queryParams.name?.trim()) queryObject.name = queryParams.name.trim(); // 使用name而不是query
  if (queryParams.target?.trim()) queryObject.target = queryParams.target.trim();
  if (queryParams.status) queryObject.status = queryParams.status;
  if (queryParams.task_tag) queryObject.task_tag = queryParams.task_tag;
  
  // 添加选项过滤条件，只添加非空值
  const options: any = {};
  if (queryParams['options.domain_brute_type']) {
    options.domain_brute_type = queryParams['options.domain_brute_type'];
  }
  if (queryParams['options.port_scan_type']) {
    options.port_scan_type = queryParams['options.port_scan_type'];
  }
  if (queryParams['options.domain_brute'] !== undefined && queryParams['options.domain_brute'] !== '') {
    options.domain_brute = queryParams['options.domain_brute'];
  }
  if (queryParams['options.port_scan'] !== undefined && queryParams['options.port_scan'] !== '') {
    options.port_scan = queryParams['options.port_scan'];
  }

  // 只有当options有值时才添加到查询对象中
  if (Object.keys(options).length > 0) {
    queryObject.options = options;
  }
  
  // 添加统计数据过滤条件
  if (queryParams.siteCountCompare && queryParams.siteCountValue !== null) {
    switch (queryParams.siteCountCompare) {
      case 'eq':
        queryObject['statistic.site_cnt'] = queryParams.siteCountValue;
        break;
      case 'gt':
        queryObject['statistic.site_cnt__gt'] = queryParams.siteCountValue;
        break;
      case 'lt':
        queryObject['statistic.site_cnt__lt'] = queryParams.siteCountValue;
        break;
    }
  }

  if (queryParams.domainCountCompare && queryParams.domainCountValue !== null) {
    switch (queryParams.domainCountCompare) {
      case 'eq':
        queryObject['statistic.domain_cnt'] = queryParams.domainCountValue;
        break;
      case 'gt':
        queryObject['statistic.domain_cnt__gt'] = queryParams.domainCountValue;
        break;
      case 'lt':
        queryObject['statistic.domain_cnt__lt'] = queryParams.domainCountValue;
        break;
    }
  }

  if (queryParams.wihCountCompare && queryParams.wihCountValue !== null) {
    switch (queryParams.wihCountCompare) {
      case 'eq':
        queryObject['statistic.wih_cnt'] = queryParams.wihCountValue;
        break;
      case 'gt':
        queryObject['statistic.wih_cnt__gt'] = queryParams.wihCountValue;
        break;
      case 'lt':
        queryObject['statistic.wih_cnt__lt'] = queryParams.wihCountValue;
        break;
    }
  }
  
  // 构建查询字符串，过滤掉空值参数
  const params = new URLSearchParams();
  Object.entries(queryObject).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        params.append(key, value ? 'true' : 'false');
      } else if (typeof value === 'object') {
        // 处理嵌套对象（如options）
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  console.log('Task list query params:', params.toString());
  
  // 发送请求
  fetch(`/api/task/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    }
  })
  .then((response: Response) => {
    if (!response.ok && response.status !== 401) {
      return response.json().then((err: ApiResponse<any>) => {
        throw new Error(err.message || `请求失败 (${response.status})`);
      }).catch(() => {
        throw new Error(`请求失败 (${response.status})`);
      });
    }
    return response.json();
  })
  .then((data: ApiResponse<Task>) => {
    console.log('API返回数据:', data);
    
    if (data.code === 401) {
      message.error('登录已过期，请重新登录');
      localStorage.removeItem('Token');
      localStorage.removeItem('TokenTime');
      localStorage.removeItem('username');
      return;
    }
    
    if (data.code !== 200) {
      throw new Error(data.message || '获取任务列表失败');
    }
    
    taskList.value = data.items || [];
    pagination.total = data.total || 0;
    pagination.current = page;
    pagination.pageSize = pageSize;
  })
  .catch((error: Error) => {
    console.error('获取任务列表错误:', error);
    message.error('获取任务列表失败: ' + error.message);
    taskList.value = [];
  })
  .then(() => {
    loading.value = false;
  });
};

// 处理表格分页、排序、过滤
const handleTableChange = (pag: any, filters: any, sorter: any) => {
  fetchTaskList(pag.current, pag.pageSize);
};

// 获取任务状态颜色
const getStatusColor = (status: string) => {
  // 如果状态包含特定服务名称，则视为running状态
  if (status !== 'waiting' && 
      status !== 'done' && 
      status !== 'stop' && 
      status !== 'error') {
    return 'green'; // 各种运行中状态都显示为绿色
  }
  
  switch (status) {
    case 'waiting':
      return 'blue';
    case 'done':
      return 'gray';
    case 'stop':
      return 'red';
    case 'error':
      return 'orange';
    default:
      return 'default';
  }
};

// 获取任务状态文本
const getStatusText = (status: string) => {
  // 如果状态不是基本状态之一，则为运行中的具体状态
  if (status !== 'waiting' && 
      status !== 'done' && 
      status !== 'stop' && 
      status !== 'error') {
    return `运行中: ${status}`; // 显示具体的运行状态
  }
  
  switch (status) {
    case 'waiting':
      return '等待中';
    case 'done':
      return '已完成';
    case 'stop':
      return '已停止';
    case 'error':
      return '失败';
    default:
      return '未知';
  }
};

// 截断文本
const truncateText = (text: string, length: number) => {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + '...';
};

// 显示任务详情
const router = useRouter();
const showTaskDetail = (record: Task) => {
  router.push(`/task/detail/${record._id}`);
};

// 停止单个任务
const stopTask = (record: Task) => {
  Modal.confirm({
    title: '确认停止',
    content: `确定要停止任务"${record.name}"吗？`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 获取认证Token
      const token = localStorage.getItem('Token');
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录');
        return;
      }
      
      // 显示加载状态
      message.loading('正在停止任务...');
      
      // 发送停止请求
      fetch(`/api/task/stop/${record._id}`, {
        method: 'GET',
        headers: {
          'Token': token
        }
      })
      .then((response: Response) => {
        if (!response.ok) {
          return response.json().then((err: ApiResponse<any>) => {
            throw new Error(err.message || '网络请求失败');
          }).catch(() => {
            throw new Error(`请求失败 (${response.status})`);
          });
        }
        return response.json();
      })
      .then((data: ApiResponse<any>) => {
        if (data.code === 401) {
          message.error('登录已过期，请重新登录');
          return;
        }
        
        if (data.code === 102) {
          message.warning('未找到Celery ID，任务可能尚未开始执行');
          fetchTaskList(); // 刷新任务列表
          return;
        }
        
        if (data.code === 103) {
          message.info('任务已完成，无需停止');
          return;
        }
        
        if (data.code !== 200) {
          throw new Error(data.message || '停止任务失败');
        }
        
        message.success('停止任务成功');
        // 刷新任务列表
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('停止任务失败: ' + error.message);
        console.error('停止任务错误:', error);
      });
    }
  });
};

// 假设有一个函数用于重启任务
const restartTask = (record: Task) => {
  console.log('重启任务:', record);
};

// 删除单个任务
const deleteTask = (record: Task) => {
  // 如果任务状态是"等待中"，先停止任务
  if (record.status === 'waiting') {
    // 显示确认对话框
    Modal.confirm({
      title: '停止并删除任务',
      content: `任务"${record.name}"处于等待中状态，需要先停止才能删除。确定要停止并删除吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        // 先停止任务
        stopAndDeleteTask(record);
      }
    });
  } else {
    // 直接显示删除确认框
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${record.name}"吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        performDeleteTask(record._id);
      }
    });
  }
};

// 停止并删除任务
const stopAndDeleteTask = (record: Task) => {
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  // 发送停止请求
  fetch(`/api/task/stop/${record._id}`, {
    method: 'GET',
    headers: {
      'Token': token
    }
  })
  .then((response: Response) => {
    if (!response.ok) {
      return response.json().then((err: ApiResponse<any>) => {
        throw new Error(err.message || '网络请求失败');
      }).catch(() => {
        throw new Error(`请求失败 (${response.status})`);
      });
    }
    return response.json();
  })
  .then((data: ApiResponse<any>) => {
    if (data.code === 200) {
      // 停止成功后，执行删除操作
      message.success('任务已停止，正在删除...');
      setTimeout(() => {
        performDeleteTask(record._id);
      }, 1000); // 等待1秒确保任务状态更新
    } else {
      throw new Error(data.message || '停止任务失败');
    }
  })
  .catch((error: Error) => {
    message.error('停止任务失败: ' + error.message);
  });
};

// 执行删除任务
const performDeleteTask = (taskId: string) => {
  // 获取认证Token
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  // 发送删除请求
  fetch('/api/task/delete/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    },
    body: JSON.stringify({
      task_id: [taskId], // 后端API要求传递数组格式
      del_task_data: false   // 默认不删除关联数据
    })
  })
  .then((response: Response) => {
    if (!response.ok) {
      return response.json().then((err: ApiResponse<any>) => {
        throw new Error(err.message || '网络请求失败');
      }).catch(() => {
        throw new Error(`请求失败 (${response.status})`);
      });
    }
    return response.json();
  })
  .then((data: ApiResponse<any>) => {
    if (data.code === 401) {
      message.error('登录已过期，请重新登录');
      return;
    }
    
    if (data.code !== 200) {
      throw new Error(data.message || '删除任务失败');
    }
    
    message.success('删除任务成功');
    // 刷新任务列表
    fetchTaskList();
  })
  .catch((error: Error) => {
    message.error('删除任务失败: ' + error.message);
    console.error('删除任务错误:', error);
  });
};

// 处理批量停止任务
const handleBatchStop = () => {
  console.log('批量停止任务:', selectedRowKeys.value);
  
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要停止的任务');
    return;
  }
  
  // 显示确认对话框
  Modal.confirm({
    title: '确认批量停止',
    content: `确定要停止已选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 获取认证Token
      const token = localStorage.getItem('Token');
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录');
        return;
      }
      
      // 显示加载状态
      message.loading('正在停止任务...');
      
      // 发送批量停止请求
      fetch('/api/task/batch_stop/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token
        },
        body: JSON.stringify({
          task_id: selectedRowKeys.value // 后端API要求传递任务ID数组
        })
      })
      .then((response: Response) => {
        if (!response.ok) {
          return response.json().then((err: ApiResponse<any>) => {
            throw new Error(err.message || '网络请求失败');
          }).catch(() => {
            throw new Error(`请求失败 (${response.status})`);
          });
        }
        return response.json();
      })
      .then((data: ApiResponse<any>) => {
        if (data.code === 401) {
          message.error('登录已过期，请重新登录');
          return;
        }
        
        if (data.code !== 200) {
          throw new Error(data.message || '批量停止任务失败');
        }
        
        message.success('批量停止任务成功');
        // 清空选中的行
        selectedRowKeys.value = [];
        // 刷新任务列表
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('批量停止任务失败: ' + error.message);
        console.error('批量停止任务错误:', error);
      });
    }
  });
};

// 处理批量删除任务
const handleBatchDelete = () => {
  console.log('批量删除任务:', selectedRowKeys.value);
  
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的任务');
    return;
  }
  
  // 检查是否有正在运行或等待中的任务
  const runningTasks = taskList.value.filter(task => 
    selectedRowKeys.value.includes(task._id) && 
    (task.status === 'waiting' || 
     (task.status !== 'done' && task.status !== 'stop' && task.status !== 'error'))
  );
  
  if (runningTasks.length > 0) {
    // 如果有运行中的任务，需要先停止
    Modal.confirm({
      title: '停止并删除任务',
      content: `选中的任务中有 ${runningTasks.length} 个正在运行或等待中，需要先停止这些任务。确定要停止并删除所选任务吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        // 先停止任务，再删除
        stopAndThenDeleteBatch(selectedRowKeys.value);
      }
    });
  } else {
    // 没有运行中的任务，可以直接删除
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除已选中的 ${selectedRowKeys.value.length} 个任务吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        performBatchDelete(selectedRowKeys.value);
      }
    });
  }
};

// 先停止然后批量删除任务
const stopAndThenDeleteBatch = (taskIds: string[]) => {
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  // 显示加载状态
  message.loading('正在停止任务...');
  
  // 发送批量停止请求
  fetch('/api/task/batch_stop/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    },
    body: JSON.stringify({
      task_id: taskIds
    })
  })
  .then((response: Response) => {
    if (!response.ok) {
      return response.json().then((err: ApiResponse<any>) => {
        throw new Error(err.message || '网络请求失败');
      }).catch(() => {
        throw new Error(`请求失败 (${response.status})`);
      });
    }
    return response.json();
  })
  .then((data: ApiResponse<any>) => {
    if (data.code !== 200) {
      throw new Error(data.message || '批量停止任务失败');
    }
    
    message.success('任务已停止，正在删除...');
    
    // 等待一段时间确保任务状态更新
    setTimeout(() => {
      performBatchDelete(taskIds);
    }, 1500);
  })
  .catch((error: Error) => {
    message.error('批量停止任务失败: ' + error.message);
    console.error('批量停止任务错误:', error);
  });
};

// 执行批量删除
const performBatchDelete = (taskIds: string[]) => {
  // 获取认证Token
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  // 显示加载状态
  message.loading('正在删除任务...');
  
  // 发送批量删除请求
  fetch('/api/task/delete/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    },
    body: JSON.stringify({
      task_id: taskIds, // 后端API要求传递任务ID数组
      del_task_data: false // 默认不删除关联数据
    })
  })
  .then((response: Response) => {
    if (!response.ok) {
      return response.json().then((err: ApiResponse<any>) => {
        throw new Error(err.message || '网络请求失败');
      }).catch(() => {
        throw new Error(`请求失败 (${response.status})`);
      });
    }
    return response.json();
  })
  .then((data: ApiResponse<any>) => {
    if (data.code === 401) {
      message.error('登录已过期，请重新登录');
      return;
    }
    
    if (data.code === 104) {
      // 处理任务运行中的错误
      message.warning('部分任务正在运行中，无法删除');
      fetchTaskList(); // 刷新列表以显示最新状态
      return;
    }
    
    if (data.code !== 200) {
      throw new Error(data.message || '批量删除任务失败');
    }
    
    message.success('批量删除任务成功');
    // 清空选中的行
    selectedRowKeys.value = [];
    // 刷新任务列表
    fetchTaskList();
  })
  .catch((error: Error) => {
    message.error('批量删除任务失败: ' + error.message);
    console.error('批量删除任务错误:', error);
  });
};

// 假设有一个函数用于批量重启任务
const handleBatchRestart = () => {
  console.log('批量重启任务:', selectedRowKeys.value);
};

// 假设有一个函数用于过滤资产组选项
const filterScopeOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 导出任务
const exportTask = (record: Task) => {
  // 获取认证Token
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  // 构建下载链接
  const url = `/api/task/export/${record._id}`;
  
  // 创建一个隐藏的a标签来下载文件
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `task_${record.name}_${record._id}.json`;
  
  // 添加token到header
  fetch(url, {
    headers: {
      'Token': token
    }
  })
  .then((response: Response) => response.blob())
  .then((blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  })
  .catch((error: Error) => {
    message.error('导出任务失败: ' + error.message);
  });
};

// 组件挂载时调用
onMounted(() => {
  fetchTaskList();
});
</script>

<style>
@import '@/assets/styles/views/task-manage.css';
</style>
