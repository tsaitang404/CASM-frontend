<template>
  <div class="asset-list">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="服务名">
          <a-input v-model:value="form.service_name" placeholder="请输入服务名" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="协议">
          <a-input v-model:value="form.protocol" placeholder="请输入协议" allow-clear />
        </a-form-item>
        <a-form-item label="识别方式">
          <a-input v-model:value="form.identify_method" placeholder="请输入识别方式" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" :loading="loading">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <a-table 
      :columns="columns" 
      :data-source="data" 
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 1000 }"
      @change="handleTableChange"
      bordered 
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import http from '@/plugins/http';

interface NpocServiceData {
  _id: string;
  service_name: string;
  port: number;
  protocol: string;
  identify_method: string;
  update_time: string;
  task_id: string;
}

const props = defineProps<{ taskId?: string }>();

// 添加搜索表单数据
const form = reactive({
  service_name: '',
  port: '',
  protocol: '',
  identify_method: ''
});

const data = ref<NpocServiceData[]>([]);
const loading = ref(false);

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
});

const columns = [
  {
    title: '服务名',
    dataIndex: 'service_name',
    key: 'service_name',
    width: 150,
    fixed: 'left'
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 100
  },
  {
    title: '协议',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 100
  },
  {
    title: '识别方式',
    dataIndex: 'identify_method',
    key: 'identify_method',
    width: 150
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    key: 'update_time',
    width: 180,
    fixed: 'right'
  }
];

// 搜索处理函数
const handleSearch = async (params: TablePaginationConfig = { current: 1, pageSize: 10 }) => {
  if (!props.taskId) return;
  
  loading.value = true;
  try {
    const queryParams = new URLSearchParams({
      task_id: props.taskId,
      page: String(params.current),
      size: String(params.pageSize)
    });

    if (form.service_name) queryParams.append('service_name', form.service_name);
    if (form.port) queryParams.append('port', form.port);
    if (form.protocol) queryParams.append('protocol', form.protocol);
    if (form.identify_method) queryParams.append('identify_method', form.identify_method);

    const res = await http.get(`/npoc_service/?${queryParams.toString()}`);
    if (res.data.code === 200) {
      data.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = params.current || 1;
    } else {
      throw new Error(res.data.message || '获取NPOC服务列表失败');
    }
  } catch (error) {
    console.error('获取NPOC服务列表错误:', error);
    message.error('获取NPOC服务列表失败');
  } finally {
    loading.value = false;
  }
}

// 重置搜索表单
const handleReset = () => {
  form.service_name = '';
  form.port = '';
  form.protocol = '';
  form.identify_method = '';
  pagination.current = 1;
  handleSearch();
};

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

onMounted(() => handleSearch());
watch(() => props.taskId, () => handleSearch());
</script>

<style scoped>
.asset-list {
  margin: 16px 0;
  overflow-x: auto;
}

:deep(.ant-table-wrapper) {
  overflow-x: auto;
}

:deep(.ant-table-header),
:deep(.ant-table-body) {
  overflow-y: auto !important;
}

:deep(.ant-table-cell-ellipsis) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-table-fixed) {
  background: #fff;
}

.search-form {
  margin-bottom: 20px;
}
</style>
