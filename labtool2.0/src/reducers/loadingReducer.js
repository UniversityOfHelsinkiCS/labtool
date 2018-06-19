/**
 * Named loading in state
 * loading: flag for displaying spinner
 * loadingHooks: events that must happen before loading can end.
 * redirect flag for redirecting to another page
 * redirectHooks: events that must happen before redirecting.
 */

const INITITAL_STATE = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: []
}

const loadingReducer = (state = INITITAL_STATE, action) => {
  switch (action.type) {
    case 'LOADING_RESET':
      return INITITAL_STATE
    case 'LOADING_ADD_REDIRECT_HOOK':
      return { ...state, redirectHooks: [...state.redirectHooks, action.data.hook] }
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
