const INITIAL_STATE = {
  string: '',
  data: {}
}

const checklistReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CHECKLIST_GET_ONE_SUCCESS':
      return { data: action.response, string: JSON.stringify(action.response.list, null, 2) }
    case 'CHECKLIST_CHANGE_STRING':
      return { ...state, string: action.string }
    case 'CHECKLIST_RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

export const resetChecklist = () => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_RESET'
    })
  }
}

export const changeString = string => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_CHANGE_STRING',
      string
    })
  }
}

export default checklistReducer
