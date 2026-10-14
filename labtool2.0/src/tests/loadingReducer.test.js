import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import reducer, { resetLoading, addRedirectHook, forceSetLoading } from '../reducers/loadingReducer'

const initial = () => reducer(undefined, { type: '@@INIT' })

const dispatched = async thunk => {
  const dispatch = vi.fn()
  await thunk(dispatch)
  return dispatch.mock.calls[0][0]
}

const apply = (state, ...actions) =>
  actions.reduce((s, action) => {
    deepFreeze(s)
    return reducer(s, action)
  }, state)

const notFound = { message: 'Request failed', response: { status: 404, data: 'nope' } }

describe('loadingReducer', () => {
  it('has the expected initial state', () => {
    expect(initial()).toEqual({
      loading: true,
      loadingHooks: [],
      redirect: false,
      redirectHooks: [],
      redirectFailure: false,
      errors: {}
    })
  })

  it('ATTEMPT adds a loading hook and SUCCESS removes it', () => {
    const attempted = apply(initial(), { type: 'CI_GET_ONE_ATTEMPT', payload: {} })
    expect(attempted.loading).toBe(true)
    expect(attempted.loadingHooks).toEqual(['CI_GET_ONE_'])
    const done = apply(attempted, { type: 'CI_GET_ONE_SUCCESS', response: {} })
    expect(done.loading).toBe(false)
    expect(done.loadingHooks).toEqual([])
    expect(done.redirect).toBe(false)
  })

  it('stays loading until all calls finish', () => {
    const state = apply(
      initial(),
      { type: 'A_ATTEMPT', payload: {} },
      { type: 'B_ATTEMPT', payload: {} },
      { type: 'A_SUCCESS', response: {} }
    )
    expect(state.loading).toBe(true)
    expect(state.loadingHooks).toEqual(['B_'])
    const done = apply(state, { type: 'B_FAILURE', response: new Error('x') })
    expect(done.loading).toBe(false)
  })

  it('works with prefixes that have no trailing underscore', () => {
    const state = apply(
      initial(),
      { type: 'WEEKS_CREATE_ONE_ATTEMPT', payload: {} },
      { type: 'WEEKS_CREATE_ONE_SUCCESS' }
    )
    expect(state.loadingHooks).toEqual([])
    expect(state.loading).toBe(false)
  })

  it.each([403, 404, 500])('FAILURE with status %i is stored in errors', status => {
    const error = { message: 'x', response: { status, data: {} } }
    const state = apply(
      initial(),
      { type: 'CP_INFO_ATTEMPT', payload: {} },
      { type: 'CP_INFO_FAILURE', response: error }
    )
    expect(state.errors).toEqual({ CP_INFO_: error })
  })

  it.each([400, 401])('FAILURE with status %i is not stored in errors', status => {
    const state = apply(
      initial(),
      { type: 'CP_INFO_ATTEMPT', payload: {} },
      { type: 'CP_INFO_FAILURE', response: { response: { status } } }
    )
    expect(state.errors).toEqual({})
  })

  it('FAILURE without a response is not stored in errors', () => {
    const state = apply(
      initial(),
      { type: 'X_ATTEMPT', payload: {} },
      { type: 'X_FAILURE', response: new Error('x') }
    )
    expect(state.errors).toEqual({})
  })

  it('SUCCESS clears a previous error of the same prefix', () => {
    const state = apply(
      initial(),
      { type: 'X_ATTEMPT', payload: {} },
      { type: 'X_FAILURE', response: notFound },
      { type: 'Y_ATTEMPT', payload: {} },
      { type: 'Y_FAILURE', response: notFound },
      { type: 'X_ATTEMPT', payload: {} },
      { type: 'X_SUCCESS', response: {} }
    )
    expect(Object.keys(state.errors)).toEqual(['Y_'])
  })

  describe('redirect hooks', () => {
    it('redirects after all redirect hooks succeed', async () => {
      let state = apply(initial(), await dispatched(addRedirectHook({ hook: 'CI_MODIFY_ONE_' })))
      expect(state.redirectHooks).toEqual(['CI_MODIFY_ONE_'])
      state = apply(state, { type: 'CI_MODIFY_ONE_ATTEMPT', payload: {} })
      expect(state.redirect).toBe(false)
      state = apply(state, { type: 'CI_MODIFY_ONE_SUCCESS', response: {} })
      expect(state.redirect).toBe(true)
      expect(state.loading).toBe(false)
      expect(state.redirectHooks).toEqual([])
    })

    it('waits for every redirect hook', () => {
      let state = apply(
        initial(),
        { type: 'LOADING_ADD_REDIRECT_HOOK', data: { hook: 'A_' } },
        { type: 'LOADING_ADD_REDIRECT_HOOK', data: { hook: 'B_' } },
        { type: 'A_ATTEMPT', payload: {} },
        { type: 'B_ATTEMPT', payload: {} },
        { type: 'A_SUCCESS', response: {} }
      )
      expect(state.redirect).toBe(false)
      expect(state.loading).toBe(true)
      state = apply(state, { type: 'B_SUCCESS', response: {} })
      expect(state.redirect).toBe(true)
    })

    it('does not redirect when a redirect hook fails', () => {
      const state = apply(
        initial(),
        { type: 'LOADING_ADD_REDIRECT_HOOK', data: { hook: 'A_' } },
        { type: 'A_ATTEMPT', payload: {} },
        { type: 'A_FAILURE', response: notFound }
      )
      expect(state.redirect).toBe(false)
      expect(state.redirectFailure).toBe(true)
      expect(state.loading).toBe(false)
    })

    it('adding a redirect hook clears a previous failure', () => {
      const state = apply(
        { ...initial(), redirectFailure: true },
        { type: 'LOADING_ADD_REDIRECT_HOOK', data: { hook: 'A_' } }
      )
      expect(state.redirectFailure).toBe(false)
    })
  })

  it('resetLoading resets', async () => {
    const state = apply(
      initial(),
      { type: 'A_ATTEMPT', payload: {} },
      { type: 'A_FAILURE', response: notFound }
    )
    expect(apply(state, await dispatched(resetLoading()))).toEqual(initial())
  })

  it('forceSetLoading sets the flag', async () => {
    expect(apply(initial(), await dispatched(forceSetLoading({ value: false }))).loading).toBe(false)
  })

  it('ignores other actions', () => {
    const state = initial()
    deepFreeze(state)
    expect(reducer(state, { type: 'COURSE_PAGE_RESET' })).toBe(state)
  })
})
