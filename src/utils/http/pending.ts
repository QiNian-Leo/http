import type { CustomRequestConfig } from './types.js'

const pendingMap = new Map<string, AbortController>()

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function sortObject(obj: Record<string, any>) {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, any>>((result, key) => {
      result[key] = obj[key]
      return result
    }, {})
}

function stringify(value: unknown) {
  if (!value) return ''

  if (isPlainObject(value)) {
    return JSON.stringify(sortObject(value))
  }

  return JSON.stringify(value)
}

export function getPendingKey(config: CustomRequestConfig) {
  const { method, url, params, data } = config

  return [
    method?.toUpperCase(),
    url,
    stringify(params),
    stringify(data)
  ].join('&')
}

export function cancelPending(config: CustomRequestConfig) {
  const key = getPendingKey(config)
  const controller = pendingMap.get(key)

  if (controller) {
    controller.abort()
    pendingMap.delete(key)
  }
}

export function addPending(config: CustomRequestConfig) {
  if (config.requestOptions?.repeatCancel === false) return

  const key = getPendingKey(config)

  cancelPending(config)

  const controller = new AbortController()

  if (!config.signal) {
    config.signal = controller.signal
  }

  pendingMap.set(key, controller)
}

export function removePending(config: CustomRequestConfig) {
  const key = getPendingKey(config)
  pendingMap.delete(key)
}

export function clearPending() {
  pendingMap.forEach(controller => controller.abort())
  pendingMap.clear()
}
