import { callController } from '../util/apiConnection'

export const getAllStudentCourses = () => {
  const route = '/course/student'
  const prefix = 'STUDENT_COURSE_GET_ALL_'
  const method = 'post'
  return callController(route, prefix, null, method)
}

export const createStudentCourses = (data, ohid) => {
  const route = `/course/register/${ohid}`
  const prefix = 'STUDENT_COURSE_CREATE_ONE_'
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
