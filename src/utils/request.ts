import { HttpRequest } from './http'
// import router from '@/router'
// import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'TOKEN'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const http = new HttpRequest(
  {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    withCredentials: false
  },
  {
    getToken,

    onUnauthorized() {
      removeToken()

      /**
       * 真实项目中可以打开：
       * router.replace('/login')
       */
      console.warn('登录已过期，请重新登录')
    },

    onError(message) {
      /**
       * 真实项目中可以打开：
       * ElMessage.error(message)
       */
      console.error(message)
    },

    /**
     * 根据公司后端规范配置成功 code
     */
    successCodes: [0, 200, '0', '200']
  }
)

export default http