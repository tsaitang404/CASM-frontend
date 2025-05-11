<template>
  <div class="asset-list">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="URL">
          <a-input v-model:value="form.url" placeholder="请输入URL" allow-clear />
        </a-form-item>
        <a-form-item label="状态码">
          <a-input v-model:value="form.status_code" placeholder="请输入状态码" allow-clear />
        </a-form-item>
        <a-form-item label="类型">
          <a-input v-model:value="form.content_type" placeholder="请输入文件类型" allow-clear />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="form.title" placeholder="请输入标题" allow-clear />
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
      :scroll="{ x: 1200 }"
      @change="handleTableChange"
      bordered 
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status_code'">
          <a-tag :color="getStatusColor(record.status_code)">
            {{ record.status_code }}
          </a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FileleakList'
})
</script>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import http from '../../plugins/http';

interface FileLeakData {
  _id: string;
  url: string;
  status_code: number;
  size: number;
  content_type: string;
  title: string;
  found_time: string;
  task_id: string;
}

const props = defineProps<{ taskId?: string }>();

// 添加搜索表单数据
const form = reactive({
  url: '',
  status_code: '',
  content_type: '',
  title: ''
});

const data = ref<FileLeakData[]>([]);
const loading = ref(false);

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
});

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'processing';
  if (status >= 400 && status < 500) return 'warning';
  if (status >= 500) return 'error';
  return 'default';
};

const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const columns = [
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 350,
    fixed: 'left',
    ellipsis: true
  },
  {
    title: '状态码',
    dataIndex: 'status_code',
    key: 'status_code',
    width: 100
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    width: 120,
    render: (size: number) => formatSize(size)
  },
  {
    title: '类型',
    dataIndex: 'content_type',
    key: 'content_type',
    width: 150,
    ellipsis: true
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    width: 250,
    ellipsis: true
  },
  {
    title: '发现时间',
    dataIndex: 'found_time',
    key: 'found_time',
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

    if (form.url) queryParams.append('url', form.url);
    if (form.status_code) queryParams.append('status_code', form.status_code);
    if (form.content_type) queryParams.append('content_type', form.content_type);
    if (form.title) queryParams.append('title', form.title);

    const res = await http.get(`/fileleak/?${queryParams.toString()}`);
    if (res.data.code === 200) {
      data.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = params.current || 1;
    } else {
      throw new Error(res.data.message || '获取文件泄露列表失败');
    }
  } catch (error) {
    console.error('获取文件泄露列表错误:', error);
    message.error('获取文件泄露列表失败');
  } finally {
    loading.value = false;
  }
}

// 重置搜索表单
const handleReset = () => {
  form.url = '';
  form.status_code = '';
  form.content_type = '';
  form.title = '';
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
