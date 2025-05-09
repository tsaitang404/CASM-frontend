<template>
  <div class="site-search">
    <div class="search-form">
      <a-form :model="form" layout="inline">
        <a-form-item label="站点URL">
          <a-input v-model:value="form.url" placeholder="请输入站点URL" allow-clear />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="form.title" placeholder="请输入站点标题" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    
    <div class="search-result">
      <a-table :dataSource="tableData" :columns="columns" bordered />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SiteSearch'
})
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  url: '',
  title: ''
})

const tableData = ref([])

const columns = [
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
]

const handleSearch = () => {
  // TODO: 实现搜索逻辑
}

const handleReset = () => {
  form.url = ''
  form.title = ''
}
</script>

<style scoped>
.site-search {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-result {
  margin-top: 20px;
}
</style>