<template>
  <div class="asset-list">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="C段地址">
          <a-input v-model:value="form.cidr_ip" placeholder="请输入C段地址" allow-clear />
        </a-form-item>
        <a-form-item label="IP数量">
          <a-input v-model:value="form.ip_count" placeholder="请输入IP数量" allow-clear />
        </a-form-item>
        <a-form-item label="域名数量">
          <a-input v-model:value="form.domain_count" placeholder="请输入域名数量" allow-clear />
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
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CipList'
})
</script>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import http from '../../plugins/http';

interface CipData {
  _id: string;
  cidr_ip: string;
  ip_count: number;
  domain_count: number;
  ip_list: string[];
  domain_list: string[];
  task_id: string;
  create_time: string;
}

const props = defineProps<{ taskId?: string }>();

// 添加搜索表单数据
const form = reactive({
  cidr_ip: '',
  ip_count: '',
  domain_count: ''
});

const data = ref<CipData[]>([]);
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
    title: 'C段地址', 
    dataIndex: 'cidr_ip', 
    key: 'cidr_ip', 
    width: 180,
    fixed: 'left'
  },
  { 
    title: 'IP数量', 
    dataIndex: 'ip_count', 
    key: 'ip_count', 
    width: 100,
    sorter: true 
  },
  { 
    title: '域名数量', 
    dataIndex: 'domain_count', 
    key: 'domain_count', 
    width: 100,
    sorter: true 
  },
  { 
    title: 'IP列表', 
    dataIndex: 'ip_list', 
    key: 'ip_list',
    width: 300,
    ellipsis: true,
    render: (text: string[]) => text?.join(', ') || '-'
  },
  { 
    title: '域名列表', 
    dataIndex: 'domain_list', 
    key: 'domain_list', 
    width: 300,
    ellipsis: true,
    render: (text: string[]) => text?.join(', ') || '-'
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180,
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

    if (form.cidr_ip) queryParams.append('cidr_ip', form.cidr_ip);
    if (form.ip_count) queryParams.append('ip_count', form.ip_count);
    if (form.domain_count) queryParams.append('domain_count', form.domain_count);

    const res = await http.get(`/cip/?${queryParams.toString()}`);
    if (res.data.code === 200) {
      data.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = params.current || 1;
    } else {
      throw new Error(res.data.message || '获取C段IP列表失败');
    }
  } catch (error) {
    console.error('获取C段IP列表错误:', error);
    message.error('获取C段IP列表失败');
  } finally {
    loading.value = false;
  }
}

// 重置搜索表单
const handleReset = () => {
  form.cidr_ip = '';
  form.ip_count = '';
  form.domain_count = '';
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
