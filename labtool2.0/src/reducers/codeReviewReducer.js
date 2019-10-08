/**
 * Code review reducer
 *
   INITIAL_STATE contains 
    - randomizedCodeReview: all the students who are assigned to random code review round
    - codeReviewStates: all individually selected students for code review. There are separate arrays for CRs 1 & 2
    - checkBoxStates: to see which students have an cb selected to be assigned for random CR
 *  */

const INITIAL_STATE = {
  codeReviewStates: {},
  currentSelections: {},
  selectedDropdown: null,
  statesCreated: false,
  initialized: false,
  showCreate: false,
  filterByReview: 0,
  filterActive: false
}

function shuffleArray(array) {
  for (let i = 0; i < array.length - 1; i++) {
    const j = i + 1 + Math.floor(Math.random() * (array.length - i - 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

const codeReviewReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return {}
    case 'CODE_REVIEW_RESTORE':
      return action.data
    case 'CREATE_STATES_FOR_CODE_REVIEWS': {
      let i = 1
      let codeReviewStates = {}
      let currentSelections = {}
      while (i <= action.data) {
        codeReviewStates[i] = []
        currentSelections[i] = {}
        i++
      }
      codeReviewStates['create'] = []
      currentSelections['create'] = {}
      return { ...state, codeReviewStates: codeReviewStates, currentSelections: currentSelections, statesCreated: true }
    }
    case 'TOGGLE_CREATE':
      return { ...state, showCreate: !state.showCreate }
    case 'SELECT_DROPDOWN':
      return { ...state, selectedDropdown: action.data }
    case 'FILTER_BY_REVIEW': {
      let newActiveStatus = true
      if (action.data === 0) {
        newActiveStatus = false
      }
      return { ...state, filterByReview: action.data, filterActive: newActiveStatus }
    }
    case 'INIT_REVIEW': {
      const oldReviews = state.codeReviewStates[action.data.round]
      let selections = state.currentSelections
      let updatedReviews = {}
      let codeReviewRoundsToUpdate = state.codeReviewStates

      if (!action.data.toReview) {
        delete selections[action.data.round][action.data.reviewer]
        updatedReviews = oldReviews.filter(cr => cr.reviewer !== action.data.reviewer)
        codeReviewRoundsToUpdate[action.data.round] = updatedReviews
        return { ...state, codeReviewStates: codeReviewRoundsToUpdate, currentSelections: selections }
      }
      let toUpdate = oldReviews.find(f => f.reviewer === action.data.reviewer)
      if (toUpdate) {
        toUpdate.reviewer = action.data.reviewer
        toUpdate.toReview = action.data.toReview
        updatedReviews = oldReviews.filter(review => (review.reviewer !== action.data.reviewer ? review : toUpdate))
      } else {
        updatedReviews = [...oldReviews, { reviewer: action.data.reviewer, toReview: action.data.toReview }]
      }
      codeReviewRoundsToUpdate[action.data.round] = updatedReviews

      const newCurrentSelections = state.currentSelections
      newCurrentSelections[action.data.round][action.data.reviewer] = action.data.toReview
      return { ...state, codeReviewStates: codeReviewRoundsToUpdate, currentSelections: newCurrentSelections }
    }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS': {
      var codeReviewRoundsToUpdate = state.codeReviewStates
      var currentSelectionsToUpdate = state.currentSelections
      var newRound = action.response.data.reviewNumber
      let dropdown = state.selectedDropdown

      if (newRound > Object.keys(state.codeReviewStates).length - 1) {
        codeReviewRoundsToUpdate = { ...codeReviewRoundsToUpdate, [newRound]: [] }
      }
      if (newRound > Object.keys(state.currentSelections).length - 1) {
        currentSelectionsToUpdate = { ...currentSelectionsToUpdate, [newRound]: {} }
      }
      //This is double clear but if the ternary is not true we'll have to clear the array anyway
      codeReviewRoundsToUpdate[action.response.data.reviewNumber] = []
      if (action.response.data.createTrue) {
        dropdown = action.response.data.reviewNumber
        currentSelectionsToUpdate['create'] = {}
      }
      return { ...state, codeReviewStates: codeReviewRoundsToUpdate, currentSelections: currentSelectionsToUpdate, selectedDropdown: dropdown }
    }
    case 'CODE_REVIEW_RANDOMIZE': {
      const newCodeReviewStates = { ...state.codeReviewStates }
      const selectedForRandom = action.data.selected
      console.log(selectedForRandom)

      let codeReviews = newCodeReviewStates[action.data.reviewNumber]
      //Do not assign code review to students who have not been selected
      codeReviews = codeReviews.filter(cr => !selectedForRandom['' + cr.reviewer])

      const originalOrder = [...Object.keys(selectedForRandom).map(x => Number(x, 10))]
      const randomizedOrder = [...originalOrder]
      shuffleArray(randomizedOrder)
      const newCurrentSelections = { ...state.currentSelections }
      for (let i = 0; i < randomizedOrder.length; i++) {
        codeReviews = codeReviews.concat({
          reviewer: randomizedOrder[i],
          toReview: originalOrder[i]
        })
        newCurrentSelections[action.data.reviewNumber][randomizedOrder[i]] = originalOrder[i]
      }
      newCodeReviewStates[action.data.reviewNumber] = codeReviews
      return { ...state, codeReviewStates: newCodeReviewStates, currentSelections: newCurrentSelections }
    }

    case 'CODE_REVIEW_REMOVE_ONE_SUCCESS': {
      const currentStates = state.currentSelections
      delete currentStates[action.response.data.codeReviewRound][action.response.data.reviewer]
      return { ...state, currentSelections: currentStates }
    }

    /* This breaks going to coursePage. So it is commented out.
    case 'CP_INFO_SUCCESS': {
      if (action.role !== 'teacher' || state.initialized) {
        return state
      }
      const newCurrentSelections = state.currentSelections
      action.response.data.forEach(student => {
        student.codeReviews.forEach(cr => {
          newCurrentSelections[cr.reviewNumber][student.id] = cr.toReview
        })
      })
      return { ...state, currentSelections: newCurrentSelections, initialized: true }
    }
    */
    case 'CODE_REVIEW_RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

export const restoreData = data => {
  return async dispatch => {
    dispatch({
      type: 'CODE_REVIEW_RESTORE',
      data
    })
  }
}

export const toggleCreate = () => {
  return async dispatch => {
    dispatch({
      type: 'TOGGLE_CREATE'
    })
  }
}

export const createStates = data => {
  return async dispatch => {
    dispatch({
      type: 'CREATE_STATES_FOR_CODE_REVIEWS',
      data: data
    })
  }
}

export const initOneReview = data => {
  return async dispatch => {
    dispatch({
      type: 'INIT_REVIEW',
      data: data
    })
  }
}

export const randomAssign = (data, selected) => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'CODE_REVIEW_RANDOMIZE',
      data: {
        reviewNumber: data.reviewNumber,
        selected
      }
    })
  }
}

export const codeReviewReset = () => {
  return async dispatch => {
    dispatch({
      type: 'CODE_REVIEW_RESET'
    })
  }
}

export const selectDropdown = data => {
  return async dispatch => {
    dispatch({
      type: 'SELECT_DROPDOWN',
      data: data
    })
  }
}

export const filterByReview = data => {
  return async dispatch => {
    dispatch({
      type: 'FILTER_BY_REVIEW',
      data: data
    })
  }
}

export default codeReviewReducer
