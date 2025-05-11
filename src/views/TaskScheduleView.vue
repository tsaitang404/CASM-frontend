<template>
  <div class="task-schedule-container">
    <!-- 搜索区域 -->
    <a-card class="search-card" :bordered="false">
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
            placeholder="请选择状态" 
            style="width: 120px" 
            allow-clear
          >
            <a-select-option value="scheduled">已计划</a-select-option>
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
    
    <!-- 操作按钮区域 -->
    <div class="operation-row" style="margin: 16px 0;">
      <a-space>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          创建计划任务
        </a-button>
        <a-button 
          danger 
          :disabled="!hasSelected" 
          @click="showDeleteConfirm"
        >
          <template #icon><DeleteOutlined /></template>
          删除计划任务
        </a-button>
        <a-button 
          :disabled="!hasSelected" 
          @click="handleStop"
        >
          <template #icon><PauseCircleOutlined /></template>
          停止计划任务
        </a-button>
        <a-button 
          :disabled="!hasSelected" 
          @click="handleRecover"
        >
          <template #icon><PlayCircleOutlined /></template>
          恢复计划任务
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
    
    <!-- 计划任务表格 -->
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
          
          <!-- 计划类型列 -->
          <template v-if="column.dataIndex === 'schedule_type'">
            <a-tag :color="record.schedule_type === 'future_scan' ? 'blue' : 'purple'">
              {{ getScheduleTypeText(record.schedule_type) }}
            </a-tag>
          </template>
          
          <!-- 日期列 -->
          <template v-if="column.dataIndex === 'last_run_date' || column.dataIndex === 'next_run_date'">
            <span>{{ formatDate(record[column.dataIndex]) }}</span>
          </template>
          
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button 
                type="link" 
                size="small"
                @click="handleDetail(record)"
              >
                详情
              </a-button>
              <a-button 
                v-if="record.status === 'scheduled'"
                type="link" 
                size="small" 
                danger
                @click="handleStopSingle(record)"
              >
                停止
              </a-button>
              <a-button 
                v-if="record.status === 'stop'"
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
    
    <!-- 创建计划任务弹窗 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建计划任务"
      @ok="handleCreateSubmit"
      :confirmLoading="submitLoading"
      width="600px"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item name="name" label="任务名称" required>
          <a-input 
            v-model:value="createForm.name" 
            placeholder="请输入任务名称" 
            allow-clear
          />
        </a-form-item>
        
        <a-form-item name="target" label="任务目标" required>
          <a-textarea 
            v-model:value="createForm.target" 
            placeholder="请输入任务目标，如域名、IP或URL" 
            :rows="3"
            allow-clear
          />
        </a-form-item>
        
        <a-form-item name="policy_id" label="策略" required>
          <a-select
            v-model:value="createForm.policy_id"
            placeholder="请选择策略"
            :loading="policiesLoading"
            allow-clear
          >
            <a-select-option v-for="policy in policies" :key="policy._id" :value="policy._id">
              {{ policy.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item name="task_tag" label="任务标签" required>
          <a-select
            v-model:value="createForm.task_tag"
            placeholder="请选择任务标签"
            allow-clear
          >
            <a-select-option value="task">资产发现任务</a-select-option>
            <a-select-option value="risk_cruising">风险巡航任务</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item name="schedule_type" label="计划类型" required>
          <a-radio-group v-model:value="createForm.schedule_type">
            <a-radio value="future_scan">定时任务</a-radio>
            <a-radio value="recurrent_scan">周期任务</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <!-- 定时任务选择日期时间 -->
        <a-form-item 
          v-if="createForm.schedule_type === 'future_scan'" 
          name="start_date" 
          label="执行时间" 
          required
        >
          <a-date-picker
            v-model:value="datePickerValue"
            :disabledDate="disabledDate"
            :showTime="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            style="width: 100%"
            placeholder="请选择执行时间"
            @change="handleDateChange"
          />
        </a-form-item>
        
        <!-- 周期任务设置Cron表达式 -->
        <a-form-item 
          v-if="createForm.schedule_type === 'recurrent_scan'" 
          name="cron" 
          label="Cron表达式" 
          required
          help="格式：秒 分 时 日 月 星期，例如：0 0 0 * * 1 表示每周一0点执行"
        >
          <a-input 
            v-model:value="createForm.cron" 
            placeholder="输入Cron表达式，如: 0 0 0 * * 1" 
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TaskScheduleView'
});
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
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
import dayjs, { Dayjs } from 'dayjs';

// 类型定义
interface TaskSchedule {
  _id: string;
  name: string;
  target: string;
  task_tag: string;
  schedule_type: 'future_scan' | 'recurrent_scan';
  policy_id: string;
  policy_name: string;
  cron?: string; // 周期任务需要
  start_date?: string; // 定时任务需要
  start_time?: number;
  status: string;
  run_number: number;
  last_run_time?: number;
  last_run_date?: string;
  next_run_date?: string;
}

interface Policy {
  _id: string;
  name: string;
}

// 搜索表单数据
const searchForm = reactive({
  name: '',
  target: '',
  policy_name: '',
  schedule_type: undefined as string | undefined,
  schedule_status: undefined as string | undefined,
});

// 表格相关
const loading = ref(false);
const tableData = ref<TaskSchedule[]>([]);
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
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 180
  },
  {
    title: '任务目标',
    dataIndex: 'target',
    key: 'target',
    width: 200,
    ellipsis: true
  },
  {
    title: '策略名称',
    dataIndex: 'policy_name',
    key: 'policy_name',
    width: 180
  },
  {
    title: '计划类型',
    dataIndex: 'schedule_type',
    key: 'schedule_type',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '执行次数',
    dataIndex: 'run_number',
    key: 'run_number',
    width: 100
  },
  {
    title: '上次执行时间',
    dataIndex: 'last_run_date',
    key: 'last_run_date',
    width: 180
  },
  {
    title: '下次执行时间',
    dataIndex: 'next_run_date',
    key: 'next_run_date',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 150
  }
];

// 创建任务表单
const createModalVisible = ref(false);
const submitLoading = ref(false);
const createFormRef = ref();
const datePickerValue = ref<Dayjs>();
const createForm = reactive({
  name: '',
  target: '',
  schedule_type: 'future_scan' as 'future_scan' | 'recurrent_scan',
  policy_id: '',
  cron: '',
  task_tag: ''
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  target: [{ required: true, message: '请输入任务目标', trigger: 'blur' }],
  policy_id: [{ required: true, message: '请选择策略', trigger: 'change' }],
  task_tag: [{ required: true, message: '请选择任务标签', trigger: 'change' }],
  cron: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }],
  start_date: [{ required: true, message: '请选择执行时间', trigger: 'change' }]
};

// 策略列表
const policies = ref<Policy[]>([]);
const policiesLoading = ref(false);

// 初始化
onMounted(() => {
  fetchTaskSchedules();
  fetchPolicies();
});

// 获取计划任务列表
const fetchTaskSchedules = async (params: any = {}) => {
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
    
    const res = await http.get(`/task_schedule/?${queryParams.toString()}`);
    if (res.data && res.data.code === 200) {
      tableData.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = res.data.page || page;
      pagination.pageSize = res.data.size || size;
    } else {
      throw new Error(res.data?.message || '获取计划任务失败');
    }
  } catch (error) {
    console.error('获取计划任务列表失败:', error);
    message.error('获取计划任务列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取策略列表
const fetchPolicies = async () => {
  policiesLoading.value = true;
  try {
    const res = await http.get('/policy/?size=100');
    if (res.data && res.data.code === 200) {
      policies.value = res.data.items || [];
    } else {
      throw new Error(res.data?.message || '获取策略列表失败');
    }
  } catch (error) {
    console.error('获取策略列表失败:', error);
    message.error('获取策略列表失败');
  } finally {
    policiesLoading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  selectedRowKeys.value = []; // 清空选择
  fetchTaskSchedules();
};

// 重置搜索条件
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    // @ts-ignore
    searchForm[key] = undefined;
  });
  pagination.current = 1;
  fetchTaskSchedules();
};

// 刷新数据
const refreshData = () => {
  selectedRowKeys.value = [];
  fetchTaskSchedules();
};

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  fetchTaskSchedules({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

// 行选择变化
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

// 打开创建任务弹窗
const showCreateModal = () => {
  // 重置表单
  Object.keys(createForm).forEach(key => {
    // @ts-ignore
    createForm[key] = key === 'schedule_type' ? 'future_scan' : '';
  });
  datePickerValue.value = undefined;
  // 下一次更新DOM后再打开弹窗
  setTimeout(() => {
    createFormRef.value?.resetFields();
    createModalVisible.value = true;
  }, 0);
};

// 禁用过去的日期
const disabledDate = (current: Dayjs) => {
  return current && current < dayjs().startOf('day');
};

// 提交创建任务
const handleCreateSubmit = async () => {
  try {
    // 表单验证
    await createFormRef.value.validateFields();
    
    submitLoading.value = true;
    
    // 准备提交数据
    const submitData: any = {
      name: createForm.name,
      target: createForm.target,
      schedule_type: createForm.schedule_type,
      policy_id: createForm.policy_id,
      task_tag: createForm.task_tag
    };
    
    // 根据计划类型设置参数
    if (createForm.schedule_type === 'recurrent_scan') {
      if (!createForm.cron) {
        message.error('请输入有效的Cron表达式');
        submitLoading.value = false;
        return;
      }
      submitData.cron = createForm.cron;
    } else {
      if (!datePickerValue.value) {
        message.error('请选择执行时间');
        submitLoading.value = false;
        return;
      }
      // 修改日期格式，不使用Z时区标识符，而是使用ISO格式但不包含时区信息
      submitData.start_date = datePickerValue.value.format('YYYY-MM-DDTHH:mm:00');
    }
    
    // 提交创建请求
    const res = await http.post('/task_schedule/', submitData);
    
    if (res.data && res.data.code === 200) {
      message.success('创建计划任务成功');
      createModalVisible.value = false;
      fetchTaskSchedules(); // 刷新数据
    } else {
      throw new Error(res.data?.message || '创建计划任务失败');
    }
  } catch (error: any) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    console.error('创建计划任务失败:', error);
    message.error(`创建计划任务失败: ${error.message || '未知错误'}`);
  } finally {
    submitLoading.value = false;
  }
};

// 显示删除确认
const showDeleteConfirm = () => {
  if (!hasSelected.value) return;
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个计划任务吗？此操作不可恢复。`,
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
    const res = await http.post('/task_schedule/delete/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      message.success(`成功删除 ${selectedRowKeys.value.length} 个计划任务`);
      selectedRowKeys.value = [];
      fetchTaskSchedules();
    } else {
      throw new Error(res.data?.message || '删除计划任务失败');
    }
  } catch (error) {
    console.error('删除计划任务失败:', error);
    message.error('删除计划任务失败');
  }
};

// 处理停止
const handleStop = async () => {
  if (!hasSelected.value) return;
  
  try {
    const res = await http.post('/task_schedule/stop/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      message.success(`成功停止 ${selectedRowKeys.value.length} 个计划任务`);
      fetchTaskSchedules();
    } else {
      throw new Error(res.data?.message || '停止计划任务失败');
    }
  } catch (error) {
    console.error('停止计划任务失败:', error);
    message.error('停止计划任务失败');
  }
};

// 处理恢复
const handleRecover = async () => {
  if (!hasSelected.value) return;
  
  try {
    const res = await http.post('/task_schedule/recover/', {
      _id: selectedRowKeys.value
    });
    
    if (res.data && res.data.code === 200) {
      message.success(`成功恢复 ${selectedRowKeys.value.length} 个计划任务`);
      fetchTaskSchedules();
    } else {
      throw new Error(res.data?.message || '恢复计划任务失败');
    }
  } catch (error) {
    console.error('恢复计划任务失败:', error);
    message.error('恢复计划任务失败');
  }
};

// 处理单个任务停止
const handleStopSingle = (record: TaskSchedule) => {
  selectedRowKeys.value = [record._id];
  handleStop();
};

// 处理单个任务恢复
const handleRecoverSingle = (record: TaskSchedule) => {
  selectedRowKeys.value = [record._id];
  handleRecover();
};

// 查看任务详情
const handleDetail = (record: TaskSchedule) => {
  message.info(`查看计划任务详情：${record.name}`);
  // 这里可以实现查看详情的功能，如跳转到详情页或显示详情弹窗
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

// 状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'scheduled': return '已计划';
    case 'stop': return '已停止';
    default: return status;
  }
};

// 状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'green';
    case 'stop': return 'orange';
    default: return 'default';
  }
};

// 计划类型文本
const getScheduleTypeText = (type: string) => {
  switch (type) {
    case 'future_scan': return '定时任务';
    case 'recurrent_scan': return '周期任务';
    default: return type;
  }
};

// 处理日期选择变化
const handleDateChange = (date: Dayjs | null) => {
  if (date) {
    // 直接设置表单中的start_date字段，确保它不为空，使用与提交一致的格式
    createForm.start_date = date.format('YYYY-MM-DDTHH:mm:00');
    
    // 通知表单验证系统值已更新
    createFormRef.value?.validateFields(['start_date']);
  } else {
    createForm.start_date = '';
  }
};
</script>

<style scoped>
.task-schedule-container {
  padding: 12px;
}

.search-card {
  margin-bottom: 16px;
}

.operation-row {
  margin: 16px 0;
}
</style>
