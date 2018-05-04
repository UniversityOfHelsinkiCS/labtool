const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'CI_GET_ALL_SUCCESS':
      return action.response
    case 'CI_MODIFY_ONE_SUCCESS':
      return store
    default:
      return store
  }
}

export default courseInstancereducer