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

    <!-- 任务统计信息卡片，改为资产搜索的多标签列表 -->
    <a-card title="资产列表" :bordered="false" class="detail-card asset-search-card">
      <a-tabs v-model:activeKey="activeTab" type="card" class="asset-tabs">
        <a-tab-pane key="site" tab="站点">
          <site-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="domain" tab="域名">
          <domain-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="ip" tab="IP">
          <ip-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="url" tab="URL">
          <url-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="ssl" tab="SSL证书">
          <ssl-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="service" tab="服务">
          <service-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="npoc" tab="NPOC服务">
          <npoc-service-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="cip" tab="C段IP">
          <cip-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="wih" tab="WIH">
          <wih-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="fileleak" tab="文件泄漏">
          <fileleak-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="vuln" tab="漏洞">
          <vuln-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="nuclei" tab="Nuclei结果">
          <nuclei-result-search :taskId="taskId" />
        </a-tab-pane>
        <a-tab-pane key="finger" tab="指纹统计">
          <stat-finger-search :taskId="taskId" />
        </a-tab-pane>
      </a-tabs>
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
import http from '@/plugins/http';
import SiteSearch from '@/components/asset/SiteSearch.vue';
import DomainSearch from '@/components/asset/DomainSearch.vue';
import IpSearch from '@/components/asset/IpSearch.vue';
import UrlSearch from '@/components/asset/UrlSearch.vue';
import SslSearch from '@/components/asset/SslSearch.vue';
import ServiceSearch from '@/components/asset/ServiceSearch.vue';
import NpocServiceSearch from '@/components/asset/NpocServiceSearch.vue';
import CipSearch from '@/components/asset/CipSearch.vue';
import WihSearch from '@/components/asset/WihSearch.vue';
import FileleakSearch from '@/components/asset/FileleakSearch.vue';
import VulnSearch from '@/components/asset/VulnSearch.vue';
import NucleiResultSearch from '@/components/asset/NucleiResultSearch.vue';
import StatFingerSearch from '@/components/asset/StatFingerSearch.vue';

const router = useRouter();
const route = useRoute();
const taskId = ref<string>('');
const activeTab = ref('site');

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
  const id = route.params.id;
  if (!id) {
    message.error('任务ID不能为空');
    return;
  }
  
  taskId.value = id as string;
  loading.value = true;

  try {
    // 按接口文档，直接通过 /task/?_id=xxx 获取任务详情和结果
    const { data } = await http.get('/task/', {
      params: { _id: taskId.value }
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

.asset-search-card .asset-tabs {
  margin-top: -16px;
  margin-left: -24px;
  margin-right: -24px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 16px;
}

:deep(.ant-tabs-content-holder) {
  padding: 0;
}

:deep(.ant-tabs-nav-wrap) {
  overflow-x: auto;
}
</style>