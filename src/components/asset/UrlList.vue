<template>
  <div class="asset-list">
    <ResizableTable :columns="columns" :data="data" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import ResizableTable from '../ResizableTable.vue';

const props = defineProps<{ taskId?: string }>();
const data = ref([]);

const columns = [
  { title: 'URL', key: 'url' },
  { title: '状态码', key: 'status_code' },
  { title: '标题', key: 'title' },
  { title: '发现时间', key: 'found_time' }
];

async function fetchData() {
  // TODO: 替换为实际接口
  // const res = await http.get(`/api/url/?task_id=${props.taskId}`);
  // data.value = res.data;
  data.value = [];
}

onMounted(fetchData);
watch(() => props.taskId, fetchData);
</script>

<style scoped>
.asset-list {
  margin: 16px 0;
}
</style>
