/**
 * Named users in state. Contains all the users in the labtool database.
 */

const INITIAL_STATE = []

const userReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'USERS_GET_ALL_SUCCESS': {
      const users = action.response
      users.forEach(user => {
        if (user.firsts === null) {
          user.firsts = `username ${user.username}`
        }
      })
      return users
    }
    case 'USER_UPDATE_ADMIN_SUCCESS': {
      const newUser = action.response
      return store.map(user => (user.id === newUser.id ? newUser : user))
    }
    default:
      return store
  }
}

export default userReducer
