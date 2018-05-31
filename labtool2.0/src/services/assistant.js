import { callController } from '../util/apiConnection'

export const associateTeacherToStudent = data => {
  const send = {
    course: data
  }
  const route = `/course/assistant/create`
  const prefix = 'ASSOCIATE_TEACHER_AND_STUDENT_'
  const method = 'post'
  return callController(route, prefix, send, method)
}

export const getStudentsAssistant = id => {
  const route = `/course/assistant/student/${id}`
  const prefix = 'GET_ASSISTANT_FOR_STUDENT_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

export default { associateTeacherToStudent }
