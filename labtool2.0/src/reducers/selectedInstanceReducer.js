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
  currentCodeReview: Array of code reviews which are visible to students
 * 
 */

const INITIAL_STATE = {}

const selectedInstanceReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'CI_GET_ONE_SUCCESS':
      return action.response
    case 'TEACHER_CREATE_SUCCESS':
      return { ...store, teacherInstances: [...store.teacherInstances, action.response] }
    case 'TEACHER_REMOVE_SUCCESS':
      return { ...store, teacherInstances: store.teacherInstances.filter(teacher => teacher.id !== action.response.id) }
    case 'SI_CHANGE_FIELD':
      return { ...store, [action.data.field]: action.data.value }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS':
      var amountOfCw = action.response.data.reviewNumber
      var newStore
      amountOfCw > store.amountOfCodeReviews ? (newStore = { ...store, amountOfCodeReviews: amountOfCw }) : (newStore = store)
      return newStore
    case 'SET_FINAL_REVIEW':
      return { ...store, finalReview: action.value }
    case 'SET_FINAL_REVIEW_HAS_POINTS':
      return { ...store, finalReviewHasPoints: action.value }
    case 'CI_MODIFY_ONE_SUCCESS':
      return { ...store, ...action.response, currentWeek: Number(action.response.currentWeek || store.currentWeek, 10) }
    default:
      return store
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

export const setFinalReviewHasPoints = value => {
  return async dispatch => {
    dispatch({
      type: 'SET_FINAL_REVIEW_HAS_POINTS',
      value
    })
  }
}

export const changeCourseField = data => {
  return async dispatch => {
    dispatch({
      type: 'SI_CHANGE_FIELD',
      data
    })
  }
}

export default selectedInstanceReducer
