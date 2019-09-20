import { callController } from '../util/apiConnection'

export const getIsAllowedToImport = () => {
  const route = '/courseimport/allowed'
  const prefix = 'COURSE_IMPORT_GET_ALLOWED_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

export const getImportableCourses = () => {
  const route = '/courseimport/get'
  const prefix = 'COURSE_IMPORT_GET_COURSES_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

export const importCourses = data => {
  const route = '/courseimport/import'
  const prefix = 'COURSE_IMPORT_DO_IMPORT_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export default { getIsAllowedToImport, getImportableCourses, importCourses }
