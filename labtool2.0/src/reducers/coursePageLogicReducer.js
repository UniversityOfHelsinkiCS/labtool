/**
 * Named coursePageLogic in state.
 *
 * showDropdown: studentInstance, who the user is assigning a teacher to.
 * selectedTeacher: teacherInstance, who the user is assigning to a student.
 * filterByAssistant: teacherInstance, whose students are the only ones to be shown.
 */

const INITIAL_STATE = {
  showDropdown: '',
  selectedTeacher: '',
  filterByAssistant: 0
}

const coursePageLogicReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'COURSE_PAGE_SHOW_DROPDOWN':
      return { ...state, showDropdown: action.show }
    case 'COURSE_PAGE_SELECT_TEACHER':
      return { ...state, selectedTeacher: action.selection }
    case 'COURSE_PAGE_FILTER_BY_ASSISTANT':
      return { ...state, filterByAssistant: action.assistant }
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS':
      return { ...INITIAL_STATE, filterByAssistant: state.filterByAssistant }
    case 'COURSE_PAGE_RESET':
      return { ...INITIAL_STATE, filterByAssistant: state.filterByAssistant }
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    default:
      return state
  }
}

export const showDropdown = show => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SHOW_DROPDOWN',
      show
    })
  }
}

export const selectTeacher = selection => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SELECT_TEACHER',
      selection
    })
  }
}

export const filterByAssistant = assistant => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_FILTER_BY_ASSISTANT',
      assistant
    })
  }
}

export const coursePageReset = () => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_RESET'
    })
  }
}

export default coursePageLogicReducer