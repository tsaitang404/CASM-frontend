<template>
  <div class="task-detail-container">
    <!-- 返回按钮 -->
    <div class="header-actions">
      <a-button @click="goBack">
        <LeftOutlined />
        返回任务列表
      </a-button>
    </div>

    <!-- 任务基本信息卡片 -->
    <a-card title="基本信息" :bordered="false" class="detail-card">
      <a-descriptions :column="3">
        <a-descriptions-item label="任务名称">{{ taskDetail.name }}</a-descriptions-item>
        <a-descriptions-item label="任务ID">{{ taskDetail._id }}</a-descriptions-item>
        <a-descriptions-item label="任务状态">
          <a-tag :color="getStatusColor(taskDetail.status)">
            {{ getStatusText(taskDetail.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="任务目标">{{ taskDetail.target }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ taskDetail.create_time || '-' }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ taskDetail.start_time || '-' }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ taskDetail.end_time || '-' }}</a-descriptions-item>
        <a-descriptions-item label="Celery ID">{{ taskDetail.celery_id }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 任务选项设置卡片 -->
    <a-card title="任务选项" :bordered="false" class="detail-card">
      <a-descriptions :column="3" bordered>
        <a-descriptions-item label="域名爆破">
          {{ taskDetail.options?.domain_brute ? '开启' : '关闭' }}
        </a-descriptions-item>
        <a-descriptions-item label="域名爆破类型">
          {{ taskDetail.options?.domain_brute_type }}
        </a-descriptions-item>
        <a-descriptions-item label="端口扫描">
          {{ taskDetail.options?.port_scan ? '开启' : '关闭' }}
        </a-descriptions-item>
        <a-descriptions-item label="端口扫描类型">
          {{ taskDetail.options?.port_scan_type }}
        </a-descriptions-item>
        <a-descriptions-item label="服务识别">
          {{ taskDetail.options?.service_detection ? '开启' : '关闭' }}
        </a-descriptions-item>
        <a-descriptions-item label="操作系统识别">
          {{ taskDetail.options?.os_detection ? '开启' : '关闭' }}
        </a-descriptions-item>
        <a-descriptions-item label="站点识别">
          {{ taskDetail.options?.site_identify ? '开启' : '关闭' }}
        </a-descriptions-item>
        <a-descriptions-item label="文件泄露扫描">
          {{ taskDetail.options?.file_leak ? '开启' : '关闭' }}
        </a-descriptions-item>
        <a-descriptions-item label="DNS字典生成">
          {{ taskDetail.options?.alt_dns ? '开启' : '关闭' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 任务统计信息卡片 -->
    <a-card title="统计信息" :bordered="false" class="detail-card">
      <div class="stat-bar">
        <div class="stat-item stat-site">
          <span class="stat-label">站点</span>
          <span class="stat-value">{{ taskDetail.statistic?.site_cnt || taskDetail.statistics?.site_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-domain">
          <span class="stat-label">域名</span>
          <span class="stat-value">{{ taskDetail.statistic?.domain_cnt || taskDetail.statistics?.domain_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-wih">
          <span class="stat-label">WIH</span>
          <span class="stat-value">{{ taskDetail.statistic?.wih_cnt || taskDetail.statistics?.wih_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-ip">
          <span class="stat-label">IP</span>
          <span class="stat-value">{{ taskDetail.statistic?.ip_cnt || taskDetail.statistics?.ip_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-cip">
          <span class="stat-label">整数IP</span>
          <span class="stat-value">{{ taskDetail.statistic?.cip_cnt || taskDetail.statistics?.cip_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-service">
          <span class="stat-label">服务</span>
          <span class="stat-value">{{ taskDetail.statistic?.service_cnt || taskDetail.statistics?.service_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-npoc">
          <span class="stat-label">服务识别</span>
          <span class="stat-value">{{ taskDetail.statistic?.npoc_service_cnt || taskDetail.statistics?.npoc_service_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-cert">
          <span class="stat-label">证书</span>
          <span class="stat-value">{{ taskDetail.statistic?.cert_cnt || taskDetail.statistics?.cert_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-fileleak">
          <span class="stat-label">泄露</span>
          <span class="stat-value">{{ taskDetail.statistic?.fileleak_cnt || taskDetail.statistics?.fileleak_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-url">
          <span class="stat-label">URL</span>
          <span class="stat-value">{{ taskDetail.statistic?.url_cnt || taskDetail.statistics?.url_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-vuln">
          <span class="stat-label">漏洞</span>
          <span class="stat-value">{{ taskDetail.statistic?.vuln_cnt || taskDetail.statistics?.vuln_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-nuclei">
          <span class="stat-label">Nuclei</span>
          <span class="stat-value">{{ taskDetail.statistic?.nuclei_result_cnt || taskDetail.statistics?.nuclei_result_cnt || 0 }}</span>
        </div>
        <div class="stat-item stat-finger">
          <span class="stat-label">指纹</span>
          <span class="stat-value">{{ taskDetail.statistic?.stat_finger_cnt || taskDetail.statistics?.stat_finger_cnt || 0 }}</span>
        </div>
      </div>
    </a-card>

    <!-- 任务进度/结果列表 -->
    <a-card title="任务结果" :bordered="false" class="detail-card">
      <a-table
        :columns="resultColumns"
        :data-source="taskResults"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        size="middle"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.key === 'status'">
            <a-tag :color="text === 'success' ? 'success' : 'error'">
              {{ text === 'success' ? '成功' : '失败' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import http from '@/plugins/http'

const router = useRouter();
const route = useRoute();

// 任务详情数据
const taskDetail = ref<any>({});
const taskResults = ref<any[]>([]);
const loading = ref(false);

// 结果表格列定义
const resultColumns = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  }
];

// 返回任务列表
const goBack = () => {
  router.back();
};

// 获取任务状态颜色
const getStatusColor = (status: string) => {
  if (status !== 'waiting' && 
      status !== 'done' && 
      status !== 'stop' && 
      status !== 'error') {
    return 'green';
  }
  
  switch (status) {
    case 'waiting':
      return 'blue';
    case 'done':
      return 'gray';
    case 'stop':
      return 'red';
    case 'error':
      return 'orange';
    default:
      return 'default';
  }
};

// 获取任务状态文本
const getStatusText = (status: string) => {
  if (status !== 'waiting' && 
      status !== 'done' && 
      status !== 'stop' && 
      status !== 'error') {
    return `运行中: ${status}`;
  }
  
  switch (status) {
    case 'waiting':
      return '等待中';
    case 'done':
      return '已完成';
    case 'stop':
      return '已停止';
    case 'error':
      return '失败';
    default:
      return '未知';
  }
};

// 获取任务详情
const fetchTaskDetail = async () => {
  const taskId = route.params.id;
  if (!taskId) {
    message.error('任务ID不能为空');
    return;
  }

  loading.value = true;

  try {
    // 按接口文档，直接通过 /task/?_id=xxx 获取任务详情和结果
    const { data } = await http.get('/task/', {
      params: { _id: taskId }
    });

    if (data.code !== 200) {
      throw new Error(data.message || '获取任务详情失败');
    }

    if (data.items && data.items.length > 0) {
      taskDetail.value = data.items[0];
      // 任务结果直接从详情数据中获取（如有）
      taskResults.value = data.items[0].results || [];
    } else {
      throw new Error('未找到任务详情');
    }
  } catch (error: any) {
    message.error('获取任务详情失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取任务详情
onMounted(() => {
  fetchTaskDetail();
});
</script>

<style>
@import '@/assets/styles/views/task-detail.css';
</style>