import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createHttpRequest,
  HttpRequest,
  checkStatus,
  clearPending,
  getPendingKey
} from '../dist/index.js'

test('exports the public HTTP package API', () => {
  assert.equal(typeof HttpRequest, 'function')
  assert.equal(typeof createHttpRequest, 'function')
  assert.equal(typeof checkStatus, 'function')
  assert.equal(typeof clearPending, 'function')
  assert.equal(typeof getPendingKey, 'function')
})

test('injects token headers and unwraps successful business responses', async () => {
  let receivedHeader

  const http = createHttpRequest(
    {
      adapter: async config => {
        receivedHeader = config.headers?.get?.('X-Token')

        return {
          config,
          data: {
            code: 0,
            data: { id: 1, name: 'Tom' }
          },
          headers: {},
          status: 200,
          statusText: 'OK'
        }
      }
    },
    {
      getToken() {
        return 'abc123'
      }
    },
    {
      tokenHeader: 'X-Token',
      tokenPrefix: ''
    }
  )

  const user = await http.get('/users/1')

  assert.deepEqual(user, { id: 1, name: 'Tom' })
  assert.equal(receivedHeader, 'abc123')
})

test('creates stable duplicate request keys for object params regardless of property order', () => {
  const firstKey = getPendingKey({
    method: 'get',
    url: '/users',
    params: { page: 1, keyword: 'tom' }
  })

  const secondKey = getPendingKey({
    method: 'GET',
    url: '/users',
    params: { keyword: 'tom', page: 1 }
  })

  assert.equal(firstKey, secondKey)
})

test('maps unknown HTTP status codes to a readable fallback message', () => {
  assert.equal(checkStatus(418), '请求失败，状态码：418')
})
