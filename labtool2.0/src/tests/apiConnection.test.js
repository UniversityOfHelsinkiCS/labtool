import { vi } from 'vitest'
import {
  createRecordingServer,
  createApiStore,
  waitForAction,
  waitForRequests,
  flushPromises,
  http,
  HttpResponse,
  DEV_API_BASE
} from './testUtils/httpMock'

// The middleware keeps module-level state (willRefresh, backendIsBroken), so every test
// imports a fresh copy of the module.
const loadApi = async () => {
  vi.resetModules()
  return import('../util/apiConnection')
}

const { server, requests, setResponse, reset } = createRecordingServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  reset()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
})
afterAll(() => server.close())

describe('getAxios base url', () => {
  const requestPath = async () => {
    const { getAxios } = await loadApi()
    await getAxios().get('/ping')
    await waitForRequests(requests)
    return requests[0].url
  }

  it('uses http://localhost:3001/api in dev mode', async () => {
    expect(await requestPath()).toBe(`${DEV_API_BASE}/ping`)
  })

  it('uses VITE_API_URL when set', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.example.test/custom/api')
    expect(await requestPath()).toBe('http://api.example.test/custom/api/ping')
  })

  it('VITE_API_URL wins over the production default', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_API_URL', 'http://api.example.test/api')
    expect(await requestPath()).toBe('http://api.example.test/api/ping')
  })

  it('uses /labtool-backend/api (same origin) in production', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_API_URL', '')
    expect(await requestPath()).toBe(`${window.location.origin}/labtool-backend/api/ping`)
  })

  it('appends /staging/api when the page path starts with /staging', async () => {
    window.history.pushState({}, '', '/staging/courses/1')
    expect(await requestPath()).toBe(`${DEV_API_BASE}/staging/api/ping`)
  })

  it('appends /v2/api when the page path starts with /v2', async () => {
    window.history.pushState({}, '', '/v2/courses')
    expect(await requestPath()).toBe(`${DEV_API_BASE}/v2/api/ping`)
  })

  it('appends the path prefix to the production base too', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_API_URL', '')
    window.history.pushState({}, '', '/staging/')
    expect(await requestPath()).toBe(`${window.location.origin}/labtool-backend/api/staging/api/ping`)
  })

  it.each(['/labtool/courses', '/stagingx/courses', '/courses/staging', '/'])(
    'does not add a prefix for page path %s',
    async path => {
      window.history.pushState({}, '', path)
      expect(await requestPath()).toBe(`${DEV_API_BASE}/ping`)
    }
  )

  it('reads the page path at call time', async () => {
    const { getAxios } = await loadApi()
    window.history.pushState({}, '', '/v2/x')
    await getAxios().get('/a')
    window.history.pushState({}, '', '/x')
    await getAxios().get('/b')
    expect(requests.map(r => r.url)).toEqual([`${DEV_API_BASE}/v2/api/a`, `${DEV_API_BASE}/b`])
  })
})

describe('callController', () => {
  it('dispatches ATTEMPT with route, method, data and prefix', async () => {
    const { callController } = await loadApi()
    const dispatch = vi.fn()
    callController('/some/route', 'SOME_', { a: 1 }, 'put')(dispatch)
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SOME_ATTEMPT',
      payload: { route: '/some/route', method: 'put', data: { a: 1 }, prefix: 'SOME_' }
    })
  })

  it('defaults to get', async () => {
    const { callController } = await loadApi()
    const dispatch = vi.fn()
    callController('/r', 'P_')(dispatch)
    expect(dispatch.mock.calls[0][0].payload.method).toBe('get')
  })
})

describe('handleRequest middleware', () => {
  const setup = async (options = {}) => {
    const api = await loadApi()
    const { store, actions } = createApiStore(api.handleRequest, options)
    return { api, store, actions }
  }

  it('passes actions without payload through without http calls', async () => {
    const { store, actions } = await setup()
    store.dispatch({ type: 'SOMETHING' })
    await flushPromises()
    expect(actions.map(a => a.type)).toEqual(['SOMETHING'])
    expect(requests).toHaveLength(0)
  })

  it('performs the call and dispatches SUCCESS with the response body', async () => {
    setResponse(() => HttpResponse.json({ hello: 'world', list: [1, 2] }))
    const { api, store, actions } = await setup({ token: 'abc123' })
    store.dispatch(api.callController('/things/1', 'THING_GET_', null, 'get'))

    const success = await waitForAction(actions, 'THING_GET_SUCCESS')
    expect(success).toEqual({ type: 'THING_GET_SUCCESS', response: { hello: 'world', list: [1, 2] } })
    expect(actions.map(a => a.type)).toEqual(['THING_GET_ATTEMPT', 'THING_GET_SUCCESS'])

    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe('GET')
    expect(requests[0].url).toBe(`${DEV_API_BASE}/things/1`)
    expect(requests[0].headers.authorization).toBe('bearer abc123')
  })

  it('passes the ATTEMPT action on to reducers before the call', async () => {
    const api = await loadApi()
    const seen = []
    const { store } = createApiStore(api.handleRequest, {
      reducers: {
        user: (state = { token: 't' }) => state,
        log: (state = [], action) => {
          seen.push(action.type)
          return state
        }
      }
    })
    store.dispatch(api.callController('/x', 'X_'))
    expect(seen).toContain('X_ATTEMPT')
    await flushPromises()
  })

  it('reads the token from the store at request time', async () => {
    const api = await loadApi()
    const { store, actions } = createApiStore(api.handleRequest, {
      reducers: {
        user: (state = { token: 'first' }, action) =>
          action.type === 'SET_TOKEN' ? { token: action.token } : state
      }
    })
    store.dispatch({ type: 'SET_TOKEN', token: 'second' })
    store.dispatch(api.callController('/x', 'X_'))
    await waitForAction(actions, 'X_SUCCESS')
    expect(requests[0].headers.authorization).toBe('bearer second')
  })

  it('handles a non-json (empty) success body', async () => {
    setResponse(() => new HttpResponse(null, { status: 204 }))
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/x', 'X_', null, 'delete'))
    const success = await waitForAction(actions, 'X_SUCCESS')
    expect(success.response === '' || success.response === null || success.response === undefined).toBe(true)
  })

  it('handles plain text success body', async () => {
    setResponse(() => HttpResponse.text('just text'))
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/x', 'X_'))
    const success = await waitForAction(actions, 'X_SUCCESS')
    expect(success.response).toBe('just text')
  })

  it('merges data.__HEADERS into the request headers', async () => {
    const { api, store, actions } = await setup({ token: 'tok' })
    store.dispatch(
      api.callController('/loginFake', 'LOGIN_', { __HEADERS: { uid: 'tester', givenname: 'Test' } }, 'post')
    )
    await waitForAction(actions, 'LOGIN_SUCCESS')
    expect(requests[0].headers.authorization).toBe('bearer tok')
    expect(requests[0].headers.uid).toBe('tester')
    expect(requests[0].headers.givenname).toBe('Test')
  })

  it('lets __HEADERS override Authorization', async () => {
    const { api, store, actions } = await setup({ token: 'tok' })
    store.dispatch(api.callController('/x', 'X_', { __HEADERS: { Authorization: 'custom' } }, 'get'))
    await waitForAction(actions, 'X_SUCCESS')
    expect(requests[0].headers.authorization).toBe('custom')
  })

  it.each([
    ['get', 'GET', { ignored: true }, null],
    ['post', 'POST', { a: 1, nested: { b: [1, 2] } }, { a: 1, nested: { b: [1, 2] } }],
    ['put', 'PUT', { c: 'x' }, { c: 'x' }],
    ['delete', 'DELETE', { ignored: true }, null]
  ])('%s sends method %s and the expected body', async (method, httpMethod, data, expectedBody) => {
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/resource/5', 'R_', data, method))
    await waitForAction(actions, 'R_SUCCESS')
    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe(httpMethod)
    expect(requests[0].url).toBe(`${DEV_API_BASE}/resource/5`)
    expect(requests[0].body).toEqual(expectedBody)
  })

  it('sends json bodies with a json content type', async () => {
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/r', 'R_', { a: 1 }, 'post'))
    await waitForAction(actions, 'R_SUCCESS')
    expect(requests[0].headers['content-type']).toMatch(/application\/json/)
  })

  it('post without data sends no body', async () => {
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/r', 'R_', null, 'post'))
    await waitForAction(actions, 'R_SUCCESS')
    expect(requests[0].method).toBe('POST')
    expect(requests[0].body === null || requests[0].body === 'null').toBe(true)
  })

  it('dispatches FAILURE with an invalid http method without calling the server', async () => {
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/r', 'R_', null, 'patch'))
    const failure = await waitForAction(actions, 'R_FAILURE')
    expect(failure.response).toBeInstanceOf(Error)
    expect(failure.response.message).toBe('Invalid http method')
    expect(requests).toHaveLength(0)
  })

  it.each([400, 401, 403, 404, 500, 503])('dispatches FAILURE with the error on status %i', async status => {
    setResponse(() => HttpResponse.json({ message: `failed ${status}` }, { status }))
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/r', 'R_', { x: 1 }, 'post'))
    const failure = await waitForAction(actions, 'R_FAILURE')
    expect(actions.map(a => a.type)).toEqual(['R_ATTEMPT', 'R_FAILURE'])
    // reducers rely on action.response.response.{status,data}
    expect(failure.response).toBeInstanceOf(Error)
    expect(failure.response.response.status).toBe(status)
    expect(failure.response.response.data).toEqual({ message: `failed ${status}` })
  })

  it('FAILURE carries plain text error bodies as data', async () => {
    setResponse(() => HttpResponse.text('You are not allowed', { status: 403 }))
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/r', 'R_'))
    const failure = await waitForAction(actions, 'R_FAILURE')
    expect(failure.response.response.data).toBe('You are not allowed')
  })

  it('treats 201 as success', async () => {
    setResponse(() => HttpResponse.json({ id: 7 }, { status: 201 }))
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/r', 'R_', { a: 1 }, 'post'))
    const success = await waitForAction(actions, 'R_SUCCESS')
    expect(success.response).toEqual({ id: 7 })
  })

  it('handles several concurrent calls independently', async () => {
    server.use(
      http.get(`${DEV_API_BASE}/a`, () => HttpResponse.json({ which: 'a' })),
      http.get(`${DEV_API_BASE}/b`, () => HttpResponse.json({ err: true }, { status: 500 }))
    )
    const { api, store, actions } = await setup()
    store.dispatch(api.callController('/a', 'A_'))
    store.dispatch(api.callController('/b', 'B_'))
    expect((await waitForAction(actions, 'A_SUCCESS')).response).toEqual({ which: 'a' })
    expect((await waitForAction(actions, 'B_FAILURE')).response.response.status).toBe(500)
  })
})

describe('handleRequest network errors', () => {
  let reload
  let alert
  let warn

  beforeEach(() => {
    setResponse(() => HttpResponse.error())
    reload = vi.fn()
    alert = vi.fn()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('alert', alert)
    vi.stubGlobal('location', {
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
      pathname: '/',
      reload
    })
  })

  const setup = async () => {
    const api = await loadApi()
    const { store, actions } = createApiStore(api.handleRequest)
    const call = async (prefix = 'N_') => {
      const before = requests.length
      store.dispatch(api.callController('/n', prefix))
      await waitForRequests(requests, before + 1)
      await flushPromises()
    }
    return { api, store, actions, call }
  }

  it('reloads the page on the first network error and remembers the time', async () => {
    const { actions, call } = await setup()
    const before = Date.now()
    await call()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(reload).toHaveBeenCalledWith(true)
    expect(warn).toHaveBeenCalled()
    const stored = Number(window.localStorage.getItem('labtoolLastNetworkRefresh'))
    expect(stored).toBeGreaterThanOrEqual(before)
    expect(stored).toBeLessThanOrEqual(Date.now())
    expect(alert).not.toHaveBeenCalled()
    expect(actions.map(a => a.type)).toEqual(['N_ATTEMPT'])
  })

  it('reloads when the last refresh was more than 6 seconds ago', async () => {
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 60000)
    const { call } = await setup()
    await call()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(alert).not.toHaveBeenCalled()
  })

  it('alerts instead of reloading when the last refresh was within 6 seconds', async () => {
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 1000)
    const { actions, call } = await setup()
    await call()
    expect(reload).not.toHaveBeenCalled()
    expect(alert).toHaveBeenCalledTimes(1)
    expect(alert.mock.calls[0][0]).toMatch(/problem communicating with the backend/)
    expect(actions.map(a => a.type)).toEqual(['N_ATTEMPT'])
  })

  it('alerts only once while the backend is broken', async () => {
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 1000)
    const { call } = await setup()
    await call('A_')
    await call('B_')
    await call('C_')
    expect(alert).toHaveBeenCalledTimes(1)
    expect(reload).not.toHaveBeenCalled()
  })

  it('uses an 18 second window once the backend is known to be broken', async () => {
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 1000)
    const { call } = await setup()
    await call('A_')
    expect(alert).toHaveBeenCalledTimes(1)
    // 10s ago: outside the 6s window, but inside the 18s window -> silently ignored
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 10000)
    await call('B_')
    expect(reload).not.toHaveBeenCalled()
    // 30s ago: outside 18s window -> reload
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 30000)
    await call('C_')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('without a broken backend, a refresh 10 seconds ago allows another reload', async () => {
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 10000)
    const { call } = await setup()
    await call()
    expect(reload).toHaveBeenCalledTimes(1)
    expect(alert).not.toHaveBeenCalled()
  })

  it('a successful response clears the broken backend state', async () => {
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 1000)
    const { api, store, actions, call } = await setup()
    await call('A_')
    expect(alert).toHaveBeenCalledTimes(1)

    setResponse(() => HttpResponse.json({ ok: true }))
    store.dispatch(api.callController('/ok', 'OK_'))
    await waitForAction(actions, 'OK_SUCCESS')

    setResponse(() => HttpResponse.error())
    window.localStorage.setItem('labtoolLastNetworkRefresh', Date.now() - 1000)
    await call('B_')
    expect(alert).toHaveBeenCalledTimes(2)
  })

  it('once a reload is pending, further network errors reload again instead of alerting', async () => {
    const { call } = await setup()
    await call('A_')
    expect(reload).toHaveBeenCalledTimes(1)
    // lastRefresh is now "just now", but willRefresh is set
    await call('B_')
    expect(reload).toHaveBeenCalledTimes(2)
    expect(alert).not.toHaveBeenCalled()
  })

  it('http error statuses are not treated as network errors', async () => {
    setResponse(() => HttpResponse.json({}, { status: 502 }))
    const { actions, call } = await setup()
    await call()
    expect(reload).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
    expect(actions.map(a => a.type)).toEqual(['N_ATTEMPT', 'N_FAILURE'])
  })
})
