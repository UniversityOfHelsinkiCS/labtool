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
  ;[arr[a], arr[b]] = [arr[b], arr[a]]
}

const constructObjectFromEntries = kv => {
  const obj = {}
  kv.forEach(([k, v]) => (obj[k] = v))
  return obj
}

const reorderProperties = (obj, keys) =>
  (Object.fromEntries || constructObjectFromEntries)(keys.map(x => [x, obj[x]]))

// Returns a copy of data where the first row named `name` in category `key` is replaced by update(row).
const updateRow = (data, key, name, update) => {
  const index = data[key].findIndex(row => row.name === name)
  if (index === -1) {
    return data
  }
  return { ...data, [key]: data[key].map((row, i) => (i === index ? update(row) : row)) }
}

// Returns a copy of data where the row named `name` in category `key` is moved by `offset` (-1 or 1).
const moveRow = (data, key, name, offset) => {
  const rows = [...data[key]]
  const index = rows.findIndex(row => row.name === name)
  const target = index + offset
  if (index === -1 || target < 0 || target >= rows.length) {
    return data
  }
  swapIndex(rows, index, target)
  return { ...data, [key]: rows }
}

// The next temporary id for a new row: one more than the largest id or tempId in use, starting from 1.
const nextTempId = data => {
  const ids = Object.values(data)
    .flat()
    .map(row => row.id || row.tempId)
    .filter(id => Number.isFinite(id))
  return ids.length ? Math.max(...ids) + 1 : 1
}

const checklistReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return {}
    case 'CHECKLIST_GET_ONE_SUCCESS':
      return { data: action.response.list, maxPoints: action.response.maxPoints || '' }
    case 'CHECKLIST_GET_ONE_FAILURE':
      return { data: {}, maxPoints: '' }
    case 'CHECKLIST_CHANGE_FIELD': {
      const { key, name, field, value } = action.data
      return { ...state, data: updateRow(state.data, key, name, row => ({ ...row, [field]: value })) }
    }
    case 'CHECKLIST_APPLY_PREREQUISITE_TO_CHECKS_IN_CATEGORY': {
      const { category, prerequisite } = action
      const rows = state.data[category].map(row => ({
        ...row,
        prerequisite: row.id === prerequisite || row.tempId === prerequisite ? null : prerequisite
      }))
      return { ...state, data: { ...state.data, [category]: rows } }
    }
    case 'CHECKLIST_ADD_TOPIC':
      return { ...state, data: { ...state.data, [action.data.key]: [] } }
    case 'CHECKLIST_ADD_ROW': {
      const newRow = {
        name: action.data.name,
        tempId: nextTempId(state.data),
        checkedPoints: 0,
        uncheckedPoints: 0,
        textWhenOn: '',
        textWhenOff: '',
        prerequisite: action.data.prerequisite
      }
      const { key } = action.data
      return { ...state, data: { ...state.data, [key]: [...state.data[key], newRow] } }
    }
    case 'CHECKLIST_REMOVE_TOPIC': {
      const { [action.data.key]: removed, ...data } = state.data // eslint-disable-line no-unused-vars
      return { ...state, data }
    }
    case 'CHECKLIST_REMOVE_ROW': {
      const { key, name } = action.data
      const index = state.data[key].findIndex(row => row.name === name)
      if (index === -1) {
        return state
      }
      return { ...state, data: { ...state.data, [key]: state.data[key].filter((_, i) => i !== index) } }
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
    case 'CHECKLIST_MOVE_ROW_UP':
      return { ...state, data: moveRow(state.data, action.data.key, action.data.name, -1) }
    case 'CHECKLIST_MOVE_ROW_DOWN':
      return { ...state, data: moveRow(state.data, action.data.key, action.data.name, 1) }
    case 'CHECKLIST_CAST_POINTS': {
      const { key, name } = action.data
      const data = updateRow(state.data, key, name, row => ({
        ...row,
        checkedPoints: Number(row.checkedPoints),
        uncheckedPoints: Number(row.uncheckedPoints)
      }))
      return { ...state, data }
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
