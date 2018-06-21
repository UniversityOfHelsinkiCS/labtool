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
