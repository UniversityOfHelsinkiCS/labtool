const coursePageReducer = (store = {}, action) => {
  switch (action.type) {
    case 'COURSE_PAGE_GET_ALL_SUCCESS':
      return action.response
/*     case 'COURSE_PAGE_GET_ONE':
      return store.StudentInstances.weeks.find(n => n.id === action.response.week) ??? */ 
    default:
      return store
  }
}

export default coursePageReducer

