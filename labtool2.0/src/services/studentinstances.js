import { callController } from '../util/apiConnection'

/**
 * Gets all the courses where user is a student.
 */
export const getAllStudentCourses = () => {
  const route = '/course/student'
  const prefix = 'STUDENT_COURSE_GET_ALL_'
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
 *      id: {integer}
 *      projectname: {string}
 *      github: {string}
 * }
 */
export const updateStudentProjectInfo = data => {
  const route = `/studentinstance/update`
  const prefix = 'STUDENT_PROJECT_INFO_UPDATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
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
