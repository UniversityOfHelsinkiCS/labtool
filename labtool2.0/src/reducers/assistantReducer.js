export const addAssistant = (store = [], action) => {
  switch (action.type) {
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS':
      return action.response
    default:
      return store
  }
}

export const addAssistant = (store = [], action) => {
    switch (action.type) {
      case 'GET_ASSISTANT_FOR_STUDENT_SUCCESS':
        return action.response
      default:
        return store
    }
}
