 axios 请求二次封装

新建文件 axios
请求拦截器 根据自己业务需求，修改请求头以及超时时间等
import axios from 'axios'
axios.interceptors.request.use(
  config => {
    // 判断是否是提交文件，还是常规请求
    if (config.data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data' // 此处格式自定义
      }
    } else {
      config.data = JSON.stringify(config.data)
      config.headers = {
        'Content-Type': 'application/json', // 此处格式自定义
        token: getLocalStorage('token')
      }
    }
    config.withCredentials = true
    config.timeout = 5000    // 超时时间
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
复制代码
响应拦截器 根据后台返回数据，做些统一处理
// 添加响应拦截器
axios.interceptors.response.use(
  res => {
    let data = res.data
    if (res.statusCode !== 200) {
      if (data.failureReason === 4011 || data.failureReason === 4012) {
        console.log('需要重新登录')
      }
    } else {
      if (data.resultStates === 0) {
        return data
      } else {
        return Promise.reject(data)
      }
    }
  },
  error => {
    notification['error']({
      message: '提示',
      duration: 2,
      description: '后台报错'
    })
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)
复制代码
封装get，post，并导出
export function get (url, params = {}) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params
      })
      .then(response => {
        if (response.success) {
          resolve(response.data)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post (url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, data).then(
      response => {
        if (response.success) {
          resolve(response.data)
        }
      },
      err => {
        reject(err)
      }
    )
  })
}
复制代码
重点：新建 api.js 文件 将后台请求接口全部写在此处，统一管理
import { get, post } from './axios'
const api = {
     reqLogin: p => post('api/user/addFormId', p),
      reqGetInfo: p => post('api/user/addFormId', p)
}
export default api

// 将 api 引入到 main.js 中
Vue.prototype.$api = api

// 这样页面中使用
this.$api.reqLogin().then(res => {
      console.log(res)
})