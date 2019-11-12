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
  filterByReview: 0,
  filterActive: false
}

/**
 * Check if there is a repeated reviewer-toReview pair or the reviewer is same as toReview when code review round>1
 */
const checkRepeated = (currentSelections, reviewers, toReviews, round) => {
  if (round === -1) {
    round = Object.keys(currentSelections).length
  }
  for (let i = 1; i < round; i++) {
    for (let j = 0; j < reviewers.length; j++) {
      if (currentSelections[i][reviewers[j]] === toReviews[j]) {
        //repeated reviewer-toReview pair
        return true
      }
      if (reviewers[j] === toReviews[j]) {
        //reviewer is same as toReview
        return true
      }
    }
  }
  return false
}

const swap = (array, i, j) => {
  const temp = array[i]
  array[i] = array[j]
  array[j] = temp
}

const shuffleArray = array => {
  for (let i = 0; i < array.length - 1; i++) {
    const j = i + 1 + Math.floor(Math.random() * (array.length - i - 1))
    swap(array, i, j)
  }
}

let shuffledArray
let endRecursion = false
/**
 * find a permutation of reviwers-array which will not cause repeated review-toReview pair
 * or the situation that review and toReview are same
 */
const findNonRepeatedPermutation = (currentSelections, reviewers, start, toReviews, round) => {
  if (start === reviewers.length - 1) {
    if (!checkRepeated(currentSelections, reviewers, toReviews, round)) {
      shuffledArray = [...reviewers]
      endRecursion = true
    } else {
      shuffleArray(reviewers)
    }
  }
  for (let i = start; i < reviewers.length; i++) {
    if (endRecursion) {
      break
    }
    swap(reviewers, start, i)
    findNonRepeatedPermutation(currentSelections, reviewers, start + 1, toReviews, round)
    swap(reviewers, start, i)
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
      const studentData = action.data.studentData
      while (i <= action.data.codeReviewAmount) {
        codeReviewStates[i] = []
        currentSelections[i] = {}

        for (let j = 0; j < studentData.length; j++) {
          const codeReview = studentData[j].codeReviews.find(cr => cr.reviewNumber === i) // eslint-disable-line no-loop-func
          if (codeReview) {
            currentSelections[i][studentData[j].id] = codeReview.toReview || codeReview.repoToReview
          }
        }
        i++
      }
      codeReviewStates[-1] = []
      currentSelections[-1] = {}
      return { ...state, codeReviewStates: codeReviewStates, currentSelections: currentSelections, statesCreated: true }
    }
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

      if (!action.data.toReview && !action.data.repoToReview) {
        delete selections[action.data.round][action.data.reviewer]
        updatedReviews = oldReviews.filter(cr => cr.reviewer !== action.data.reviewer)
        codeReviewRoundsToUpdate[action.data.round] = updatedReviews
        return { ...state, codeReviewStates: codeReviewRoundsToUpdate, currentSelections: selections }
      }
      let toUpdate = oldReviews.find(f => f.reviewer === action.data.reviewer)
      if (toUpdate) {
        toUpdate.reviewer = action.data.reviewer
        toUpdate.toReview = action.data.toReview
        toUpdate.repoToReview = action.data.repoToReview

        updatedReviews = oldReviews.filter(review => (review.reviewer !== action.data.reviewer ? review : toUpdate))
      } else {
        updatedReviews = [...oldReviews, { reviewer: action.data.reviewer, toReview: action.data.toReview, repoToReview: action.data.repoToReview }]
      }
      codeReviewRoundsToUpdate[action.data.round] = updatedReviews

      const newCurrentSelections = state.currentSelections
      newCurrentSelections[action.data.round][action.data.reviewer] = action.data.toReview || action.data.repoToReview
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
        currentSelectionsToUpdate[-1] = {}
      }
      return { ...state, codeReviewStates: codeReviewRoundsToUpdate, currentSelections: currentSelectionsToUpdate, selectedDropdown: dropdown }
    }
    case 'CODE_REVIEW_RANDOMIZE': {
      const newCodeReviewStates = { ...state.codeReviewStates }
      const selectedForRandom = action.data.selected

      let codeReviews = newCodeReviewStates[action.data.reviewNumber]
      //Do not assign code review to students who have not been selected
      codeReviews = codeReviews.filter(cr => !selectedForRandom['' + cr.reviewer])

      const toReviews = [...Object.keys(selectedForRandom).map(x => Number(x, 10))]
      let reviewers = [...toReviews]

      let shuffledReviewers

      shuffleArray(reviewers)
      if (action.data.reviewNumber === 1 || (action.data.reviewNumber === -1 && Object.keys(state.currentSelections).length === 1)) {
        //if the code review round is 1 or there is no code review and the first one will be created, we don't need to care about the repetition problem
        shuffledReviewers = reviewers
      } else {
        shuffledArray = []
        endRecursion = false
        findNonRepeatedPermutation(state.currentSelections, reviewers, 0, toReviews, action.data.reviewNumber)
        shuffledReviewers = shuffledArray
      }

      const newCurrentSelections = { ...state.currentSelections }
      for (let i = 0; i < shuffledReviewers.length; i++) {
        codeReviews = codeReviews.concat({
          reviewer: shuffledReviewers[i],
          toReview: toReviews[i]
        })
        newCurrentSelections[action.data.reviewNumber][shuffledReviewers[i]] = toReviews[i]
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

export const createStates = (codeReviewAmount, studentData) => {
  return async dispatch => {
    dispatch({
      type: 'CREATE_STATES_FOR_CODE_REVIEWS',
      data: {
        codeReviewAmount,
        studentData
      }
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
  return async dispatch => {
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
