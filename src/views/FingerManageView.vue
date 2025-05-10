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
        <a-form-item label="指纹规则 (键值对)" required>
          <div v-for="(rule, index) in addRules" :key="index" style="display: flex; align-items: center;">
            <a-select v-model:value="rule.key" :options="supportedKeys" placeholder="选择字段" style="margin-right: 8px; width: 40%" />
            <a-input v-model:value="rule.value" placeholder="值(长度>6)" style="margin-right: 8px; width: 50%" />
            <a-button @click="removeRule(addRules, index)" type="link" danger v-if="addRules.length > 1">删除</a-button>
          </div>
          <a-button @click="addRule(addRules)" type="dashed" style="width: 100%; margin-top: 8px;">添加规则</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:open="showEditModal" title="编辑指纹" @ok="handleEdit" @cancel="resetEditForm" :confirmLoading="editLoading" :okButtonProps="{ disabled: !isEditChanged() }">
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="指纹名称" required>
          <a-input v-model:value="editForm.name" placeholder="请输入指纹名称" />
        </a-form-item>
        <a-form-item label="指纹规则 (键值对)" required>
          <div v-for="(rule, index) in editRules" :key="index" style="display: flex; align-items: center;">
            <a-select v-model:value="rule.key" :options="supportedKeys" placeholder="选择字段" style="margin-right: 8px; width: 40%" />
            <a-input v-model:value="rule.value" placeholder="值(长度>6)" style="margin-right: 8px; width: 50%" />
            <a-button @click="removeRule(editRules, index)" type="link" danger v-if="editRules.length > 1">删除</a-button>
          </div>
          <a-button @click="addRule(editRules)" type="dashed" style="width: 100%; margin-top: 8px;">添加规则</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
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
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}))
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
  let t = text
  if (t.endsWith('"')) t = t.slice(0, -1) // 去掉末尾的双引号
  return t.length > len ? t.slice(0, len) + '...' : t
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

// 指纹规则动态表单
const addRules = ref([{ key: '', value: '' }])
const editRules = ref([{ key: '', value: '' }])

// 支持的 key 列表
const supportedKeys = [
  { label: 'body', value: 'body' },
  { label: 'title', value: 'title' },
  { label: 'header', value: 'header' },
  { label: 'icon_hash', value: 'icon_hash' }
]

function addRule(rulesArr: any) {
  rulesArr.push({ key: '', value: '' })
}
function removeRule(rulesArr: any, idx: number) {
  if (rulesArr.length > 1) rulesArr.splice(idx, 1)
}
function resetAddRules() {
  addRules.value = [{ key: '', value: '' }]
}
function resetEditRules() {
  editRules.value = [{ key: '', value: '' }]
}

// 组装规则为 key="value"，多个用 || 分隔，校验 key/value
function buildRuleStr(rulesArr: any[]) {
  const exprs: string[] = []
  for (const r of rulesArr) {
    if (!r.key || !supportedKeys.some(k => k.value === r.key)) {
      message.warning('请选择有效字段')
      return ''
    }
    let v = r.value.replace(/^['"“”]+|['"“”]+$/g, '')
    if (v.length <= 6) {
      message.warning('值长度需大于6')
      return ''
    }
    v = `"${v.replace(/"/g, '\"')}"`
    exprs.push(`${r.key}=${v}`)
  }
  return exprs.join(' || ')
}

async function handleAdd() {
  if (!addForm.name) {
    message.warning('请填写完整信息')
    return
  }
  const ruleStr = buildRuleStr(addRules.value)
  if (!ruleStr) return
  addLoading.value = true
  try {
    await http.post('/fingerprint/', { name: addForm.name, human_rule: ruleStr })
    message.success('添加成功')
    showAddModal.value = false
    resetAddForm()
    resetAddRules()
    fetchList()
  } finally {
    addLoading.value = false
  }
}

function resetAddForm() {
  addForm.name = ''
  resetAddRules()
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

// 编辑指纹
const showEditModal = ref(false)
const editForm = reactive({ _id: '', name: '', human_rule: '' })
const editLoading = ref(false)
const originalEditForm = ref({ name: '', rules: [] as {key: string, value: string}[] })

function showEdit(record: Fingerprint) {
  editForm._id = record._id
  editForm.name = record.name
  // 兼容 human_rule 为 JSON 或 k=v 字符串
  let parsed = false
  try {
    const obj = JSON.parse(record.human_rule)
    if (typeof obj === 'object' && obj !== null) {
      editRules.value = Object.entries(obj).map(([key, value]) => ({ key, value }))
      parsed = true
    }
  } catch {}
  if (!parsed) {
    // 兼容 body="xxx" 或 body=xxx 或 title="xxx" 等格式
    const arr: {key: string, value: string}[] = []
    const ruleStr = record.human_rule.trim()
    // 支持多条规则用换行分隔
    const lines = ruleStr.split(/\n|;/).map(l => l.trim()).filter(Boolean)
    for (const line of lines) {
      // 匹配 key="value" 或 key='value' 或 key=value
      const m = line.match(/^(\w+)\s*=\s*(["']?)(.+?)\2$/)
      if (m) {
        arr.push({ key: m[1], value: m[3] })
      }
    }
    if (arr.length > 0) {
      editRules.value = arr
    } else {
      editRules.value = [{ key: '', value: '' }]
    }
  }
  // 保存原始数据用于对比
  originalEditForm.value = {
    name: editForm.name,
    rules: editRules.value.map(r => ({ key: r.key, value: r.value }))
  }
  showEditModal.value = true
}

function isEditChanged() {
  if (editForm.name !== originalEditForm.value.name) return true
  if (editRules.value.length !== originalEditForm.value.rules.length) return true
  for (let i = 0; i < editRules.value.length; i++) {
    if (editRules.value[i].key !== originalEditForm.value.rules[i]?.key ||
        editRules.value[i].value !== originalEditForm.value.rules[i]?.value) {
      return true
    }
  }
  return false
}

async function handleEdit() {
  if (!editForm.name) {
    message.warning('请填写完整信息')
    return
  }
  const ruleStr = buildRuleStr(editRules.value)
  if (!ruleStr) return
  editLoading.value = true
  try {
    await http.put(`/fingerprint/${editForm._id}/`, {
      name: editForm.name,
      human_rule: ruleStr
    })
    message.success('修改成功')
    showEditModal.value = false
    resetEditForm()
    resetEditRules()
    fetchList()
  } finally {
    editLoading.value = false
  }
}

function resetEditForm() {
  editForm._id = ''
  editForm.name = ''
  resetEditRules()
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
