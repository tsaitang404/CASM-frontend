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
  if (status !== 'waiting' && 
      status !== 'done' && 
      status !== 'stop' && 
      status !== 'error') {
    return `运行中: ${status}`;
  }
  
  switch (status) {
    case 'waiting':
      return '等待中';
    case 'done':
      return '已完成';
    case 'stop':
      return '已停止';
    case 'error':
      return '失败';
    default:
      return '未知';
  }
};

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
    paused: '已暂停'
  }
  return textMap[status] || '未知状态'
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
  const stats = task.statistics || task.statistic || {}
  const parts = []
  
  if (stats.site_cnt !== undefined) {
    parts.push(`站点: ${stats.site_cnt}`)
  }
  if (stats.domain_cnt !== undefined) {
    parts.push(`域名: ${stats.domain_cnt}`)
  }
  if (stats.wih_cnt !== undefined) {
    parts.push(`WIH: ${stats.wih_cnt}`)
  }
  
  return parts.join(' | ')
}

export function calculateProgress(task: Task): number {
  const stats = task.statistics || task.statistic || {}
  const total = stats.total || 0
  const processed = (stats.success || 0) + (stats.failed || 0)
  return total > 0 ? Math.floor((processed / total) * 100) : 0
}