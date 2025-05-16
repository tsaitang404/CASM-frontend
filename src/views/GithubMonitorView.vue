<template>
  <div class="github-monitor-container">
    <!-- 搜索区域 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="监控名称">
          <a-input 
            v-model:value="searchForm.name" 
            placeholder="请输入监控名称" 
            allow-clear 
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input 
            v-model:value="searchForm.keyword" 
            placeholder="请输入关键词" 
            allow-clear 
            @pressEnter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="监控状态">
          <a-select 
            v-model:value="searchForm.status" 
            placeholder="请选择状态" 
            style="width: 120px" 
            allow-clear
          >
            <a-select-option value="running">运行中</a-select-option>
            <a-select-option value="stopped">已停止</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- 操作按钮区域 -->
    <div class="operation-row" style="margin: 16px 0;">
      <a-space>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          创建监控
        </a-button>
        <a-button 
          danger 
          :disabled="!hasSelected" 
          @click="showDeleteConfirm"
        >
          <template #icon><DeleteOutlined /></template>
          删除监控
        </a-button>
        <a-button 
          :disabled="!hasSelected" 
          @click="handleStop"
        >
          <template #icon><PauseCircleOutlined /></template>
          停止监控
        </a-button>
        <a-button 
          :disabled="!hasSelected" 
          @click="handleRecover"
        >
          <template #icon><PlayCircleOutlined /></template>
          恢复监控
        </a-button>
        <a-button @click="refreshData">
          <template #icon><SyncOutlined /></template>
          刷新
        </a-button>
      </a-space>
      <a-alert
        v-if="hasSelected"
        :message="`已选择 ${selectedRowKeys.length} 项`"
        type="info"
        style="margin-top: 12px"
        show-icon
      />
    </div>
    
    <!-- 监控任务表格 -->
    <a-card>
      <a-table
        :dataSource="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        rowKey="_id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- 状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <!-- 日期列 -->
          <template v-if="column.dataIndex === 'last_time' || column.dataIndex === 'next_time' || column.dataIndex === 'create_time'">
            <span>{{ formatDate(record[column.dataIndex]) }}</span>
          </template>
          
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button 
                type="link" 
                size="small"
                @click="handleViewResults(record)"
              >
                查看结果
              </a-button>
              <a-button 
                type="link" 
                size="small"
                @click="handleEdit(record)"
              >
                编辑
              </a-button>
              <a-button 
                v-if="record.status === 'running'"
                type="link" 
                size="small" 
                danger
                @click="handleStopSingle(record)"
              >
                停止
              </a-button>
              <a-button 
                v-if="record.status === 'stopped'"
                type="link" 
                size="small"
                @click="handleRecoverSingle(record)"
              >
                恢复
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 创建/编辑监控弹窗 -->
    <a-modal
      v-model:open="createModalVisible"
      :title="isEdit ? '编辑监控' : '创建监控'"
      @ok="handleCreateSubmit"
      :confirmLoading="submitLoading"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item name="name" label="监控名称" required>
          <a-input 
            v-model:value="formData.name" 
            placeholder="请输入监控名称" 
            allow-clear
          />
        </a-form-item>
        
        <a-form-item name="keyword" label="搜索关键词" required>
          <a-textarea 
            v-model:value="formData.keyword" 
            placeholder="请输入GitHub搜索关键词，如: password OR secret OR token" 
            :rows="3"
            allow-clear
          />
        </a-form-item>
        
        <a-form-item name="scope" label="搜索范围">
          <a-input 
            v-model:value="formData.scope" 
            placeholder="请输入搜索范围，如：org:example-org" 
            allow-clear
          />
        </a-form-item>
        
        <a-form-item name="cron" label="Cron表达式" required>
          <a-input 
            v-model:value="formData.cron" 
            placeholder="请输入Cron表达式，如: 0 0 */12 * * *" 
            allow-clear
          />
          <div class="cron-helper">
            <a-select 
              placeholder="选择常用Cron表达式" 
              style="width: 150px" 
              @change="handleCronSelect"
            >
              <a-select-option value="0 0 */1 * * *">每1小时</a-select-option>
              <a-select-option value="0 0 */4 * * *">每4小时</a-select-option>
              <a-select-option value="0 0 */12 * * *">每12小时</a-select-option>
              <a-select-option value="0 0 0 * * *">每天凌晨</a-select-option>
              <a-select-option value="0 0 0 */3 * *">每3天</a-select-option>
              <a-select-option value="0 0 0 * * 1">每周一</a-select-option>
            </a-select>
            <span class="cron-tip">* 秒 分 时 日 月 星期</span>
          </div>
        </a-form-item>
        
        <a-form-item name="description" label="描述">
          <a-input 
            v-model:value="formData.description" 
            placeholder="请输入监控描述" 
            allow-clear
          />
        </a-form-item>
        
        <a-form-item name="token_id" label="GitHub Token">
          <a-select 
            v-model:value="formData.token_id" 
            placeholder="请选择Token" 
            loading={tokensLoading}
            allow-clear
          >
            <a-select-option value="">使用系统默认Token</a-select-option>
            <a-select-option v-for="token in tokens" :key="token._id" :value="token._id">
              {{ token.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 查看结果弹窗 -->
    <a-modal
      v-model:open="resultsModalVisible"
      title="监控结果"
      :width="800"
      :footer="null"
    >
      <a-spin :spinning="resultsLoading">
        <a-form layout="inline" :model="resultsSearchForm" style="margin-bottom: 16px">
          <a-form-item label="仓库">
            <a-input 
              v-model:value="resultsSearchForm.repo" 
              placeholder="请输入仓库名" 
              allow-clear 
              @pressEnter="fetchResults"
            />
          </a-form-item>
          <a-form-item label="内容关键词">
            <a-input 
              v-model:value="resultsSearchForm.content" 
              placeholder="请输入内容关键词" 
              allow-clear 
              @pressEnter="fetchResults"
            />
          </a-form-item>
          <a-form-item label="状态">
            <a-select 
              v-model:value="resultsSearchForm.status" 
              placeholder="请选择状态" 
              style="width: 120px" 
              allow-clear
            >
              <a-select-option value="read">已读</a-select-option>
              <a-select-option value="unread">未读</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="fetchResults">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
          </a-form-item>
        </a-form>
        
        <a-table
          :dataSource="resultsData"
          :columns="resultsColumns"
          :loading="resultsLoading"
          :pagination="resultsPagination"
          @change="handleResultsTableChange"
          rowKey="_id"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <!-- URL列 -->
            <template v-if="column.dataIndex === 'url'">
              <a :href="record.url" target="_blank">{{ record.url }}</a>
            </template>
            
            <!-- 内容列 -->
            <template v-if="column.dataIndex === 'content'">
              <div class="content-preview">
                <pre>{{ record.content }}</pre>
              </div>
            </template>
            
            <!-- 匹配列 -->
            <template v-if="column.dataIndex === 'matches'">
              <div>
                <a-tag v-for="match in record.matches" :key="match">
                  {{ match }}
                </a-tag>
              </div>
            </template>
            
            <!-- 状态列 -->
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="record.status === 'unread' ? 'red' : 'default'">
                {{ record.status === 'unread' ? '未读' : '已读' }}
              </a-tag>
            </template>
            
            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-button 
                type="link" 
                size="small"
                @click="handleMarkAsRead(record)"
              >
                标记为已读
              </a-button>
            </template>
          </template>
        </a-table>
      </a-spin>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GithubMonitorView'
});
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import http from '../plugins/http';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SyncOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// 类型定义
interface GithubMonitor {
  _id: string;
  name: string;
  keyword: string;
  scope?: string;
  status: string;
  cron: string;
  next_time?: string;
  last_time?: string;
  description?: string;
  create_time: string;
  creator: string;
  token_id?: string;
}

interface GithubToken {
  _id: string;
  name: string;
  token: string;
}

interface GithubResult {
  _id: string;
  monitor_id: string;
  repo: string;
  path: string;
  url: string;
  content: string;
  matches: string[];
  status: string;
  find_time: string;
}

// 搜索表单数据
const searchForm = reactive({
  name: '',
  keyword: '',
  status: undefined as string | undefined,
});

// 表格相关
const loading = ref(false);
const tableData = ref<GithubMonitor[]>([]);
const selectedRowKeys = ref<string[]>([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 分页设置
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
});

// 表格列定义
const columns = [
  {
    title: '监控名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true
  },
  {
    title: '关键词',
    dataIndex: 'keyword',
    key: 'keyword',
    width: 200,
    ellipsis: true
  },
  {
    title: '搜索范围',
    dataIndex: 'scope',
    key: 'scope',
    width: 150,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: 'Cron表达式',
    dataIndex: 'cron',
    key: 'cron',
    width: 150
  },
  {
    title: '上次执行',
    dataIndex: 'last_time',
    key: 'last_time',
    width: 180
  },
  {
    title: '下次执行',
    dataIndex: 'next_time',
    key: 'next_time',
    width: 180
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200
  }
];

// 创建表单相关
const createModalVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const isEdit = ref(false);

const formData = reactive({
  _id: '',
  name: '',
  keyword: '',
  scope: '',
  cron: '',
  description: '',
  token_id: ''
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入监控名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为2-50个字符', trigger: 'blur' }
  ],
  keyword: [
    { required: true, message: '请输入搜索关键词', trigger: 'blur' }
  ],
  cron: [
    { required: true, message: '请输入Cron表达式', trigger: 'blur' }
  ]
};

// Token相关
const tokens = ref<GithubToken[]>([]);
const tokensLoading = ref(false);

// 结果查看相关
const resultsModalVisible = ref(false);
const resultsLoading = ref(false);
const currentMonitorId = ref('');
const resultsData = ref<GithubResult[]>([]);

// 结果搜索表单
const resultsSearchForm = reactive({
  repo: '',
  content: '',
  status: undefined as string | undefined,
});

// 结果分页设置
const resultsPagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
});

// 结果表格列定义
const resultsColumns = [
  {
    title: '仓库',
    dataIndex: 'repo',
    key: 'repo',
    width: 150,
    ellipsis: true
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    width: 200,
    ellipsis: true
  },
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 200,
    ellipsis: true
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 250,
    ellipsis: true
  },
  {
    title: '匹配',
    dataIndex: 'matches',
    key: 'matches',
    width: 150
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '发现时间',
    dataIndex: 'find_time',
    key: 'find_time',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120
  }
];

// 初始化
onMounted(() => {
  fetchMonitors();
  fetchTokens();
});

// 获取监控任务列表
const fetchMonitors = async (params: any = {}) => {
  loading.value = true;
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (searchForm.name) queryParams.append('name', searchForm.name);
    if (searchForm.keyword) queryParams.append('keyword', searchForm.keyword);
    if (searchForm.status) queryParams.append('status', searchForm.status);
    
    const page = params.current || pagination.current;
    const size = params.pageSize || pagination.pageSize;
    queryParams.append('page', String(page));
    queryParams.append('size', String(size));
    
    const res = await http.get(`/github_scheduler/?${queryParams.toString()}`);
    if (res.data && res.data.code === 200) {
      // 直接从顶层获取items、total、page、size，而不是从data字段
      tableData.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = res.data.page || page;
      pagination.pageSize = res.data.size || size;
    } else {
      throw new Error(res.data?.message || '获取监控列表失败');
    }
  } catch (error) {
    console.error('获取GitHub监控列表失败:', error);
    message.error('获取监控列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取Token列表
const fetchTokens = async () => {
  tokensLoading.value = true;
  try {
    const res = await http.get('/github_task/');
    if (res.data && res.data.code === 200) {
      // 直接从顶层获取items，而不是从data.items
      tokens.value = res.data.items || [];
    } else {
      // 无需显示错误，使用空列表
      tokens.value = [];
    }
  } catch (error) {
    console.error('获取Token列表失败:', error);
    tokens.value = [];
  } finally {
    tokensLoading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  selectedRowKeys.value = []; // 清空选择
  fetchMonitors();
};

// 重置搜索条件
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    // @ts-ignore
    searchForm[key] = undefined;
  });
  pagination.current = 1;
  fetchMonitors();
};

// 刷新数据
const refreshData = () => {
  selectedRowKeys.value = [];
  fetchMonitors();
};

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  fetchMonitors({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

// 行选择变化
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

// 打开创建监控弹窗
const showCreateModal = () => {
  isEdit.value = false;
  // 重置表单
  Object.keys(formData).forEach(key => {
    // @ts-ignore
    formData[key] = key === '_id' ? '' : '';
  });
  // 下一次更新DOM后再打开弹窗
  setTimeout(() => {
    formRef.value?.resetFields();
    createModalVisible.value = true;
  }, 0);
};

// 打开编辑监控弹窗
const handleEdit = (record: GithubMonitor) => {
  isEdit.value = true;
  // 填充表单
  Object.keys(formData).forEach(key => {
    if (key in record) {
      // @ts-ignore
      formData[key] = record[key];
    }
  });
  // 打开弹窗
  createModalVisible.value = true;
};

// 提交创建/编辑
const handleCreateSubmit = async () => {
  try {
    // 表单验证
    await formRef.value?.validateFields();
    
    submitLoading.value = true;
    
    // 准备提交数据
    const submitData = { ...formData };
    
    let res;
    if (isEdit.value) {
      // 编辑模式，调用更新API
      const id = submitData._id;
      delete submitData.__id; // 删除ID字段，API不需要
      res = await http.put(`/github_scheduler/${id}`, submitData);
    } else {
      // 创建模式
      delete submitData._id; // 删除ID字段，API不需要
      res = await http.post('/github_scheduler/', submitData);
    }
    
    if (res.data && res.data.code === 200) {
      message.success(isEdit.value ? '编辑监控成功' : '创建监控成功');
      createModalVisible.value = false;
      fetchMonitors(); // 刷新数据
    } else {
      throw new Error(res.data?.message || (isEdit.value ? '编辑监控失败' : '创建监控失败'));
    }
  } catch (error: any) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    console.error(isEdit.value ? '编辑监控失败:' : '创建监控失败:', error);
    message.error(`${isEdit.value ? '编辑' : '创建'}监控失败: ${error.message || '未知错误'}`);
  } finally {
    submitLoading.value = false;
  }
};

// 显示删除确认
const showDeleteConfirm = () => {
  if (!hasSelected.value) return;
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个监控任务吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: handleDelete
  });
};

// 处理删除
const handleDelete = async () => {
  if (!hasSelected.value) return;
  
  try {
    const res = await http.post('/github_scheduler/delete/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      // 直接从顶层数据或通过_id数组长度获取删除数量
      message.success(`成功删除${res.data._id?.length || selectedRowKeys.value.length}个监控`);
      selectedRowKeys.value = [];
      fetchMonitors();
    } else {
      throw new Error(res.data?.message || '删除监控失败');
    }
  } catch (error) {
    console.error('删除监控失败:', error);
    message.error('删除监控失败');
  }
};

// 处理停止
const handleStop = async () => {
  if (!hasSelected.value) return;
  
  try {
    const res = await http.post('/github_scheduler/stop/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      // 直接从顶层数据或通过_id数组长度获取数量
      message.success(`成功停止${res.data._id?.length || selectedRowKeys.value.length}个监控`);
      fetchMonitors();
    } else {
      throw new Error(res.data?.message || '停止监控失败');
    }
  } catch (error) {
    console.error('停止监控失败:', error);
    message.error('停止监控失败');
  }
};

// 处理恢复
const handleRecover = async () => {
  if (!hasSelected.value) return;
  
  try {
    const res = await http.post('/github_scheduler/recover/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      // 直接从顶层数据或通过_id数组长度获取数量
      message.success(`成功恢复${res.data._id?.length || selectedRowKeys.value.length}个监控`);
      fetchMonitors();
    } else {
      throw new Error(res.data?.message || '恢复监控失败');
    }
  } catch (error) {
    console.error('恢复监控失败:', error);
    message.error('恢复监控失败');
  }
};

// 处理单个监控停止
const handleStopSingle = (record: GithubMonitor) => {
  selectedRowKeys.value = [record._id];
  handleStop();
};

// 处理单个监控恢复
const handleRecoverSingle = (record: GithubMonitor) => {
  selectedRowKeys.value = [record._id];
  handleRecover();
};

// 查看监控结果
const handleViewResults = (record: GithubMonitor) => {
  currentMonitorId.value = record._id;
  resultsSearchForm.repo = '';
  resultsSearchForm.content = '';
  resultsSearchForm.status = undefined;
  resultsPagination.current = 1;
  resultsModalVisible.value = true;
  fetchResults();
};

// 获取监控结果
const fetchResults = async (params: any = {}) => {
  if (!currentMonitorId.value) return;
  
  resultsLoading.value = true;
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    queryParams.append('monitor_id', currentMonitorId.value);
    if (resultsSearchForm.repo) queryParams.append('repo', resultsSearchForm.repo);
    if (resultsSearchForm.content) queryParams.append('content', resultsSearchForm.content);
    if (resultsSearchForm.status) queryParams.append('status', resultsSearchForm.status);
    
    const page = params.current || resultsPagination.current;
    const size = params.pageSize || resultsPagination.pageSize;
    queryParams.append('page', String(page));
    queryParams.append('size', String(size));
    
    const res = await http.get(`/github_monitor_result/?${queryParams.toString()}`);
    if (res.data && res.data.code === 200) {
      // 直接从顶层获取items、total、page等属性
      resultsData.value = res.data.items || [];
      resultsPagination.total = res.data.total || 0;
      resultsPagination.current = res.data.page || page;
      resultsPagination.pageSize = res.data.size || size;
    } else {
      throw new Error(res.data?.message || '获取监控结果失败');
    }
  } catch (error) {
    console.error('获取监控结果失败:', error);
    message.error('获取监控结果失败');
  } finally {
    resultsLoading.value = false;
  }
};

// 结果表格变化处理
const handleResultsTableChange = (pag: TablePaginationConfig) => {
  fetchResults({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

// 标记为已读
const handleMarkAsRead = async (record: GithubResult) => {
  try {
    const res = await http.post('/github_monitor_result/mark_as_read/', {
      _id: [record._id]
    });
    
    if (res.data && res.data.code === 200) {
      message.success('已标记为已读');
      // 更新当前结果状态
      const index = resultsData.value.findIndex(item => item._id === record._id);
      if (index !== -1) {
        resultsData.value[index].status = 'read';
        // 强制更新
        resultsData.value = [...resultsData.value];
      }
    } else {
      throw new Error(res.data?.message || '标记已读失败');
    }
  } catch (error) {
    console.error('标记已读失败:', error);
    message.error('标记已读失败');
  }
};

// Cron表达式选择
const handleCronSelect = (value: string) => {
  formData.cron = value;
};

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    return dateStr;
  }
};

// 状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'green';
    case 'stopped': return 'orange';
    default: return 'default';
  }
};

// 状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'running': return '运行中';
    case 'stopped': return '已停止';
    default: return status;
  }
};
</script>

<style scoped>
.github-monitor-container {
  padding: 24px;
}

.search-card {
  margin-bottom: 16px;
}

.operation-row {
  margin: 16px 0;
}

.cron-helper {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.cron-tip {
  margin-left: 12px;
  color: #999;
  font-size: 12px;
}

.content-preview {
  max-height: 80px;
  overflow-y: auto;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

:deep(.ant-table-row) pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
