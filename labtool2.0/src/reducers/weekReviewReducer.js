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
    case 'WEEK_REVIEW_TOGGLE': {
      const newChecks = state.checks
      newChecks[action.name] = !newChecks[action.name]
      return { ...state, checks: newChecks }
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
