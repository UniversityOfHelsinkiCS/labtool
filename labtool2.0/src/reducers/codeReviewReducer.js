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
  codeReviewStates: { 1: [], 2: [] }
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

export default codeReviewReducer
