import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import loginReducer, { tokenLogin } from '../reducers/loginReducer'

const loggedIn = {
  user: { id: 1, email: 'old@example.com', firsts: 'Testi', lastname: 'Testaaja', username: 'tester' },
  token: 'jwt-token',
  created: false
}

describe('loginReducer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('starts with an empty object', () => {
    expect(loginReducer(undefined, { type: '@@INIT' })).toEqual({})
  })

  it('LOGIN_SUCCESS stores the response (user, token, created) as the state', () => {
    const state = {}
    deepFreeze(state)
    const action = { type: 'LOGIN_SUCCESS', response: loggedIn }
    deepFreeze(action)
    const newState = loginReducer(state, action)
    expect(newState).toEqual(loggedIn)
    expect(newState.token).toBe('jwt-token')
  })

  it('LOGIN_FAILURE resets the state', () => {
    deepFreeze(loggedIn)
    expect(loginReducer(loggedIn, { type: 'LOGIN_FAILURE', response: new Error('x') })).toEqual({})
  })

  it('tokenLogin dispatches LOGIN_BYTOKEN which stores the given user', async () => {
    const dispatch = vi.fn()
    await tokenLogin(loggedIn)(dispatch)
    expect(dispatch).toHaveBeenCalledWith({ type: 'LOGIN_BYTOKEN', user: loggedIn })
    const state = {}
    deepFreeze(state)
    expect(loginReducer(state, dispatch.mock.calls[0][0])).toEqual(loggedIn)
  })

  it('LOGOUT_SUCCESS clears fake login data, redirects to logoutUrl and resets the state', () => {
    const location = { href: 'http://localhost:3000/' }
    vi.stubGlobal('location', location)
    window.localStorage.setItem('fake-shibbo-data', '{"uid":"tester"}')
    window.localStorage.setItem('other', 'kept')
    deepFreeze(loggedIn)
    const newState = loginReducer(loggedIn, {
      type: 'LOGOUT_SUCCESS',
      response: { logoutUrl: 'https://login.example.com/logout' }
    })
    expect(newState).toEqual({})
    expect(location.href).toBe('https://login.example.com/logout')
    expect(window.localStorage.getItem('fake-shibbo-data')).toBeNull()
    expect(window.localStorage.getItem('other')).toBe('kept')
  })

  it('USER_UPDATE_SUCCESS updates only the email', () => {
    deepFreeze(loggedIn)
    const newState = loginReducer(loggedIn, {
      type: 'USER_UPDATE_SUCCESS',
      response: { email: 'new@example.com' }
    })
    expect(newState.user).toEqual({ ...loggedIn.user, email: 'new@example.com' })
    expect(newState.token).toBe('jwt-token')
  })

  it('USER_UPDATE_ADMIN_SUCCESS replaces the user when it is the logged in user', () => {
    deepFreeze(loggedIn)
    const updated = { id: 1, email: 'x@example.com', admin: true }
    const newState = loginReducer(loggedIn, { type: 'USER_UPDATE_ADMIN_SUCCESS', response: updated })
    expect(newState.user).toEqual(updated)
    expect(newState.token).toBe('jwt-token')
  })

  it('USER_UPDATE_ADMIN_SUCCESS ignores updates to other users', () => {
    deepFreeze(loggedIn)
    const newState = loginReducer(loggedIn, { type: 'USER_UPDATE_ADMIN_SUCCESS', response: { id: 2 } })
    expect(newState).toBe(loggedIn)
  })

  it('ignores unknown actions', () => {
    deepFreeze(loggedIn)
    expect(loginReducer(loggedIn, { type: 'SOMETHING_ELSE' })).toBe(loggedIn)
  })
})
