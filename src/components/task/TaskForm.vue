<template>
  <a-form :model="props.modelValue" :rules="rules" ref="formRef" layout="vertical">
    <!-- 基本信息 -->
    <a-row :gutter="20">
      <a-col :span="12">
        <a-form-item name="name" label="任务名称" required>
          <a-input 
            v-model:value="props.modelValue.name" 
            placeholder="请输入任务名称"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item name="target" label="目标" required>
          <a-input 
            v-model:value="props.modelValue.target" 
            placeholder="请输入目标IP/域名"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="20">
      <a-col :span="12">
        <a-form-item name="domain_brute_type" label="域名爆破类型">
          <a-select v-model:value="props.modelValue.domain_brute_type" placeholder="请选择域名爆破类型">
            <a-select-option value="small">小字典</a-select-option>
            <a-select-option value="medium">中字典</a-select-option>
            <a-select-option value="big">大字典</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item name="port_scan_type" label="端口扫描类型">
          <a-select v-model:value="props.modelValue.port_scan_type" placeholder="请选择端口扫描类型">
            <a-select-option value="top100">Top 100</a-select-option>
            <a-select-option value="top1000">Top 1000</a-select-option>
            <a-select-option value="all">全部端口</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- 功能选项区域 -->
    <div class="option-section">
      <div class="option-header">任务选项</div>
      
      <div class="option-group">
        <div class="group-title">信息收集</div>
        <div class="options">
          <a-checkbox v-model:checked="props.modelValue.domain_brute">域名爆破</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.alt_dns">DNS生成</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.dns_query_plugin">DNS解析</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.casm_search">搜索</a-checkbox>
        </div>
      </div>
      
      <div class="option-group">
        <div class="group-title">端口扫描</div>
        <div class="options">
          <a-checkbox v-model:checked="props.modelValue.port_scan">端口扫描</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.service_detection">服务识别</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.os_detection">系统识别</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.ssl_cert">SSL证书</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.skip_scan_cdn_ip">跳过CDN</a-checkbox>
        </div>
      </div>

      <div class="option-group">
        <div class="group-title">站点识别</div>
        <div class="options">
          <a-checkbox v-model:checked="props.modelValue.site_identify">站点识别</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.search_engines">搜索引擎</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.site_spider">网站爬虫</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.site_capture">站点截图</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.file_leak">文件泄露</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.findvhost">虚拟主机</a-checkbox>
        </div>
      </div>

      <div class="option-group">
        <div class="group-title">漏洞检测</div>
        <div class="options">
          <a-checkbox v-model:checked="props.modelValue.nuclei_scan">Nuclei扫描</a-checkbox>
          <a-checkbox v-model:checked="props.modelValue.web_info_hunter">Web信息收集</a-checkbox>
        </div>
      </div>
    </div>
  </a-form>
</template>

<script lang="ts">
// 声明组件选项
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TaskForm'
})
</script>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'ant-design-vue'

const props = withDefaults(defineProps<{ modelValue?: any }>(), {
  modelValue: () => ({
    name: '',
    target: '',
    domain_brute_type: '',
    port_scan_type: '',
    domain_brute: false,
    alt_dns: false,
    dns_query_plugin: false,
    casm_search: false,
    port_scan: false,
    service_detection: false,
    os_detection: false,
    ssl_cert: false,
    skip_scan_cdn_ip: false,
    site_identify: false,
    search_engines: false,
    site_spider: false,
    site_capture: false,
    file_leak: false,
    findvhost: false,
    nuclei_scan: false,
    web_info_hunter: false
  })
})
const formRef = ref<FormInstance>()

const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '任务名称长度应为2-50个字符', trigger: 'blur' }
  ],
  target: [
    { required: true, message: '请输入目标IP/域名', trigger: 'blur' },
    {
      validator: async (_: any, value: string) => {
        if (!value?.trim()) {
          return Promise.reject('目标不能为空')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

const validate = () => {
  return new Promise((resolve, reject) => {
    if (!formRef.value) {
      reject(new Error('表单未初始化'))
      return
    }
    formRef.value.validate()
      .then(() => {
        if (!props.modelValue.name?.trim()) {
          return Promise.reject('任务名称不能为空')
        }
        if (!props.modelValue.target?.trim()) {
          return Promise.reject('任务目标不能为空')
        }
        resolve(true)
      })
      .catch(err => {
        console.error('表单验证失败:', err)
        reject(err)
      })
  })
}

defineExpose({
  formRef,
  validate
})
</script>

<style scoped>
/* 导入任务管理相关样式 */
@import '@/assets/styles/views/task-manage.css';

/* 表单项样式调整 */
:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 8px;
}

:deep(.ant-input),
:deep(.ant-select-selector) {
  border-radius: 4px;
}

/* 选项区域样式 */
.option-section {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-top: 24px;
}

.option-header {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #d9d9d9;
}

.option-group {
  padding: 16px 20px;
  border-bottom: 1px dashed #d9d9d9;
}

.option-group:last-child {
  border-bottom: none;
}

.group-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

:deep(.ant-checkbox-wrapper) {
  margin-left: 0;
}
</style>