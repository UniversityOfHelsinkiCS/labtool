import { callController } from '../util/apiConnection'

export const bulkinsertCodeReviews = data => {
  console.log(data)
  const route = `/codereviews/bulkinsert`
  const prefix = 'CODE_REVIEW_BULKINSERT_'
  const method = 'put'
  return callController(route, prefix, data, method)
}
