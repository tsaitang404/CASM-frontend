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
  { title: '文件名', key: 'filename' },
  { title: '路径', key: 'path' },
  { title: '泄露类型', key: 'leak_type' },
  { title: '发现时间', key: 'found_time' }
];

async function fetchData() {
  // TODO: 替换为实际接口
  // const res = await http.get(`/api/fileleak/?task_id=${props.taskId}`);
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
