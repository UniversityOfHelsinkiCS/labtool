/**
 * Change history of the student whose page is open (#1129, #1132):
 * [{ id, kind, number, changes, createdAt, by }], newest first.
 */

const INITIAL_STATE = { entries: [] }

const changeLogReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'CHANGELOG_GET_ATTEMPT':
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'CHANGELOG_GET_SUCCESS':
      return { entries: Array.isArray(action.response) ? action.response : [] }
    default:
      return state
  }
}

export default changeLogReducer
