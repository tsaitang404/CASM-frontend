/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型声明，可根据实际需要扩展
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // 在这里添加其他自定义环境变量，例如：
  // readonly VITE_SOME_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}