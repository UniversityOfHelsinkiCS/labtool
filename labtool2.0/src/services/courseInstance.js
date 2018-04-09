import { callController } from '../util/apiConnection'


export const getAllCI = () => {
  const route = '/courseInstances'
  const prefix = 'CI_GET_ALL_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

export const getOneCI = (id) => {
  const route = `/courses/${id}`
  const prefix = 'CI_GET_ONE_'
  const method = 'get'
  return callController(route, prefix, null, method)
}


export default { getAllCI }
