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

// all checklists of another course onto a course that has none yet
export const copyAllChecklists = (copyFrom, copyTo) => {
  const route = `/checklist/copyall`
  const prefix = 'CHECKLIST_COPY_ALL_'
  const method = 'post'
  return callController(route, prefix, { copyFrom, copyTo }, method)
}

export const getCopyableChecklists = () => {
  const route = `/checklist/copyable`
  const prefix = 'CHECKLIST_GET_COPYABLE_'
  const method = 'get'
  return callController(route, prefix, null, method)
}
