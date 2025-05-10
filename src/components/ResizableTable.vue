<template>
  <a-table :columns="columns" :data-source="data" :pagination="false" bordered />
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  columns: any[],
  data: any[]
}>()
</script>
