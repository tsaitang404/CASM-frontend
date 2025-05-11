<template>
  <div class="asset-list">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="主题名称">
          <a-input v-model:value="form.subject_dn" placeholder="请输入主题名称" allow-clear />
        </a-form-item>
        <a-form-item label="签发者">
          <a-input v-model:value="form.issuer_dn" placeholder="请输入签发者" allow-clear />
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
  name: 'SslList'
})
</script>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import http from '../../plugins/http';

interface SslData {
  _id: string;
  ip: string;
  port: number;
  cert: {
    subject_dn: string;
    issuer_dn: string;
    extensions: {
      subjectAltName: string[];
    };
  };
  found_time: string;
  task_id: string;
}

const props = defineProps<{ taskId?: string }>();

// 添加搜索表单数据
const form = reactive({
  ip: '',
  port: '',
  subject_dn: '',
  issuer_dn: ''
});

const data = ref<SslData[]>([]);
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
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
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
    title: '主题名称',
    dataIndex: ['cert', 'subject_dn'],
    key: 'subject_dn',
    width: 250,
    ellipsis: true
  },
  {
    title: '签发者',
    dataIndex: ['cert', 'issuer_dn'],
    key: 'issuer_dn',
    width: 250,
    ellipsis: true
  },
  {
    title: '备用名称',
    dataIndex: ['cert', 'extensions', 'subjectAltName'],
    key: 'subjectAltName',
    width: 200,
    ellipsis: true,
    render: (names: string[]) => names?.join(', ') || '-'
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

    if (form.ip) queryParams.append('ip', form.ip);
    if (form.port) queryParams.append('port', form.port);
    if (form.subject_dn) queryParams.append('cert.subject_dn', form.subject_dn);
    if (form.issuer_dn) queryParams.append('cert.issuer_dn', form.issuer_dn);

    const res = await http.get(`/cert/?${queryParams.toString()}`);
    if (res.data.code === 200) {
      data.value = res.data.items || [];
      pagination.total = res.data.total || 0;
      pagination.current = params.current || 1;
    } else {
      throw new Error(res.data.message || '获取SSL证书列表失败');
    }
  } catch (error) {
    console.error('获取SSL证书列表错误:', error);
    message.error('获取SSL证书列表失败');
  } finally {
    loading.value = false;
  }
}

// 重置搜索表单
const handleReset = () => {
  form.ip = '';
  form.port = '';
  form.subject_dn = '';
  form.issuer_dn = '';
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