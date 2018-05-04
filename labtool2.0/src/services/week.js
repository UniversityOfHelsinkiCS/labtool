import { callController } from '../util/apiConnection'

/**
 * Creates new week.
 */
export const createOneWeek = data => {
  const route = '/weeks/create'
  const prefix = 'WEEKS_CREATE_ONE'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export default { createOneWeek }
