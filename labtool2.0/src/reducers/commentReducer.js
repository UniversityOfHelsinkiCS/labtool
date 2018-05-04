const commentReducer = (store = [], action) => {
    switch (action.type) {
      case 'COMMENT_CREATE_ONE_SUCCESS':
        return action.response
      default:
        return store
    }
  }
  
  export default commentReducer