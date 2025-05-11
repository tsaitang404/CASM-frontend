<template>
  <a-card class="search-card" :bordered="false">
    <a-form layout="inline" :model="searchForm" class="compact-form">
      <a-row :gutter="[8, 4]" style="width: 100%">
        <!-- 基本查询条件 -->
        <a-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <a-form-item label="任务名称" class="compact-form-item">
            <a-input
              id="task-name-input"
              v-model:value="searchForm.name"
              @change="handleInputChange('name', $event)"
              placeholder="任务名称"
              allow-clear
              class="compact-input"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <a-form-item label="任务目标" class="compact-form-item">
            <a-input
              id="task-target-input"
              v-model:value="searchForm.target"
              @change="handleInputChange('target', $event)"
              placeholder="任务目标"
              allow-clear
              class="compact-input"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <a-form-item label="任务状态" class="compact-form-item">
            <a-select id="task-status-select" v-model="searchForm.status" placeholder="状态" allow-clear class="compact-select">
              <a-select-option value="waiting">等待中</a-select-option>
              <a-select-option value="running">运行中</a-select-option>
              <a-select-option value="done">已完成</a-select-option>
              <a-select-option value="stop">已停止</a-select-option>
              <a-select-option value="error">失败</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6" :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <a-form-item label="任务标签" class="compact-form-item">
            <a-select id="task-tag-select" v-model="searchForm.task_tag" placeholder="标签" allow-clear class="compact-select">
              <a-select-option value="task">常规任务</a-select-option>
              <a-select-option value="risk_cruising">侦查任务</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :span="24" :xs="24" :sm="24" :md="24" :lg="24" :xl="4" class="action-col">
          <a-form-item class="action-form-item">
            <a-space size="small">
              <a-button id="search-button" type="primary" @click="handleSearch" size="middle">
                <SearchOutlined /> 查询
              </a-button>
              <a-button id="reset-button" @click="handleReset" size="middle">
                <ReloadOutlined /> 重置
              </a-button>
              <a-button id="toggle-advanced-button" type="link" @click="toggleAdvanced" size="middle">
                {{ showAdvanced ? '收起' : '展开' }} <component :is="showAdvanced ? 'UpOutlined' : 'DownOutlined'" />
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
        
        <!-- 高级搜索区域，默认折叠 -->
        <template v-if="showAdvanced">
          <!-- 选项配置查询 -->
          <a-col :span="6">
            <a-form-item label="域名爆破类型">
              <a-select id="domain-brute-type-select" v-model="searchForm['options.domain_brute_type']" placeholder="请选择" allow-clear>
                <a-select-option value="small">小字典</a-select-option>
                <a-select-option value="medium">中字典</a-select-option>
                <a-select-option value="big">大字典</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="端口扫描类型">
              <a-select id="port-scan-type-select" v-model="searchForm['options.port_scan_type']" placeholder="请选择" allow-clear>
                <a-select-option value="top100">Top100</a-select-option>
                <a-select-option value="top1000">Top1000</a-select-option>
                <a-select-option value="all">全部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <!-- 选项开关筛选 -->
          <a-col :span="6">
            <a-form-item label="域名爆破">
              <a-select id="domain-brute-select" v-model="searchForm['options.domain_brute']" placeholder="请选择" allow-clear>
                <a-select-option :value="true">开启</a-select-option>
                <a-select-option :value="false">关闭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="端口扫描">
              <a-select id="port-scan-select" v-model="searchForm['options.port_scan']" placeholder="请选择" allow-clear>
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
                  <a-select id="site-count-compare-select" v-model="searchForm.siteCountCompare" placeholder="比较" allow-clear>
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="16">
                  <a-input-number id="site-count-value-input" v-model="searchForm.siteCountValue" placeholder="数量" style="width: 100%" />
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="域名数量">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-select id="domain-count-compare-select" v-model="searchForm.domainCountCompare" placeholder="比较" allow-clear>
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="16">
                  <a-input-number id="domain-count-value-input" v-model="searchForm.domainCountValue" placeholder="数量" style="width: 100%" />
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="WIH数量">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-select id="wih-count-compare-select" v-model="searchForm.wihCountCompare" placeholder="比较" allow-clear>
                    <a-select-option value="eq">等于</a-select-option>
                    <a-select-option value="gt">大于</a-select-option>
                    <a-select-option value="lt">小于</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="16">
                  <a-input-number id="wih-count-value-input" v-model="searchForm.wihCountValue" placeholder="数量" style="width: 100%" />
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
        </template>
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

// 处理输入框值变化
const handleInputChange = (field: keyof SearchForm, event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  console.log(`输入框 ${field} 值变化:`, value);
  searchForm[field] = value;
}

// 处理查询
const handleSearch = () => {
  console.log('搜索前表单数据:', searchForm)
  const form = { ...searchForm };
  // 移除空值，但保留已输入的值（包括空字符串）
  Object.keys(form).forEach(key => {
    if (form[key] === undefined || form[key] === null) {
      delete form[key];
    }
  });

  console.log('处理后的搜索参数:', form)
  emit('search', form);
}

// 处理重置
const handleReset = () => {
  console.log('重置前表单数据:', searchForm)
  Object.assign(searchForm, {
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
  });
  console.log('重置后表单数据:', searchForm)
  emit('reset');
}
</script>

<style scoped>
.search-card {
  margin-bottom: 10px;
}

.search-card :deep(.ant-card-body) {
  padding: 8px 12px;
}

.compact-form :deep(.ant-form-item-label) {
  padding-bottom: 0;
  line-height: 28px;
  font-size: 13px;
  flex: 0 0 auto;
  min-width: 70px;
}

.compact-form-item {
  margin-bottom: 4px;
  margin-right: 4px;
}

.compact-input {
  width: 100%;
  max-width: 180px;
  height: 32px !important; /* 统一输入框高度 */
}

.compact-select {
  width: 100%;
  max-width: 180px;
}

/* 统一所有表单控件的高度 */
.compact-form :deep(.ant-input),
.compact-form :deep(.ant-select-selector),
.compact-form :deep(.ant-input-number),
.compact-form :deep(.ant-btn) {
  height: 32px !important;
  line-height: 32px !important;
  font-size: 13px;
}

.compact-form :deep(.ant-select-single .ant-select-selector) {
  height: 32px !important;
  padding: 0 8px !important;
}

.compact-form :deep(.ant-select-single .ant-select-selection-item) {
  line-height: 30px !important;
}

.compact-form :deep(.ant-input-number-input) {
  height: 30px !important;
}

/* 修复输入框内边距 */
.compact-form :deep(.ant-form-item-control-input-content) {
  line-height: 32px !important;
}

/* 按钮区域样式 */
.action-col {
  text-align: right;
}

.action-form-item {
  margin-right: 0;
}

/* 将行间距调整得更小 */
.compact-form :deep(.ant-row) {
  margin-bottom: -4px !important;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .action-col {
    text-align: left;
  }
}

@media (max-width: 576px) {
  .compact-input, .compact-select {
    max-width: 100%;
  }
}
</style>