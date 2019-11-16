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
          [action.checklistItemId]:
            baseChecks[action.checklistItemId] !== undefined ? !baseChecks[action.checklistItemId] : thisWeek ? !thisWeek.checks[action.checklistItemId] : !baseChecks[action.checklistItemId]
        }
      }
    }
    case 'WEEK_CODE_REVIEW_TOGGLE': {
      const thisCr = state.data.filter(student => student.id === Number(action.studentId, 10))[0].codeReviews.filter(cr => cr.reviewNumber === Number(action.crNbr, 10))[0]
      const baseChecks = state.checks ? state.checks : thisCr ? thisCr.checks : {}
      return {
        ...state,
        checks: {
          ...baseChecks,
          [action.checklistItemId]:
            baseChecks[action.checklistItemId] !== undefined ? !baseChecks[action.checklistItemId] : thisCr ? !thisCr.checks[action.checklistItemId] : !baseChecks[action.checklistItemId]
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

export const toggleCheckWeek = (checklistItemId, studentId, weekNbr) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_TOGGLE',
      checklistItemId,
      studentId,
      weekNbr
    })
  }
}

export const toggleCheckCodeReview = (checklistItemId, studentId, crNbr) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_CODE_REVIEW_TOGGLE',
      checklistItemId,
      studentId,
      crNbr
    })
  }
}

export const restoreChecks = (studentId, checks) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_CHECKS_RESTORE',
      studentId,
      checks
    })
  }
}

export default weekReviewReducer
