import deepFreeze from 'deep-freeze'
import copyableChecklistReducer from '../reducers/copyableChecklistReducer'

describe('copyableChecklistReducer', () => {
  const checklists = [{ courseInstanceId: 1, week: 2, forCodeReview: false }]

  it('starts empty', () => {
    expect(copyableChecklistReducer(undefined, { type: '@@INIT' })).toEqual([])
  })

  it('stores the copyable checklists from the backend', () => {
    const state = []
    deepFreeze(state)
    expect(
      copyableChecklistReducer(state, { type: 'CHECKLIST_GET_COPYABLE_SUCCESS', response: checklists })
    ).toEqual(checklists)
  })

  it('ignores a response that is not a list', () => {
    expect(
      copyableChecklistReducer(checklists, { type: 'CHECKLIST_GET_COPYABLE_SUCCESS', response: 'oops' })
    ).toEqual([])
  })

  it('is cleared on logout', () => {
    const state = [...checklists]
    deepFreeze(state)
    expect(copyableChecklistReducer(state, { type: 'LOGOUT_SUCCESS' })).toEqual([])
  })

  it('ignores other actions', () => {
    const state = [...checklists]
    deepFreeze(state)
    expect(copyableChecklistReducer(state, { type: 'CHECKLIST_GET_ONE_SUCCESS', response: {} })).toBe(state)
  })
})
