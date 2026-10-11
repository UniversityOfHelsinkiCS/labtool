/**
 * Checklists the user can copy from: [{ courseInstanceId, week, forCodeReview }]
 * for the non-empty checklists on the courses the user is on.
 */

const copyableChecklistReducer = (state = [], action) => {
  switch (action.type) {
    case 'CHECKLIST_GET_COPYABLE_SUCCESS':
      return Array.isArray(action.response) ? action.response : []
    case 'CHECKLIST_COPY_ALL_SUCCESS':
      return [...state, ...((action.response && action.response.checklists) || [])]
    case 'LOGOUT_SUCCESS':
      return []
    default:
      return state
  }
}

export default copyableChecklistReducer
