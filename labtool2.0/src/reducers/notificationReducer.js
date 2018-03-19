const notificationReducer = (state = { }, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        message: 'You have logged in',
        error: false
      }
    case 'NOTIFICATION_CLEAR':
      return {}
    default:
      return state
  }
}

export default notificationReducer