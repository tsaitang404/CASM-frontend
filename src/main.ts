import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import http from './plugins/http'

import './assets/main.css'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

app.use(router)
app.use(Antd)

// 添加全局 http 实例
app.config.globalProperties.$http = http

app.mount('#app')
