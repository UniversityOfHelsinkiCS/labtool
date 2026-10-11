import { callController } from '../util/apiConnection'

export const createOneComment = data => {
  const route = '/comment'
  const prefix = 'COMMENT_CREATE_ONE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

// the author edits the text of their comment (#534); data: { id, comment }
export const editComment = data => {
  const route = `/comment/${data.id}`
  const prefix = 'COMMENT_EDIT_ONE_'
  const method = 'put'
  return callController(route, prefix, { comment: data.comment }, method)
}

export const markCommentsAsRead = data => {
  const route = '/comments/update'
  const prefix = 'MARK_COMMENTS_AS_READ_'
  const method = 'put'
  return callController(route, prefix, data, method)
}

export default { createOneComment }
