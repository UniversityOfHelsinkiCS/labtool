/**
 * Code review reducer
 *
   INITIAL_STATE contains 
    - randomizedCodeReview: all the students who are assigned to random code review round
    - codeReviewStates: all individually selected students for code review. There are separate arrays for CRs 1 & 2
    - checkBoxStates: to see which students have an cb selected to be assigned for random CR
 *  */

const INITIAL_STATE = {
  randomizedCodeReview: [],
  codeReviewStates: { 1: [], 2: [] },
  checkBoxStates: {}
}

const codeReviewReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INIT_REVIEW': {
      console.log(INITIAL_STATE.codeReviewStates)
      const oldReviews = state.codeReviewStates[action.data.round]
      let updatedReviews = {}
      let toUpdate = oldReviews.find(f => f.reviewer === action.data.reviewer)

      if (toUpdate) {
        toUpdate.reviewer = action.data.reviewer
        toUpdate.toReview = action.data.toReview
        updatedReviews = oldReviews.filter(review => (review.reviewer !== action.data.reviewer ? review : toUpdate))
      } else {
        updatedReviews = [...oldReviews, { reviewer: action.data.reviewer, toReview: action.data.toReview }]
      }
      let codeReviewRoundsToUpdate = state.codeReviewStates
      codeReviewRoundsToUpdate[action.data.round] = updatedReviews
      return { ...state, codeReviewStates: codeReviewRoundsToUpdate }
    }

    case 'INIT_ALL_CHECKBOXES':
      return { ...state, checkBoxStates: action.data.data, randomizedCodeReview: action.data.ids }
    case 'INIT_CHECKBOX':
      var cb = state.checkBoxStates
      if (cb[action.data]) {
        cb[action.data] = !cb[action.data]
      } else {
        cb[action.data] = true
      }
      return { ...state, checkBoxStates: cb }
    case 'INIT_OR_REMOVE_RANDOM':
      var cbState = state.checkBoxStates
      var rndCr = state.randomizedCodeReview
      var idToCheck = rndCr.find(cr => cr === action.data)

      if (cbState[action.data]) {
        idToCheck !== undefined ? rndCr : (rndCr = [...rndCr, action.data])
        return { ...state, randomizedCodeReview: rndCr }
      }
      rndCr = rndCr.filter(rnd => rnd !== action.data)
      return { ...state, randomizedCodeReview: rndCr }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS':
      var codeReviewRoundsToUpdate = state.codeReviewStates
      codeReviewRoundsToUpdate[action.response.data.reviewNumber] = []
      return { ...state, codeReviewStates: codeReviewRoundsToUpdate }
    default:
      return INITIAL_STATE
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

export const initOrRemoveRandom = data => {
  return async dispatch => {
    dispatch({
      type: 'INIT_OR_REMOVE_RANDOM',
      data: data
    })
  }
}

export const initCheckbox = data => {
  return async dispatch => {
    dispatch({
      type: 'INIT_CHECKBOX',
      data: data
    })
  }
}

export const initAllCheckboxes = data => {
  return async dispatch => {
    dispatch({
      type: 'INIT_ALL_CHECKBOXES',
      data: data
    })
  }
}

export default codeReviewReducer
