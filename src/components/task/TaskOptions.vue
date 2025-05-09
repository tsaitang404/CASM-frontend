<template>
  <a-descriptions :column="2" bordered>
    <a-descriptions-item label="域名爆破">{{ options.domain_brute ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="域名爆破类型">{{ options.domain_brute_type }}</a-descriptions-item>
    <a-descriptions-item label="端口扫描">{{ options.port_scan ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="端口扫描类型">{{ options.port_scan_type }}</a-descriptions-item>
    <a-descriptions-item label="服务识别">{{ options.service_detection ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="服务弱口令爆破">{{ options.service_brute ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="操作系统识别">{{ options.os_detection ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="站点识别">{{ options.site_identify ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="文件泄露扫描">{{ options.file_leak ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="DNS字典智能生成">{{ options.alt_dns ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="搜索引擎调用">{{ options.search_engines ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="站点爬虫">{{ options.site_spider ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="历史查询">{{ options.casm_search ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="域名插件查询">{{ options.dns_query_plugin ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="跳过CDN IP端口扫描">{{ options.skip_scan_cdn_ip ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="Nuclei扫描">{{ options.nuclei_scan ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="Host碰撞检测">{{ options.findvhost ? '开启' : '关闭' }}</a-descriptions-item>
    <a-descriptions-item label="Web信息猎手">{{ options.web_info_hunter ? '开启' : '关闭' }}</a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
import type { TaskOptions } from '@/types/task'

interface Props {
  options: TaskOptions
}

defineProps<Props>()
</script>

<style scoped>
:deep(.ant-descriptions-item-label) {
  width: 180px;
}
</style>