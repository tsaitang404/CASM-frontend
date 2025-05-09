<template>
  <a-form :model="formState" :rules="rules" ref="formRef">
    <a-form-item label="任务名称" name="name">
      <a-input v-model="formState.name" />
    </a-form-item>
    <a-form-item label="任务目标" name="target">
      <a-input v-model="formState.target" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSubmit" :loading="loading">提交</a-button>
      <a-button @click="handleReset">重置</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const formState = reactive({
      name: '',
      target: ''
    })

    const loading = ref(false)
    const formRef = ref()
    const router = useRouter()

    const rules = {
      name: [
        { required: true, message: '请输入任务名称', trigger: 'blur' },
        { min: 2, max: 50, message: '任务名称长度应在2-50个字符之间', trigger: 'blur' }
      ],
      target: [
        { required: true, message: '请输入任务目标', trigger: 'blur' },
        { validator: (rule, value) => {
            if (!value.trim()) {
              return Promise.reject('任务目标不能为空')
            }
            // 可以添加更多的目标格式验证，比如域名、IP等
            return Promise.resolve()
          },
          trigger: 'blur'
        }
      ]
    }

    const handleSubmit = async () => {
      try {
        // 先进行表单验证
        await formRef.value.validateFields()
        loading.value = true
        
        const submitData = {
          name: formState.name.trim(),
          target: formState.target.trim()
        }
        
        // 检查数据是否为空
        if (!submitData.name || !submitData.target) {
          message.error('任务名称和目标不能为空')
          loading.value = false
          return
        }

        // 发送请求
        const response = await fetch('/api/task/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        })

        if (!response.ok) {
          throw new Error('提交任务失败')
        }

        const result = await response.json()
        
        if (result.code === 200) {
          message.success('任务创建成功')
          router.push('/task-manage')
        } else {
          throw new Error(result.message || '提交任务失败')
        }
      } catch (error) {
        message.error(error.message || '提交失败，请检查输入')
      } finally {
        loading.value = false
      }
    }

    const handleReset = () => {
      formRef.value.resetFields()
    }

    return {
      formState,
      rules,
      loading,
      formRef,
      handleSubmit,
      handleReset
    }
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>