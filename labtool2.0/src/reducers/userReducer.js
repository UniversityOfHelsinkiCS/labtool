const userReducer = (store = [], action) => {
  switch (action.type) {
    case 'GET_ALL_USERS_SUCCESS':
      return action.response
    default:
      return store
  }
}

export default userReducer
