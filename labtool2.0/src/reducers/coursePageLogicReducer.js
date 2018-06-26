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
  filterByAssistant: 0,
  activeIndex: 0,
  lastReviewedWeek: 1,
  lastReviewedIsShownAlready: false,
  filterByTag: [],
  showCodeReviews: []
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
    case 'COURSE_PAGE_FILTER_BY_ASSISTANT':
      return { ...state, filterByAssistant: action.assistant }
    case 'COURSE_PAGE_FILTER_BY_TAG':
      if (action.tag === 0) {
        return { ...state, filterByTag: [] }
      } else if (state.filterByTag.map(tag => tag.id).includes(action.tag.id)) {
        return { ...state, filterByTag: state.filterByTag.filter(tag => tag.id !== action.tag.id) }
      } else {
        return { ...state, filterByTag: [...state.filterByTag, action.tag] }
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
              const probablyNewest = new Date(action.response.data.weeks[i].createdAt) > new Date(action.response.data.weeks[i - 1].createdAt) ? action.response.data.weeks[i] : action.response.data.weeks[i - 1]
              newestWeek = new Date(probablyNewest.createdAt) > new Date(newestWeek.createdAt) ? probablyNewest : newestWeek
            }
            newestReviewWeek = newestWeek.weekNumber
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
