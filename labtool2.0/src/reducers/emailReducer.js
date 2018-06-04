/**
 * Named emailPage in state.
 *
 * loading: show spinner
 * redirect: redirect to mypage
 */

const INITIAL_STATE = {
  loading: false,
  redirect: false
}

const emailReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'USER_UPDATE_ATTEMPT':
      return { ...state, loading: true }
    case 'USER_UPDATE_SUCCESS':
      return {
        loading: false,
        redirect: true
      }
    case 'USER_UPDATE_FAILURE':
      return { ...state, loading: false }
    case 'EMAIL_RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

export const resetEmailPage = () => {
  return async dispatch => {
    dispatch({
      type: 'EMAIL_RESET'
    })
  }
}

export default emailReducer
