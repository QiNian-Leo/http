import type { AxiosRequestConfig } from 'axios'

/**
 * 后端通用返回结构
 * 根据你们公司接口可改：
 * {
 *   code: 200,
 *   message: 'success',
 *   data: {}
 * }
 */
export interface Result<T = any> {
  code: number | string
  message?: string
  msg?: string
  data: T
}

/**
 * 每个请求的自定义配置
 */
export interface RequestOptions {
  /**
   * 是否携带 token
   */
  withToken?: boolean

  /**
   * 是否取消重复请求
   */
  repeatCancel?: boolean

  /**
   * 是否统一弹出错误
   */
  showError?: boolean

  /**
   * 是否返回原始 AxiosResponse
   */
  returnNativeResponse?: boolean

  /**
   * 是否对响应数据做业务处理
   */
  transformResponse?: boolean
}

/**
 * 扩展 axios config
 */
export interface CustomRequestConfig<D = any> extends AxiosRequestConfig<D> {
  requestOptions?: RequestOptions
}

/**
 * 外部注入 hooks，避免 http 层强依赖 router / UI 组件库 / pinia
 */
export interface HttpHooks {
  getToken?: () => string | null
  onUnauthorized?: () => void
  onError?: (message: string, error?: unknown) => void
  successCodes?: Array<number | string>
}