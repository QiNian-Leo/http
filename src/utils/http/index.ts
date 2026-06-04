import axios, {
  type AxiosError,
  type AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

import { addPending, removePending } from './pending.js'
import { checkStatus } from './status.js'
import type {
  CustomRequestConfig,
  HttpHooks,
  RequestOptions,
  Result
} from './types.js'

const DEFAULT_OPTIONS: Required<RequestOptions> = {
  withToken: true,
  repeatCancel: true,
  showError: true,
  returnNativeResponse: false,
  transformResponse: true,
  tokenHeader: 'Authorization',
  tokenPrefix: 'Bearer'
}

export class HttpRequest {
  private instance: AxiosInstance
  private hooks: HttpHooks
  private defaultOptions: RequestOptions

  constructor(
    config: CustomRequestConfig,
    hooks: HttpHooks = {},
    options: RequestOptions = {}
  ) {
    this.instance = axios.create(config)
    this.hooks = hooks
    this.defaultOptions = options

    this.setupInterceptors()
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance
  }

  setHooks(hooks: HttpHooks) {
    this.hooks = {
      ...this.hooks,
      ...hooks
    }
  }

  setDefaultOptions(options: RequestOptions) {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options
    }
  }

  private setupInterceptors() {
    /**
     * 请求拦截器
     */
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomRequestConfig

        const options = {
          ...DEFAULT_OPTIONS,
          ...this.defaultOptions,
          ...customConfig.requestOptions
        }

        customConfig.requestOptions = options

        /**
         * 取消重复请求
         */
        if (options.repeatCancel) {
          addPending(customConfig)
        }

        /**
         * 添加 token
         */
        const token = this.hooks.getToken?.()

        if (options.withToken && token) {
          ;(config.headers as AxiosHeaders).set(
            options.tokenHeader,
            this.formatToken(token, options.tokenPrefix)
          )
        }

        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    /**
     * 响应拦截器
     */
    this.instance.interceptors.response.use(
      (response: AxiosResponse<Result>) => {
        const config = response.config as CustomRequestConfig
        const options = {
          ...DEFAULT_OPTIONS,
          ...this.defaultOptions,
          ...config.requestOptions
        }

        removePending(config)

        /**
         * 是否返回原生响应
         */
        if (options.returnNativeResponse) {
          return response as any
        }

        /**
         * 是否不做业务数据处理
         */
        if (!options.transformResponse) {
          return response.data as any
        }

        const result = response.data
        const successCodes = this.hooks.successCodes || [0, 200, '0', '200']

        /**
         * 业务成功
         */
        if (successCodes.includes(result?.code)) {
          return result.data as any
        }

        /**
         * 业务 401
         */
        if (result?.code === 401 || result?.code === '401') {
          this.hooks.onUnauthorized?.()

          const message = result.message || result.msg || '登录已过期'
          return Promise.reject(new Error(message))
        }

        /**
         * 业务失败
         */
        const message = result?.message || result?.msg || '请求失败'

        if (options.showError) {
          this.hooks.onError?.(message, result)
        }

        return Promise.reject(new Error(message))
      },
      (error: AxiosError<Result>) => {
        const config = error.config as CustomRequestConfig | undefined

        if (config) {
          removePending(config)
        }

        /**
         * 取消请求不弹错误
         */
        if (
          error.code === 'ERR_CANCELED' ||
          error.name === 'CanceledError'
        ) {
          return Promise.reject(error)
        }

        const options = {
          ...DEFAULT_OPTIONS,
          ...this.defaultOptions,
          ...config?.requestOptions
        }

        const message = this.formatError(error)

        if (options.showError) {
          this.hooks.onError?.(message, error)
        }

        if (error.response?.status === 401) {
          this.hooks.onUnauthorized?.()
        }

        return Promise.reject(error)
      }
    )
  }

  private formatError(error: AxiosError<Result>) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return '请求超时，请稍后重试'
    }

    if (!error.response) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return '网络已断开'
      }

      return '网络异常，请稍后重试'
    }

    return checkStatus(error.response.status)
  }

  private formatToken(token: string, prefix: string) {
    return prefix ? `${prefix} ${token}` : token
  }

  request<T = unknown>(config: CustomRequestConfig): Promise<T> {
    return this.instance.request<any, T>(config)
  }

  get<T = unknown>(
    url: string,
    params?: Record<string, any>,
    config: CustomRequestConfig = {}
  ): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'GET',
      params
    })
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config: CustomRequestConfig = {}
  ): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      data
    })
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    config: CustomRequestConfig = {}
  ): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      data
    })
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config: CustomRequestConfig = {}
  ): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      data
    })
  }

  delete<T = unknown>(
    url: string,
    params?: Record<string, any>,
    config: CustomRequestConfig = {}
  ): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE',
      params
    })
  }

  upload<T = unknown>(
    url: string,
    data: FormData,
    config: CustomRequestConfig = {}
  ): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      data,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async download(
    url: string,
    params?: Record<string, any>,
    filename = 'download',
    config: CustomRequestConfig = {}
  ) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('download 只能在浏览器环境中使用')
    }

    const blob = await this.request<Blob>({
      ...config,
      url,
      method: 'GET',
      params,
      responseType: 'blob',
      requestOptions: {
        repeatCancel: false,
        showError: true,
        transformResponse: false,
        ...config.requestOptions
      }
    })

    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = blobUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(blobUrl)
  }
}

export function createHttpRequest(
  config: CustomRequestConfig,
  hooks: HttpHooks = {},
  options: RequestOptions = {}
) {
  return new HttpRequest(config, hooks, options)
}
