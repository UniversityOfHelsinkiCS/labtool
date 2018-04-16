import { callController } from '../util/apiConnection'


export const createOneWeek = () => {
  const route = '/weeks/create'
  const prefix = 'WEEKS_CREATE_ONE'
  const method = 'post'
  return callController(route, prefix, null, method)
}

export default { createOneWeek }
