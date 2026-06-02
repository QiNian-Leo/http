export function checkStatus(status: number): string {
  const statusMap: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问该资源',
    404: '请求地址不存在',
    405: '请求方式错误',
    408: '请求超时',
    409: '请求冲突',
    422: '请求参数校验失败',
    429: '请求过于频繁，请稍后再试',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂不可用',
    504: '网关超时'
  }

  return statusMap[status] || `请求失败，状态码：${status}`
}