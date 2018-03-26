
import { callController } from '../util/apiConnection'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/api'

export const login = (loginInformation) => {
  const route = baseUrl + '/login'
  const prefix = 'LOGIN_'
  const method = 'post'
  return callController(route, prefix, loginInformation, method)
}

export const updateUser = (content) => {
  const route = baseUrl + '/users/update'
  const prefix = 'USER_UPDATE_'
  const method = 'put'
  return callController(route, prefix, content, method)
}

export default { login }