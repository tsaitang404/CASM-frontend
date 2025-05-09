export interface TaskOptions {
  domain_brute?: boolean;
  domain_brute_type?: string;
  port_scan?: boolean;
  port_scan_type?: string;
  service_detection?: boolean;
  service_brute?: boolean;
  os_detection?: boolean;
  site_identify?: boolean;
  file_leak?: boolean;
  alt_dns?: boolean;
  search_engines?: boolean;
  site_spider?: boolean;
  casm_search?: boolean;
  dns_query_plugin?: boolean;
  skip_scan_cdn_ip?: boolean;
  nuclei_scan?: boolean;
  findvhost?: boolean;
  web_info_hunter?: boolean;
}

export interface Task {
  _id: string;
  name: string;
  target: string;
  status: string;
  options: TaskOptions;
  statistic?: {
    site_cnt?: number;
    domain_cnt?: number;
    wih_cnt?: number;
  };
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