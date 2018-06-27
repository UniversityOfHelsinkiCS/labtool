/**
 * Named weekReview in store.
 *
 * checks: object with names as keys and booleans representing checklist values as values.
 */

const INITIAL_STATE = {
  checks: {}
}

const weekReviewReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return {}
    case 'WEEK_REVIEW_TOGGLE': {
      return { ...state, checks: { ...state.checks, [action.name]: !state.checks[action.name] } }
    }
    case 'WEEK_REVIEW_RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

export const resetChecklist = () => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_RESET'
    })
  }
}

export const toggleCheck = name => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_TOGGLE',
      name
    })
  }
}

export default weekReviewReducer
