import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'STUDENT_COURSE_GET_ALL_SUCCESS':
      return action.response
    case 'STUDENT_COURSE_CREATE_ONE_SUCCESS':  
      return store
    default:
      return store
  }
}

export default courseInstancereducer

