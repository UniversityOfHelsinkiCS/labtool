const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'TEACHER_COURSE_GET_ALL_SUCCESS':
      return action.response
    default:
      return store
  }
}

export default courseInstancereducer
