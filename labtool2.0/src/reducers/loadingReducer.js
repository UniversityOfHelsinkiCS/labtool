/**
 * Named loading in state
 * loading: flag for displaying spinner
 * loadingHooks: events that must happen before loading can end.
 * redirect flag for redirecting to another page
 * redirectHooks: events that must happen before redirecting.
 */

const INITITAL_STATE = {
  loading: true,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const handleResponse = (state, hook, success) => {
  const loadingHooks = [...state.loadingHooks]
  const redirectHooks = [...state.redirectHooks]
  const loadingIndex = loadingHooks.indexOf(hook)
  let loading = loadingHooks.length > 0
  let redirect = false
  let redirectFailure = state.redirectFailure
  if (loadingIndex !== -1) {
    loadingHooks.splice(loadingIndex, 1)
    const redirectIndex = redirectHooks.indexOf(hook)
    if (redirectIndex !== -1) {
      redirectFailure = redirectFailure || !success
      redirectHooks.splice(redirectIndex, 1)
      if (redirectHooks.length === 0) {
        loading = false
        redirect = !redirectFailure
      } else {
        loading = loadingHooks.length > 0
      }
    } else {
      loading = loadingHooks.length > 0
    }
  }
  return { loading, redirect, loadingHooks, redirectHooks, redirectFailure }
}

const loadingReducer = (state = INITITAL_STATE, action) => {
  if (action.type.includes('ATTEMPT')) {
    const prefix = action.type.split('ATTEMPT')[0]
    return { ...state, loading: true, loadingHooks: [...state.loadingHooks, prefix] }
  } else if (action.type.includes('SUCCESS')) {
    const prefix = action.type.split('SUCCESS')[0]
    return handleResponse(state, prefix, true)
  } else if (action.type.includes('FAILURE')) {
    const prefix = action.type.split('FAILURE')[0]
    return handleResponse(state, prefix, false)
  }
  switch (action.type) {
    case 'LOADING_RESET':
      return INITITAL_STATE
    case 'LOADING_ADD_REDIRECT_HOOK':
      return { ...state, redirectHooks: [...state.redirectHooks, action.data.hook], redirectFailure: false }
    case 'LOADING_FORCE_SET':
      return { ...state, loading: action.data.value }
    default:
      return state
  }
}

// Call this before making any api calls in a component to ensure state.loading is true before rendering.
export const resetLoading = () => {
  return async dispatch => {
    dispatch({
      type: 'LOADING_RESET'
    })
  }
}

// Use this method to add your service call prefix as a redirect hook.
// data.hook should be equal to the prefix of your api call.
// state.redirect will become true after the api call is finished successfully.
export const addRedirectHook = data => {
  return async dispatch => {
    dispatch({
      type: 'LOADING_ADD_REDIRECT_HOOK',
      data
    })
  }
}

export const forceSetLoading = data => {
  return async dispatch => {
    dispatch({
      type: 'LOADING_FORCE_SET',
      data
    })
  }
}

export default loadingReducer
