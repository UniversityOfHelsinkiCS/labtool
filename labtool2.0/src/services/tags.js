import { callController } from '../util/apiConnection'

/**
 * Creates or modifies a tag
 * data: {
 *   text
 *   newText (optional)
 *   color
 * }
 */
export const createTag = data => {
  const route = '/tags/create'
  const prefix = 'TAG_CREATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * Removes a tag from the system
 * data: {
 *   text
 * }
 */
export const removeTag = data => {
  const route = '/tags/remove'
  const prefix = 'TAG_REMOVE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * Gets all tags in the system
 */
export const getAllTags = () => {
  const route = '/tags/list'
  const prefix = 'TAGS_GET_ALL_'
  const method = 'get'
  return callController(route, prefix, null, method)
}

/** Tags a student
 * data: {
 *  studentId
 *  tagId
 * }
 */
export const tagStudent = data => {
  const route = '/tags/tagStudent'
  const prefix = 'TAG_STUDENT_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/** Un-tags a student
 * data: {
 *  studentId
 *  tagId
 * }
 */
export const unTagStudent = data => {
  const route = '/tags/untagStudent'
  const prefix = 'UNTAG_STUDENT_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export default { createTag }
