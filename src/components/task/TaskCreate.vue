<template>
  <a-modal
    :open="open"
    title="新建任务"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirmLoading="confirmLoading"
    @update:open="(val) => $emit('update:open', val)"
    width="800px"
  >
    <TaskForm
      ref="formRef"
      v-model="formData"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import TaskForm from './TaskForm.vue'
import type { FormInstance } from 'ant-design-vue'
import http from '@/plugins/http'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', open: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 确认加载状态
const confirmLoading = ref(false)

// 表单数据初始值
const defaultFormData = {
  name: '',  // 确保初始化为空字符串
  target: '',  // 确保初始化为空字符串
  domain_brute_type: 'small',  // 设置合理的默认值
  port_scan_type: 'top100',
  domain_brute: false,  // 默认关闭各项功能
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

// 表单数据，使用 reactive 保持响应性
const formData = reactive<typeof defaultFormData>({ ...defaultFormData })

// 重置表单数据到初始状态
const resetForm = () => {
  Object.assign(formData, defaultFormData)
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleOk = async () => {
  if (!formRef.value) return

  try {
    confirmLoading.value = true
    // 调用子组件的验证方法
    await formRef.value.validate()
    
    // 二次验证任务名称和目标
    const trimmedName = formData.name?.trim()
    const trimmedTarget = formData.target?.trim()
    
    if (!trimmedName || !trimmedTarget) {
      message.error('任务名称和目标不能为空')
      return
    }
    
    // 构造任务数据
    const taskData = {
      name: trimmedName,
      target: trimmedTarget,
      options: {
        domain_brute_type: formData.domain_brute_type,
        port_scan_type: formData.port_scan_type,
        domain_brute: formData.domain_brute,
        alt_dns: formData.alt_dns,
        dns_query_plugin: formData.dns_query_plugin,
        casm_search: formData.casm_search,
        port_scan: formData.port_scan,
        service_detection: formData.service_detection,
        os_detection: formData.os_detection,
        ssl_cert: formData.ssl_cert,
        skip_scan_cdn_ip: formData.skip_scan_cdn_ip,
        site_identify: formData.site_identify,
        search_engines: formData.search_engines,
        site_spider: formData.site_spider,
        site_capture: formData.site_capture,
        file_leak: formData.file_leak,
        findvhost: formData.findvhost,
        nuclei_scan: formData.nuclei_scan,
        web_info_hunter: formData.web_info_hunter
      }
    }

    console.log('提交的任务数据:', taskData)

    const { data } = await http.post('/task/', taskData)
    
    if (data.code === 200) {
      message.success('任务创建成功')
      emit('success')
      emit('update:open', false)
      resetForm()
    }

  } catch (error: any) {
    console.error('提交任务时出错:', error)
    // 错误消息已由 axios 拦截器统一处理
  } finally {
    confirmLoading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
  resetForm()
  emit('update:open', false)
}
</script>