import { callController } from '../util/apiConnection'

/**
 * Gets all the courses a user is teacher on.
 */
export const getAllTeacherCourses = () => {
  const route = '/course/teacher'
  const prefix = 'TEACHER_COURSE_GET_ALL_'
  const method = 'post'
  return callController(route, prefix, null, method)
}

export const createOne = teacherInformation => {
  const route = '/users/teacher/create'
  const prefix = 'TEACHER_CREATE_'
  const method = 'post'
  return callController(route, prefix, teacherInformation, method)
}

export const removeOne = teacherId => {
  const route = '/users/teacher/remove'
  const prefix = 'TEACHER_REMOVE_'
  const method = 'post'
  return callController(route, prefix, teacherId, method)
}

export default { getAllTeacherCourses }
