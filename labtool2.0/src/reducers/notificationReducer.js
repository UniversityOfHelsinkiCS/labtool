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
    case 'USER_UPDATE_SUCCESS':
      return {
        message: 'You have updated your email',
        error: false
      }
    case 'USER_UPDATE_FAILURE':
      return {
        message: 'Give a valid email',
        error: true
      }
    case 'STUDENT_COURSE_CREATE_ONE_SUCCESS':
      return {
        message: 'Course registration succesful!',
        error: false
      }  
    default:
      return state
  }

export const clearNotifications = () => {
  return async (dispatch) => {
    dispatch({ type: 'NOTIFICATION_CLEAR' })
  }
}

export default notificationReducer