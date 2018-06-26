/**
 * Named users in state. Contains all the users in the labtool database.
 */
const userReducer = (store = [], action) => {
  switch (action.type) {
    case 'USERS_GET_ALL_SUCCESS': {
      const users = action.response
      users.forEach(user => {
        if (user.firsts === null) {
          user.firsts = `username ${user.username}`
        }
      })
      return users
    }
    default:
      return store
  }
}

export default userReducer
