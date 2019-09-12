import { callController } from '../util/apiConnection'

/**
 * Send email notification about a comment or week review.
 *
 * data:
 * {
 *   commentId or weekId: {number}
 *   role: {string}
 * }
 */
export const sendEmail = data => {
  const route = `/email/send`
  const prefix = 'SEND_EMAIL_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * Send mass email message to students.
 *
 * data:
 * {
 *   students: [
 *     {id: student id}
 *   ],
 *   content: {string}
 * }
 */
export const sendMassEmail = (data, id) => {
  const route = `/email/sendmass/${id}`
  const prefix = 'MASS_EMAIL_SEND'
  const method = 'post'
  return callController(route, prefix, data, method)
}
