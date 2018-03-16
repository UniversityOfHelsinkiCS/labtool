
const notificationReducer = (state = {}, action) => {
  switch (action.type) {
    case 'NEW_NOTIFICATION':
      return {
        message: action.message,
        error: action.error
      }
    case 'CLEAR_NOTIFICATION':
      return {}
    default:
      return state
  }
}

export const newNotification = (notification) => {
  return async (dispatch) => {
    dispatch({
      type: 'NEW_NOTIFICATION',
      message: notification.message,
      error: notification.error
    })
  }
}

export const clearNotification = () => {
  return {
    type: 'CLEAR_NOTIFICATION'
  }
  return async (dispatch) => {
    dispatch({
      type:'CLEAR_NOTIFICATION',
    })
  }
}

export const createNotification = (notification) => {
  return async () => {
    newNotification(notification)
    setTimeout(() => {
      clearNotification()
    }, 5000)
  }
}

export default notificationReducer