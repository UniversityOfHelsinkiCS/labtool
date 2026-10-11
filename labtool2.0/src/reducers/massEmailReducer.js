/**
 * Result of the last mass email (issue #1141).
 *
 * done: the email was sent to at least one recipient
 * notDelivered: [{ name, email, studentInstanceId, reason }] recipients who did not get it
 */

const INITIAL_STATE = { done: false, notDelivered: [] }

const notDeliveredIn = response =>
  response && Array.isArray(response.notDelivered) ? response.notDelivered : []

const massEmailReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'MASS_EMAIL_SENDATTEMPT':
    case 'MASS_EMAIL_RESET':
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'MASS_EMAIL_SENDSUCCESS':
      return { done: true, notDelivered: notDeliveredIn(action.response) }
    case 'MASS_EMAIL_SENDFAILURE': {
      const data = action.response && action.response.response && action.response.response.data
      return { done: false, notDelivered: notDeliveredIn(data) }
    }
    default:
      return state
  }
}

export const resetMassEmail = () => {
  return async dispatch => {
    dispatch({ type: 'MASS_EMAIL_RESET' })
  }
}

export default massEmailReducer
