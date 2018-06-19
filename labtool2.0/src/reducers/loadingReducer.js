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
  redirectHooks: []
}

const handleResponse = (state, hook) => {
  const loadingHooks = [...state.loadingHooks]
  const redirectHooks = [...state.redirectHooks]
  const loadingIndex = loadingHooks.indexOf(hook)
  let loading = true
  let redirect = false
  if (loadingIndex !== -1) {
    loadingHooks.splice(loadingIndex, 1)
    const redirectIndex = redirectHooks.indexOf(hook)
    if (redirectIndex !== -1) {
      redirectHooks.splice(redirectIndex, 1)
      if (redirectHooks.length === 0) {
        loading = false
        redirect = true
      } else {
        loading = loadingHooks.length > 0
      }
    } else {
      loading = loadingHooks.length > 0
    }
  }
  return { loading, redirect, loadingHooks, redirectHooks }
}

const loadingReducer = (state = INITITAL_STATE, action) => {
  if (action.type.includes('ATTEMPT')) {
    const prefix = action.type.split('ATTEMPT')[0]
    return { ...state, loading: true, loadingHooks: [...state.loadingHooks, prefix] }
  } else if (action.type.includes('SUCCESS')) {
    const prefix = action.type.split('SUCCESS')[0]
    return handleResponse(state, prefix)
  } else if (action.type.includes('FAILURE')) {
    const prefix = action.type.split('FAILURE')[0]
    return handleResponse(state, prefix)
  }
  switch (action.type) {
    case 'LOADING_RESET':
      return INITITAL_STATE
    default:
      return state
  }
}

export const resetLoading = () => {
  return async dispatch => {
    dispatch({
      type: 'LOADING_RESET'
    })
  }
}

export const addRedirectHook = data => {
  return async dispatch => {
    dispatch({
      type: 'LOADING_ADD_REDIRECT_HOOK',
      data
    })
  }
}

export default loadingReducer
