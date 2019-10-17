const INITIAL_STATE = {
  redirect: false
}

const redirectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CI_MODIFY_ONE_SUCCESS':
      //return { ...state, redirect: true }
      return { ...state }
    case 'CI_GET_ONE_ATTEMPT':
      return { ...state, redirect: false }
    case 'REDIRECT_ENABLE':
      return { ...state, redirect: true }
    case 'REDIRECT_DISABLE':
      return { ...state, redirect: false }
    default:
      return state
  }
}

export const forceRedirect = () => {
  return async dispatch => {
    dispatch({
      type: 'REDIRECT_ENABLE'
    })
  }
}

export const forceNoRedirect = () => {
  return async dispatch => {
    dispatch({
      type: 'REDIRECT_DISABLE'
    })
  }
}

export default redirectReducer
