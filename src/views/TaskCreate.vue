<template>
  <div class="task-create">
    <task-form
      v-model="formData"
      ref="formRef"
    />
    <div class="actions">
      <a-button type="primary" @click="handleSubmit" :loading="loading">提交</a-button>
      <a-button @click="handleReset">重置</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import TaskForm from '@/components/task/TaskForm.vue'
import { http } from '@/plugins/http'
import type { TaskForm as ITaskForm } from '@/types/task'

const router = useRouter()
const loading = ref(false)
const formRef = ref()
const formData = ref<ITaskForm>({
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
})

const handleSubmit = async () => {
  try {
    if (!formRef.value) {
      return
    }
    
    loading.value = true
    await formRef.value.validate()
    
    const response = await http.post('/tasks', formData.value)
    if (response.data.code === 0) {
      message.success('任务创建成功')
      router.push('/task-manage')
    } else {
      throw new Error(response.data.message || '任务创建失败')
    }
  } catch (error: any) {
    message.error(error.message || '提交失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.task-create {
  padding: 24px;
}

.actions {
  margin-top: 24px;
  text-align: center;
}

.actions .ant-btn + .ant-btn {
  margin-left: 12px;
}
</style>