<template>
  <div class="asset-list">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="漏洞名称">
          <a-input v-model:value="form.vuln_name" placeholder="请输入漏洞名称" allow-clear />
        </a-form-item>
        <a-form-item label="目标">
          <a-input v-model:value="form.target" placeholder="请输入目标" allow-clear />
        </a-form-item>
        <a-form-item label="风险等级">
          <a-select v-model:value="form.risk_level" placeholder="请选择风险等级" allow-clear style="width: 120px">
            <a-select-option value="high">高危</a-select-option>
            <a-select-option value="medium">中危</a-select-option>
            <a-select-option value="low">低危</a-select-option>
            <a-select-option value="info">信息</a-select-option>
          </a-select>
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

interface VulnData {
  _id: string;
  vuln_name: string;
  risk_level: string;
  target: string;
  found_time: string;
  task_id: string;
}

const props = defineProps<{ taskId?: string }>();

// 添加搜索表单数据
const form = reactive({
  vuln_name: '',
  target: '',
  risk_level: undefined as string | undefined
});

const data = ref<VulnData[]>([]);
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
    title: '漏洞名称',
    dataIndex: 'vuln_name',
    key: 'vuln_name',
    width: 200,
    fixed: 'left',
    ellipsis: true
  },
  {
    title: '风险等级',
    dataIndex: 'risk_level',
    key: 'risk_level',
    width: 100
  },
  {
    title: '目标',
    dataIndex: 'target',
    key: 'target',
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

    if (form.vuln_name) queryParams.append('vuln_name', form.vuln_name);
    if (form.target) queryParams.append('target', form.target);
    if (form.risk_level) queryParams.append('risk_level', form.risk_level);

    const res = await http.get(`/vuln/?${queryParams.toString()}`);
    if (res.data.code === 200) {
      data.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = params.current || 1;
    } else {
      throw new Error(res.data.message || '获取漏洞列表失败');
    }
  } catch (error) {
    console.error('获取漏洞列表错误:', error);
    message.error('获取漏洞列表失败');
  } finally {
    loading.value = false;
  }
}

// 重置搜索表单
const handleReset = () => {
  form.vuln_name = '';
  form.target = '';
  form.risk_level = undefined;
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
