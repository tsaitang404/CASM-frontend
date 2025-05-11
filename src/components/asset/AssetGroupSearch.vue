<template>
  <div class="asset-group-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="分组名称">
          <a-input v-model:value="form.name" placeholder="请输入分组名称" allow-clear @keyup.enter="handleSearch" />
        </a-form-item>
        <a-form-item label="分组类型">
          <a-select v-model:value="form.scope_type" placeholder="请选择分组类型" allow-clear style="width: 120px">
            <a-select-option value="domain">域名</a-select-option>
            <a-select-option value="ip">IP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" :loading="loading">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    
    <div class="search-result">
      <div class="table-operations" v-if="selectedRowKeys.length > 0">
        <a-space>
          <span>已选择 {{ selectedRowKeys.length }} 项</span>
          <a-popconfirm
            title="确定要删除所选资产分组吗？"
            ok-text="是"
            cancel-text="否"
            @confirm="handleBatchDelete"
          >
            <a-button type="primary" danger>
              <template #icon><DeleteOutlined /></template>
              批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
      
      <a-table 
        :dataSource="tableData" 
        :columns="columns" 
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        :rowSelection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange
        }"
        bordered 
        row-key="_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'scope_type'">
            <a-tag v-if="record.scope_type === 'domain'" color="blue">域名</a-tag>
            <a-tag v-else-if="record.scope_type === 'ip'" color="green">IP</a-tag>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'scope'">
            <div class="scope-content">
              <template v-if="record.scope_array && record.scope_array.length > 0">
                <a-tag v-for="(item, index) in (record.scope_array?.length > 3 ? record.scope_array.slice(0, 3) : record.scope_array)" :key="index">
                  {{ item }}
                </a-tag>
                <a-tag v-if="record.scope_array?.length > 3" color="purple">+{{ record.scope_array.length - 3 }}</a-tag>
              </template>
              <span v-else>-</span>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" @click="handleEditScope(record)">范围管理</a-button>
              <a-popconfirm
                title="确定要删除该资产分组吗？"
                ok-text="是"
                cancel-text="否"
                @confirm="handleDelete(record._id)"
              >
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
        
        <!-- 添加空状态展示 -->
        <template #emptyText>
          <div class="empty-data">
            <a-empty :image="emptyImage" :description="emptyDescription">
              <template #description>
                <span>{{ emptyDescription }}</span>
              </template>
              <a-button type="primary" @click="showAddModal">
                <template #icon><PlusOutlined /></template>
                添加资产分组
              </a-button>
            </a-empty>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 添加/编辑分组弹窗 -->
    <a-modal
      :title="formTitle"
      v-model:open="formVisible"
      :confirm-loading="formLoading"
      @ok="handleSubmitForm"
      @cancel="cancelForm"
      width="650px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="分组名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入分组名称" />
        </a-form-item>
        <a-form-item label="分组描述" name="desc">
          <a-textarea v-model:value="formData.desc" placeholder="请输入分组描述" rows="4" />
        </a-form-item>
        <a-form-item label="分组类型" name="scope_type">
          <a-select v-model:value="formData.scope_type" placeholder="请选择分组类型">
            <a-select-option value="domain">域名</a-select-option>
            <a-select-option value="ip">IP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="资产范围" name="scope" help="多个资产范围用逗号分隔">
          <a-textarea v-model:value="formData.scope" placeholder="请输入资产范围，多个范围用逗号分隔，如：example.com,example.org" rows="3" />
        </a-form-item>
        <a-form-item label="黑名单范围" name="black_scope" help="多个黑名单范围用逗号分隔">
          <a-textarea v-model:value="formData.black_scope" placeholder="请输入黑名单范围，多个范围用逗号分隔，如：test.example.com" rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 范围管理弹窗 -->
    <a-modal
      title="资产范围管理"
      v-model:open="scopeVisible"
      :confirm-loading="scopeLoading"
      @cancel="cancelScopeForm"
      :footer="null"
      width="700px"
    >
      <div class="scope-management">
        <a-tabs v-model:activeKey="activeTabKey">
          <a-tab-pane key="scope" tab="资产范围">
            <div class="scope-form">
              <a-form layout="vertical">
                <a-form-item label="资产范围" help="多个范围请用逗号分隔">
                  <a-textarea v-model:value="scopeData.scope" placeholder="请输入资产范围，多个范围用逗号分隔" rows="4" />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="updateScope" :loading="scopeLoading">更新范围</a-button>
                </a-form-item>
              </a-form>
            </div>
            
            <div class="scope-list">
              <h4>当前范围列表</h4>
              <a-list
                size="small"
                bordered
                :dataSource="scopeData.scope_array || []"
                :loading="scopeLoading"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <div class="list-item-content">
                      <span>{{ item }}</span>
                      <a-button type="link" danger size="small" @click="removeScopeItem(item)">
                        <template #icon><DeleteOutlined /></template>
                      </a-button>
                    </div>
                  </a-list-item>
                </template>
                <template #footer>
                  <div>共 {{ scopeData.scope_array?.length || 0 }} 项</div>
                </template>
              </a-list>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="black_scope" tab="黑名单范围">
            <div class="scope-form">
              <a-form layout="vertical">
                <a-form-item label="黑名单范围" help="多个范围请用逗号分隔">
                  <a-textarea v-model:value="scopeData.black_scope" placeholder="请输入黑名单范围，多个范围用逗号分隔" rows="4" />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="updateBlackScope" :loading="scopeLoading">更新黑名单</a-button>
                </a-form-item>
              </a-form>
            </div>
            
            <div class="scope-list">
              <h4>当前黑名单列表</h4>
              <a-list
                size="small"
                bordered
                :dataSource="scopeData.black_scope_array || []"
                :loading="scopeLoading"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <div class="list-item-content">
                      <span>{{ item }}</span>
                      <a-button type="link" danger size="small" @click="removeBlackScopeItem(item)">
                        <template #icon><DeleteOutlined /></template>
                      </a-button>
                    </div>
                  </a-list-item>
                </template>
                <template #footer>
                  <div>共 {{ scopeData.black_scope_array?.length || 0 }} 项</div>
                </template>
              </a-list>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AssetGroupSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import http from '../../plugins/http'

// 空状态相关变量
const emptyImage = undefined // 使用默认图片
const emptyDescription = computed(() => {
  if (loading.value) return '数据加载中...'
  if (form.name || form.scope_type) return '未找到符合条件的资产分组'
  return '当前暂无资产分组，请添加'
})

interface AssetGroupData {
  _id: string
  name: string
  desc: string
  scope_type?: string
  scope?: string
  scope_array?: string[]
  black_scope?: string
  black_scope_array?: string[]
  create_time: string
  update_time: string
}

interface QueryParams {
  name: string;
  scope_type?: string;
  page: number;
  size: number;
  sort_field?: string;
  sort_order?: string;
}

// 父组件可能传入的属性
interface Props {
  initQuery?: Partial<QueryParams>;
  refreshKey?: number; // 用于触发刷新的键
}

// 组件事件定义
const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'edit', record: AssetGroupData): void
  (e: 'delete', id: string): void
  (e: 'add'): void
  (e: 'updated'): void
}>()

const props = defineProps<Props>()

// 表单数据
const form = reactive<QueryParams>({
  name: '',
  scope_type: undefined,
  page: 1,
  size: 10
})

// 表格数据
const tableData = ref<AssetGroupData[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])

// 分页配置
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
  showQuickJumper: true
})

// 表格列定义
const columns = [
  {
    title: '分组名称',
    dataIndex: 'name',
    key: 'name',
    width: '15%',
    ellipsis: true
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc',
    width: '30%',
    ellipsis: true
  },
  {
    title: '分组类型',
    dataIndex: 'scope_type',
    key: 'scope_type',
    width: '10%'
  },
  {
    title: '资产范围',
    dataIndex: 'scope_array',
    key: 'scope',
    width: '25%',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: '15%',
    sorter: true,
    customRender: ({ text }) => {
      return text ? new Date(text).toLocaleString() : '-'
    }
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
  }
]

// 表单相关变量
const formRef = ref()
const formMode = ref<'add' | 'edit'>('add')
const formTitle = computed(() => formMode.value === 'add' ? '添加资产分组' : '编辑资产分组')
const formVisible = ref(false)
const formLoading = ref(false)
const formData = reactive({
  _id: '',
  name: '',
  desc: '',
  scope_type: 'domain' as 'domain' | 'ip' | undefined,
  scope: '',
  black_scope: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分组名称长度必须在2-50个字符之间', trigger: 'blur' }
  ],
  desc: [
    { max: 200, message: '描述最多200个字符', trigger: 'blur' }
  ],
  scope_type: [
    { required: true, message: '请选择分组类型', trigger: 'change' }
  ],
  scope: [
    { max: 500, message: '资产范围最多500个字符', trigger: 'blur' }
  ],
  black_scope: [
    { max: 500, message: '黑名单范围最多500个字符', trigger: 'blur' }
  ]
}

// 范围管理相关变量
const scopeVisible = ref(false)
const scopeLoading = ref(false)
const activeTabKey = ref('scope')
const scopeData = reactive<{
  _id: string
  scope: string
  scope_array: string[]
  black_scope: string
  black_scope_array: string[]
}>({
  _id: '',
  scope: '',
  scope_array: [],
  black_scope: '',
  black_scope_array: []
})

// 初始化和数据加载
onMounted(() => {
  // 如果有初始查询参数则应用
  if (props.initQuery) {
    Object.assign(form, props.initQuery)
  }
  fetchAssetGroups()
})

// 监听外部刷新信号
watch(() => props.refreshKey, () => {
  fetchAssetGroups()
})

// 获取资产分组列表
const fetchAssetGroups = async (pag?: TablePaginationConfig) => {
  loading.value = true
  selectedRowKeys.value = [] // 清空选择
  
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    if (form.name) params.append('name', form.name)
    if (form.scope_type) params.append('scope_type', form.scope_type)
    
    const page = pag?.current || pagination.current
    const size = pag?.pageSize || pagination.pageSize
    params.append('page', String(page))
    params.append('size', String(size))
    
    if (form.sort_field) {
      params.append('sort_field', form.sort_field)
      params.append('sort_order', form.sort_order || 'asc')
    }

    const res = await http.get(`/asset_scope/?${params.toString()}`)
    if (res.data && res.data.code === 200) {
      // 适配实际返回格式：items 在顶层而不是在 data 对象中
      tableData.value = res.data.items || []
      pagination.total = res.data.total || 0
      pagination.current = res.data.page || page
      pagination.pageSize = res.data.size || size
    } else {
      throw new Error(res.data?.message || '查询失败')
    }
  } catch (error) {
    console.error('资产分组查询错误:', error)
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 表格行选择变化
const onSelectChange = (selectedKeys: string[]) => {
  selectedRowKeys.value = selectedKeys
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  fetchAssetGroups()
}

// 重置搜索条件
const handleReset = () => {
  form.name = ''
  form.scope_type = undefined
  pagination.current = 1
  fetchAssetGroups()
}

// 表格变更（分页、排序）
const handleTableChange = (pag: TablePaginationConfig, filters, sorter) => {
  // 处理排序
  if (sorter && sorter.field) {
    form.sort_field = sorter.field as string
    form.sort_order = sorter.order === 'ascend' ? 'asc' : 'desc'
  } else {
    form.sort_field = undefined
    form.sort_order = undefined
  }
  fetchAssetGroups(pag)
}

// 显示添加分组弹窗
const showAddModal = () => {
  formMode.value = 'add'
  formData._id = ''
  formData.name = ''
  formData.desc = ''
  formData.scope_type = 'domain'
  formData.scope = ''
  formData.black_scope = ''
  formVisible.value = true
  emit('add')
}

// 编辑分组处理
const handleEdit = (record: AssetGroupData) => {
  formMode.value = 'edit'
  formData._id = record._id
  formData.name = record.name
  formData.desc = record.desc || ''
  formData.scope_type = record.scope_type as 'domain' | 'ip' | undefined
  formData.scope = record.scope || ''
  formData.black_scope = record.black_scope || ''
  formVisible.value = true
  emit('edit', record)
}

// 删除分组处理
const handleDelete = async (id: string) => {
  loading.value = true
  try {
    const res = await http.delete(`/asset_scope/${id}`)
    if (res.data.code === 200) {
      message.success('删除资产分组成功')
      fetchAssetGroups()
      emit('delete', id)
    } else {
      throw new Error(res.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除资产分组失败:', error)
    message.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 批量删除处理
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的分组')
    return
  }
  
  loading.value = true
  try {
    const res = await http.post('/asset_scope/delete/', {
      _id: selectedRowKeys.value
    })
    
    if (res.data.code === 200) {
      message.success(`成功删除 ${res.data.data.deleted} 个分组`)
      selectedRowKeys.value = []
      fetchAssetGroups()
    } else {
      throw new Error(res.data.message || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除资产分组失败:', error)
    message.error('批量删除失败')
  } finally {
    loading.value = false
  }
}

// 取消表单
const cancelForm = () => {
  formVisible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleSubmitForm = async () => {
  try {
    await formRef.value.validate()
    
    formLoading.value = true
    
    if (formMode.value === 'add') {
      // 添加资产分组
      const res = await http.post('/asset_scope/', {
        name: formData.name,
        desc: formData.desc,
        scope_type: formData.scope_type,
        scope: formData.scope,
        black_scope: formData.black_scope
      })
      if (res.data.code === 200) {
        message.success('添加资产分组成功')
        formVisible.value = false
        fetchAssetGroups()
        emit('updated')
      }
    } else {
      // 编辑资产分组
      const res = await http.put(`/asset_scope/${formData._id}`, {
        name: formData.name,
        desc: formData.desc,
        scope_type: formData.scope_type,
        scope: formData.scope,
        black_scope: formData.black_scope
      })
      if (res.data.code === 200) {
        message.success('更新资产分组成功')
        formVisible.value = false
        fetchAssetGroups()
        emit('updated')
      }
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    message.error('操作失败')
  } finally {
    formLoading.value = false
  }
}

// 范围管理相关方法
// 打开范围管理弹窗
const handleEditScope = async (record: AssetGroupData) => {
  scopeData._id = record._id
  scopeData.scope = record.scope || ''
  scopeData.scope_array = record.scope_array || []
  scopeData.black_scope = record.black_scope || ''
  scopeData.black_scope_array = record.black_scope_array || []
  scopeVisible.value = true
}

// 关闭范围管理弹窗
const cancelScopeForm = () => {
  scopeVisible.value = false
}

// 更新资产范围
const updateScope = async () => {
  if (!scopeData._id) return
  
  scopeLoading.value = true
  try {
    // 更新范围信息
    const res = await http.put(`/asset_scope/${scopeData._id}`, {
      scope: scopeData.scope
    })
    
    if (res.data.code === 200) {
      message.success('更新资产范围成功')
      
      // 更新本地数据
      const index = tableData.value.findIndex(item => item._id === scopeData._id)
      if (index !== -1) {
        const updatedItem = res.data.data
        scopeData.scope_array = updatedItem.scope_array || scopeData.scope.split(',').filter(Boolean)
        tableData.value[index] = { ...tableData.value[index], ...updatedItem }
      }
    } else {
      throw new Error(res.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新资产范围失败:', error)
    message.error('更新资产范围失败')
  } finally {
    scopeLoading.value = false
  }
}

// 更新资产黑名单范围
const updateBlackScope = async () => {
  if (!scopeData._id) return
  
  scopeLoading.value = true
  try {
    // 更新黑名单范围信息
    const res = await http.put(`/asset_scope/${scopeData._id}`, {
      black_scope: scopeData.black_scope
    })
    
    if (res.data.code === 200) {
      message.success('更新黑名单范围成功')
      
      // 更新本地数据
      const index = tableData.value.findIndex(item => item._id === scopeData._id)
      if (index !== -1) {
        const updatedItem = res.data.data
        scopeData.black_scope_array = updatedItem.black_scope_array || scopeData.black_scope.split(',').filter(Boolean)
        tableData.value[index] = { ...tableData.value[index], ...updatedItem }
      }
    } else {
      throw new Error(res.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新黑名单范围失败:', error)
    message.error('更新黑名单范围失败')
  } finally {
    scopeLoading.value = false
  }
}

// 删除单个资产范围项
const removeScopeItem = async (item: string) => {
  const newScopeArray = scopeData.scope_array.filter(scope => scope !== item)
  scopeData.scope = newScopeArray.join(',')
  scopeData.scope_array = newScopeArray
  await updateScope()
}

// 删除单个资产黑名单范围项
const removeBlackScopeItem = async (item: string) => {
  const newBlackScopeArray = scopeData.black_scope_array.filter(scope => scope !== item)
  scopeData.black_scope = newBlackScopeArray.join(',')
  scopeData.black_scope_array = newBlackScopeArray
  await updateBlackScope()
}

// 暴露给父组件的方法
defineExpose({
  showAddModal,
  refresh: fetchAssetGroups
})
</script>

<style scoped>
.asset-group-search {
  width: 100%;
  padding: 0;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  width: 100%;
  overflow-x: auto;
}

.table-operations {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f2f5;
  padding: 8px 12px;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.scope-content {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.scope-management {
  padding: 0;
}

.scope-form {
  margin-bottom: 24px;
}

.scope-list {
  margin-top: 16px;
}

.list-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

:deep(.ant-table-wrapper) {
  overflow-x: auto;
}

:deep(.ant-table-cell-ellipsis) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-table-cell) {
  vertical-align: middle;
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

:deep(.ant-empty) {
  margin: 32px 0;
}

:deep(.ant-empty-description) {
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

:deep(.ant-empty .ant-empty-image) {
  height: 100px;
}
</style>