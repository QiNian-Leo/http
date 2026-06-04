# @workforwork/axios-http

一个轻量的 TypeScript axios 请求封装，适合前端项目复用。它把 token 注入、重复请求取消、业务 code 处理、统一错误提示、上传和浏览器下载收敛在一个可配置的 `HttpRequest` 类里，同时通过 hooks 避免和路由、状态管理、UI 组件库强绑定。

> 发布前建议把包名 `@workforwork/axios-http`、仓库地址和作者信息替换成你自己的 npm scope / GitHub 仓库。

## 特性

- 基于 axios，提供 `get`、`post`、`put`、`patch`、`delete`、`upload`、`download` 快捷方法
- 支持按请求配置是否携带 token、是否取消重复请求、是否统一提示错误
- 支持自定义成功业务 code、401 回调、错误回调
- 支持返回原生 `AxiosResponse` 或直接返回业务 `data`
- 支持自定义 token 请求头和 token 前缀
- 导出 TypeScript 类型声明，构建产物可直接发布到 npm

## 安装

```bash
npm install @workforwork/axios-http
```

如果你在本仓库本地调试：

```bash
npm install
npm run test
```

## 快速使用

```ts
import { createHttpRequest } from '@workforwork/axios-http'

const http = createHttpRequest(
  {
    baseURL: '/api',
    timeout: 10000,
    withCredentials: false
  },
  {
    getToken() {
      return localStorage.getItem('TOKEN')
    },
    onUnauthorized() {
      localStorage.removeItem('TOKEN')
      console.warn('登录已过期，请重新登录')
    },
    onError(message) {
      console.error(message)
    },
    successCodes: [0, 200, '0', '200']
  }
)

interface UserInfo {
  id: number
  name: string
  roles: string[]
}

const user = await http.get<UserInfo>('/user/info')
```

## 请求配置

每个请求都可以通过 `requestOptions` 覆盖默认行为。

```ts
await http.post<LoginResult>(
  '/login',
  { username: 'admin', password: '123456' },
  {
    requestOptions: {
      withToken: false,
      showError: true
    }
  }
)
```

可用配置：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `withToken` | `true` | 是否调用 `getToken` 并注入请求头 |
| `repeatCancel` | `true` | 是否取消相同 method、url、params、data 的重复请求 |
| `showError` | `true` | 是否调用 `onError` |
| `returnNativeResponse` | `false` | 是否返回原生 `AxiosResponse` |
| `transformResponse` | `true` | 是否按 `{ code, message, data }` 结构提取业务数据 |
| `tokenHeader` | `Authorization` | token 写入的请求头名称 |
| `tokenPrefix` | `Bearer` | token 前缀，传空字符串则只写 token |

## 上传和下载

```ts
const formData = new FormData()
formData.append('file', file)

await http.upload<string>('/user/avatar', formData)
await http.download('/user/export', {}, '用户列表.xlsx')
```

`download` 依赖 `window` 和 `document`，只能在浏览器环境中使用。

## API

```ts
import {
  HttpRequest,
  createHttpRequest,
  clearPending,
  checkStatus,
  type CustomRequestConfig,
  type HttpHooks,
  type RequestOptions,
  type Result
} from '@workforwork/axios-http'
```

核心方法：

- `new HttpRequest(config, hooks?, options?)`
- `createHttpRequest(config, hooks?, options?)`
- `http.request<T>(config)`
- `http.get<T>(url, params?, config?)`
- `http.post<T>(url, data?, config?)`
- `http.put<T>(url, data?, config?)`
- `http.patch<T>(url, data?, config?)`
- `http.delete<T>(url, params?, config?)`
- `http.upload<T>(url, formData, config?)`
- `http.download(url, params?, filename?, config?)`
- `http.getAxiosInstance()`
- `http.setHooks(hooks)`
- `http.setDefaultOptions(options)`
- `clearPending()`

## 本地开发

```bash
npm install
npm run typecheck
npm run build
npm run test
npm pack --dry-run
```

脚本说明：

- `npm run build`：清理并编译 TypeScript 到 `dist`
- `npm run typecheck`：只做类型检查，不输出文件
- `npm run test`：构建后运行 Node 内置测试
- `npm pack --dry-run`：预览实际会发布到 npm 的文件
- `npm publish`：发布包；本项目的 `prepublishOnly` 会先执行测试和 dry-run

## 发布到 npm 并开源

1. 修改 `package.json`：
   - 把 `name` 改成你自己的包名，例如 `@your-scope/axios-http`
   - 把 `repository`、`bugs`、`homepage` 改成真实 GitHub 地址
   - 确认 `license`，当前是 `MIT`

2. 初始化 GitHub 仓库并推送：

```bash
git init
git add .
git commit -m "feat: publishable axios http package"
git branch -M main
git remote add origin https://github.com/your-name/axios-http.git
git push -u origin main
```

3. 登录 npm：

```bash
npm login
npm whoami
```

4. 发布前检查：

```bash
npm run test
npm pack --dry-run
```

5. 首次发布公开 scoped 包：

```bash
npm publish --access public
```

后续版本先升级版本号，再发布：

```bash
npm version patch
npm publish
```

如果你在 GitHub Actions 等支持 provenance 的 CI 环境发布，可以使用：

```bash
npm publish --access public --provenance
```

## 注意事项

- npm 包名必须全站唯一；如果发布失败提示名称被占用，需要更换 `name`
- scoped 包首次公开发布要带 `--access public`
- 不要发布真实 token、`.env`、私有接口地址或公司内部域名
- `files` 字段当前只发布 `dist`、`README.md` 和 `LICENSE`
