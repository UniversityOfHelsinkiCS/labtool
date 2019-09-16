import { callController } from '../util/apiConnection'

/**
 * Creates new week.
 */
export const createOneWeek = data => {
  const route = '/weeks/create'
  const prefix = 'WEEKS_CREATE_ONE'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * Gets a review draft for a week.
 */
export const getWeekDraft = data => {
  const route = '/weeks/getDraft'
  const prefix = 'WEEKDRAFTS_GET_ONE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

/**
 * Saves a review draft for a week.
 */
export const saveWeekDraft = data => {
  const route = '/weeks/saveDraft'
  const prefix = 'WEEKDRAFTS_CREATE_ONE'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export default { createOneWeek, getWeekDraft, saveWeekDraft }
