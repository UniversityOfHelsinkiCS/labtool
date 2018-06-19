/**
 * Reducer for a single course instance.
 * 
  id(pin):  -- database id of the course
  name(pin): "Tietokantasovellus (periodi IV)" -- String, Name of the course
  start(pin):  -- Date, start date of the course
  end(pin):   -- date, end date of the course
  active(pin):  -- boolean, is the course active or not.
  weekAmount(pin): -- integer, how many weeks does the course have
  weekMaxPoints(pin): -- double, how many points does week have
  currentWeek(pin): -- integer, what is the current week
  ohid(pin): -- Opetushallitus id of the course, is often used instead of the database id
  teacherInstances: all the teacherinstances related to his course instance
  amountOfCodeReviews: the amount of code reviews on this course
  codeReviewActive: if the code reviews are active
  currentCodeReview: array that contains all the current code reviews
  * 
 */
const selectedInstanceReducer = (store = [], action) => {
  switch (action.type) {
    case 'CI_GET_ONE_SUCCESS':
      return action.response
    case 'TEACHER_CREATE_SUCCESS':
      return { ...store, teacherInstances: [...store.teacherInstances, action.response] }
    case 'TEACHER_REMOVE_SUCCESS':
      return { ...store, teacherInstances: store.teacherInstances.filter(teacher => teacher.id !== action.response.id) }
    case 'SET_ACTIVE':
      return { ...store, active: action.active }
    case 'SET_FINAL_REVIEW':
      return { ...store, finalReview: action.value }
    case 'CI_GET_ONE_ATTEMPT':
      return []
    case 'CP_INFO_ATTEMPT':
      return []
    case 'CODE_REVIEW_BULKINSERT_SUCCESS':
      var amountOfCw = action.response.data.reviewNumber
      var newStore
      amountOfCw > store.amountOfCodeReviews ? (newStore = { ...store, amountOfCodeReviews: amountOfCw }) : (newStore = store)
      return newStore
    default:
      return store
  }
}

export const setActive = active => {
  return async dispatch => {
    dispatch({
      type: 'SET_ACTIVE',
      active
    })
  }
}

export const setFinalReview = value => {
  return async dispatch => {
    dispatch({
      type: 'SET_FINAL_REVIEW',
      value
    })
  }
}

export default selectedInstanceReducer
