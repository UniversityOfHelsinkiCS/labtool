/**
 * Named "user" in state. 
 * Has all the information regarding to a user who is logged in.
 * 
 * user: json which has the following fields: 
 *    id(pin): -- integer, database id
      email(pin): -- string, email of the user
      firsts(pin): -- users first names
      lastname(pin): -- users lastname
      studentNumber(pin): -- users studentnumber
      username(pin): -- users ad credentials
  
  token: users token
  created: did the user exist in database before logging in?
 * 
 */
const INITIAL_STATE = {}

const loginReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return action.response
    case 'LOGIN_FAILURE':
      return INITIAL_STATE
    case 'LOGIN_BYTOKEN':
      return action.user
    case 'LOGOUT_SUCCESS':
      window.localStorage.removeItem('fake-shibbo-data')
      window.location.href = action.response.logoutUrl
      return INITIAL_STATE
    case 'USER_UPDATE_SUCCESS':
      return { ...state, user: { ...state.user, email: action.response.email } }
    case 'USER_UPDATE_ADMIN_SUCCESS':
      if (action.response.id === state.user.id) {
        return { ...state, user: action.response }
      }
      return state
    default:
      return state
  }
}

export const tokenLogin = user => {
  return async dispatch => {
    dispatch({
      type: 'LOGIN_BYTOKEN',
      user
    })
  }
}

export default loginReducer
