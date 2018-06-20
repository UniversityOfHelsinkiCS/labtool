const INITIAL_STATE = {
  redirect: false
}

const redirectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CI_MODIFY_ONE_SUCCESS':
      return { ...state, redirect: true }
    case 'CI_GET_ONE_ATTEMPT':
      return { ...state, redirect: false }
    default:
      return state
  }
}

export default redirectReducer
