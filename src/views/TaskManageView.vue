<template>
  <div class="task-manage-container">
    <div class="header-actions">
      <a-button type="primary" @click="showCreateTaskModal">
        <PlusOutlined />
        新建任务
      </a-button>
    </div>
    
    <div>这里是任务管理页面</div>

    <!-- 新建任务弹窗 -->
    <a-modal
      v-model:open="createTaskModalVisible"
      title="新建任务"
      @ok="handleCreateTask"
      @cancel="handleCancel"
      :confirm-loading="confirmLoading"
      width="600px"
      :bodyStyle="{ padding: '24px' }"
    >
      <a-form :model="taskForm" :rules="rules" ref="taskFormRef" layout="vertical">
        <!-- 基本信息 -->
        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item name="name" label="任务名称">
              <a-input v-model:value="taskForm.name" placeholder="请输入任务名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="target" label="目标">
              <a-input v-model:value="taskForm.target" placeholder="请输入目标IP/域名" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item name="domain_brute_type" label="域名爆破类型">
              <a-select v-model:value="taskForm.domain_brute_type">
                <a-select-option value="small">小字典</a-select-option>
                <a-select-option value="medium">中字典</a-select-option>
                <a-select-option value="big">大字典</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="port_scan_type" label="端口扫描类型">
              <a-select v-model:value="taskForm.port_scan_type">
                <a-select-option value="top100">Top100</a-select-option>
                <a-select-option value="top1000">Top1000</a-select-option>
                <a-select-option value="all">全部</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 扫描选项 -->
        <div class="option-section">
          <div class="option-header">扫描选项</div>
          
          <div class="option-group">
            <div class="group-title">信息收集</div>
            <div class="options">
              <a-checkbox v-model:checked="taskForm.domain_brute">域名爆破</a-checkbox>
              <a-checkbox v-model:checked="taskForm.alt_dns">DNS生成</a-checkbox>
              <a-checkbox v-model:checked="taskForm.dns_query_plugin">DNS解析</a-checkbox>
              <a-checkbox v-model:checked="taskForm.casm_search">搜索</a-checkbox>
            </div>
          </div>
          
          <div class="option-group">
            <div class="group-title">端口扫描</div>
            <div class="options">
              <a-checkbox v-model:checked="taskForm.port_scan">端口扫描</a-checkbox>
              <a-checkbox v-model:checked="taskForm.service_detection">服务识别</a-checkbox>
              <a-checkbox v-model:checked="taskForm.os_detection">系统识别</a-checkbox>
              <a-checkbox v-model:checked="taskForm.ssl_cert">SSL证书</a-checkbox>
            </div>
          </div>
          
          <div class="option-group">
            <div class="group-title">站点扫描</div>
            <div class="options">
              <a-checkbox v-model:checked="taskForm.site_identify">站点识别</a-checkbox>
              <a-checkbox v-model:checked="taskForm.search_engines">搜索引擎</a-checkbox>
              <a-checkbox v-model:checked="taskForm.site_spider">站点爬虫</a-checkbox>
              <a-checkbox v-model:checked="taskForm.site_capture">站点截图</a-checkbox>
            </div>
          </div>
          
          <div class="option-group">
            <div class="group-title">安全扫描</div>
            <div class="options">
              <a-checkbox v-model:checked="taskForm.skip_scan_cdn_ip">跳过CDN</a-checkbox>
              <a-checkbox v-model:checked="taskForm.file_leak">文件泄露</a-checkbox>
              <a-checkbox v-model:checked="taskForm.findvhost">虚拟主机</a-checkbox>
              <a-checkbox v-model:checked="taskForm.nuclei_scan">Nuclei</a-checkbox>
              <a-checkbox v-model:checked="taskForm.web_info_hunter">Web信息</a-checkbox>
            </div>
          </div>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 表单引用
const taskFormRef = ref(null);

// 控制弹窗显示
const createTaskModalVisible = ref(false);
const confirmLoading = ref(false);

// 任务表单数据
const taskForm = reactive({
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
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1, max: 50, message: '任务名称长度应为1-50个字符', trigger: 'blur' }
  ],
  target: [
    { required: true, message: '请输入目标IP/域名', trigger: 'blur' }
  ],
  domain_brute_type: [
    { required: true, message: '请选择域名爆破类型', trigger: 'change' }
  ],
  port_scan_type: [
    { required: true, message: '请选择端口扫描类型', trigger: 'change' }
  ]
};

// 显示创建任务弹窗
const showCreateTaskModal = () => {
  console.log('点击了新建任务按钮');
  createTaskModalVisible.value = true;
};

// 处理取消
const handleCancel = () => {
  createTaskModalVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  if (taskFormRef.value) {
    taskFormRef.value.resetFields();
  }
};

// 处理创建任务
const handleCreateTask = () => {
  if (!taskFormRef.value) {
    console.error('表单引用不存在');
    return;
  }
  
  taskFormRef.value.validate()
    .then(() => {
      confirmLoading.value = true;
      
      console.log('提交表单数据:', JSON.stringify(taskForm));
      
      // 发送API请求
      fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskForm)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('网络请求失败');
        }
        return response.json();
      })
      .then(data => {
        message.success('创建任务成功');
        createTaskModalVisible.value = false;
        resetForm();
        // 这里可以添加刷新任务列表的逻辑
      })
      .catch(error => {
        message.error('创建任务失败: ' + error.message);
      })
      .finally(() => {
        confirmLoading.value = false;
      });
    })
    .catch(errors => {
      console.log('表单验证失败', errors);
    });
};
</script>

<style scoped>
.task-manage-container {
  padding: 24px;
}

.header-actions {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.option-section {
  border: 1px solid #f0f0f0;
  border-radius: 5px;
  margin-top: 16px;
}

.option-header {
  font-size: 18px;
  font-weight: 500;
  padding: 12px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.option-group {
  padding: 16px 20px 18px;
  border-bottom: 1px dashed #f0f0f0;
}

.option-group:last-child {
  border-bottom: none;
}

.group-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 0;
  padding-left: 16px;
}

/* 复选框样式 */
:deep(.ant-checkbox-wrapper) {
  font-size: 16px;
  margin-left: 0;
  padding: 0;
  line-height: 1.5;
}

:deep(.ant-checkbox) {
  font-size: 16px;
  margin-right: 8px;
}

/* 修改表单项的间距 */
:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 8px;
}

:deep(.ant-form-item-label > label) {
  font-size: 16px;
  height: 32px;
}

:deep(.ant-input) {
  padding: 6px 18px;
  font-size: 16px;
  line-height: 1.5;
  height: 40px;
}

:deep(.ant-select-selector) {
  padding: 0 18px !important;
  height: 40px !important;
  font-size: 16px;
}

:deep(.ant-select-selection-item) {
  line-height: 38px !important;
  font-size: 16px;
}

:deep(.ant-btn) {
  font-size: 16px;
  height: 40px;
  padding: 0px 20px;
}

:deep(.ant-modal-header) {
  padding: 20px 28px;
}

:deep(.ant-modal-footer) {
  padding: 20px 28px;
}

:deep(.ant-modal-title) {
  font-size: 20px;
}

:deep(.ant-modal-close-x) {
  height: 56px;
  width: 56px;
  line-height: 56px;
}

:deep(.ant-row) {
  margin-bottom: 0;
}
</style>
