import { callController } from '../util/apiConnection'


export const getAllTeacherCourses = () => {
  const route = '/course/teacher'
  const prefix = 'TEACHER_COURSE_GET_ALL_'
  const method = 'post'
  return callController(route, prefix, null, method)
}


export default { getAllTeacherCourses }
