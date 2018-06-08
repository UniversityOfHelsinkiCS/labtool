import { callController } from '../util/apiConnection'

/**
 * Insert codereview for studentinstances
 * The data comes in the following form
 * {reviewNumber: the round of code review,
 * codeReviews: [
 *      {reviewer: student id, toReview: student id}
 * ]
 */

export const bulkinsertCodeReviews = data => {
  const route = `/codereviews/bulkinsert`
  const prefix = 'CODE_REVIEW_BULKINSERT_'
  const method = 'put'
  return callController(route, prefix, data, method)
}
