import { callController } from '../util/apiConnection'


export const createWeek = (data) => {
  const route = '/theroute '
  const prefix = 'WEEK_CREATE_ONE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/* export const getWeek = () => {
  const route = '/theroute '
  const prefix = 'WEEK_GET_ONE_'
  const method = 'get'
  return callController(route, prefix, null, method)
} */


export default { createWeek }
