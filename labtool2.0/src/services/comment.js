import { callController } from '../util/apiConnection'

export const createOneComment = data => {
  const route = '/comment'
  const prefix = 'COMMENT_CREATE_ONE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export default { createOneComment }
