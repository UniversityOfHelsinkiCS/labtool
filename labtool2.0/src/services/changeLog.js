import { callController } from '../util/apiConnection'

/**
 * Change history of a student's grading and repository link (#1129, #1132)
 */
export const getChangeLog = studentInstanceId => {
  const route = `/changelog/${studentInstanceId}`
  const prefix = 'CHANGELOG_GET_'
  const method = 'get'
  return callController(route, prefix, null, method)
}
