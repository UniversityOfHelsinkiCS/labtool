import { callController } from '../util/apiConnection'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/api'


export const getAllTeacherCourses = () => {
  const route = baseUrl + '/course/teacher'
  const prefix = 'TEACHER_COURSE_GET_ALL_'
  const method = 'post'
  return callController(route, prefix, null, method)
}


export default { getAllTeacherCourses }
