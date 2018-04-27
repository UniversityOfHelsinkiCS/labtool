const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'CP_INFO_SUCCESS':
      return action.response
    default:
      return store
  }
}

export default courseInstancereducer
