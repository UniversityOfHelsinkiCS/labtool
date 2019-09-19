
import { sortCourses } from '../util/sort'
import { createEuropeanDate, createShorterCourseid } from '../util/format'

const INITIAL_STATE = { canImport: false, importable: null }

const userReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'COURSE_IMPORT_GET_ALLOWED_SUCCESS':
      return { ...store, canImport: action.response.allowed }
    case 'COURSE_IMPORT_GET_COURSES_SUCCESS': {
      const sortedCourses = sortCourses(action.response)
      return { ...store, importable: sortedCourses.map(m => {
        return { ...m, europeanStart: createEuropeanDate(m.starts), europeanEnd: createEuropeanDate(m.ends), shorterId: createShorterCourseid(m.hid) }
      })}
    }
    case 'COURSE_IMPORT_DO_IMPORT_SUCCESS':
      return store
    default:
      return store
  }
}

export default userReducer
