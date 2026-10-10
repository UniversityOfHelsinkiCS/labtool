/**
 * HTTP-level test helpers for the api middleware (src/util/apiConnection.js).
 *
 * Requests are intercepted with msw at the network level (XMLHttpRequest / fetch / http),
 * so these helpers do not depend on axios internals and keep working across axios upgrades.
 */
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { vi } from 'vitest'

export { http, HttpResponse }

export const DEV_API_BASE = 'http://localhost:3001/api'

/**
 * Creates an msw server whose catch-all handler records every request and replies with
 * `respond(request)` (default: 200 {}). Tests can still add their own handlers with server.use();
 * requests answered by such handlers are not recorded.
 */
export const createRecordingServer = () => {
  const requests = []
  let respond = () => HttpResponse.json({})

  const server = setupServer(
    http.all('*', async ({ request }) => {
      const text = await request.clone().text()
      let body = text
      try {
        body = text ? JSON.parse(text) : null
      } catch (e) {
        // not json, keep raw text
      }
      const url = new URL(request.url)
      requests.push({
        method: request.method,
        url: request.url,
        pathname: url.pathname,
        origin: url.origin,
        headers: Object.fromEntries(request.headers.entries()),
        body
      })
      return respond(request)
    })
  )

  return {
    server,
    requests,
    setResponse: fn => {
      respond = fn
    },
    reset: () => {
      requests.length = 0
      respond = () => HttpResponse.json({})
      server.resetHandlers()
    }
  }
}

/**
 * Creates a redux store with thunk + the given handleRequest middleware and an action recorder.
 * By default the root reducer only holds `user` (with token), which is all the middleware reads.
 */
export const createApiStore = (handleRequest, { token = 'test-token', reducers } = {}) => {
  const actions = []
  const recorder = () => next => action => {
    actions.push(action)
    return next(action)
  }
  const reducer = reducers ? combineReducers(reducers) : (state = { user: { token } }) => state
  const store = createStore(reducer, applyMiddleware(thunk, recorder, handleRequest))
  return { store, actions }
}

/** Waits until an action with the given type has been dispatched and returns it. */
export const waitForAction = (actions, type) =>
  vi.waitFor(
    () => {
      const found = actions.find(a => a.type === type)
      if (!found) {
        throw new Error(`action ${type} not dispatched; got ${actions.map(a => a.type).join(', ')}`)
      }
      return found
    },
    { timeout: 2000 }
  )

/** Waits until a request has been recorded. */
export const waitForRequests = (requests, count = 1) =>
  vi.waitFor(
    () => {
      if (requests.length < count) {
        throw new Error(`expected ${count} requests, got ${requests.length}`)
      }
      return requests
    },
    { timeout: 2000 }
  )

/** Lets pending promise callbacks (e.g. the middleware's .then/.catch) run. */
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 20))
