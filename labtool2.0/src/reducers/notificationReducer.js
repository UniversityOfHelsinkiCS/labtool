
const notificationReducer = (state = {}, action) => {
  switch (action.type) {
    case 'NEW_NOTIFICATION':
      return action.notification
    case 'CLEAR_NOTIFICATION':
      return {}
    default:
      return state
  }
}

export const newNotification = (notification) => {
  return {
    type: 'NEW_NOTIFICATION',
    notification
  }
}

export const clearNotification = () => {
  return {
    type: 'CLEAR_NOTIFICATION'
  }
}

export const createNotification = (notification) => {
  return async (dispatch) => {
    dispatch(newNotification(notification))
    setTimeout(() => {
      dispatch(clearNotification())
    }, 5000)
  }
}

export default notificationReducer