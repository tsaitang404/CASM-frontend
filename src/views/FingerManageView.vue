<template>
  <div class="finger-manage-container">
    <!-- 操作区 -->
    <div class="header-actions">
      <a-space>
        <a-button type="primary" @click="showAddModal = true">添加指纹</a-button>
        <a-upload :showUploadList="false" :beforeUpload="handleUpload" accept=".json">
          <a-button>批量上传</a-button>
        </a-upload>
        <a-button @click="handleExport">导出指纹</a-button>
        <a-popconfirm
          title="确定要删除选中的指纹吗？"
          ok-text="确认"
          cancel-text="取消"
          @confirm="handleBatchDelete"
        >
          <a-button danger :disabled="!selectedRowKeys.length">批量删除</a-button>
        </a-popconfirm>
      </a-space>
    </div>
    <!-- 搜索表单 -->
    <a-form layout="inline" @submit.prevent>
      <a-form-item label="指纹名称">
        <a-input v-model:value="searchForm.name" placeholder="请输入指纹名称" allow-clear />
      </a-form-item>
      <a-form-item label="更新时间大于">
        <a-date-picker v-model:value="searchForm.update_date__dgt" style="width: 160px" />
      </a-form-item>
      <a-form-item label="更新时间小于">
        <a-date-picker v-model:value="searchForm.update_date__dlt" style="width: 160px" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="fetchList">搜索</a-button>
        <a-button @click="resetSearch" style="margin-left: 8px">重置</a-button>
      </a-form-item>
    </a-form>
    <!-- 指纹表格 -->
    <a-table
      :dataSource="list"
      :columns="columns"
      :rowKey="'_id'"
      :loading="loading"
      :pagination="pagination"
      :rowSelection="rowSelection"
      @change="handleTableChange"
      style="margin-top: 18px"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" @click="showEdit(record)">编辑</a-button>
            <a-popconfirm title="确定要删除该指纹吗？" ok-text="确认" cancel-text="取消" @confirm="() => handleDelete(record)">
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'human_rule'">
          <a-tooltip :title="record.human_rule">
            {{ truncateText(record.human_rule, 32) }}
          </a-tooltip>
        </template>
      </template>
    </a-table>
    <!-- 添加/编辑指纹弹窗 -->
    <a-modal v-model:open="showAddModal" title="添加指纹" @ok="handleAdd" @cancel="resetAddForm" :confirmLoading="addLoading">
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="指纹名称" required>
          <a-input v-model:value="addForm.name" placeholder="请输入指纹名称" />
        </a-form-item>
        <a-form-item label="指纹规则 (JSON格式)" required>
          <a-textarea v-model:value="addForm.human_rule" placeholder='{"html": ["特征"]}' :rows="5" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import http from '@/plugins/http'

interface Fingerprint {
  _id: string
  name: string
  human_rule: string
  update_date?: string
}

const list = ref<Fingerprint[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})
const selectedRowKeys = ref<string[]>([])
const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}
const searchForm = reactive({
  name: '',
  update_date__dgt: null as string | null,
  update_date__dlt: null as string | null
})

const columns = [
  { title: '名称', dataIndex: 'name', width: 180 },
  { title: '规则', dataIndex: 'human_rule', width: 320 },
  { title: '更新时间', dataIndex: 'update_date', width: 180 },
  { title: '操作', dataIndex: 'action', width: 120, fixed: 'right' }
]

function truncateText(text: string, len = 24) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.pageSize,
      ...searchForm
    }
    if (params.update_date__dgt) params.update_date__dgt = params.update_date__dgt.format?.('YYYY-MM-DD') || params.update_date__dgt
    if (params.update_date__dlt) params.update_date__dlt = params.update_date__dlt.format?.('YYYY-MM-DD') || params.update_date__dlt
    const { data } = await http.get('/fingerprint/', { params })
    list.value = data.items
    pagination.total = data.total
  } catch (e) {
    // 错误已全局处理
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag: any) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchList()
}
function resetSearch() {
  searchForm.name = ''
  searchForm.update_date__dgt = null
  searchForm.update_date__dlt = null
  pagination.current = 1
  fetchList()
}

// 添加指纹
const showAddModal = ref(false)
const addForm = reactive({ name: '', human_rule: '' })
const addLoading = ref(false)
async function handleAdd() {
  if (!addForm.name || !addForm.human_rule) {
    message.warning('请填写完整信息')
    return
  }
  let ruleObj
  try {
    ruleObj = JSON.parse(addForm.human_rule)
  } catch {
    message.error('规则需为合法JSON')
    return
  }
  addLoading.value = true
  try {
    await http.post('/fingerprint/', { name: addForm.name, human_rule: addForm.human_rule })
    message.success('添加成功')
    showAddModal.value = false
    resetAddForm()
    fetchList()
  } finally {
    addLoading.value = false
  }
}
function resetAddForm() {
  addForm.name = ''
  addForm.human_rule = ''
}

// 删除指纹
async function handleDelete(record: Fingerprint) {
  await http.post('/fingerprint/delete/', { _id: [record._id] })
  message.success('删除成功')
  fetchList()
}
async function handleBatchDelete() {
  if (!selectedRowKeys.value.length) return
  await http.post('/fingerprint/delete/', { _id: selectedRowKeys.value })
  message.success('批量删除成功')
  selectedRowKeys.value = []
  fetchList()
}

// 导出指纹
async function handleExport() {
  const res = await http.get('/fingerprint/export/', { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fingerprints.json'
  a.click()
  window.URL.revokeObjectURL(url)
}

// 上传指纹
async function handleUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  await http.post('/fingerprint/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  message.success('上传成功')
  fetchList()
  return false // 阻止自动上传
}

// 编辑功能预留
function showEdit(record: Fingerprint) {
  message.info('暂不支持编辑，可删除后重新添加')
}

fetchList()
</script>

<style scoped>
.finger-manage-container {
  padding: 24px;
}
.header-actions {
  margin-bottom: 18px;
  display: flex;
  justify-content: flex-end;
}
</style>
