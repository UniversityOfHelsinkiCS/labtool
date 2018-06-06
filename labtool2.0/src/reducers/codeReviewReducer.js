/**
 * Code review reducer
 *
 * currentCodeReviews: object which includes all code reviews, mapped as arrays by their code review number
 * toupdateCodereviews: Code review number and all the modified code reviews which are added to the state to be changed when the user clicks assign
 * currentlyActiveCodeReview: '' for making it look different from the rest
 * allUserIdsToName: ''
 */


const INITIAL_STATE = {
    allDropDownUsers: ''
}

const codeReviewReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'INIT_ALL_USERS_DROPDOWN':
            return { ...state, allDropDownUSers: action.data }
        default:
            return INITIAL_STATE
    }
}



export default codeReviewReducer
