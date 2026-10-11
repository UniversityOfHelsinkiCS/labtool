import { callController } from '../util/apiConnection'

/**
 * Adds a review note to a student's final review (instructors only, never shown to students).
 * data: { studentInstanceId, weekNumber, text }
 */
export const createReviewNote = data => {
  const route = '/reviewnotes'
  const prefix = 'REVIEW_NOTE_CREATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export default { createReviewNote }
