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
  name: '',
  target: '',
  domain_brute_type: 'big',
  port_scan_type: 'top100',
  domain_brute: true,
  alt_dns: true,
  dns_query_plugin: true,
  casm_search: true,
  port_scan: true,
  service_detection: true,
  os_detection: true,
  ssl_cert: true,
  skip_scan_cdn_ip: true,
  site_identify: true,
  search_engines: true,
  site_spider: false,
  site_capture: true,
  file_leak: true,
  findvhost: true,
  nuclei_scan: true,
  web_info_hunter: true
}

// 表单数据，使用 reactive 保持响应性
const formData = reactive({ ...defaultFormData })

// 重置表单数据到初始状态
const resetForm = () => {
  Object.assign(formData, defaultFormData)
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleOk = () => {
  if (!formRef.value) return

  formRef.value.validate()
    .then(() => {
      confirmLoading.value = true
      
      const taskData = {
        name: formData.name,
        target: formData.target,
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
      
      const token = localStorage.getItem('Token')
      if (!token) {
        message.error('您尚未登录或登录已过期，请重新登录')
        confirmLoading.value = false
        return
      }
      
      fetch('/api/task/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token
        },
        body: JSON.stringify(taskData)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || '网络请求失败')
          }).catch(() => {
            throw new Error(`请求失败 (${response.status})`)
          })
        }
        return response.json()
      })
      .then(data => {
        if (data.code === 401) {
          message.error('登录已过期，请重新登录')
          return
        }
        
        message.success('创建任务成功')
        emit('success')
        resetForm()
        emit('update:open', false)
      })
      .catch(error => {
        message.error('创建任务失败: ' + error.message)
      })
      .then(() => {
        confirmLoading.value = false
      })
    })
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
  resetForm()
  emit('update:open', false)
}
</script>