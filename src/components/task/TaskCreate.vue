<template>
  <a-modal
    :open="open"
    title="新建任务"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="confirmLoading"
    @update:open="(val) => emit('update:open', val)"
    width="800px"
  >
    <TaskForm
      ref="formRef"
      v-model:modelValue="formData"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import http from '../../plugins/http'
import TaskForm from './TaskForm.vue'

interface Props {
  open: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
  'cancel': []
}>()

const formRef = ref<FormInstance>()
const confirmLoading = ref(false)

// 表单数据初始值
const defaultFormData = {
  name: '',
  target: '',
  domain_brute_type: 'small',
  port_scan_type: 'top100',
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
}

// 使用reactive来创建响应式数据
const formData = reactive({ ...defaultFormData })

// 重置表单数据
const resetForm = () => {
  // 重置所有字段到初始状态
  Object.assign(formData, defaultFormData)
  // 重置表单校验状态
  formRef.value?.formRef?.resetFields()
}

// 当弹窗打开时重置表单
watch(() => props.open, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 提交处理
const handleOk = async () => {
  console.log('handleOk formData:', formData)
  if (!formRef.value) {
    message.error('表单组件未初始化')
    return
  }

  try {
    confirmLoading.value = true
    
    // 先验证必填字段
    if (!formData.name?.trim() || !formData.target?.trim()) {
      throw new Error(formData.name?.trim() ? '任务目标不能为空' : '任务名称不能为空')
    }

    // 进行表单验证
    await formRef.value.validate()

    // 构造请求数据
    const requestData = {
      name: formData.name.trim(),
      target: formData.target.trim(),
      domain_brute_type: formData.domain_brute_type || 'small',
      port_scan_type: formData.port_scan_type || 'top100',
      domain_brute: Boolean(formData.domain_brute),
      alt_dns: Boolean(formData.alt_dns),
      dns_query_plugin: Boolean(formData.dns_query_plugin),
      casm_search: Boolean(formData.casm_search),
      port_scan: Boolean(formData.port_scan),
      service_detection: Boolean(formData.service_detection),
      os_detection: Boolean(formData.os_detection),
      ssl_cert: Boolean(formData.ssl_cert),
      skip_scan_cdn_ip: Boolean(formData.skip_scan_cdn_ip),
      site_identify: Boolean(formData.site_identify),
      search_engines: Boolean(formData.search_engines),
      site_spider: Boolean(formData.site_spider),
      site_capture: Boolean(formData.site_capture),
      file_leak: Boolean(formData.file_leak),
      findvhost: Boolean(formData.findvhost),
      nuclei_scan: Boolean(formData.nuclei_scan),
      web_info_hunter: Boolean(formData.web_info_hunter)
    }

    // 打印请求数据用于调试
    console.log('准备发送的请求数据:', requestData)

    // 确保所有必填字段都有值
    if (!requestData.name || !requestData.target) {
      throw new Error('任务名称和目标不能为空')
    }

    // 发送请求
    const response = await http.post('/task/', requestData)
    
    if (response.data?.code === 200) {
      message.success('任务创建成功')
      emit('success')
      emit('update:open', false)
      resetForm()
    } else {
      throw new Error(response.data?.message || '创建任务失败')
    }
  } catch (error: any) {
    console.error('提交任务时出错:', error)
    if (error.errorFields) {
      const errors = error.errorFields.map((field: any) => field.errors[0])
      message.error(errors.join(', '))
    } else {
      message.error(error.message || '创建任务失败，请检查输入')
    }
  } finally {
    confirmLoading.value = false
  }
}

// 取消处理
const handleCancel = () => {
  resetForm()
  emit('cancel')
  emit('update:open', false)
}
</script>