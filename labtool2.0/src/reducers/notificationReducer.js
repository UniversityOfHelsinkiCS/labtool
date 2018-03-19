
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

/* export const newNotification = (notification) => {
  return async (dispatch) => {
    dispatch({
      type: 'NEW_NOTIFICATION',
      message: notification.message,
      error: notification.error
    })
    setTimeout(() => {
      dispatch({
        type: 'CLEAR_NOTIFICATION'
      })
    }, 5000)
  } 
}*/

export const clearNotifications = () => {
  return async (dispatch) => {
    dispatch({ type: 'NOTIFICATION_CLEAR' })  
  }
}

export default notificationReducer