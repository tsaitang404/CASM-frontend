<template>
  <a-card class="search-card" :bordered="false">
    <a-form layout="inline" :model="searchForm">
      <a-row :gutter="[16, 16]" style="width: 100%">
        <!-- 基本查询条件 -->
        <a-col :span="6">
          <a-form-item label="任务名称">
            <a-input v-model="searchForm.name" placeholder="请输入任务名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="任务目标">
            <a-input v-model="searchForm.target" placeholder="请输入任务目标" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="任务状态">
            <a-select v-model="searchForm.status" placeholder="请选择任务状态" allow-clear>
              <a-select-option value="waiting">等待中</a-select-option>
              <a-select-option value="running">运行中</a-select-option>
              <a-select-option value="done">已完成</a-select-option>
              <a-select-option value="stop">已停止</a-select-option>
              <a-select-option value="error">失败</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="任务标签">
            <a-select v-model="searchForm.task_tag" placeholder="请选择任务标签" allow-clear>
              <a-select-option value="task">常规任务</a-select-option>
              <a-select-option value="risk_cruising">侦查任务</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <!-- 高级搜索区域，默认折叠 -->
        <template v-if="showAdvanced">
          <!-- 选项配置查询 -->
          <a-col :span="6">
            <a-form-item label="域名爆破类型">
              <a-select v-model="searchForm['options.domain_brute_type']" placeholder="请选择" allow-clear>
                <a-select-option value="small">小字典</a-select-option>
                <a-select-option value="medium">中字典</a-select-option>
                <a-select-option value="big">大字典</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="端口扫描类型">
              <a-select v-model="searchForm['options.port_scan_type']" placeholder="请选择" allow-clear>
                <a-select-option value="top100">Top100</a-select-option>
                <a-select-option value="top1000">Top1000</a-select-option>
                <a-select-option value="all">全部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <!-- 选项开关筛选 -->
          <a-col :span="6">
            <a-form-item label="域名爆破">
              <a-select v-model="searchForm['options.domain_brute']" placeholder="请选择" allow-clear>
                <a-select-option :value="true">开启</a-select-option>
                <a-select-option :value="false">关闭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="端口扫描">
              <a-select v-model="searchForm['options.port_scan']" placeholder="请选择" allow-clear>
                <a-select-option :value="true">开启</a-select-option>
                <a-select-option :value="false">关闭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <!-- 统计数据查询 -->
          <a-col :span="8">
            <a-form-item label="站点数量">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-select v-model="searchForm.siteCountCompare" placeholder="比较" allow-clear>
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="16">
                  <a-input-number v-model="searchForm.siteCountValue" placeholder="数量" style="width: 100%" />
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="域名数量">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-select v-model="searchForm.domainCountCompare" placeholder="比较" allow-clear>
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="16">
                  <a-input-number v-model="searchForm.domainCountValue" placeholder="数量" style="width: 100%" />
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="WIH数量">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-select v-model="searchForm.wihCountCompare" placeholder="比较" allow-clear>
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="16">
                  <a-input-number v-model="searchForm.wihCountValue" placeholder="数量" style="width: 100%" />
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
        </template>
        
        <!-- 查询按钮区域 -->
        <a-col :span="24" style="text-align: right;">
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined /> 查询
            </a-button>
            <a-button @click="handleReset">
              <ReloadOutlined /> 重置
            </a-button>
            <a-button type="link" @click="toggleAdvanced">
              {{ showAdvanced ? '收起' : '展开' }} <component :is="showAdvanced ? 'UpOutlined' : 'DownOutlined'" />
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { SearchOutlined, ReloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue'

interface SearchForm {
  name: string
  target: string
  status: string
  task_tag: string
  siteCountCompare: string
  siteCountValue: number | null
  domainCountCompare: string
  domainCountValue: number | null
  wihCountCompare: string
  wihCountValue: number | null
  'options.domain_brute': boolean | undefined
  'options.domain_brute_type': string
  'options.port_scan': boolean | undefined
  'options.port_scan_type': string
}

interface Emits {
  (e: 'search', form: SearchForm): void
  (e: 'reset'): void
}

const emit = defineEmits<Emits>()

// 搜索表单数据
const searchForm = reactive<SearchForm>({
  name: '',
  target: '',
  status: '',
  task_tag: '',
  siteCountCompare: '',
  siteCountValue: null,
  domainCountCompare: '',
  domainCountValue: null,
  wihCountCompare: '',
  wihCountValue: null,
  'options.domain_brute': undefined,
  'options.domain_brute_type': '',
  'options.port_scan': undefined,
  'options.port_scan_type': ''
})

// 显示高级搜索
const showAdvanced = ref(false)

// 切换高级搜索
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 处理查询
const handleSearch = () => {
  emit('search', { ...searchForm })
}

// 处理重置
const handleReset = () => {
  // 重置表单数据
  Object.keys(searchForm).forEach((key) => {
    const k = key as keyof SearchForm
    if (typeof searchForm[k] === 'number') {
      searchForm[k] = null
    } else if (typeof searchForm[k] === 'boolean') {
      searchForm[k] = undefined
    } else {
      searchForm[k] = ''
    }
  })
  emit('reset')
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
</style>