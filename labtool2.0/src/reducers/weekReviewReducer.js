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

const cascadeMissingPrerequisites = (checks, prerequisites) => {
  const newChecks = { ...checks }
  let updated = false
  Object.keys(newChecks).forEach(checkId => {
    while (newChecks[checkId] && prerequisites[checkId] !== null && !newChecks[prerequisites[checkId]]) {
      updated = true
      newChecks[checkId] = false
      checkId = prerequisites[checkId]
    }
  })
  return updated ? newChecks : checks
}

const toggleAndCascadeMissingPrerequisites = (baseChecks, thisChecks, itemId, prerequisites) => {
  const toggledChecks = {
    ...baseChecks,
    [itemId]: baseChecks[itemId] !== undefined ? !baseChecks[itemId] : thisChecks ? !thisChecks.checks[itemId] : !baseChecks[itemId]
  }
  return cascadeMissingPrerequisites(toggledChecks, prerequisites)
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
        checks: toggleAndCascadeMissingPrerequisites(baseChecks, thisWeek, action.checklistItemId, action.prerequisites)
      }
    }
    case 'WEEK_CODE_REVIEW_TOGGLE': {
      const thisCr = state.data.filter(student => student.id === Number(action.studentId, 10))[0].codeReviews.filter(cr => cr.reviewNumber === Number(action.crNbr, 10))[0]
      const baseChecks = state.checks ? state.checks : thisCr ? thisCr.checks : {}
      return {
        ...state,
        checks: toggleAndCascadeMissingPrerequisites(baseChecks, thisCr, action.checklistItemId, action.prerequisites)
      }
    }
    case 'WEEK_REVIEW_RESET':
      return INITIAL_STATE
    case 'WEEK_REVIEW_CHECK_SCAN_PREREQUISITES':
      const newChecks = cascadeMissingPrerequisites(state.checks, action.prerequisites)
      // do not modify state if we don't need to change anything
      return state.checks == newChecks
        ? state
        : {
            ...state,
            checks: newChecks
          }
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

export const toggleCheckWeek = (checklistItemId, studentId, weekNbr, prerequisites) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_TOGGLE',
      checklistItemId,
      studentId,
      weekNbr,
      prerequisites
    })
  }
}

export const toggleCheckCodeReview = (checklistItemId, studentId, crNbr, prerequisites) => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_CODE_REVIEW_TOGGLE',
      checklistItemId,
      studentId,
      crNbr,
      prerequisites
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

export const verifyCheckPrerequisites = prerequisites => {
  return async dispatch => {
    dispatch({
      type: 'WEEK_REVIEW_CHECK_SCAN_PREREQUISITES',
      prerequisites
    })
  }
}

export default weekReviewReducer
