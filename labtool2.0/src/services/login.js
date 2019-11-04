import { callController } from '../util/apiConnection'

/**
 * Logs the user in
 * Uses Json:
 * {
 *  username: {string}
 *  password: {string}
 * }
 */
export const login = loginInformation => {
  const route = '/login'
  const prefix = 'LOGIN_'
  const method = 'post'
  return callController(route, prefix, loginInformation, method)
}

/**
 * Does fake Shibboleth login
 */
export const fakeShibboLogin = loginInformation => {
  const route = '/loginFake'
  const prefix = 'LOGIN_'
  const method = 'post'
  return callController(route, prefix, { __HEADERS: loginInformation }, method)
}

/**
 * Currently only used to modify the users email.
 * Uses Json:
 * {
 *   email: {string}
 * }
 */
export const updateSelf = content => {
  const route = '/users/update'
  const prefix = 'USER_UPDATE_'
  const method = 'put'
  return callController(route, prefix, content, method)
}

export const logout = () => {
  const route = '/logout'
  const prefix = 'LOGOUT_'
  const method = 'post'
  return callController(route, prefix, { returnUrl: window.location.href }, method)
}

export default { login, updateSelf }
