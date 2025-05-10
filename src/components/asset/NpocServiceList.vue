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
  { title: '服务名', key: 'service_name' },
  { title: '端口', key: 'port' },
  { title: '协议', key: 'protocol' },
  { title: '识别方式', key: 'identify_method' },
  { title: '更新时间', key: 'update_time' }
];

async function fetchData() {
  // TODO: 替换为实际接口
  // const res = await http.get(`/api/npoc_service/?task_id=${props.taskId}`);
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
