<template>
  <div class="asset-list">
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
    width: 120
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 300,
    ellipsis: true
  },
  {
    title: '来源JS',
    dataIndex: 'source',
    key: 'source',
    width: 300,
    ellipsis: true
  },
  {
    title: '站点',
    dataIndex: 'site',
    key: 'site',
    width: 200,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180,
    sorter: true
  }
];

// 加载WIH列表数据
async function fetchData(params: TablePaginationConfig = { current: 1, pageSize: 10 }) {
  if (!props.taskId) return;
  
  loading.value = true;
  try {
    const queryParams = new URLSearchParams({
      task_id: props.taskId,
      page: String(params.current),
      size: String(params.pageSize)
    });

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

// 处理表格变化（分页、排序、筛选）
const handleTableChange = (pag: TablePaginationConfig) => {
  fetchData({
    current: pag.current,
    pageSize: pag.pageSize
  });
};

// 初始加载和taskId变化时重新加载数据
onMounted(() => fetchData());
watch(() => props.taskId, () => fetchData());
</script>

<style scoped>
.asset-list {
  margin: 16px 0;
}
</style>
