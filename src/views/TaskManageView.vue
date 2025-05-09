<template>
  <div class="task-manage-container">
    <div class="header-actions">
      <a-button type="primary" @click="showTaskCreateModal">
        <PlusOutlined /> 新建任务
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
import { ref, reactive, onMounted } from 'vue'
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

interface ApiResponse<T> {
  code: number;
  message?: string;
  items?: T[];
  total?: number;
  data?: T;
}

interface AssetScope {
  _id: string;
  name: string;
}

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
const handleSearch = (form: any) => {
  pagination.current = 1;
  fetchTaskList(1, pagination.pageSize, form);
};

// 处理搜索重置
const handleSearchReset = () => {
  pagination.current = 1;
  fetchTaskList();
};

// 处理表格分页变化
const handleTableChange = (pag: any) => {
  fetchTaskList(pag.current, pag.pageSize);
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
  console.log('重启任务:', task);
  // TODO: 实现重启任务功能
};

// 处理批量重启
const handleBatchRestart = () => {
  console.log('批量重启任务:', selectedRowKeys.value);
  // TODO: 实现批量重启功能
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
</script>

<style>
@import '@/assets/styles/views/task-manage.css';
</style>
