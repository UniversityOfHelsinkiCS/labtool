/**
 * Notification reducer. You can add context-sensitive
 * notification messages that are related to the operation.
 *
 * ex. Login is succesfull, a "You have logged in" message is put to the store
 * With the "error" field being a boolean for the notification being
 * green or red, with error false being green.
 */
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
        message: 'Wrong username or password',
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
    case 'STUDENT_COURSE_CREATE_ONE_FAILURE':
      return {
        message: 'You have not yet registered to this course at WebOodi. If you have already registered at WebOodi, try again in two hours.',
        error: true
      }
    case 'CI_MODIFY_ONE_SUCCESS':
      return {
        message: 'Course instance updated successfully!',
        error: false
      }
    case 'WEEKS_CREATE_ONESUCCESS':
      return {
        message: 'Week reviewed succesfully!',
        error: false
      }
    case 'WEEKS_CREATE_ONEFAILURE':
      return {
        message: 'Oopsie doopsie, inputs are not valid!',
        error: true
      }
    case 'COMMENT_CREATE_ONE_SUCCESS':
      return {
        message: 'Comment created succesfully!',
        error: false
      }
    case 'COMMENT_CREATE_ONE_FAILURE':
      return {
        message: 'Creating comment failed!',
        error: true
      }
    case 'TEACHER_CREATE_SUCCESS':
      return {
        message: 'Added a new admin succesfully!',
        error: false
      }
    case 'TEACHER_CREATE_FAILURE':
      return {
        message: action.response.response.data,
        error: true
      }
    default:
      return state
  }
}

export const clearNotifications = () => {
  return async dispatch => {
    dispatch({ type: 'NOTIFICATION_CLEAR' })
  }
}

export default notificationReducer
