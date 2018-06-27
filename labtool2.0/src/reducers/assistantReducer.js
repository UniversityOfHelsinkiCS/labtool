export const addAssistantReducer = (store = [], action) => {
  switch (action.type) {
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS':
      return action.response
    default:
      return store
  }
}

export default addAssistantReducer
