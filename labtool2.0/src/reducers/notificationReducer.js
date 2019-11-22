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
    case 'NOTIFICATION_SHOW':
      return action.notification
    //case 'LOGIN_SUCCESS':
    //  return {
    //    message: 'You have logged in',
    //    error: false
    //  }
    case 'NOTIFICATION_CLEAR':
      return {
        lastMessage: state.message,
        error: state.error
      }
    //case 'LOGIN_FAILURE':
    //  return {
    //    message: 'Wrong username or password',
    //    error: true
    //  }
    //case 'LOGOUT_SUCCESS':
    //  return {
    //    message: 'You have logged out',
    //    error: false
    //  }
    case 'USER_UPDATE_SUCCESS':
      return {
        message: 'Your email address has been updated',
        error: false
      }
    case 'USER_UPDATE_FAILURE':
      // action.response.response.data refers to the json sent by backend
      return {
        message: action.response.response.data.error,
        error: true
      }
    case 'USER_UPDATE_ADMIN_SUCCESS':
      return {
        message: 'User updated',
        error: false
      }
    case 'USER_UPDATE_ADMIN_FAILURE':
      return {
        message: 'Could not update user',
        error: true
      }
    case 'STUDENT_COURSE_CREATE_ONE_SUCCESS':
      return {
        message: 'Course registration successful!',
        error: false
      }
    case 'STUDENT_COURSE_CREATE_ONE_FAILURE':
      return {
        message: action.response.response.data.message,
        error: true
      }
    case 'CI_MODIFY_ONE_SUCCESS':
      return {
        message: 'Course instance updated successfully!',
        error: false
      }
    case 'WEEKS_CREATE_ONESUCCESS':
      return {
        message: 'Week reviewed successfully!',
        error: false
      }
    case 'WEEKS_CREATE_ONEFAILURE':
      return {
        message: 'Invalid inputs.',
        error: true
      }
    case 'WEEKDRAFTS_CREATE_ONESUCCESS':
      return {
        message: 'Week draft saved successfully!',
        error: false
      }
    case 'WEEKDRAFTS_CREATE_ONEFAILURE':
      return {
        message: 'Invalid inputs.',
        error: true
      }
    case 'COMMENT_CREATE_ONE_SUCCESS':
      return {
        message: 'Comment created successfully!',
        error: false
      }
    case 'COMMENT_CREATE_ONE_FAILURE':
      return {
        message: 'Creating comment failed!',
        error: true
      }
    case 'TEACHER_CREATE_SUCCESS':
      return {
        message: 'Added a new assistant successfully!',
        error: false
      }
    case 'TEACHER_CREATE_FAILURE':
      return {
        message: action.response.response.data,
        error: true
      }
    case 'TEACHER_REMOVE_SUCCESS':
      return {
        message: 'Removed an assistant successfully!',
        error: false
      }
    case 'TEACHER_REMOVE_FAILURE':
      return {
        message: 'Removing assistant failed',
        error: true
      }
    case 'ASSOCIATE_TEACHER_AND_STUDENT_FAILURE':
      return {
        message: action.response.response.data,
        error: true
      }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS':
      return {
        message: 'Code reviews saved successfully',
        error: false
      }
    case 'CODE_REVIEW_BULKINSERT_FAILURE':
      return {
        message: action.response.response.data,
        error: true
      }
    case 'CODE_REVIEW_GRADE_SUCCESS':
      return {
        message: 'Code review graded successfully',
        error: false
      }
    case 'CODE_REVIEW_GRADE_FAILURE':
      return {
        message: action.response.response.data,
        error: true
      }
    case 'CODE_REVIEW_ADD_LINK_SUCCESS':
      return {
        message: 'Link added successfully',
        error: false
      }
    case 'CODE_REVIEW_ADD_LINK_FAILURE':
      return {
        message: 'Link could not be added. Please check URL formatting',
        error: true
      }
    case 'CHECKLIST_CREATE_SUCCESS':
      return {
        message: action.response.message,
        error: false
      }
    case 'TAG_STUDENT_SUCCESS':
      return {
        message: 'Student tagged successfully',
        error: false
      }
    case 'UNTAG_STUDENT_SUCCESS':
      return {
        message: 'Student tag removed successfully',
        error: false
      }
    case 'TAG_CREATE_SUCCESS':
      return {
        message: 'Tag saved successfully',
        error: false
      }
    case 'TAG_REMOVE_SUCCESS':
      return {
        message: 'Tag removed successfully',
        error: false
      }
    case 'CHECKLIST_CREATE_FAILURE':
      return {
        message: action.response.response.data,
        error: true
      }
    case 'CHECKLIST_GET_ONE_FAILURE':
      if (action.response.response.data.data.copying) {
        return {
          message: action.response.response.data.message,
          error: true
        }
      }
      return state
    case 'CODE_REVIEW_RANDOMIZE':
      return {
        message: 'Code reviews randomized, changes need to be saved',
        error: false
      }
    case 'STUDENT_PROJECT_INFO_UPDATE_SUCCESS':
      return {
        message: 'Project info updated successfully!',
        error: false
      }
    case 'SEND_EMAIL_SUCCESS':
      return {
        message: action.response.message,
        error: false
      }
    case 'SEND_EMAIL_FAILURE':
      return {
        message: action.response.response.data.message,
        error: true
      }

    case 'CODE_REVIEW_REMOVE_ONE_SUCCESS':
      return {
        message: 'Code review removed successfully!',
        error: false
      }
    case 'STUDENT_PROJECT_INFO_UPDATE_FAILURE': {
      const { message } = action.response.response ? action.response.response.data : { message: 'Error updating project info' }
      return {
        message,
        error: true
      }
    }
    case 'MASS_EMAIL_SENDSUCCESS':
      return {
        message: action.response.message,
        error: false
      }
    case 'MASS_EMAIL_SENDFAILURE':
      return {
        message: `Could not send e-mail; ${(action.response && action.response.response.data.message) || 'no students selected'}`,
        error: true
      }
    case 'COURSE_IMPORT_DO_IMPORT_SUCCESS':
      return {
        message: 'Courses imported successfully',
        error: false
      }
    case 'COURSE_IMPORT_DO_IMPORT_FAILURE':
      return {
        message: 'Could not import courses',
        error: true
      }
    case 'STUDENT_REMOVE_SUCCESS':
      return {
        message: 'You have removed yourself from the course',
        error: false
      }
    case 'STUDENT_REMOVE_FAILURE':
      return {
        message: 'You cannot remove yourself from the course',
        error: true
      }
    default:
      return state
  }
}

export const showNotification = notification => {
  return async dispatch => {
    dispatch({
      type: 'NOTIFICATION_SHOW',
      notification
    })
  }
}

export const clearNotifications = () => {
  return async dispatch => {
    dispatch({ type: 'NOTIFICATION_CLEAR' })
  }
}

export default notificationReducer
