<template>
  <div class="status-view">
    <div class="status-card">
      <!-- 系统状态卡片 -->
      <a-card class="system-info" title="系统状态">
        <a-row :gutter="24">
          <a-col :span="24">
            <div class="status-item">
              <span class="label">Mongo数据库:</span>
              <a-tag :color="mongoStatus === 'running' ? 'success' : 'error'">
                {{ mongoStatus === 'running' ? '运行中' : '停止' }}
              </a-tag>
            </div>

            <div class="status-item">
              <span class="label">调度器:</span>
              <a-tag :color="schedulerStatus === 'running' ? 'success' : 'error'">
                {{ schedulerStatus === 'running' ? '运行中' : '停止' }}
              </a-tag>
            </div>

            <div class="status-item">
              <span class="label">消息队列:</span>
              <a-tag :color="rabbitStatus === 'running' ? 'success' : 'error'">
                {{ rabbitStatus === 'running' ? '运行中' : '停止' }}
              </a-tag>
            </div>

            <div class="status-item">
              <span class="label">扫描节点:</span>
              <a-tag :color="workerCount > 0 ? 'success' : 'warning'">
                {{ workerCount }} 个工作节点
              </a-tag>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 资产统计卡片 -->  
      <a-card title="资产统计" style="margin-top: 24px;">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic title="域名资产" :value="assetStats.domains || 0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="IP资产" :value="assetStats.ips || 0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="站点资产" :value="assetStats.sites || 0" />
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 24px;">
          <a-col :span="8">
            <a-statistic title="服务资产" :value="assetStats.services || 0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="漏洞数量" :value="assetStats.vulnerabilities || 0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="证书数量" :value="assetStats.certificates || 0" />
          </a-col>
        </a-row>
      </a-card>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'

// 系统状态数据
const mongoStatus = ref('error')
const rabbitStatus = ref('error')
const workerCount = ref(0)

// 调度器状态数据
const schedulerStatus = ref('error')
const schedulerNodeCount = ref(0)
const schedulerLastTime = ref('')

// 资产统计数据
const assetStats = ref({
  domains: 0,
  ips: 0,  
  sites: 0,
  services: 0,
  vulnerabilities: 0,
  certificates: 0
})

// 获取系统状态
const getSystemStatus = async () => {
  try {
    const token = localStorage.getItem('Token')
    if (!token) {
      message.error('您尚未登录或登录已过期')
      return
    }

    const response = await fetch('/api/status/', {
      headers: {
        'Token': token
      }
    })

    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`)
    }

    const data = await response.json()
    
    // 修改错误处理逻辑
    if (data.code === 401) {
      message.error('登录已过期，请重新登录')
      return
    }
    
    if (data.code !== 200 || !data.data) {
      throw new Error(data.message || '获取系统状态失败')
    }

    // 更新系统组件状态
    mongoStatus.value = data.data.mongodb?.status || 'error'
    rabbitStatus.value = data.data.rabbitmq?.status || 'error'
    workerCount.value = Object.values(data.data.workers || {}).filter(w => w.status === 'running').length
    
    // 更新调度器状态
    schedulerStatus.value = data.data.scheduler?.status || 'error'
    schedulerNodeCount.value = data.data.scheduler?.nodeCount || 0
    schedulerLastTime.value = data.data.scheduler?.lastTime || ''

    // 更新资产统计数据
    if (data.data.assets) {
      assetStats.value = {
        domains: data.data.assets.domains || 0,
        ips: data.data.assets.ips || 0,
        sites: data.data.assets.sites || 0,
        services: data.data.assets.services || 0,
        vulnerabilities: data.data.assets.vulnerabilities || 0,
        certificates: data.data.assets.certificates || 0
      }
    }
  } catch (error) {
    console.error('获取系统状态错误:', error)
    message.error('获取系统状态失败：' + (error as Error).message)
  }
}

// 定时刷新数据
let timer: number
const startTimer = () => {
  timer = window.setInterval(() => {
    getSystemStatus()
  }, 30000) // 每30秒刷新一次
}

onMounted(() => {
  getSystemStatus()
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.status-view {
  padding: 24px;
}

.status-card {
  max-width: 1200px;
  margin: 0 auto;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item .label {
  width: 100px;
  color: rgba(0, 0, 0, 0.65);  
  margin-right: 16px;
}

:deep(.ant-card-head) {
  min-height: 48px;
}

:deep(.ant-card-head-title) {
  padding: 12px 0;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
} 
</style>