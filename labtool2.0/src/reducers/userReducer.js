/**
 * Named users in state. Contains all the users in the labtool database.
 */
const userReducer = (store = [], action) => {
  switch (action.type) {
    case 'USERS_GET_ALL_SUCCESS':
      return action.response
    default:
      return store
  }
}

export default userReducer
