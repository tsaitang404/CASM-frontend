<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
