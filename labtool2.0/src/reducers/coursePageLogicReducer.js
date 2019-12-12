/**
 * Named coursePageLogic in state.
 *
 * showDropdown: studentInstance, who the user is assigning a teacher to. Teacher side.
 * selectedTeacher: teacherInstance, who the user is assigning to a student. Teacher side.
 * filterByAssistant: teacherInstance, whose students are the only ones to be shown. Teacher side.
 * showCodeReviews: array of codeReviews to be shown uncollapsed. Student side.
 */

const INITIAL_STATE = {
  tags: {},
  showAssistantDropdown: '',
  showTagDropdown: '',
  selectedTeacher: '',
  selectedTag: '',
  activeIndex: 0,
  lastReviewedWeek: 1,
  lastReviewedIsShownAlready: false,
  showCodeReviews: [],
  selectedStudentsCourse: '',
  selectedStudents: {},
  showMassAssignForm: false
}

const coursePageLogicReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'COURSE_PAGE_SHOW_ASSISTANT_DROPDOWN':
      return { ...state, showAssistantDropdown: action.show }
    case 'COURSE_PAGE_SHOW_TAG_DROPDOWN':
      return { ...state, showTagDropdown: action.show }
    case 'COURSE_PAGE_SELECT_TEACHER':
      return { ...state, selectedTeacher: action.selection }
    case 'COURSE_PAGE_SELECT_TAG':
      return { ...state, selectedTag: action.selection }
    case 'COURSE_PAGE_SET_SELECTED_STUDENTS':
      return { ...state, selectedStudents: action.selection }
    case 'COURSE_PAGE_TOGGLE_MASS_ASSIGN':
      return { ...state, showMassAssignForm: !state.showMassAssignForm }
    case 'COURSE_PAGE_SELECT_STUDENT': {
      const newSelectedStudents = { ...state.selectedStudents }
      newSelectedStudents[action.id] = true
      return { ...state, selectedStudents: newSelectedStudents }
    }
    case 'COURSE_PAGE_UNSELECT_STUDENT': {
      const newSelectedStudents = { ...state.selectedStudents }
      delete newSelectedStudents[action.id]
      return { ...state, selectedStudents: newSelectedStudents }
    }
    case 'COURSE_PAGE_SELECT_MANY_STUDENTS': {
      const newSelectedStudents = { ...state.selectedStudents }
      action.ids.forEach(id => {
        newSelectedStudents[id] = true
      })
      return { ...state, selectedStudents: newSelectedStudents }
    }
    case 'COURSE_PAGE_UNSELECT_MANY_STUDENTS': {
      const newSelectedStudents = { ...state.selectedStudents }
      action.ids.forEach(id => {
        delete newSelectedStudents[id]
      })
      return { ...state, selectedStudents: newSelectedStudents }
    }
    case 'COURSE_PAGE_INVERT_MANY_STUDENTS': {
      console.log('invert')
      const newSelectedStudents = { ...state.selectedStudents }
      action.ids.forEach(id => {
        if (newSelectedStudents[id]) {
          delete newSelectedStudents[id]
        } else {
          newSelectedStudents[id] = true
        }
      })
      return { ...state, selectedStudents: newSelectedStudents }
    }
    case 'COURSE_PAGE_RESET_FOR_COURSE': {
      const newCourseId = action.courseId
      if (state.selectedStudentsCourse !== newCourseId) {
        return { ...state, selectedStudentsCourse: newCourseId, selectedStudents: {} }
      }
      return state
    }
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS':
      return INITIAL_STATE
    case 'COURSE_PAGE_RESET':
      return INITIAL_STATE
    case 'TAG_STUDENT_SUCCESS':
      return INITIAL_STATE
    case 'UNTAG_STUDENT_SUCCESS':
      return INITIAL_STATE
    case 'CP_INFO_SUCCESS':
      if (action.response.role === 'student') {
        try {
          const weeks = action.response.data.weeks
          let newestReviewWeek = 0
          let newestWeek
          if (weeks) {
            newestWeek = action.response.data.weeks[0]
            const numberOfWeeks = action.response.data.weeks.length
            for (let i = 1; i < numberOfWeeks; i++) {
              const probablyNewest =
                new Date(action.response.data.weeks[i].createdAt) > new Date(action.response.data.weeks[i - 1].createdAt) ? action.response.data.weeks[i] : action.response.data.weeks[i - 1]
              newestWeek = new Date(probablyNewest.createdAt) > new Date(newestWeek.createdAt) ? probablyNewest : newestWeek
            }
            newestReviewWeek = newestWeek ? newestWeek.weekNumber : 0
          }

          // The showCodeReviews -line below sets showCodeReviews to be equal to the reviewNumbers whose points are 0.
          const showNewestOrUserOpened = state.lastReviewedIsShownAlready ? state.activeIndex : newestReviewWeek - 1
          return {
            ...state,
            lastReviewedWeek: newestReviewWeek,
            activeIndex: showNewestOrUserOpened,
            showCodeReviews: action.response.data.codeReviews.filter(cr => cr.points === null).map(cr => cr.reviewNumber)
          }
        } catch (e) {
          console.error('Setting initial values for shown codeReviews failed.', e)
          return state
        }
      } else {
        return state
      }
    case 'COURSE_PAGE_TOGGLE_CODE_REVIEW': {
      const index = state.showCodeReviews.indexOf(action.reviewNumber)
      if (index === -1) {
        return { ...state, showCodeReviews: [...state.showCodeReviews, action.reviewNumber] }
      } else {
        var newValue = state.showCodeReviews
        newValue.splice(index, 1)
        return { ...state, showCodeReviews: newValue }
      }
    }
    case 'COURSE_PAGE_UPDATE_ACTIVE_INDEX':
      try {
        return {
          ...state,
          lastReviewedIsShownAlready: true,
          activeIndex: action.theNewIndex
        }
      } catch (e) {
        console.log('ERROR: Updating activeIndex in coursePage failed.')
        return state
      }

    default:
      return state
  }
}

export const prepareForCourse = courseId => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_RESET_FOR_COURSE',
      courseId
    })
  }
}

export const showAssistantDropdown = show => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SHOW_ASSISTANT_DROPDOWN',
      show
    })
  }
}

export const showTagDropdown = show => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SHOW_TAG_DROPDOWN',
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

export const selectTag = selection => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SELECT_TAG',
      selection
    })
  }
}

export const selectStudent = id => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SELECT_STUDENT',
      id
    })
  }
}

export const unselectStudent = id => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_UNSELECT_STUDENT',
      id
    })
  }
}

export const selectAllStudents = ids => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SELECT_MANY_STUDENTS',
      ids
    })
  }
}

export const unselectAllStudents = ids => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_UNSELECT_MANY_STUDENTS',
      ids
    })
  }
}

export const invertStudentSelection = ids => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_INVERT_MANY_STUDENTS',
      ids
    })
  }
}

export const restoreStudentSelection = selection => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_SET_SELECTED_STUDENTS',
      selection
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

export const updateActiveIndex = theNewIndex => {
  return async dispatch => {
    dispatch({
      type: 'COURSE_PAGE_UPDATE_ACTIVE_INDEX',
      theNewIndex
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
