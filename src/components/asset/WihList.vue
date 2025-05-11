<template>
  <div class="asset-list">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="记录类型">
          <a-input v-model:value="form.record_type" placeholder="请输入记录类型" allow-clear />
        </a-form-item>
        <a-form-item label="内容">
          <a-input v-model:value="form.content" placeholder="请输入内容" allow-clear />
        </a-form-item>
        <a-form-item label="来源JS">
          <a-input v-model:value="form.source" placeholder="请输入来源JS" allow-clear />
        </a-form-item>
        <a-form-item label="站点">
          <a-input v-model:value="form.site" placeholder="请输入站点" allow-clear />
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
      @change="handleTableChange"
      row-key="_id"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'create_time'">
          {{ record.create_time ? new Date(record.create_time).toLocaleString() : '-' }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import http from '@/plugins/http';

const props = defineProps<{ taskId?: string }>();

// 添加搜索表单数据
const form = reactive({
  record_type: '',
  content: '',
  source: '',
  site: ''
});

const data = ref([]);
const loading = ref(false);

// 分页配置
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
    title: '记录类型',
    dataIndex: 'record_type',
    key: 'record_type',
    width: 100,
    fixed: 'left'
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    minWidth: 200,
    ellipsis: true
  },
  {
    title: '来源JS',
    dataIndex: 'source',
    key: 'source',
    width: 250,
    ellipsis: true
  },
  {
    title: '站点',
    dataIndex: 'site',
    key: 'site',
    width: 180,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 160,
    fixed: 'right',
    sorter: true
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

    if (form.record_type) queryParams.append('record_type', form.record_type);
    if (form.content) queryParams.append('content', form.content);
    if (form.source) queryParams.append('source', form.source);
    if (form.site) queryParams.append('site', form.site);

    const res = await http.get(`/wih/?${queryParams.toString()}`);
    if (res.data.code === 200) {
      data.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = params.current || 1;
    } else {
      throw new Error(res.data.message || '获取WIH列表失败');
    }
  } catch (error) {
    console.error('获取WIH列表错误:', error);
    message.error('获取WIH列表失败');
  } finally {
    loading.value = false;
  }
}

// 重置搜索表单
const handleReset = () => {
  form.record_type = '';
  form.content = '';
  form.source = '';
  form.site = '';
  pagination.current = 1;
  handleSearch();
};

const handleTableChange = (pag: TablePaginationConfig) => {
  handleSearch({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

// 初始加载和taskId变化时重新加载数据
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
