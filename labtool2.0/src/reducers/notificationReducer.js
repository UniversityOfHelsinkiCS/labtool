const notificationReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        message: 'You have logged in',
        error: false
      }
    case 'NOTIFICATION_CLEAR':
      return {}
    case 'LOGIN_FAILURE':
      return {
        message: 'Wrong credentials!',
        error: true
      }
      case 'LOGOUT_SUCCESS':
      return {
        message: 'You have logged out',
        error: false
      }
    default:
      return state
  }
}

export const clearNotifications = () => {
  return async (dispatch) => {
    dispatch({ type: 'NOTIFICATION_CLEAR' })
  }
}

export default notificationReducer