<template>
  <div class="task-manage-container">
    <div class="header-actions">
      <a-button type="primary" @click="showTaskCreateModal">
        <PlusOutlined /> 新建任务
      </a-button>
    </div>

    <div class="operation-bar">
      <a-button 
        type="primary" 
        danger 
        :disabled="!selectedRowKeys.length"
        @click="handleBatchStop"
      >
        批量停止
      </a-button>
      <a-button 
        type="primary"
        :disabled="!selectedRowKeys.length"
        @click="handleBatchRestart"
      >
        批量重启
      </a-button>
      <a-button 
        danger 
        :disabled="!selectedRowKeys.length"
        @click="handleBatchDelete"
      >
        批量删除
      </a-button>
    </div>

    <!-- 搜索组件 -->
    <TaskSearch @search="handleSearch" @reset="handleSearchReset" />
    
    <!-- 任务列表组件 -->
    <TaskList
      :tasks="taskList"
      :loading="loading"
      :pagination="pagination"
      v-model:selectedRowKeys="selectedRowKeys"
      @change="handleTableChange"
      @stop="stopTask"
      @delete="deleteTask"
      @restart="restartTask"
      @export="exportTask"
      @sync="showSyncTaskModal"
      @view-detail="showTaskDetail"
      @view-options="showTaskOptions"
      @batch-stop="handleBatchStop"
      @batch-delete="handleBatchDelete"
      @batch-restart="handleBatchRestart"
    />

    <!-- 新建任务组件弹窗 -->
    <TaskCreate 
      v-model:open="createTaskModalVisible"
      @success="handleTaskCreateSuccess"
      @cancel="handleTaskCreateCancel"
    />

    <!-- 同步任务到资产组弹窗 -->
    <a-modal
      v-model:open="syncTaskModalVisible"
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
      v-model:open="taskOptionsModalVisible"
      title="任务选项详情"
      :footer="null"
      width="700px"
    >
      <TaskOptions :options="currentTaskOptions" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskSearch from '@/components/task/TaskSearch.vue'
import TaskForm from '@/components/task/TaskForm.vue'
import TaskOptions from '@/components/task/TaskOptions.vue'
import TaskCreate from '@/components/task/TaskCreate.vue'
import { buildQueryParams } from '@/utils/taskHelper'
import type { Task, TaskOptions as TaskOptionsType } from '@/types/task'
import { setupTaskRefresh, formatTaskStatistic, getTaskStatusColor, getTaskStatusText } from '@/utils/taskHelper'
import { fetchTaskList, stopTask, deleteTask, restartTask, exportTaskData, syncTaskToScope } from '@/utils/taskHelper'
import type { TaskItem, PaginationProps } from '@/types/task'

// 定义响应式变量
const router = useRouter()
const loading = ref(false)
const taskList = ref<TaskItem[]>([])
const selectedRowKeys = ref<string[]>([])
const refreshInterval = ref<number | null>(null)
const autoRefresh = ref(true)

const pagination = reactive<PaginationProps>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 启动自动刷新
const startAutoRefresh = () => {
  if (refreshInterval.value) return
  refreshInterval.value = window.setInterval(() => {
    if (autoRefresh.value) {
      loadTaskList()
    }
  }, 30000) // 每30秒刷新一次
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 加载任务列表
const loadTaskList = async () => {
  try {
    loading.value = true
    const { data, total } = await fetchTaskList({
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    taskList.value = data
    pagination.total = total
  } catch (error) {
    message.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时启动自动刷新
onMounted(() => {
  loadTaskList()
  startAutoRefresh()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})

// 监听分页变化
watch(
  () => [pagination.current, pagination.pageSize],
  () => {
    loadTaskList()
  }
)

// 表单引用
const taskFormRef = ref<FormInstance>();

// 控制弹窗显示
const createTaskModalVisible = ref(false);
const confirmLoading = ref(false);
const syncTaskModalVisible = ref(false);
const taskOptionsModalVisible = ref(false);
const confirmSyncLoading = ref(false);

// 初始化选中行的数组
const selectedRowKeys = ref<string[]>([]);

// 任务表单数据
const taskForm = reactive({
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
const currentTaskOptions = reactive<TaskOptionsType>({});

const router = useRouter();

// 搜索表单数据
const searchForm = ref({});

// 显示创建任务弹窗
const showTaskCreateModal = () => {
  createTaskModalVisible.value = true;
};

const handleTaskCreateSuccess = () => {
  createTaskModalVisible.value = false
  message.success('创建任务成功')
  fetchTaskList()
}

const handleTaskCreateCancel = () => {
  createTaskModalVisible.value = false
}

// 处理取消
const handleCancel = () => {
  createTaskModalVisible.value = false;
  if (taskFormRef.value) {
    taskFormRef.value.resetFields();
  }
};

// 处理创建任务
const handleCreateTask = () => {
  if (!taskFormRef.value) return;

  taskFormRef.value.validate()
    .then(() => {
      confirmLoading.value = true;
      
      // 重构提交的数据结构
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
      
      const token = localStorage.getItem('Token');
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录');
        confirmLoading.value = false;
        return;
      }
      
      fetch('/api/task/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token
        },
        body: JSON.stringify(taskData)
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
        
        message.success('创建任务成功');
        createTaskModalVisible.value = false;
        if (taskFormRef.value) {
          taskFormRef.value.resetFields();
        }
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('创建任务失败: ' + error.message);
      })
      .finally(() => {
        confirmLoading.value = false;
      });
    });
};

// 处理搜索
const handleSearch = (values?: any) => {
  pagination.current = 1;
  if (values) {
    searchForm.value = values;
  }
  fetchTaskList();
};

// 处理搜索重置
const handleSearchReset = () => {
  pagination.current = 1;
  fetchTaskList();
};

// 处理表格分页变化
const handleTableChange = (pagination: any) => {
  state.pagination.current = pagination.current;
  state.pagination.pageSize = pagination.pageSize;
  fetchData();
};

// 获取任务列表
const fetchTaskList = (page: number = pagination.current, pageSize: number = pagination.pageSize, searchForm?: any) => {
  loading.value = true;
  
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    loading.value = false;
    return;
  }
  
  // 构建查询参数
  const params = searchForm ? buildQueryParams(searchForm) : new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', pageSize.toString());
  
  const queryString = params.toString();
  console.log('任务查询参数:', queryString);
  
  fetch(`/api/task/?${queryString}`, {
    method: 'GET',
    headers: {
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
  .finally(() => {
    loading.value = false;
  });
};

// 显示任务详情
const showTaskDetail = (task: Task) => {
  router.push(`/task/detail/${task._id}`);
};

// 停止任务
const stopTask = (task: Task) => {
  Modal.confirm({
    title: '确认停止',
    content: `确定要停止任务"${task.name}"吗？`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const token = localStorage.getItem('Token');
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录');
        return;
      }
      
      message.loading('正在停止任务...');
      
      fetch(`/api/task/stop/${task._id}`, {
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
          fetchTaskList();
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
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('停止任务失败: ' + error.message);
        console.error('停止任务错误:', error);
      });
    }
  });
};

// 删除任务
const deleteTask = (task: Task) => {
  // 如果任务状态是"等待中"，先停止任务
  if (task.status === 'waiting') {
    Modal.confirm({
      title: '停止并删除任务',
      content: `任务"${task.name}"处于等待中状态，需要先停止才能删除。确定要停止并删除吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        stopAndDeleteTask(task);
      }
    });
  } else {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.name}"吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        performDeleteTask(task._id);
      }
    });
  }
};

// 停止并删除任务
const stopAndDeleteTask = (task: Task) => {
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  fetch(`/api/task/stop/${task._id}`, {
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
      message.success('任务已停止，正在删除...');
      setTimeout(() => {
        performDeleteTask(task._id);
      }, 1000);
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
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  fetch('/api/task/delete/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    },
    body: JSON.stringify({
      task_id: [taskId],
      del_task_data: false
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
    fetchTaskList();
  })
  .catch((error: Error) => {
    message.error('删除任务失败: ' + error.message);
    console.error('删除任务错误:', error);
  });
};

// 处理批量停止
const handleBatchStop = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要停止的任务');
    return;
  }
  
  Modal.confirm({
    title: '确认批量停止',
    content: `确定要停止已选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const token = localStorage.getItem('Token');
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录');
        return;
      }
      
      message.loading('正在停止任务...');
      
      fetch('/api/task/batch_stop/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token
        },
        body: JSON.stringify({
          task_id: selectedRowKeys.value
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
        selectedRowKeys.value = [];
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('批量停止任务失败: ' + error.message);
        console.error('批量停止任务错误:', error);
      });
    }
  });
};

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的任务');
    return;
  }
  
  const runningTasks = taskList.value.filter(task => 
    selectedRowKeys.value.includes(task._id) && 
    (task.status === 'waiting' || 
     (task.status !== 'done' && task.status !== 'stop' && task.status !== 'error'))
  );
  
  if (runningTasks.length > 0) {
    Modal.confirm({
      title: '停止并删除任务',
      content: `选中的任务中有 ${runningTasks.length} 个正在运行或等待中，需要先停止这些任务。确定要停止并删除所选任务吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        stopAndThenDeleteBatch(selectedRowKeys.value);
      }
    });
  } else {
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
  
  message.loading('正在停止任务...');
  
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
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  message.loading('正在删除任务...');
  
  fetch('/api/task/delete/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    },
    body: JSON.stringify({
      task_id: taskIds,
      del_task_data: false
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
      message.warning('部分任务正在运行中，无法删除');
      fetchTaskList();
      return;
    }
    
    if (data.code !== 200) {
      throw new Error(data.message || '批量删除任务失败');
    }
    
    message.success('批量删除任务成功');
    selectedRowKeys.value = [];
    fetchTaskList();
  })
  .catch((error: Error) => {
    message.error('批量删除任务失败: ' + error.message);
    console.error('批量删除任务错误:', error);
  });
};

// 重启任务
const restartTask = (task: Task) => {
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }

  Modal.confirm({
    title: '确认重启',
    content: `确定要重启任务"${task.name}"吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      message.loading('正在重启任务...');
      
      fetch(`/api/task/restart/${task._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        
        if (data.code !== 200) {
          throw new Error(data.message || '重启任务失败');
        }
        
        message.success('重启任务成功');
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('重启任务失败: ' + error.message);
        console.error('重启任务错误:', error);
      });
    }
  });
};

// 批量重启任务
const handleBatchRestart = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要重启的任务');
    return;
  }

  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }

  Modal.confirm({
    title: '确认批量重启',
    content: `确定要重启已选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      message.loading('正在重启任务...');
      
      fetch('/api/task/batch_restart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token
        },
        body: JSON.stringify({
          task_id: selectedRowKeys.value
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
          throw new Error(data.message || '批量重启任务失败');
        }
        
        message.success('批量重启任务成功');
        selectedRowKeys.value = [];
        fetchTaskList();
      })
      .catch((error: Error) => {
        message.error('批量重启任务失败: ' + error.message);
        console.error('批量重启任务错误:', error);
      });
    }
  });
};

// 导出任务
const exportTask = (task: Task) => {
  const token = localStorage.getItem('Token');
  if (!token) {
    message.error('您尚未登录或登录已过期，请重新登录');
    return;
  }
  
  const url = `/api/task/export/${task._id}`;
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `task_${task.name}_${task._id}.json`;
  
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

// 显示同步任务弹窗
const showSyncTaskModal = (task: Task) => {
  selectedRowKeys.value = [task._id];
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
  .finally(() => {
    confirmSyncLoading.value = false;
  });
};

// 显示任务选项
const showTaskOptions = (task: Task) => {
  Object.assign(currentTaskOptions, task.options);
  taskOptionsModalVisible.value = true;
};

// 过滤资产组选项
const filterScopeOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 初始化加载
onMounted(() => {
  fetchTaskList();
});

const state = reactive({
  loading: false,
  data: [] as any[],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total: number) => `共 ${total} 条`,
    showSizeChanger: true,
    showQuickJumper: true
  },
  queryParams: {
    name: '',
    target: '',
    status: undefined
  }
})

// 获取任务列表数据
const fetchData = async () => {
  state.loading = true
  try {
    const params = new URLSearchParams({
      page: state.pagination.current.toString(),
      size: state.pagination.pageSize.toString()
    })

    // 添加查询参数
    if (state.queryParams.name) {
      params.append('name', state.queryParams.name.trim())
    }
    if (state.queryParams.target) {
      params.append('target', state.queryParams.target.trim())
    }
    if (state.queryParams.status) {
      params.append('status', state.queryParams.status)
    }

    console.log('任务查询参数:', params.toString())

    const response = await fetch(`/api/task/?${params.toString()}`)
    const data = await response.json()

    if (data.code === 200) {
      state.data = data.data.items || []
      state.pagination.total = data.data.total || 0
      state.pagination.current = data.data.page || 1
      state.pagination.pageSize = data.data.size || 10
    } else {
      message.error(data.message || '获取任务列表失败')
    }
  } catch (error) {
    console.error('获取任务列表出错:', error)
    message.error('获取任务列表失败')
  } finally {
    state.loading = false
  }
}

// 处理表格变化（分页、排序等）
const onTableChange = (pagination: any) => {
  state.pagination.current = pagination.current
  state.pagination.pageSize = pagination.pageSize
  fetchData()
}

// 处理查询
const onSearch = (values?: any) => {
  pagination.current = 1;
  if (values) {
    searchForm.value = values;
  }
  fetchTaskList();
}

// 重置查询
const handleReset = () => {
  state.queryParams.name = ''
  state.queryParams.target = ''
  state.queryParams.status = undefined
  state.pagination.current = 1
  fetchData()
}

// 监听查询参数变化
watch(() => state.queryParams, () => {
  state.pagination.current = 1
}, { deep: true })

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})

const handleRetry = async () => {
  if (loading.value) {
    console.warn('正在加载中，请稍后重试');
    return;
  }

  try {
    await fetchTaskList();
  } catch (error) {
    message.error('重新加载失败，请刷新页面');
  }
};

// 监听网络状态
onMounted(() => {
  window.addEventListener('online', handleRetry);
  window.addEventListener('offline', () => {
    message.warning('网络连接已断开，请检查网络');
  });
  
  fetchTaskList();
});

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('online', handleRetry);
  window.removeEventListener('offline', () => {});
});

// 批量操作相关
const batchActions = {
  restart: async () => {
    if (!selectedRowKeys.value.length) {
      message.warning('请选择要重启的任务')
      return
    }
    try {
      loading.value = true
      await http.post('/api/tasks/batch/restart', {
        task_ids: selectedRowKeys.value
      })
      message.success('批量重启任务成功')
      selectedRowKeys.value = []
      fetchData()
    } catch (error) {
      message.error('批量重启任务失败')
    } finally {
      loading.value = false
    }
  },
  stop: async () => {
    if (!selectedRowKeys.value.length) {
      message.warning('请选择要停止的任务')
      return
    }
    try {
      loading.value = true
      await http.post('/api/tasks/batch/stop', {
        task_ids: selectedRowKeys.value
      })
      message.success('批量停止任务成功')
      selectedRowKeys.value = []
      fetchData()
    } catch (error) {
      message.error('批量停止任务失败')
    } finally {
      loading.value = false
    }
  },
  delete: async () => {
    if (!selectedRowKeys.value.length) {
      message.warning('请选择要删除的任务')
      return
    }
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除选中的任务吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          loading.value = true
          await http.post('/api/tasks/batch/delete', {
            task_ids: selectedRowKeys.value
          })
          message.success('批量删除任务成功')
          selectedRowKeys.value = []
          fetchData()
        } catch (error) {
          message.error('批量删除任务失败')
        } finally {
          loading.value = false
        }
      }
    })
  }
}

// 设置自动刷新
let clearRefreshInterval: (() => void) | null = null

onMounted(() => {
  fetchData()
  clearRefreshInterval = setupTaskRefresh(() => {
    if (!loading.value) {
      fetchData()
    }
  }, refreshInterval.value)
})

onUnmounted(() => {
  if (clearRefreshInterval) {
    clearRefreshInterval()
  }
})

// 表格列配置
const columns = [
  // ...existing columns...
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    customRender: ({ text }: { text: string }) => {
      return h('span', { style: { color: getTaskStatusColor(text) } }, getTaskStatusText(text))
    }
  },
  {
    title: '统计信息',
    dataIndex: 'statistic',
    width: 300,
    customRender: ({ record }: { record: Task }) => formatTaskStatistic(record)
  }
  // ...existing columns...
]

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 刷新相关的方法
const startAutoRefresh = () => {
  if (refreshInterval.value) return
  refreshInterval.value = window.setInterval(() => {
    if (autoRefresh.value) {
      fetchTasks()
    }
  }, 30000) // 每30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 批量操作处理方法
const handleBatchStop = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要停止的任务')
    return
  }
  
  Modal.confirm({
    title: '确认停止所选任务?',
    content: `将停止 ${selectedRowKeys.value.length} 个任务`,
    async onOk() {
      loading.value = true
      try {
        await Promise.all(selectedRowKeys.value.map(id => stopTask(id)))
        message.success('批量停止任务成功')
        fetchTasks()
        selectedRowKeys.value = []
      } catch (error) {
        message.error('批量停止任务失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleBatchDelete = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的任务')
    return
  }

  Modal.confirm({
    title: '确认删除所选任务?',
    content: `将删除 ${selectedRowKeys.value.length} 个任务，此操作不可恢复`,
    async onOk() {
      loading.value = true
      try {
        await Promise.all(selectedRowKeys.value.map(id => deleteTask(id)))
        message.success('批量删除任务成功')
        fetchTasks()
        selectedRowKeys.value = []
      } catch (error) {
        message.error('批量删除任务失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleBatchRestart = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要重启的任务')
    return
  }

  Modal.confirm({
    title: '确认重启所选任务?',
    content: `将重启 ${selectedRowKeys.value.length} 个任务`,
    async onOk() {
      loading.value = true
      try {
        await Promise.all(selectedRowKeys.value.map(id => restartTask(id)))
        message.success('批量重启任务成功')
        fetchTasks()
        selectedRowKeys.value = []
      } catch (error) {
        message.error('批量重启任务失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 生命周期钩子
onMounted(() => {
  fetchTasks()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// 监听自动刷新开关
watch(autoRefresh, (newVal) => {
  if (newVal) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})

// 批量停止任务
const handleBatchStop = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要停止的任务')
    return
  }
  
  try {
    loading.value = true
    await Promise.all(selectedRowKeys.value.map(id => stopTask(id)))
    message.success('批量停止任务成功')
    await loadTaskList()
    selectedRowKeys.value = []
  } catch (error) {
    message.error('批量停止任务失败')
  } finally {
    loading.value = false
  }
}

// 批量重启任务
const handleBatchRestart = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要重启的任务')
    return
  }

  try {
    loading.value = true
    await Promise.all(selectedRowKeys.value.map(id => restartTask(id)))
    message.success('批量重启任务成功')
    await loadTaskList()
    selectedRowKeys.value = []
  } catch (error) {
    message.error('批量重启任务失败')
  } finally {
    loading.value = false
  }
}

// 批量删除任务
const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的任务')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个任务吗？`,
    okText: '确定',
    cancelText: '取消',
    async onOk() {
      try {
        loading.value = true
        await Promise.all(selectedRowKeys.value.map(id => deleteTask(id)))
        message.success('批量删除任务成功')
        await loadTaskList()
        selectedRowKeys.value = []
      } catch (error) {
        message.error('批量删除任务失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style>
@import '@/assets/styles/views/task-manage.css';
</style>
