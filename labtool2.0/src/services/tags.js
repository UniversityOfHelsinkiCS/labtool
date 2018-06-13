import { callController } from '../util/apiConnection'

/**
 * Creates a new tag
 */
export const createTag = () => {
  const route = '/tags/create'
  const prefix = 'TAG_CREATE_'
  const method = 'post'
  return callController(route, prefix, null, method)
}

/**
 * Gets all tags in the system
 */
export const getAllTags = () => {
  const route = '/tags/list'
  const prefix = 'TAGS_GET_ALL_'
  const method = 'post'
  return callController(route, prefix, null, method)
}

export default { createTag }
