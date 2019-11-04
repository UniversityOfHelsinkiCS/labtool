import { callController } from '../util/apiConnection'

/**
 * Get all the existing users in labtool application
 * This is needed, so that the teacher can add required assistance teachers to the course
 * by selecting the desired ones from all the users who are listed
 */

export const getAllUsers = () => {
  const route = '/users'
  const prefix = 'USERS_GET_ALL_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

export const updateOtherUser = content => {
  const route = '/users/updateAdmin'
  const prefix = 'USER_UPDATE_ADMIN_'
  const method = 'put'
  return callController(route, prefix, content, method)
}

export default { getAllUsers, updateOtherUser }
