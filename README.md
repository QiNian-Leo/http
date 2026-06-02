# http
对于axios的http封装

## 目录结构

src
├─ api
│  └─ user.ts
├─ utils
│  ├─ request.ts
│  └─ http
│     ├─ index.ts
│     ├─ types.ts
│     ├─ pending.ts
│     └─ status.ts

## 使用方式

```ts
import { getUser } from './src/api/user';
import { request } from './src/utils/request';
import { HttpRequestOptions } from './src/utils/http';
```

克隆仓库后直接使用 `src` 内模块，建议在项目中配置 TypeScript 编译或打包。