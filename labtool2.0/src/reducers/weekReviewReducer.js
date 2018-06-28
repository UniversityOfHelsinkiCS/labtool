/**
 * Named weekReview in store.
 *
 * checks: object with names as keys and booleans representing checklist values as values.
 */

const INITIAL_STATE = {
  checks: {},
  data: {}
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
      return {
        ...state,
        data: state.data.map(
          student =>
            student.id === Number(action.studentId, 10)
              ? {
                  ...student,
                  weeks: student.weeks.map(week => (week.weekNumber === Number(action.weekNbr, 10) ? { ...week, checks: { ...week.checks, [action.name]: !week.checks[action.name] } } : week))
                }
              : student
        ),
        checks: {
          ...state.checks,
          [action.name]: state.checks[action.name] !== undefined ? !state.checks[action.name] : thisWeek ? !thisWeek.checks[action.name] : !state.checks[action.name]
        }
      }
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

export default weekReviewReducer
