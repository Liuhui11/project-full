import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
    baseURL: '/api',
})

// 请求拦截

// 主要做token管理

// 响应拦截

Vue.prototype.$http = service

export const http = service