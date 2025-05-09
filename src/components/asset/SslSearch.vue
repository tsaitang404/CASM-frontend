<template>
  <div class="ssl-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="IP地址">
          <a-input v-model:value="form.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-item>
        <a-form-item label="端口">
          <a-input v-model:value="form.port" placeholder="请输入端口" allow-clear />
        </a-form-item>
        <a-form-item label="主题名称">
          <a-input v-model:value="form.subject_dn" placeholder="请输入主题名称" allow-clear />
        </a-form-item>
        <a-form-item label="签发者">
          <a-input v-model:value="form.issuer_dn" placeholder="请输入签发者名称" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch" :loading="loading">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="search-result">
      <a-table 
        :dataSource="tableData" 
        :columns="columns"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
        bordered
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SslSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import http from '@/plugins/http'

interface SslCert {
  _id: string
  ip: string
  port: string
  cert: {
    subject_dn: string
    issuer_dn: string
    serial_number: string
    validity: {
      start: string
      end: string
    }
    fingerprint: {
      sha256: string
      sha1: string
      md5: string
    }
    extensions: {
      subjectAltName: string[]
    }
  }
}

// 查询表单
const form = reactive({
  ip: '',
  port: '',
  subject_dn: '',
  issuer_dn: ''
})

// 表格数据
const tableData = ref<SslCert[]>([])
const loading = ref(false)

// 分页配置
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true
})

// 表格列定义
const columns = [
  {
    title: 'IP地址',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
  },
  {
    title: '主题名称',
    dataIndex: ['cert', 'subject_dn'],
    key: 'subject_dn',
  },
  {
    title: '签发者',
    dataIndex: ['cert', 'issuer_dn'],
    key: 'issuer_dn',
  },
  {
    title: '证书有效期',
    dataIndex: ['cert', 'validity'],
    key: 'validity',
    customRender: ({ text }: { text: { start: string, end: string } }) => {
      return `${text.start} - ${text.end}`
    }
  },
  {
    title: '备用名称',
    dataIndex: ['cert', 'extensions', 'subjectAltName'],
    key: 'subjectAltName',
    customRender: ({ text }: { text: string[] }) => text?.join(', ') || '-'
  }
]

// 搜索SSL证书
const handleSearch = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (form.ip) params.append('ip', form.ip)
    if (form.port) params.append('port', form.port)
    if (form.subject_dn) params.append('cert.subject_dn', form.subject_dn)
    if (form.issuer_dn) params.append('cert.issuer_dn', form.issuer_dn)
    params.append('page', String(pagination.current))
    params.append('size', String(pagination.pageSize))

    const { code, message: msg, items, total } = await http.get(`/cert/?${params.toString()}`)
    
    if (code === 200) {
      tableData.value = items || []
      pagination.total = total || 0
    } else {
      throw new Error(msg || '查询失败')
    }
  } catch (error) {
    console.error('SSL证书搜索错误:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.ip = ''
  form.port = ''
  form.subject_dn = ''
  form.issuer_dn = ''
  pagination.current = 1
  handleSearch()
}

// 处理表格分页、排序、筛选变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  handleSearch()
}

// 初始加载
handleSearch()
</script>

<style scoped>
.ssl-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
}
</style>