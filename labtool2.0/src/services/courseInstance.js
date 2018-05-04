import { callController } from '../util/apiConnection'

/**
 * Gets all course instances
 */
export const getAllCI = () => {
  const route = '/courseInstances'
  const prefix = 'CI_GET_ALL_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

/**
 * Gets a single course instance
 * With course instance id as param.
 */
export const getOneCI = id => {
  const route = `/courses/${id}`
  const prefix = 'CI_GET_ONE_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

/**
 * modifies a single course instance, with json data
 * indicating the changes.
 *
 * {
 *       weekAmount: {Integer}
 *       weekMaxPoints: {Double}
 *       currentWeek: {Integer}
 *       active: {Boolean}
 *       ohid: {String}
 * }
 *
 */
export const modifyOneCI = (data, id) => {
  const route = `/courseinstances/${id}`
  const prefix = 'CI_MODIFY_ONE_'
  const method = 'put'
  return callController(route, prefix, data, method)
}

/**
 * Gets a huge load of information to the store
 * regarding the page of a single course.
 * See the coursePageReducer for details
 * Takes the course id as param.
 */
export const coursePageInformation = data => {
  const send = {
    course: data
  }
  const route = `/courseinstances/coursepage`
  const prefix = 'CP_INFO_'
  const method = 'post'
  return callController(route, prefix, send, method)
}

export default { getAllCI }
