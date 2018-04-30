const loginReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return action.response
    case 'LOGIN_FAILURE':
      return {}
    case 'LOGIN_BYTOKEN':
      return action.user
    case 'LOGOUT_SUCCESS':
      return {}
    case 'USER_UPDATE_SUCCESS':
      return { ...state, user: action.response }
    default:
      return state
  }
}

export const tokenLogin = user => {
  return async dispatch => {
    dispatch({
      type: 'LOGIN_BYTOKEN',
      user
    })
  }
}

export const logout = () => {
  return async dispatch => {
    dispatch({
      type: 'LOGOUT_SUCCESS'
    })
  }
}

export default loginReducer
