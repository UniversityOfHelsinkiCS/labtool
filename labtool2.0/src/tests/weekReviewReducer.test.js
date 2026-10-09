import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import reducer, * as actions from '../reducers/weekReviewReducer'

const initial = () => reducer(undefined, { type: '@@INIT' })

const dispatched = async thunk => {
  const dispatch = vi.fn()
  await thunk(dispatch)
  return dispatch.mock.calls[0][0]
}

// checklist item 2 requires item 1, item 3 requires item 2
const prerequisites = { 1: null, 2: 1, 3: 2 }

const data = [
  {
    id: 10,
    weeks: [{ weekNumber: 1, checks: { 1: true, 2: true, 3: false } }],
    codeReviews: [{ reviewNumber: 1, checks: { 1: false } }]
  }
]

const withData = (extra = {}) => {
  const state = { ...initial(), data, ...extra }
  deepFreeze(state)
  return state
}

describe('weekReviewReducer', () => {
  it('has the expected initial state', () => {
    expect(initial()).toEqual({
      checks: null,
      data: {},
      draftData: {},
      draftCreatedAt: null,
      allowDraftLoad: true
    })
  })

  it('CP_INFO_SUCCESS stores the course page data', () => {
    const state = initial()
    deepFreeze(state)
    expect(reducer(state, { type: 'CP_INFO_SUCCESS', response: { role: 'teacher', data } }).data).toBe(data)
  })

  it.each(['LOGOUT_SUCCESS', 'WEEK_REVIEW_RESET'])('%s resets', type => {
    expect(reducer(withData({ checks: { 1: true } }), { type })).toEqual(initial())
  })

  it('resetChecklist dispatches WEEK_REVIEW_RESET', async () => {
    expect(await dispatched(actions.resetChecklist())).toEqual({ type: 'WEEK_REVIEW_RESET' })
  })

  describe('toggleCheckWeek', () => {
    it('starts from the checks saved on the week', async () => {
      const newState = reducer(
        withData(),
        await dispatched(actions.toggleCheckWeek(3, '10', '1', prerequisites))
      )
      expect(newState.checks).toEqual({ 1: true, 2: true, 3: true })
    })

    it('unchecks items whose prerequisites become unchecked', async () => {
      const state = withData({ checks: { 1: true, 2: true, 3: true } })
      const newState = reducer(state, await dispatched(actions.toggleCheckWeek(1, 10, 1, prerequisites)))
      expect(newState.checks).toEqual({ 1: false, 2: false, 3: false })
    })

    it('toggles an item that is not in the current checks', async () => {
      const state = withData({ checks: { 1: true } })
      const newState = reducer(state, await dispatched(actions.toggleCheckWeek(2, 10, 1, prerequisites)))
      expect(newState.checks).toEqual({ 1: true, 2: false })
    })

    it('uses empty checks for a week that has no review yet', async () => {
      const newState = reducer(withData(), await dispatched(actions.toggleCheckWeek(1, 10, 2, prerequisites)))
      expect(newState.checks).toEqual({ 1: true })
    })
  })

  describe('toggleCheckCodeReview', () => {
    it('starts from the checks saved on the code review', async () => {
      const newState = reducer(
        withData(),
        await dispatched(actions.toggleCheckCodeReview(1, '10', '1', prerequisites))
      )
      expect(newState.checks).toEqual({ 1: true })
    })

    it('uses empty checks for an unreviewed round', async () => {
      const newState = reducer(
        withData(),
        await dispatched(actions.toggleCheckCodeReview(1, 10, 2, prerequisites))
      )
      expect(newState.checks).toEqual({ 1: true })
    })
  })

  describe('verifyCheckPrerequisites', () => {
    it('returns the same state when nothing changes', async () => {
      const state = withData({ checks: { 1: true, 2: true, 3: false } })
      expect(reducer(state, await dispatched(actions.verifyCheckPrerequisites(prerequisites)))).toBe(state)
    })

    it('cascades missing prerequisites', async () => {
      const state = withData({ checks: { 1: false, 2: true, 3: true } })
      const newState = reducer(state, await dispatched(actions.verifyCheckPrerequisites(prerequisites)))
      expect(newState.checks).toEqual({ 1: false, 2: false, 3: false })
    })
  })

  it('restoreChecks sets the checks and disables draft loading', async () => {
    const state = withData()
    const newState = reducer(state, await dispatched(actions.restoreChecks(10, { 1: true })))
    expect(newState.checks).toEqual({ 1: true })
    expect(newState.allowDraftLoad).toBe(false)
  })

  describe('WEEKDRAFTS_GET_ONE_SUCCESS', () => {
    const draft = {
      data: { checks: { 1: true }, feedback: 'draft feedback' },
      updatedAt: '2020-01-01T00:00:00.000Z'
    }

    it('stores the draft and loads its checks', () => {
      const newState = reducer(withData(), { type: 'WEEKDRAFTS_GET_ONE_SUCCESS', response: draft })
      expect(newState.draftData).toEqual(draft.data)
      expect(newState.draftCreatedAt).toBe(draft.updatedAt)
      expect(newState.checks).toEqual({ 1: true })
    })

    it('does not overwrite restored checks', () => {
      const state = withData({ checks: { 2: true }, allowDraftLoad: false })
      const newState = reducer(state, { type: 'WEEKDRAFTS_GET_ONE_SUCCESS', response: draft })
      expect(newState.checks).toEqual({ 2: true })
      expect(newState.draftData).toEqual(draft.data)
    })

    it.each([null, {}, { data: null }])('clears the draft when there is none (%o)', response => {
      const state = withData({ draftData: { a: 1 }, draftCreatedAt: 'x' })
      const newState = reducer(state, { type: 'WEEKDRAFTS_GET_ONE_SUCCESS', response })
      expect(newState.draftData).toEqual({})
      expect(newState.draftCreatedAt).toBe(null)
    })
  })

  it('WEEKDRAFTS_GET_ONE_FAILURE keeps the state', () => {
    const state = withData()
    expect(reducer(state, { type: 'WEEKDRAFTS_GET_ONE_FAILURE', response: new Error('x') })).toBe(state)
  })
})
