<template>
  <div class="asset-monitor-container">
    <!-- 头部搜索区域 -->
    <div class="monitor-header">
      <a-card class="search-card">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="任务名称">
            <a-input
              v-model:value="searchForm.name"
              placeholder="请输入任务名称"
              allow-clear
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="任务目标">
            <a-input
              v-model:value="searchForm.target"
              placeholder="请输入任务目标"
              allow-clear
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="策略名称">
            <a-input
              v-model:value="searchForm.policy_name"
              placeholder="请输入策略名称"
              allow-clear
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="计划类型">
            <a-select
              v-model:value="searchForm.schedule_type"
              placeholder="请选择计划类型"
              style="width: 160px"
              allow-clear
            >
              <a-select-option value="future_scan">定时任务</a-select-option>
              <a-select-option value="recurrent_scan">周期任务</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="任务状态">
            <a-select
              v-model:value="searchForm.schedule_status"
              placeholder="请选择任务状态"
              style="width: 160px"
              allow-clear
            >
              <a-select-option value="scheduled">已排程</a-select-option>
              <a-select-option value="stop">已停止</a-select-option>
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
    </div>

    <!-- 监控统计信息卡片 -->
    <div class="monitor-stats">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <LinkOutlined /> 
                总任务数
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number">{{ statistics.totalTasks }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <CheckCircleOutlined /> 
                已排程任务
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number">{{ statistics.scheduledTasks }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <WarningOutlined /> 
                已停止任务
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number stat-warning">{{ statistics.stoppedTasks }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card>
            <template #title>
              <span class="stat-title">
                <ClockCircleOutlined /> 
                定时任务
              </span>
            </template>
            <div class="stat-content">
              <span class="stat-number">{{ statistics.futureTasks }}</span>
              <span class="stat-unit">个</span>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 操作按钮行 -->
    <div class="operation-row">
      <a-space>
        <a-button 
          type="primary" 
          :disabled="!hasSelected" 
          @click="showAddTagModal"
        >
          <template #icon><TagOutlined /></template>添加标签
        </a-button>
        <a-button 
          :disabled="!hasSelected" 
          @click="showDeleteTagModal"
        >
          <template #icon><TagsOutlined /></template>删除标签
        </a-button>
        <a-button 
          danger 
          :disabled="!hasSelected" 
          @click="showDeleteConfirm"
        >
          <template #icon><DeleteOutlined /></template>删除任务
        </a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleExportMenuClick">
              <a-menu-item key="save_result_set">保存为结果集</a-menu-item>
              <a-menu-item key="export_csv">导出为CSV</a-menu-item>
              <a-menu-item key="export_json">导出为JSON</a-menu-item>
            </a-menu>
          </template>
          <a-button>
            <template #icon><DownloadOutlined /></template>导出
            <DownOutlined />
          </a-button>
        </a-dropdown>
        <a-button @click="refreshData">
          <template #icon><SyncOutlined /></template>刷新
        </a-button>
      </a-space>
    </div>

    <!-- 站点监控列表 -->
    <a-card class="monitor-table">
      <a-table
        :dataSource="monitorData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <!-- 任务名称列显示带链接 -->
          <template v-if="column.dataIndex === 'name'">
            <a :href="`/task/${record._id}`" target="_blank">{{ record.name }}</a>
          </template>
          
          <!-- 状态列显示带颜色标记 -->
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <!-- 计划类型列显示文本 -->
          <template v-else-if="column.dataIndex === 'schedule_type'">
            <span>{{ getScheduleTypeText(record.schedule_type) }}</span>
          </template>
          
          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="handleViewDetails(record)">详情</a>
              <a @click="handleEditTags(record)">编辑标签</a>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="handleExportSingle(record)">导出</a-menu-item>
                    <a-menu-item danger @click="handleDeleteSingle(record)">删除</a-menu-item>
                  </a-menu>
                </template>
                <a>
                  更多 <DownOutlined />
                </a>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加标签弹窗 -->
    <a-modal
      v-model:open="tagModalVisible"
      title="添加标签"
      @ok="handleAddTagSubmit"
      :confirmLoading="tagLoading"
    >
      <a-form :model="tagForm">
        <a-form-item label="标签名称" name="tag">
          <a-input v-model:value="tagForm.tag" placeholder="请输入标签名称" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 删除标签弹窗 -->
    <a-modal
      v-model:open="deleteTagModalVisible"
      title="删除标签"
      @ok="handleDeleteTagSubmit"
      :confirmLoading="tagLoading"
    >
      <a-form :model="deleteTagForm">
        <a-form-item label="选择要删除的标签" name="tag">
          <a-select
            v-model:value="deleteTagForm.tag"
            placeholder="请选择要删除的标签"
            style="width: 100%"
          >
            <a-select-option v-for="tag in availableTags" :key="tag">
              {{ tag }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 保存结果集弹窗 -->
    <a-modal
      v-model:open="resultSetModalVisible"
      title="保存为结果集"
      @ok="handleSaveResultSetSubmit"
      :confirmLoading="resultSetLoading"
    >
      <a-form :model="resultSetForm">
        <a-form-item label="结果集名称" name="name">
          <a-input 
            v-model:value="resultSetForm.name" 
            placeholder="请输入结果集名称" 
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AssetMonitorView'
});
</script>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import http from '../plugins/http';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  TagOutlined,
  TagsOutlined,
  DeleteOutlined,
  SyncOutlined,
  DownOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue';

// 定义站点监控接口数据类型
interface MonitorSite {
  _id: string;
  name: string; // 计划任务名称
  target: string; // 任务目标
  task_tag: string; // 任务标签
  schedule_type: string; // 计划类型
  policy_id: string; // 策略ID
  policy_name: string; // 策略名称
  cron?: string; // Cron表达式(周期任务)
  start_date?: string; // 开始日期(定时任务)
  status: string; // 任务状态
  run_number?: number; // 已执行次数
  last_run_time?: number; // 上次执行时间戳
  last_run_date?: string; // 上次执行日期
  next_run_date?: string; // 下次执行日期
}

// 资产分组类型
interface AssetScope {
  _id: string;
  name: string;
  desc?: string;
}

// 搜索表单数据
const searchForm = reactive({
  name: '', // 计划任务名称
  target: '', // 任务目标
  policy_name: '', // 策略名称
  schedule_type: undefined as string | undefined, // 计划类型
  schedule_status: undefined as string | undefined, // 任务状态
  page: 1,
  size: 10,
  sort_field: undefined as string | undefined,
  sort_order: undefined as string | undefined
});

// 表格数据和加载状态
const monitorData = ref<MonitorSite[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);
const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// 资产分组数据
const assetScopes = ref<AssetScope[]>([]);
const scopeLoading = ref(false);

// 统计信息
const statistics = reactive({
  totalTasks: 0,
  scheduledTasks: 0,
  stoppedTasks: 0,
  futureTasks: 0 // 定时任务数量
});

// 分页设置
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
});

// 表格列定义
const columns = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    sorter: true,
    ellipsis: true,
    fixed: 'left'
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: 200,
    ellipsis: true
  },
  {
    title: '计划类型',
    dataIndex: 'schedule_type',
    key: 'schedule_type',
    width: 120,
  },
  {
    title: '策略名称',
    dataIndex: 'policy_name',
    key: 'policy_name',
    width: 160,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    sorter: true
  },
  {
    title: '执行次数',
    dataIndex: 'run_number',
    key: 'run_number',
    width: 100
  },
  {
    title: '上次执行',
    dataIndex: 'last_run_date',
    key: 'last_run_date',
    width: 180
  },
  {
    title: '下次执行',
    dataIndex: 'next_run_date',
    key: 'next_run_date',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200
  }
];

// 标签相关状态
const tagModalVisible = ref(false);
const deleteTagModalVisible = ref(false);
const tagLoading = ref(false);
const tagForm = reactive({
  tag: ''
});
const deleteTagForm = reactive({
  tag: ''
});
const availableTags = ref<string[]>([]);

// 结果集相关状态
const resultSetModalVisible = ref(false);
const resultSetLoading = ref(false);
const resultSetForm = reactive({
  name: `站点监控结果集-${new Date().toISOString().slice(0, 10)}`
});

// 初始化加载
onMounted(() => {
  fetchMonitorData();
  fetchAssetScopes();
});

// 获取资产分组列表
const fetchAssetScopes = async () => {
  scopeLoading.value = true;
  try {
    const res = await http.get('/asset_scope/?size=100');
    if (res.data && res.data.code === 200) {
      assetScopes.value = res.data.data?.items || [];
    } else {
      throw new Error(res.data?.message || '获取资产分组失败');
    }
  } catch (error) {
    console.error('获取资产分组失败:', error);
    message.error('获取资产分组失败');
  } finally {
    scopeLoading.value = false;
  }
};

// 获取站点监控数据
const fetchMonitorData = async (params: any = {}) => {
  loading.value = true;
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (searchForm.name) queryParams.append('name', searchForm.name);
    if (searchForm.target) queryParams.append('target', searchForm.target);
    if (searchForm.policy_name) queryParams.append('policy_name', searchForm.policy_name);
    if (searchForm.schedule_type) queryParams.append('schedule_type', searchForm.schedule_type);
    if (searchForm.schedule_status) queryParams.append('schedule_status', searchForm.schedule_status);
    
    const page = params.current || pagination.current;
    const size = params.pageSize || pagination.pageSize;
    queryParams.append('page', String(page));
    queryParams.append('size', String(size));
    
    if (searchForm.sort_field) {
      queryParams.append('sort_field', searchForm.sort_field);
      queryParams.append('sort_order', searchForm.sort_order || 'asc');
    }

    const res = await http.get(`/task_schedule/?${queryParams.toString()}`);
    if (res.data && res.data.code === 200) {
      // 直接从顶层结构中获取items, total, page, size
      monitorData.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = res.data.page || page;
      pagination.pageSize = res.data.size || size;
      
      // 更新统计信息
      updateStatistics(res.data);
    } else {
      throw new Error(res.data?.message || '获取监控数据失败');
    }
  } catch (error) {
    console.error('获取计划任务数据失败:', error);
    message.error('获取计划任务数据失败');
  } finally {
    loading.value = false;
  }
};

// 更新统计信息
const updateStatistics = (data: any) => {
  statistics.totalTasks = data.total || 0;
  
  // 计算不同状态的任务数量
  const items = data.items || [];
  let scheduledCount = 0;
  let stoppedCount = 0;
  let futureCount = 0;
  
  items.forEach((task: MonitorSite) => {
    if (task.status === 'scheduled') scheduledCount++;
    if (task.status === 'stop') stoppedCount++;
    if (task.schedule_type === 'future_scan') futureCount++;
  });
  
  statistics.scheduledTasks = scheduledCount;
  statistics.stoppedTasks = stoppedCount;
  statistics.futureTasks = futureCount;
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  selectedRowKeys.value = []; // 清空选择
  fetchMonitorData();
};

// 重置搜索条件
const handleReset = () => {
  searchForm.name = '';
  searchForm.target = '';
  searchForm.policy_name = '';
  searchForm.schedule_type = undefined;
  searchForm.schedule_status = undefined;
  searchForm.sort_field = undefined;
  searchForm.sort_order = undefined;
  pagination.current = 1;
  handleSearch();
};

// 表格变化事件处理
const handleTableChange = (pag: TablePaginationConfig, filters: any, sorter: any) => {
  // 处理排序
  if (sorter && sorter.field) {
    searchForm.sort_field = sorter.field as string;
    searchForm.sort_order = sorter.order === 'ascend' ? 'asc' : 'desc';
  } else {
    searchForm.sort_field = undefined;
    searchForm.sort_order = undefined;
  }
  
  fetchMonitorData({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

// 行选择变化处理
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

// 刷新数据
const refreshData = () => {
  fetchMonitorData();
};

// 显示添加标签对话框
const showAddTagModal = () => {
  tagForm.tag = '';
  tagModalVisible.value = true;
};

// 添加标签和删除标签API
const handleAddTagSubmit = async () => {
  if (!tagForm.tag.trim()) {
    message.error('请输入有效的标签');
    return;
  }
  
  tagLoading.value = true;
  try {
    const res = await http.post('/asset_site/add_tag/', {
      _id: selectedRowKeys.value,
      tag: tagForm.tag.trim()
    });
    
    if (res.data && res.data.code === 200) {
      message.success(`成功为${res.data.data.updated}个站点添加标签`);
      tagModalVisible.value = false;
      fetchMonitorData(); // 刷新数据
    } else {
      throw new Error(res.data?.message || '添加标签失败');
    }
  } catch (error) {
    console.error('添加标签失败:', error);
    message.error('添加标签失败');
  } finally {
    tagLoading.value = false;
  }
};

// 显示删除标签对话框
const showDeleteTagModal = () => {
  deleteTagForm.tag = '';
  deleteTagModalVisible.value = true;
};

// 提交删除标签
const handleDeleteTagSubmit = async () => {
  if (!deleteTagForm.tag) {
    message.error('请选择要删除的标签');
    return;
  }
  
  tagLoading.value = true;
  try {
    const res = await http.post('/asset_site/delete_tag/', {
      _id: selectedRowKeys.value,
      tag: deleteTagForm.tag
    });
    
    if (res.data && res.data.code === 200) {
      message.success(`成功从${res.data.data.updated}个站点删除标签`);
      deleteTagModalVisible.value = false;
      fetchMonitorData(); // 刷新数据
    } else {
      throw new Error(res.data?.message || '删除标签失败');
    }
  } catch (error) {
    console.error('删除标签失败:', error);
    message.error('删除标签失败');
  } finally {
    tagLoading.value = false;
  }
};

// 显示删除确认对话框
const showDeleteConfirm = () => {
  Modal.confirm({
    title: '确定要删除选中的任务吗？',
    content: `您已选中${selectedRowKeys.value.length}个任务，删除后将无法恢复。`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => handleDeleteSubmit()
  });
};

// 提交删除任务
const handleDeleteSubmit = async () => {
  try {
    const res = await http.post('/asset_site/delete/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      message.success(`成功删除${res.data.data.deleted}个任务`);
      selectedRowKeys.value = []; // 清空选择
      fetchMonitorData(); // 刷新数据
    } else {
      throw new Error(res.data?.message || '删除任务失败');
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    message.error('删除任务失败');
  }
};

// 处理导出菜单点击
const handleExportMenuClick = ({ key }: { key: string }) => {
  if (key === 'save_result_set') {
    showSaveResultSetModal();
  } else if (key === 'export_csv' || key === 'export_json') {
    handleExport(key.split('_')[1]);
  }
};

// 显示保存结果集对话框
const showSaveResultSetModal = () => {
  resultSetForm.name = `站点监控结果集-${new Date().toISOString().slice(0, 10)}`;
  resultSetModalVisible.value = true;
};

// 提交保存结果集
const handleSaveResultSetSubmit = async () => {
  if (!resultSetForm.name.trim()) {
    message.error('请输入结果集名称');
    return;
  }
  
  resultSetLoading.value = true;
  try {
    const queryParams = new URLSearchParams();
    
    // 使用当前的搜索条件
    if (searchForm.name) queryParams.append('name', searchForm.name);
    if (searchForm.target) queryParams.append('target', searchForm.target);
    if (searchForm.policy_name) queryParams.append('policy_name', searchForm.policy_name);
    if (searchForm.schedule_type) queryParams.append('schedule_type', searchForm.schedule_type);
    if (searchForm.schedule_status) queryParams.append('schedule_status', searchForm.schedule_status);
    
    // 如果有选中行，则使用选中的ID
    if (selectedRowKeys.value.length > 0) {
      queryParams.append('_id', selectedRowKeys.value.join(','));
    }
    
    queryParams.append('name', resultSetForm.name.trim());
    
    const res = await http.get(`/asset_site/save_result_set/?${queryParams.toString()}`);
    if (res.data && res.data.code === 200) {
      message.success(`成功保存${res.data.data.count}个任务到结果集`);
      resultSetModalVisible.value = false;
    } else {
      throw new Error(res.data?.message || '保存结果集失败');
    }
  } catch (error) {
    console.error('保存结果集失败:', error);
    message.error('保存结果集失败');
  } finally {
    resultSetLoading.value = false;
  }
};

// 处理导出
const handleExport = async (format: string) => {
  try {
    // 如果没有结果集ID，需要先创建结果集
    const saveQueryParams = new URLSearchParams();
    
    // 使用当前的搜索条件
    if (searchForm.name) saveQueryParams.append('name', searchForm.name);
    if (searchForm.target) saveQueryParams.append('target', searchForm.target);
    if (searchForm.policy_name) saveQueryParams.append('policy_name', searchForm.policy_name);
    if (searchForm.schedule_type) saveQueryParams.append('schedule_type', searchForm.schedule_type);
    if (searchForm.schedule_status) saveQueryParams.append('schedule_status', searchForm.schedule_status);
    
    // 如果有选中行，则使用选中的ID
    if (selectedRowKeys.value.length > 0) {
      saveQueryParams.append('_id', selectedRowKeys.value.join(','));
    }
    
    const tempName = `临时导出-${new Date().getTime()}`;
    saveQueryParams.append('name', tempName);
    
    // 创建临时结果集
    const saveRes = await http.get(`/asset_site/save_result_set/?${saveQueryParams.toString()}`);
    if (saveRes.data && saveRes.data.code === 200) {
      const resultSetId = saveRes.data.data.result_set_id;
      
      // 导出结果集
      const exportUrl = `/asset_site/export/?result_set_id=${resultSetId}&format=${format}`;
      window.open(exportUrl, '_blank');
    } else {
      throw new Error(saveRes.data?.message || '导出失败');
    }
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败');
  }
};

// 处理查看详情
const handleViewDetails = (record: MonitorSite) => {
  // 这里可以跳转到详情页或打开详情弹窗
  message.info(`查看任务详情: ${record.name}`);
};

// 处理编辑单个任务标签
const handleEditTags = (record: MonitorSite) => {
  selectedRowKeys.value = [record._id];
  showAddTagModal();
};

// 处理删除单个任务
const handleDeleteSingle = (record: MonitorSite) => {
  selectedRowKeys.value = [record._id];
  showDeleteConfirm();
};

// 处理导出单个任务
const handleExportSingle = (record: MonitorSite) => {
  selectedRowKeys.value = [record._id];
  handleExport('csv');
};

// 状态颜色转换
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'success';
    case 'stop':
      return 'warning';
    default:
      return 'default';
  }
};

// 状态文本转换
const getStatusText = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return '已排程';
    case 'stop':
      return '已停止';
    default:
      return status;
  }
};

// 获取计划类型文本
const getScheduleTypeText = (type: string): string => {
  switch (type) {
    case 'future_scan':
      return '定时任务';
    case 'recurrent_scan':
      return '周期任务';
    default:
      return type;
  }
};

// 获取截图URL
const getScreenshotUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

// 截断长文本
const truncate = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
</script>

<style scoped>
.asset-monitor-container {
  padding: 24px;
}

.monitor-header {
  margin-bottom: 24px;
}

.search-card {
  margin-bottom: 16px;
}

.monitor-stats {
  margin-bottom: 24px;
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
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.stat-warning {
  color: #faad14;
}

.stat-unit {
  font-size: 14px;
  color: #8c8c8c;
}

.operation-row {
  margin: 16px 0;
}

.monitor-table {
  margin-bottom: 24px;
}

.response-time-bar {
  height: 6px;
  border-radius: 3px;
  margin-bottom: 4px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .asset-monitor-container {
    padding: 16px;
  }
  
  .monitor-header {
    margin-bottom: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style>
