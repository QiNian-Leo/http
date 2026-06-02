import http from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
}

export interface UserInfo {
  id: number
  name: string
  avatar: string
  roles: string[]
}

/**
 * 登录接口
 */
export function loginApi(data: LoginParams) {
  return http.post<LoginResult>('/login', data, {
    requestOptions: {
      withToken: false
    }
  })
}

/**
 * 获取用户信息
 */
export function getUserInfoApi() {
  return http.get<UserInfo>('/user/info')
}

/**
 * 修改用户信息
 */
export function updateUserInfoApi(data: Partial<UserInfo>) {
  return http.put<boolean>('/user/info', data)
}

/**
 * 删除用户
 */
export function deleteUserApi(id: number) {
  return http.delete<boolean>('/user/delete', { id })
}

/**
 * 上传头像
 */
export function uploadAvatarApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return http.upload<string>('/user/avatar', formData)
}

/**
 * 导出用户列表
 */
export function exportUserApi() {
  return http.download('/user/export', {}, '用户列表.xlsx')
}