export interface TaskOptions {
  domain_brute_type?: 'small' | 'medium' | 'big';
  port_scan_type?: 'top100' | 'top1000' | 'all';
  domain_brute?: boolean;
  alt_dns?: boolean;
  dns_query_plugin?: boolean;
  casm_search?: boolean;
  port_scan?: boolean;
  service_detection?: boolean;
  os_detection?: boolean;
  ssl_cert?: boolean;
  skip_scan_cdn_ip?: boolean;
  site_identify?: boolean;
  search_engines?: boolean;
  site_spider?: boolean;
  site_capture?: boolean;
  file_leak?: boolean;
  findvhost?: boolean;
  nuclei_scan?: boolean;
  web_info_hunter?: boolean;
  [key: string]: any;
}

export interface TaskStatistics {
  total: number;
  success: number;
  failed: number;
  site_cnt?: number;
  domain_cnt?: number;
  wih_cnt?: number;
}

export interface Task {
  _id: string;
  name: string;
  target: string;
  status: 'waiting' | 'running' | 'done' | 'stop' | 'error';
  options: TaskOptions;
  create_time?: string;
  update_time?: string;
  celery_id?: string;
  statistic?: {
    site_cnt?: number;
    domain_cnt?: number;
    wih_cnt?: number;
  };
  statistics?: TaskStatistics;
}

export interface SearchForm {
  name: string;
  target: string;
  status: string;
  task_tag: string;
  siteCountCompare: string;
  siteCountValue: number | null;
  domainCountCompare: string;
  domainCountValue: number | null;
  wihCountCompare: string;
  wihCountValue: number | null;
  'options.domain_brute': boolean | undefined;
  'options.domain_brute_type': string;
  'options.port_scan': boolean | undefined;
  'options.port_scan_type': string;
}

export interface TaskSearchForm {
  name?: string;
  target?: string;
  status?: string;
  task_tag?: string;
  siteCountCompare?: string;
  siteCountValue?: number;
  domainCountCompare?: string;
  domainCountValue?: number;
  wihCountCompare?: string;
  wihCountValue?: number;
  'options.domain_brute'?: boolean;
  'options.domain_brute_type'?: string;
  'options.port_scan'?: boolean;
  'options.port_scan_type'?: string;
}