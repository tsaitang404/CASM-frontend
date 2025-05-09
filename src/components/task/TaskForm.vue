<template>
  <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
    <!-- 基本信息 -->
    <a-row :gutter="20">
      <a-col :span="12">
        <a-form-item name="name" label="任务名称">
          <a-input v-model:value="formState.name" placeholder="请输入任务名称" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item name="target" label="目标">
          <a-input v-model:value="formState.target" placeholder="请输入目标IP/域名" />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="20">
      <a-col :span="12">
        <a-form-item name="domain_brute_type" label="域名爆破类型">
          <a-select v-model:value="formState.domain_brute_type">
            <a-select-option value="small">小字典</a-select-option>
            <a-select-option value="medium">中字典</a-select-option>
            <a-select-option value="big">大字典</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item name="port_scan_type" label="端口扫描类型">
          <a-select v-model:value="formState.port_scan_type">
            <a-select-option value="top100">Top100</a-select-option>
            <a-select-option value="top1000">Top1000</a-select-option>
            <a-select-option value="all">全部</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- 扫描选项 -->
    <div class="option-section">
      <div class="option-header">扫描选项</div>
      
      <div class="option-group">
        <div class="group-title">信息收集</div>
        <div class="options">
          <a-checkbox v-model:checked="formState.domain_brute">域名爆破</a-checkbox>
          <a-checkbox v-model:checked="formState.alt_dns">DNS生成</a-checkbox>
          <a-checkbox v-model:checked="formState.dns_query_plugin">DNS解析</a-checkbox>
          <a-checkbox v-model:checked="formState.casm_search">搜索</a-checkbox>
        </div>
      </div>
      
      <div class="option-group">
        <div class="group-title">端口扫描</div>
        <div class="options">
          <a-checkbox v-model:checked="formState.port_scan">端口扫描</a-checkbox>
          <a-checkbox v-model:checked="formState.service_detection">服务识别</a-checkbox>
          <a-checkbox v-model:checked="formState.os_detection">系统识别</a-checkbox>
          <a-checkbox v-model:checked="formState.ssl_cert">SSL证书</a-checkbox>
        </div>
      </div>
      
      <div class="option-group">
        <div class="group-title">站点扫描</div>
        <div class="options">
          <a-checkbox v-model:checked="formState.site_identify">站点识别</a-checkbox>
          <a-checkbox v-model:checked="formState.search_engines">搜索引擎</a-checkbox>
          <a-checkbox v-model:checked="formState.site_spider">站点爬虫</a-checkbox>
          <a-checkbox v-model:checked="formState.site_capture">站点截图</a-checkbox>
        </div>
      </div>
      
      <div class="option-group">
        <div class="group-title">安全扫描</div>
        <div class="options">
          <a-checkbox v-model:checked="formState.skip_scan_cdn_ip">跳过CDN</a-checkbox>
          <a-checkbox v-model:checked="formState.file_leak">文件泄露</a-checkbox>
          <a-checkbox v-model:checked="formState.findvhost">虚拟主机</a-checkbox>
          <a-checkbox v-model:checked="formState.nuclei_scan">Nuclei</a-checkbox>
          <a-checkbox v-model:checked="formState.web_info_hunter">Web信息</a-checkbox>
        </div>
      </div>
    </div>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, PropType } from 'vue'
import type { FormInstance } from 'ant-design-vue'

interface TaskForm {
  name: string
  target: string
  domain_brute_type: string
  port_scan_type: string
  domain_brute: boolean
  alt_dns: boolean
  dns_query_plugin: boolean
  casm_search: boolean
  port_scan: boolean
  service_detection: boolean
  os_detection: boolean
  ssl_cert: boolean
  skip_scan_cdn_ip: boolean
  site_identify: boolean
  search_engines: boolean
  site_spider: boolean
  site_capture: boolean
  file_leak: boolean
  findvhost: boolean
  nuclei_scan: boolean
  web_info_hunter: boolean
}

export default defineComponent({
  name: 'TaskForm',
  props: {
    modelValue: {
      type: Object as PropType<TaskForm>,
      required: true
    }
  },
  setup(props, { emit, expose }) {
    const formRef = ref<FormInstance>()
    const formState = reactive<TaskForm>({ ...props.modelValue })

    watch(formState, (newVal) => {
      emit('update:modelValue', { ...newVal })
    }, { deep: true })

    watch(() => props.modelValue, (newVal) => {
      Object.assign(formState, newVal)
    }, { deep: true })

    const rules = {
      name: [
        { required: true, message: '请输入任务名称', trigger: 'blur' },
        { min: 1, max: 50, message: '任务名称长度应为1-50个字符', trigger: 'blur' }
      ],
      target: [
        { required: true, message: '请输入目标IP/域名', trigger: 'blur' }
      ],
      domain_brute_type: [
        { required: true, message: '请选择域名爆破类型', trigger: 'change' }
      ],
      port_scan_type: [
        { required: true, message: '请选择端口扫描类型', trigger: 'change' }
      ]
    }

    // 添加validate方法
    const validate = () => {
      return formRef.value?.validate()
    }

    // 暴露方法和引用给父组件
    expose({
      validate,
      formRef,
      resetFields: () => formRef.value?.resetFields()
    })

    return {
      formRef,
      formState,
      rules
    }
  }
})
</script>

<style scoped>
.option-section {
  margin-top: 24px;
}

.option-header {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.option-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.options {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

:deep(.ant-checkbox-wrapper) {
  margin-left: 0 !important;
}
</style>