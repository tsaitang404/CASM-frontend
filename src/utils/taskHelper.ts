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
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + '...';
};

// 构建查询参数
export const buildQueryParams = (searchForm: any): URLSearchParams => {
  const params = new URLSearchParams();
  
  // 添加基本查询参数
  if (searchForm.name !== undefined && searchForm.name !== null && searchForm.name !== '') {
    params.append('name', searchForm.name);
  }
  if (searchForm.target !== undefined && searchForm.target !== null && searchForm.target !== '') {
    params.append('target', searchForm.target);
  }
  if (searchForm.status !== undefined && searchForm.status !== null && searchForm.status !== '') {
    params.append('status', searchForm.status);
  }
  if (searchForm.task_tag !== undefined && searchForm.task_tag !== null && searchForm.task_tag !== '') {
    params.append('task_tag', searchForm.task_tag);
  }

  // 添加选项查询参数
  const options: any = {};
  if (searchForm['options.domain_brute'] !== undefined && searchForm['options.domain_brute'] !== null) {
    options.domain_brute = searchForm['options.domain_brute'];
  }
  if (searchForm['options.domain_brute_type'] !== undefined && searchForm['options.domain_brute_type'] !== '') {
    options.domain_brute_type = searchForm['options.domain_brute_type'];
  }
  if (searchForm['options.port_scan'] !== undefined && searchForm['options.port_scan'] !== null) {
    options.port_scan = searchForm['options.port_scan'];
  }
  if (searchForm['options.port_scan_type'] !== undefined && searchForm['options.port_scan_type'] !== '') {
    options.port_scan_type = searchForm['options.port_scan_type'];
  }

  // 只有当options有值时才添加到查询参数中
  if (Object.keys(options).length > 0) {
    params.append('options', JSON.stringify(options));
  }

  // 添加统计数据查询条件
  if (searchForm.siteCountCompare && searchForm.siteCountValue !== null) {
    switch (searchForm.siteCountCompare) {
      case 'eq':
        params.append('statistic.site_cnt', searchForm.siteCountValue.toString());
        break;
      case 'gt':
        params.append('statistic.site_cnt__gt', searchForm.siteCountValue.toString());
        break;
      case 'lt':
        params.append('statistic.site_cnt__lt', searchForm.siteCountValue.toString());
        break;
    }
  }

  if (searchForm.domainCountCompare && searchForm.domainCountValue !== null) {
    switch (searchForm.domainCountCompare) {
      case 'eq':
        params.append('statistic.domain_cnt', searchForm.domainCountValue.toString());
        break;
      case 'gt':
        params.append('statistic.domain_cnt__gt', searchForm.domainCountValue.toString());
        break;
      case 'lt':
        params.append('statistic.domain_cnt__lt', searchForm.domainCountValue.toString());
        break;
    }
  }

  if (searchForm.wihCountCompare && searchForm.wihCountValue !== null) {
    switch (searchForm.wihCountCompare) {
      case 'eq':
        params.append('statistic.wih_cnt', searchForm.wihCountValue.toString());
        break;
      case 'gt':
        params.append('statistic.wih_cnt__gt', searchForm.wihCountValue.toString());
        break;
      case 'lt':
        params.append('statistic.wih_cnt__lt', searchForm.wihCountValue.toString());
        break;
    }
  }

  return params;
};