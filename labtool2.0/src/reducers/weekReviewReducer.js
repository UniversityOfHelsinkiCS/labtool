/**
 * Named weekReview in store.
 *
 * checks: object with names as keys and booleans representing checklist values as values.
 */

const INITIAL_STATE = {
  checks: null,
  data: {},
  draftData: {},
  draftCreatedAt: null,
  allowDraftLoad: true
}

const weekReviewReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CP_INFO_SUCCESS': {
      return { ...state, data: action.response.data }
    }
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'WEEK_REVIEW_TOGGLE': {
      const thisWeek = state.data.filter(student => student.id === Number(action.studentId, 10))[0].weeks.filter(week => week.weekNumber === Number(action.weekNbr, 10))[0]
      const baseChecks = state.checks ? state.checks : thisWeek ? thisWeek.checks : {}
      return {
        ...state,
        checks: {
          ...baseChecks,
          [action.name]: baseChecks[action.name] !== undefined ? !baseChecks[action.name] : thisWeek ? !thisWeek.checks[action.name] : !baseChecks[action.name]
        }
      }
    }
    case 'WEEK_REVIEW_RESET':
      return INITIAL_STATE
    case 'WEEK_REVIEW_CHECKS_RESTORE':
      return {
        ...state,
        checks: {
          ...action.checks
        },
        allowDraftLoad: false
      }
    case 'WEEKDRAFTS_GET_ONE_SUCCESS':
      if (!action.response || !action.response.data) {
        return {
          ...state,
          draftData: {},
          draftCreatedAt: null
        }
      }
      return {
        ...state,
        draftData: action.response.data,
        draftCreatedAt: action.response.updatedAt,
        checks: state.allowDraftLoad ? action.response.data.checks : state.checks
      }
    case 'WEEKDRAFTS_GET_ONE_FAILURE':
      return state
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

export const toggleCheck = (name, studentId, weekNbr) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_TOGGLE',
      name,
      studentId,
      weekNbr
    })
  }
}

export const restoreChecks = (studentId, weekNbr, checks) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_CHECKS_RESTORE',
      studentId,
      weekNbr,
      checks
    })
  }
}

export default weekReviewReducer
