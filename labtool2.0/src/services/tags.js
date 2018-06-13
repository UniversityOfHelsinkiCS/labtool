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
