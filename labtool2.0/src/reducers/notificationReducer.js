
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


const EVENT_MESSAGE_CLEAR_TIMEOUT = 1000
let timeout

clearTimeout(timeout)
timeout = setTimeout(clearNotifications, EVENT_MESSAGE_CLEAR_TIMEOUT)


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