import { callController } from '../util/apiConnection'

export const createChecklist = data => {
  const route = `/checklist/create`
  const prefix = 'CHECKLIST_CREATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}
