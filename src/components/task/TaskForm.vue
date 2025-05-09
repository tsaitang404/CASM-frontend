<template>
  <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
    <!-- 基本信息 -->
    <a-row :gutter="20">
      <a-col :span="12">
        <a-form-item name="name" label="任务名称" required>
          <a-input 
            v-model:value="formState.name" 
            placeholder="请输入任务名称"
            @change="updateModelValue" 
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item name="target" label="目标" required>
          <a-input 
            v-model:value="formState.target" 
            placeholder="请输入目标IP/域名"
            @change="updateModelValue"
          />
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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const formRef = ref<FormInstance>()
    
    // 表单状态
    const formState = reactive<TaskForm>({
      ...props.modelValue
    })

    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入任务名称', trigger: ['blur', 'change'] },
        { min: 2, max: 50, message: '任务名称长度应为2-50个字符', trigger: ['blur', 'change'] },
        { whitespace: true, message: '任务名称不能为空白字符', trigger: ['blur', 'change'] }
      ],
      target: [
        { required: true, message: '请输入目标IP/域名', trigger: ['blur', 'change'] },
        { whitespace: true, message: '目标不能为空白字符', trigger: ['blur', 'change'] },
        { 
          validator: (rule: any, value: string) => {
            const trimmedValue = value.trim();
            if (!trimmedValue) {
              return Promise.reject('目标不能为空');
            }
            // 简单的域名或IP格式验证
            const isValidInput = /^([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/.test(trimmedValue) || 
                               /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(trimmedValue);
            return isValidInput ? Promise.resolve() : Promise.reject('请输入有效的域名或IP地址');
          },
          trigger: ['blur', 'change']
        }
      ]
    }

    // 更新父组件的值
    const updateModelValue = () => {
      emit('update:modelValue', {
        ...formState,
        name: formState.name?.trim() || '',
        target: formState.target?.trim() || ''
      })
    }

    // 监听父组件传入的值变化
    watch(() => props.modelValue, (newVal) => {
      Object.assign(formState, newVal)
    }, { deep: true })

    // 监听本地表单状态变化
    watch(formState, () => {
      updateModelValue()
    }, { deep: true })

    // 对外暴露的方法
    const validate = () => {
      return new Promise((resolve, reject) => {
        formRef.value?.validate()
          .then(() => {
            // 验证成功时，确保数据已经trim
            formState.name = formState.name?.trim() || ''
            formState.target = formState.target?.trim() || ''
            updateModelValue()
            resolve(true)
          })
          .catch((errors) => {
            reject(errors)
          })
      })
    }

    const resetFields = () => {
      formRef.value?.resetFields()
      updateModelValue()
    }

    return {
      formRef,
      formState,
      rules,
      validate,
      resetFields,
      updateModelValue
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