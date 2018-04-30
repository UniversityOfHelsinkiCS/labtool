import { callController } from '../util/apiConnection'

export const login = loginInformation => {
  const route = '/login'
  const prefix = 'LOGIN_'
  const method = 'post'
  return callController(route, prefix, loginInformation, method)
}

export const updateUser = content => {
  const route = '/users/update'
  const prefix = 'USER_UPDATE_'
  const method = 'put'
  return callController(route, prefix, content, method)
}

export default { login }
