<template>
  <div class="status-view">
    <div class="status-card">
      <h2>系统运行状态</h2>
      
      <el-card class="status-info">
        <div class="status-item">
          <span class="label">服务状态:</span>
          <el-tag :type="systemStatus === 'running' ? 'success' : 'danger'">
            {{ systemStatus === 'running' ? '运行中' : '停止' }}
          </el-tag>
        </div>
        
        <div class="status-item">
          <span class="label">运行时间:</span>
          <span>{{ uptime }}</span>
        </div>

        <div class="status-item">
          <span class="label">CPU使用率:</span>
          <el-progress 
            :percentage="cpuUsage" 
            :color="getProgressColor(cpuUsage)"
            :stroke-width="15"
          />
        </div>

        <div class="status-item">
          <span class="label">内存使用率:</span>
          <el-progress 
            :percentage="memoryUsage" 
            :color="getProgressColor(memoryUsage)"
            :stroke-width="15"
          />
        </div>
        
        <div class="status-item">
          <span class="label">磁盘使用率:</span>
          <el-progress 
            :percentage="diskUsage" 
            :color="getProgressColor(diskUsage)"
            :stroke-width="15"
          />
        </div>
      </el-card>

      <el-card class="task-stats">
        <template #header>
          <div class="card-header">
            <span>任务统计</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-box">
              <h3>总任务数</h3>
              <div class="stat-number">{{ taskStats.total || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-box">
              <h3>运行中</h3>
              <div class="stat-number running">{{ taskStats.running || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-box">
              <h3>已完成</h3>
              <div class="stat-number finished">{{ taskStats.finished || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-box">
              <h3>失败</h3>
              <div class="stat-number failed">{{ taskStats.failed || 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const systemStatus = ref('running')
const uptime = ref('0天0小时0分')
const cpuUsage = ref(0)
const memoryUsage = ref(0)
const diskUsage = ref(0)
const taskStats = ref({
  total: 0,
  running: 0,
  finished: 0,
  failed: 0
})

// 获取系统状态
const getSystemStatus = async () => {
  try {
    const response = await axios.get('/api/status')
    const data = response.data.data
    
    systemStatus.value = data.status
    uptime.value = formatUptime(data.uptime)
    cpuUsage.value = parseFloat(data.cpu_usage.toFixed(1))
    memoryUsage.value = parseFloat(data.memory_usage.toFixed(1))
    diskUsage.value = parseFloat(data.disk_usage.toFixed(1))
  } catch (error) {
    ElMessage.error('获取系统状态失败')
  }
}

// 获取任务统计
const getTaskStats = async () => {
  try {
    const response = await axios.get('/api/task/stats')
    taskStats.value = response.data.data
  } catch (error) {
    ElMessage.error('获取任务统计失败')
  }
}

// 格式化运行时间
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  return `${days}天${hours}小时${minutes}分`
}

// 根据使用率返回不同的进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 定时刷新数据
let timer: number
const startTimer = () => {
  timer = window.setInterval(() => {
    getSystemStatus()
    getTaskStats()
  }, 30000) // 每30秒刷新一次
}

onMounted(() => {
  getSystemStatus()
  getTaskStats()
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
  padding: 20px;
}

.status-card {
  max-width: 1200px;
  margin: 0 auto;
}

.status-card h2 {
  margin-bottom: 20px;
  color: #303133;
}

.status-info {
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item .label {
  width: 100px;
  color: #606266;
}

.status-item .el-progress {
  flex: 1;
  margin-left: 20px;
}

.task-stats .el-row {
  margin: 0 -10px;
}

.stat-box {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.stat-box h3 {
  color: #606266;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-number.running {
  color: #409EFF;
}

.stat-number.finished {
  color: #67C23A;
}

.stat-number.failed {
  color: #F56C6C;
}
</style>