/**
 * Code review reducer
 *
 * currentCodeReviews: object which includes all code reviews, mapped as arrays by their code review number
 * toupdateCodereviews: Code review number and all the modified code reviews which are added to the state to be changed when the user clicks assign
 * currentlyActiveCodeReview: '' for making it look different from the rest
 * allUserIdsToName: ''
 */

const INITIAL_STATE = {
  randomizedCodeReview: [],
  codeReviewStates: { 1: [], 2: [] },
  checkBoxStates: {}
}

const codeReviewReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INIT_REVIEW': {
      const oldReviews = state.codeReviewStates[action.data.round]
      let updatedReviews = null
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
      return { ...state, checkBoxStates: action.data }
    case 'INIT_CHECKBOX':
      let cb = state.checkBoxStates
      let ca
      if (cb[action.data]) {
        cb[action.data] = !cb[action.data]
        ca = false
      } else {
        cb[action.data] = true
      }
      return { ...state, checkBoxStates: cb }
    case 'INIT_OR_REMOVE_RANDOM':
      let cbState = state.checkBoxStates
      let rndCr = state.randomizedCodeReview
      let idToCheck = rndCr.find(cr => cr === action.data)

      if (cbState[action.data]) {
        (idToCheck !== undefined ? rndCr : rndCr = [...rndCr, action.data])
        return { ...state, randomizedCodeReview: rndCr }
      }
      rndCr = rndCr.filter(rnd => rnd !== action.data)
      return { ...state, randomizedCodeReview: rndCr }
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
