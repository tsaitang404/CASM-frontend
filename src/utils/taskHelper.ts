import type { Task, TaskSearchForm } from '@/types/task'

// 获取任务状态颜色
export const getStatusColor = (status: string): string => {
  if (status !== 'waiting' && 
      status !== 'done' && 
      status !== 'stop' && 
      status !== 'error') {
    return 'green';
  }
  
  switch (status) {
    case 'waiting':
      return 'blue';
    case 'done':
      return 'gray';
    case 'stop':
      return 'red';
    case 'error':
      return 'orange';
    default:
      return 'default';
  }
};

// 获取任务状态文本
export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    waiting: '等待中',
    running: '运行中',
    done: '已完成',
    stop: '已停止',
    error: '失败',
    completed: '已完成',
    failed: '失败',
    paused: '已暂停',
    domain_brute: '域名爆破',
    dns_query_plugin: 'DNS查询插件调用',
    casm_search: 'CASM历史查询',
    alt_dns: 'DNS字典智能生成',
    find_site: '发现站点',
    port_scan: '端口扫描',
    ssl_cert: 'SSL证书获取',
    npoc_service_detection: '服务检测',
    FETCH_SITE: '站点基本信息获取',
    SITE_IDENTIFY: '站点识别',
    SITE_CAPTURE: '站点截图',
    SEARCH_ENGINES: '搜索引擎调用',
    SITE_SPIDER: '站点爬虫',
    FILE_LEAK: '文件泄露检测',
    POC_RUN: 'POC检测',
    NUCLEI_SCAN: 'Nuclei扫描',
    Info_Hunter: 'WEB JS信息收集',
    weak_brute: '服务弱口令爆破',
    SEARCH: '正在搜索',
    FETCH: '正在获取内容'
  }
  return textMap[status] || textMap['running']
}

// 截断文本
export function truncateText(text: string, length: number = 30): string {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

/**
 * 构建任务查询参数
 * @param searchForm 搜索表单数据
 * @returns URLSearchParams 查询参数
 */
export function buildQueryParams(searchForm: TaskSearchForm): URLSearchParams {
  const params = new URLSearchParams()
  
  Object.entries(searchForm).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      if (typeof value === 'boolean') {
        params.append(key, value.toString())
      } else {
        params.append(key, value.toString().trim())
      }
    }
  })
  
  return params
}

/**
 * 获取任务状态的显示文本
 * @param status 任务状态
 * @returns 状态显示文本
 */
export function getTaskStatusText(status: string): string {
  const textMap: Record<string, string> = {
    waiting: '等待中',
    running: '运行中',
    done: '已完成',
    stop: '已停止',
    error: '错误',
    completed: '已完成',
    failed: '失败',
    paused: '已暂停',
    domain_brute: '域名爆破',
    dns_query_plugin: 'DNS查询插件调用',
    casm_search: 'CASM历史查询',
    alt_dns: 'DNS字典智能生成',
    find_site: '发现站点',
    port_scan: '端口扫描',
    ssl_cert: 'SSL证书获取',
    npoc_service_detection: '服务检测',
    FETCH_SITE: '站点基本信息获取',
    SITE_IDENTIFY: '站点识别',
    SITE_CAPTURE: '站点截图',
    SEARCH_ENGINES: '搜索引擎调用',
    SITE_SPIDER: '站点爬虫',
    FILE_LEAK: '文件泄露检测',
    POC_RUN: 'POC检测',
    NUCLEI_SCAN: 'Nuclei扫描',
    Info_Hunter: 'WEB JS信息收集',
    weak_brute: '服务弱口令爆破',
    SEARCH: '正在搜索',
    FETCH: '正在获取内容'
  }
  return textMap[status] || textMap['running']
}

/**
 * 获取任务状态的显示颜色
 * @param status 任务状态
 * @returns 状态显示颜色
 */
export function getTaskStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    waiting: '#faad14',
    running: '#1890ff',
    done: '#52c41a',
    stop: '#d9d9d9',
    error: '#f5222d',
    completed: '#52c41a',
    failed: '#ff4d4f',
    paused: '#fa8c16'
  }
  return colorMap[status] || '#999999'
}

/**
 * 定时刷新任务列表
 * @param callback 回调函数
 * @param interval 刷新间隔(毫秒)
 * @returns clearInterval函数
 */
export function setupTaskRefresh(callback: () => void, interval: number = 10000): () => void {
  const timer = setInterval(callback, interval)
  return () => clearInterval(timer)
}

/**
 * 格式化任务统计数据
 * @param task 任务数据
 * @returns 格式化后的统计信息
 */
export function formatTaskStatistic(task: Task): string {
  const stats = task.statistics || task.statistic || {};
  const parts = [];

  if (stats.site_cnt !== undefined) parts.push(`站点: ${stats.site_cnt}`);
  if (stats.domain_cnt !== undefined) parts.push(`域名: ${stats.domain_cnt}`);
  if (stats.wih_cnt !== undefined) parts.push(`WIH: ${stats.wih_cnt}`);
  if (stats.port_cnt !== undefined) parts.push(`端口: ${stats.port_cnt}`);
  if (stats.ip_cnt !== undefined) parts.push(`IP: ${stats.ip_cnt}`);
  if (stats.service_cnt !== undefined) parts.push(`服务: ${stats.service_cnt}`);
  if (stats.vuln_cnt !== undefined) parts.push(`漏洞: ${stats.vuln_cnt}`);

  // 兼容旧数据结构
  if (parts.length === 0 && task.options) {
    if (task.options.domains_count) parts.push(`域名: ${task.options.domains_count}`);
    if (task.options.ips_count) parts.push(`IP: ${task.options.ips_count}`);
    if (task.options.ports_count) parts.push(`端口: ${task.options.ports_count}`);
  }

  return parts.join(' | ');
}

export function calculateProgress(task: Task): number {
  const stats = task.statistics || task.statistic || {}
  const total = stats.total || 0
  const processed = (stats.success || 0) + (stats.failed || 0)
  return total > 0 ? Math.floor((processed / total) * 100) : 0
}