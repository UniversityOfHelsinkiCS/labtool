/**
 * Named checklist in store.
 *
 * string: string representation of data.list
 * data: object representing a checklist received from backend.
 */

const INITIAL_STATE = {
  data: {}
}

const checklistReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CHECKLIST_GET_ONE_SUCCESS':
      return { data: action.response.list }
    case 'CHECKLIST_GET_ONE_FAILURE':
      return { data: {} }
    case 'CHECKLIST_CHANGE_FIELD': {
      const newData = state.data
      newData[action.data.key].find(row => row.name === action.data.name)[action.data.field] = action.data.value
      return { ...state, data: newData }
    }
    case 'CHECKLIST_ADD_TOPIC': {
      const newData = state.data
      newData[action.data.key] = []
      return { ...state, data: newData }
    }
    case 'CHECKLIST_ADD_ROW': {
      const newData = state.data
      newData[action.data.key].push({
        name: action.data.name,
        points: 0,
        textWhenOn: '',
        textWhenOff: ''
      })
      return { ...state, data: newData }
    }
    case 'CHECKLIST_REMOVE_TOPIC': {
      const newData = state.data
      delete newData[action.data.key]
      return { ...state, data: newData }
    }
    case 'CHECKLIST_REMOVE_ROW': {
      const newData = state.data
      const index = newData[action.data.key].indexOf(action.data.name)
      newData.splice(index, 1)
      return { ...state, data: newData }
    }
    case 'CHECKLIST_CAST_POINTS': {
      const newData = state.data
      newData[action.data.key].find(row => row.name === action.data.name).points = Number(newData[action.data.key].find(row => row.name === action.data.name).points)
      return { ...state, data: newData }
    }
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

export const changeField = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_CHANGE_FIELD',
      data
    })
  }
}

export const addTopic = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_ADD_TOPIC',
      data
    })
  }
}

export const addRow = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_ADD_ROW',
      data
    })
  }
}

export const removeTopic = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_REMOVE_TOPIC',
      data
    })
  }
}

export const removeRow = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_REMOVE_ROW',
      data
    })
  }
}

export const castPointsToNumber = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_CAST_POINTS',
      data
    })
  }
}

export default checklistReducer
