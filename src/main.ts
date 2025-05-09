import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import http from './plugins/http'

import './assets/main.css'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

// 添加全局 http 实例
app.config.globalProperties.$http = http

// 确保先安装路由插件，再安装其他插件
app.use(router).use(Antd)

router.isReady().then(() => {
  app.mount('#app')
})
