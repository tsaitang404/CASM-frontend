<script setup lang="ts">
import { useRouter } from 'vue-router'
import { 
  CompassOutlined, 
  SecurityScanOutlined, 
  DashboardOutlined, 
  AlertOutlined, 
  RocketOutlined 
} from '@ant-design/icons-vue'
const router = useRouter()
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>欢迎使用网络空间测绘系统</h1>
      <p class="subtitle">全方位的资产发现、监控及风险巡航平台</p>
      <div class="action-buttons">
        <a-button type="primary" size="large" @click="router.push('/task')">
          开始使用
          <template #icon><RocketOutlined /></template>
        </a-button>
        <a-button size="large" @click="router.push('/status')">
          系统状态
          <template #icon><DashboardOutlined /></template>
        </a-button>
      </div>
    </div>

    <div class="info-cards">
      <a-row :gutter="[24, 24]">
        <a-col :span="8">
          <a-card hoverable @click="router.push('/task')">
            <template #title>
              <div class="card-title">
                <CompassOutlined />
                <span>资产发现</span>
              </div>
            </template>
            <p>全面扫描网络资产，自动发现域名、IP、站点等资产信息。支持多种扫描方式，包括域名爆破、端口扫描、服务识别等。</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card hoverable @click="router.push('/monitor')">
            <template #title>
              <div class="card-title">
                <SecurityScanOutlined />
                <span>安全监控</span>
              </div>
            </template>
            <p>对资产进行持续监控，及时发现资产变化。支持变更检测、定时扫描，确保资产安全性持续可控。</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card hoverable @click="router.push('/pocinfo')">
            <template #title>
              <div class="card-title">
                <AlertOutlined />
                <span>风险巡航</span>
              </div>
            </template>
            <p>集成大量POC插件，对资产进行安全风险检测。支持漏洞扫描、弱口令检测、配置检查等多种安全检测方式。</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div class="feature-section">
      <h2>系统特点</h2>
      <a-row :gutter="[16, 36]">
        <a-col :span="12">
          <div class="feature-item">
            <h3>高效的资产管理</h3>
            <p>系统提供全面的资产发现、分类、标签化管理功能，帮助用户快速了解资产全貌。支持多种资产类型，包括域名、IP、站点、服务等。</p>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="feature-item">
            <h3>自动化安全检测</h3>
            <p>集成多种安全检测工具，系统能够自动对资产进行安全风险检测，包括常见漏洞、弱口令、配置错误等，降低人工排查工作量。</p>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="feature-item">
            <h3>可视化分析报告</h3>
            <p>系统提供直观的数据可视化界面，帮助用户快速了解资产安全状态，支持多种报表导出格式，方便与其他系统集成。</p>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="feature-item">
            <h3>灵活的任务调度</h3>
            <p>支持定时任务和周期任务，用户可以根据需求灵活配置扫描策略和执行计划，满足不同场景下的安全检测需求。</p>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 48px 20px 64px;
  margin-bottom: 32px;
  background: linear-gradient(to right, #f0f5ff, #e6f7ff);
  border-radius: 8px;
}

.welcome-section h1 {
  font-size: 36px;
  color: #1890ff;
  margin-bottom: 16px;
  font-weight: 500;
}

.welcome-section .subtitle {
  font-size: 18px;
  color: #555;
  margin-bottom: 32px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #1890ff;
}

.card-title .anticon {
  font-size: 22px;
}

.info-cards {
  margin-bottom: 48px;
}

.info-cards .ant-card {
  height: 100%;
  transition: all 0.3s;
  cursor: pointer;
}

.info-cards .ant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-cards p {
  color: #666;
  line-height: 1.8;
}

.feature-section {
  padding: 20px 0 40px;
}

.feature-section h2 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.feature-section h2:after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 60px;
  height: 3px;
  background-color: #1890ff;
  transform: translateX(-50%);
}

.feature-item h3 {
  font-size: 18px;
  color: #1890ff;
  margin-bottom: 12px;
}

.feature-item p {
  color: #666;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 32px 16px;
  }
  
  .welcome-section h1 {
    font-size: 28px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
