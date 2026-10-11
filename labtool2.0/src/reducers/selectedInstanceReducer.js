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

const text = value => (value === null || value === undefined ? '' : String(value))

/**
 * The settings edited on the course settings page, normalised for comparison (inputs give strings).
 * savedSettings keeps them as last loaded from or saved to the server, so the page knows when there
 * are unsaved changes.
 */
export const courseSettings = course => ({
  weekAmount: text(course.weekAmount),
  weekMaxPoints: text(course.weekMaxPoints),
  currentWeek: text(course.currentWeek),
  active: Boolean(course.active) && String(course.active) !== 'false',
  finalReview: Boolean(course.finalReview),
  finalReviewHasPoints: Boolean(course.finalReviewHasPoints),
  finalReviewVisible: Boolean(course.finalReviewVisible),
  coursesPage: text(course.coursesPage).trim(),
  courseMaterial: text(course.courseMaterial).trim(),
  currentCodeReview: [...(course.currentCodeReview || [])].map(Number).sort((a, b) => a - b)
})

export const hasUnsavedSettings = (course, visibleCodeReviews) =>
  Boolean(course.savedSettings) &&
  JSON.stringify(courseSettings({ ...course, currentCodeReview: visibleCodeReviews })) !==
    JSON.stringify(course.savedSettings)

const selectedInstanceReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'CI_GET_ONE_SUCCESS':
      return { ...action.response, savedSettings: courseSettings(action.response) }
    case 'TEACHER_CREATE_SUCCESS':
      return { ...store, teacherInstances: [...store.teacherInstances, action.response] }
    case 'TEACHER_REMOVE_SUCCESS':
      return {
        ...store,
        teacherInstances: store.teacherInstances.filter(teacher => teacher.id !== action.response.id)
      }
    case 'SI_CHANGE_FIELD':
      return { ...store, [action.data.field]: action.data.value }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS':
      var amountOfCw = action.response.data.reviewNumber
      var newStore
      amountOfCw > store.amountOfCodeReviews
        ? (newStore = { ...store, amountOfCodeReviews: amountOfCw })
        : (newStore = store)
      return newStore
    case 'SET_FINAL_REVIEW':
      return { ...store, finalReview: action.value }
    case 'SET_FINAL_REVIEW_HAS_POINTS':
      return { ...store, finalReviewHasPoints: action.value }
    case 'SET_FINAL_REVIEW_VISIBLE':
      return { ...store, finalReviewVisible: action.value }
    case 'CI_MODIFY_ONE_SUCCESS': {
      const saved = {
        ...store,
        ...action.response,
        currentWeek: Number(action.response.currentWeek || store.currentWeek, 10)
      }
      return { ...saved, savedSettings: courseSettings(saved) }
    }
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

// whether students see their final review results
export const setFinalReviewVisible = value => {
  return async dispatch => {
    dispatch({
      type: 'SET_FINAL_REVIEW_VISIBLE',
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
