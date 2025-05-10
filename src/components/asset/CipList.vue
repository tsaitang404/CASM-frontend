<template>
  <div class="asset-list">
    <a-table 
      :columns="columns" 
      :data-source="data" 
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      bordered 
    />
  </div>
</template>

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
    width: 180 
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
    sorter: true
  }
];

async function fetchData(params: TablePaginationConfig = { current: 1, pageSize: 10 }) {
  if (!props.taskId) return;
  loading.value = true;
  try {
    const queryParams = new URLSearchParams({
      task_id: props.taskId,
      page: String(params.current),
      size: String(params.pageSize)
    });

    const res = await http.get(`/api/cip/?${queryParams.toString()}`);
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

const handleTableChange = (pag: TablePaginationConfig) => {
  fetchData({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

onMounted(() => fetchData());
watch(() => props.taskId, () => fetchData());
</script>

<style scoped>
.asset-list {
  margin: 16px 0;
}
</style>
