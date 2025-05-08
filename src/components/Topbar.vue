<template>
  <div class="topbar">
    <div class="topbar-left">{{ title }}</div>
    <div class="topbar-right">
      <img class="avatar" src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" alt="avatar" />
      <span class="username">Admin</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'CASM 系统'
  }
})
</script>

<style scoped>
.topbar {
  width: 100%;
  height: 48px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px #f0f1f2;
  z-index: 101;
}
.topbar-left {
  font-size: 18px;
  font-weight: 500;
}
.topbar-right {
  display: flex;
  align-items: center;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}
.username {
  font-size: 15px;
  color: #333;
}
</style>
