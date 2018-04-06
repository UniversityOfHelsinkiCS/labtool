import { callController } from '../util/apiConnection'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/api'


export const getAllCI = () => {
  const route = baseUrl + '/courseInstances'
  const prefix = 'CI_GET_ALL_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

export const getOneCI = (id) => {
  const route = baseUrl + `/courses/${id}`
  const prefix = 'CI_GET_ONE_'
  const method = 'get'
  return callController(route, prefix, null, method)
}


export default { getAllCI }
