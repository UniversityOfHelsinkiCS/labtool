
import axios from 'axios'
import { callController } from '../util/apiConnection'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/login'

export const login = (loginInformation) => {
  const route = baseUrl
  const prefix = 'LOGIN_'
  const method = 'post'
  return callController(route, prefix, loginInformation, method)
}

export default { login }