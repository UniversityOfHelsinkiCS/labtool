/**
 * Named checklist in store.
 *
 * string: string representation of data.list
 * data: object representing a checklist received from backend.
 */

const INITIAL_STATE = {
  data: {},
  maxPoints: ''
}

const swapIndex = (arr, a, b) => {
  // we don't need no semicolons
  // eslint-disable-next-line
  [arr[a], arr[b]] = [arr[b], arr[a]]
}

const constructObjectFromEntries = kv => {
  const obj = {}
  kv.forEach(([k, v]) => (obj[k] = v))
  return obj
}

const reorderProperties = (obj, keys) => (Object.fromEntries || constructObjectFromEntries)(keys.map(x => [x, obj[x]]))

const checklistReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return {}
    case 'CHECKLIST_GET_ONE_SUCCESS':
      return { data: action.response.list, maxPoints: action.response.maxPoints || '' }
    case 'CHECKLIST_GET_ONE_FAILURE':
      return { data: {}, maxPoints: '' }
    case 'CHECKLIST_CHANGE_FIELD': {
      const newData = state.data
      newData[action.data.key].find(row => row.name === action.data.name)[action.data.field] = action.data.value
      return { ...state, data: newData }
    }
    case 'CHECKLIST_APPLY_PREREQUISITE_TO_CHECKS_IN_CATEGORY': {
      const newData = state.data
      const { category, prerequisite } = action
      newData[category] = newData[category].map(row => ({ ...row, prerequisite: row.id === prerequisite || row.tempId === prerequisite ? null : prerequisite }))
      return { ...state, data: newData }
    }
    case 'CHECKLIST_ADD_TOPIC': {
      const newData = state.data
      newData[action.data.key] = []
      return { ...state, data: newData }
    }
    case 'CHECKLIST_ADD_ROW': {
      const newData = state.data
      const nextTempId = 1 + Math.max(...Object.keys(newData).map(key => Math.max(...newData[key].filter(item => item.id || item.tempId).map(item => item.id || item.tempId))))
      newData[action.data.key].push({
        name: action.data.name,
        tempId: nextTempId,
        checkedPoints: 0,
        uncheckedPoints: 0,
        textWhenOn: '',
        textWhenOff: '',
        prerequisite: action.data.prerequisite
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
      const index = newData[action.data.key].map(row => row.name).indexOf(action.data.name)
      newData[action.data.key].splice(index, 1)
      return { ...state, data: newData }
    }
    case 'CHECKLIST_MOVE_TOPIC_UP': {
      const newOrder = Object.keys(state.data)
      const oldIndex = newOrder.indexOf(action.data.key)
      if (oldIndex > 0) {
        swapIndex(newOrder, oldIndex, oldIndex - 1)
      }
      return { ...state, data: reorderProperties(state.data, newOrder) }
    }
    case 'CHECKLIST_MOVE_TOPIC_DOWN': {
      const newOrder = Object.keys(state.data)
      const oldIndex = newOrder.indexOf(action.data.key)
      if (oldIndex < newOrder.length - 1) {
        swapIndex(newOrder, oldIndex, oldIndex + 1)
      }
      return { ...state, data: reorderProperties(state.data, newOrder) }
    }
    case 'CHECKLIST_MOVE_ROW_UP': {
      const newData = state.data
      const index = newData[action.data.key].map(row => row.name).indexOf(action.data.name)
      const newArray = [...newData[action.data.key]]
      if (index > 0) {
        swapIndex(newArray, index, index - 1)
      }
      newData[action.data.key] = newArray
      return { ...state, data: newData }
    }
    case 'CHECKLIST_MOVE_ROW_DOWN': {
      const newData = state.data
      const index = newData[action.data.key].map(row => row.name).indexOf(action.data.name)
      const newArray = [...newData[action.data.key]]
      if (index < newArray.length - 1) {
        swapIndex(newArray, index, index + 1)
      }
      newData[action.data.key] = newArray
      return { ...state, data: newData }
    }
    case 'CHECKLIST_CAST_POINTS': {
      const newData = state.data
      newData[action.data.key].find(row => row.name === action.data.name).checkedPoints = Number(newData[action.data.key].find(row => row.name === action.data.name).checkedPoints)
      newData[action.data.key].find(row => row.name === action.data.name).uncheckedPoints = Number(newData[action.data.key].find(row => row.name === action.data.name).uncheckedPoints)
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

export const restoreChecklist = (data, maxPoints) => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_GET_ONE_SUCCESS',
      response: {
        list: data,
        maxPoints: maxPoints
      }
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

export const addRow = (data, prerequisite) => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_ADD_ROW',
      data,
      prerequisite
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

export const moveTopicUp = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_MOVE_TOPIC_UP',
      data
    })
  }
}

export const moveTopicDown = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_MOVE_TOPIC_DOWN',
      data
    })
  }
}

export const moveRowUp = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_MOVE_ROW_UP',
      data
    })
  }
}

export const moveRowDown = data => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_MOVE_ROW_DOWN',
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

export const applyCategoryPrerequisite = (category, prerequisite) => {
  return async dispatch => {
    dispatch({
      type: 'CHECKLIST_APPLY_PREREQUISITE_TO_CHECKS_IN_CATEGORY',
      category,
      prerequisite
    })
  }
}

export default checklistReducer
