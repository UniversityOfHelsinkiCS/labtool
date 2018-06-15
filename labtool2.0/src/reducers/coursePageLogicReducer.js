/**
 * Named coursePageLogic in state.
 *
 * showDropdown: studentInstance, who the user is assigning a teacher to. Teacher side.
 * selectedTeacher: teacherInstance, who the user is assigning to a student. Teacher side.
 * filterByAssistant: teacherInstance, whose students are the only ones to be shown. Teacher side.
 * showCodeReviews: array of codeReviews to be shown uncollapsed. Student side.
 */

const INITIAL_STATE = {
  showDropdown: '',
  selectedTeacher: '',
  filterByAssistant: 0,
  filterByTag: 0,
  showCodeReviews: []
}

const coursePageLogicReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'COURSE_PAGE_SHOW_DROPDOWN':
      return { ...state, showDropdown: action.show }
    case 'COURSE_PAGE_SELECT_TEACHER':
      return { ...state, selectedTeacher: action.selection }
    case 'COURSE_PAGE_FILTER_BY_ASSISTANT':
      return { ...state, filterByAssistant: action.assistant }
    case 'COURSE_PAGE_FILTER_BY_TAG':
      return { ...state, filterByTag: action.tag }
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS':
      return INITIAL_STATE
    case 'COURSE_PAGE_RESET':
      return INITIAL_STATE
    case 'CP_INFO_SUCCESS':
      if (action.response.role === 'student') {
        try {
          // The line below sets showCodeReviews to be equal to the reviewNumbers whose points are 0.
          return { ...state, showCodeReviews: action.response.data.codeReviews.filter(cr => cr.points === null).map(cr => cr.reviewNumber) }
        } catch (e) {
          console.log('ERROR: Setting initial values for shown codeReviews failed.')
          return state
        }
      } else {
        return state
      }
    case 'COURSE_PAGE_TOGGLE_CODE_REVIEW':
      var index = state.showCodeReviews.indexOf(action.reviewNumber)
      if (index === -1) {
        return { ...state, showCodeReviews: [...state.showCodeReviews, action.reviewNumber] }
      } else {
        var newValue = state.showCodeReviews
        newValue.splice(index, 1)
        return { ...state, showCodeReviews: newValue }
      }
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

export const filterByTag = tag => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_FILTER_BY_TAG',
      tag
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

export const toggleCodeReview = reviewNumber => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_TOGGLE_CODE_REVIEW',
      reviewNumber
    })
  }
}

export default coursePageLogicReducer
