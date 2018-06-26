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

export const gradeCodeReview = data => {
  const route = `/codereviews/grade`
  const prefix = `CODE_REVIEW_GRADE_`
  const method = 'put'
  return callController(route, prefix, data, method)
}

export const addLinkToCodeReview = data => {
  const route = `/codereviews/link`
  const prefix = `CODE_REVIEW_ADD_LINK_`
  const method = 'put'
  return callController(route, prefix, data, method)
}
