const INITIAL_STATE = {
  loading: false,
  redirect: false
}

const redirectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'STUDENT_COURSE_CREATE_ONE_ATTEMPT':
      return { ...state, loading: true }
    case 'STUDENT_COURSE_CREATE_ONE_SUCCESS':
      console.log('are we here')
      return { ...state, loading: false, redirect: true }
    case 'STUDENT_PROJECT_INFO_UPDATE_ATTEMPT':
      return { ...state, loading: true, redirect: false }
    case 'STUDENT_PROJECT_INFO_UPDATE_SUCCESS':
      return { ...state, loading: false, redirect: true }
    case 'REGISTER_RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

export const resetRegister = () => {
  return async dispatch => {
    dispatch({
      type: 'REGISTER_RESET'
    })
  }
}

export default redirectReducer
