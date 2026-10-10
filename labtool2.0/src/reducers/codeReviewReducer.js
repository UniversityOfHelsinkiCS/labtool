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

const randomOrder = array => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    swap(result, i, Math.floor(Math.random() * (i + 1)))
  }
  return result
}

/**
 * Find reviewers for toReviews (reviewers[i] reviews toReviews[i]) so that nobody reviews themselves
 * and nobody reviews someone they already reviewed in an earlier round. Randomized backtracking, so it
 * always finds an assignment when one exists. Returns [] when there is none.
 */
const findNonRepeatedPermutation = (currentSelections, toReviews, round) => {
  const previousRounds =
    round === -1
      ? Object.keys(currentSelections)
          .map(Number)
          .filter(r => r > 0)
      : Array.from({ length: round - 1 }, (_, i) => i + 1)
  const isAllowed = (reviewer, toReview) =>
    reviewer !== toReview &&
    !previousRounds.some(r => currentSelections[r] && currentSelections[r][reviewer] === toReview)

  const reviewers = []
  const used = new Set()
  const assign = position => {
    if (position === toReviews.length) {
      return true
    }
    const candidates = randomOrder(
      toReviews.filter(reviewer => !used.has(reviewer) && isAllowed(reviewer, toReviews[position]))
    )
    for (const reviewer of candidates) {
      used.add(reviewer)
      reviewers[position] = reviewer
      if (assign(position + 1)) {
        return true
      }
      used.delete(reviewer)
    }
    return false
  }
  return assign(0) ? reviewers : []
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
          const codeReview = studentData[j].codeReviews.find(cr => cr.reviewNumber === i)
          if (codeReview) {
            currentSelections[i][studentData[j].id] = codeReview.toReview || codeReview.repoToReview
          }
        }
        i++
      }
      codeReviewStates[-1] = []
      currentSelections[-1] = {}
      return {
        ...state,
        codeReviewStates: codeReviewStates,
        currentSelections: currentSelections,
        statesCreated: true
      }
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
      const { round, reviewer, toReview, repoToReview } = action.data
      const oldReviews = state.codeReviewStates[round]

      if (!toReview && !repoToReview) {
        const { [reviewer]: removed, ...remainingSelections } = state.currentSelections[round] // eslint-disable-line no-unused-vars
        return {
          ...state,
          codeReviewStates: {
            ...state.codeReviewStates,
            [round]: oldReviews.filter(cr => cr.reviewer !== reviewer)
          },
          currentSelections: { ...state.currentSelections, [round]: remainingSelections }
        }
      }
      const review = { reviewer, toReview, repoToReview }
      const updatedReviews = oldReviews.some(cr => cr.reviewer === reviewer)
        ? oldReviews.map(cr => (cr.reviewer === reviewer ? { ...cr, ...review } : cr))
        : [...oldReviews, review]
      return {
        ...state,
        codeReviewStates: { ...state.codeReviewStates, [round]: updatedReviews },
        currentSelections: {
          ...state.currentSelections,
          [round]: { ...state.currentSelections[round], [reviewer]: toReview || repoToReview }
        }
      }
    }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS': {
      const newRound = action.response.data.reviewNumber
      let dropdown = state.selectedDropdown

      // the saved round's pending reviews are cleared
      const codeReviewRoundsToUpdate = { ...state.codeReviewStates, [newRound]: [] }
      let currentSelectionsToUpdate = state.currentSelections
      if (newRound > Object.keys(state.currentSelections).length - 1) {
        currentSelectionsToUpdate = { ...currentSelectionsToUpdate, [newRound]: {} }
      }
      if (action.response.data.createTrue) {
        dropdown = newRound
        currentSelectionsToUpdate = { ...currentSelectionsToUpdate, [-1]: {} }
      }
      return {
        ...state,
        codeReviewStates: codeReviewRoundsToUpdate,
        currentSelections: currentSelectionsToUpdate,
        selectedDropdown: dropdown
      }
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
      if (
        action.data.reviewNumber === 1 ||
        (action.data.reviewNumber === -1 && Object.keys(state.currentSelections).length === 1)
      ) {
        //if the code review round is 1 or there is no code review and the first one will be created, we don't need to care about the repetition problem
        shuffledReviewers = reviewers
      } else {
        shuffledReviewers = findNonRepeatedPermutation(
          state.currentSelections,
          toReviews,
          action.data.reviewNumber
        )
      }

      const newCurrentSelections = {
        ...state.currentSelections,
        [action.data.reviewNumber]: { ...state.currentSelections[action.data.reviewNumber] }
      }
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
      const { codeReviewRound, reviewer } = action.response.data
      const { [reviewer]: removed, ...remaining } = state.currentSelections[codeReviewRound] || {} // eslint-disable-line no-unused-vars
      return { ...state, currentSelections: { ...state.currentSelections, [codeReviewRound]: remaining } }
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
