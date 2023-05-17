import { callController } from '../util/apiConnection'

/**
 * Gets all the courses where user is a student.
 * Used in MyPage when logged in
 */
export const getAllStudentCourses = () => {
  const route = '/course/student'
  const prefix = 'STUDENT_COURSE_GET_ALL_'
  const method = 'post'
  return callController(route, prefix, null, method)
}

/**
 * Gets all courses according to a studentInstance's id
 * @param {*} studentInstanceId is student's uderId
 */
export const getCoursesByStudentId = studentInstanceId => {
  const route = `/courseinstances/${studentInstanceId}`
  const prefix = 'STUDENT_COURSES_GET_ALL_BY_USERID_'
  const method = 'post'
  return callController(route, prefix, null, method)
}

/**
 * Registers user to a course.
 *
 *  data:
 *  {
 *       projectName: {string}
 *       github: {string}
 *       ohid: {string}
 *  }
 *
 * ohid is the courses opetushallitusid
 */
export const createStudentCourses = (data, ohid) => {
  const route = `/course/register/${ohid}`
  const prefix = 'STUDENT_COURSE_CREATE_ONE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * data :
 * {
 *      projectname: {string}
 *      github: {string}
 *      ohid: {string}
 * }
 */
export const updateStudentProjectInfo = data => {
  const route = `/studentinstance/update`
  const prefix = 'STUDENT_PROJECT_INFO_UPDATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * data :
 * {
 *   ohid,
 *   studentInstances: []
 * }
 */
export const massUpdateStudentProjectInfo = data => {
  const route = `/studentinstance/massupdate`
  const prefix = 'STUDENT_PROJECT_INFO_MASS_UPDATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * si:
 * {
 *  id, the id is studentInstance.id
 * }
 */
export const removeStudent = si => {
  const route = '/users/student/remove'
  const prefix = 'STUDENT_REMOVE_'
  const method = 'post'
  return callController(route, prefix, si, method)
}

/* Will probably need something like this to review students

export const getOneSI = (id) => {
  const route = `/students/${id}`
  const prefix = 'SI_GET_ONE_'
  const method = 'get'
  return callController(route, prefix, null, method)
}
*/

export default { getAllStudentCourses }
