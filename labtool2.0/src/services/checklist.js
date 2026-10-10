import { callController } from '../util/apiConnection'

export const createChecklist = data => {
  const route = `/checklist/create`
  const prefix = 'CHECKLIST_CREATE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export const getOneChecklist = data => {
  const route = `/checklist/getone`
  const prefix = 'CHECKLIST_GET_ONE_'
  const method = 'post'
  return callController(route, prefix, data, method)
}

export const getCopyableChecklists = () => {
  const route = `/checklist/copyable`
  const prefix = 'CHECKLIST_GET_COPYABLE_'
  const method = 'get'
  return callController(route, prefix, null, method)
}
