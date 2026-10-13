/**
 * Why the last week review save was refused (issue #1127), or null.
 *
 * conflict.code REVIEW_CHANGED: someone saved the review after it was opened ({ message, updatedAt, updatedBy })
 * conflict.code NOT_ASSIGNED_INSTRUCTOR: the student has another assigned instructor ({ message, assignedInstructor })
 */

const INITIAL_STATE = { conflict: null }

const reviewSaveReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'WEEKS_CREATE_ONE_ATTEMPT':
    case 'REVIEW_SAVE_RESET':
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'WEEKS_CREATE_ONE_FAILURE': {
      const response = action.response && action.response.response
      return response && response.status === 409 ? { conflict: response.data } : INITIAL_STATE
    }
    default:
      return state
  }
}

export const resetReviewSave = () => {
  return async dispatch => {
    dispatch({ type: 'REVIEW_SAVE_RESET' })
  }
}

export default reviewSaveReducer
