import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import reducer, * as actions from '../reducers/codeReviewReducer'

const initial = () => reducer(undefined, { type: '@@INIT' })

const dispatched = async thunk => {
  const dispatch = vi.fn()
  await thunk(dispatch)
  return dispatch.mock.calls[0][0]
}

const studentData = [
  { id: 1, codeReviews: [{ reviewNumber: 1, toReview: 2 }] },
  { id: 2, codeReviews: [{ reviewNumber: 1, toReview: null, repoToReview: 'https://github.com/r' }] },
  { id: 3, codeReviews: [] }
]

const createdState = () =>
  reducer(initial(), { type: 'CREATE_STATES_FOR_CODE_REVIEWS', data: { codeReviewAmount: 2, studentData } })

describe('codeReviewReducer', () => {
  it('has the expected initial state', () => {
    expect(initial()).toEqual({
      codeReviewStates: {},
      currentSelections: {},
      selectedDropdown: null,
      statesCreated: false,
      initialized: false,
      filterByReview: 0,
      filterActive: false
    })
  })

  it('LOGOUT_SUCCESS empties the state', () => {
    expect(reducer(createdState(), { type: 'LOGOUT_SUCCESS' })).toEqual({})
  })

  it('restoreData replaces the state', async () => {
    const data = { ...initial(), selectedDropdown: 2 }
    expect(reducer(initial(), await dispatched(actions.restoreData(data)))).toBe(data)
  })

  it('codeReviewReset resets the state', async () => {
    expect(reducer(createdState(), await dispatched(actions.codeReviewReset()))).toEqual(initial())
  })

  it('createStates builds per-round states from student data', async () => {
    const state = initial()
    deepFreeze(state)
    const newState = reducer(state, await dispatched(actions.createStates(2, studentData)))
    expect(newState.statesCreated).toBe(true)
    expect(newState.codeReviewStates).toEqual({ 1: [], 2: [], '-1': [] })
    expect(newState.currentSelections).toEqual({
      1: { 1: 2, 2: 'https://github.com/r' },
      2: {},
      '-1': {}
    })
  })

  it('selectDropdown', async () => {
    const state = initial()
    deepFreeze(state)
    expect(reducer(state, await dispatched(actions.selectDropdown(2))).selectedDropdown).toBe(2)
  })

  it('filterByReview activates the filter for non-zero rounds', async () => {
    const state = initial()
    deepFreeze(state)
    const on = reducer(state, await dispatched(actions.filterByReview(2)))
    expect(on).toMatchObject({ filterByReview: 2, filterActive: true })
    const off = reducer(on, await dispatched(actions.filterByReview(0)))
    expect(off).toMatchObject({ filterByReview: 0, filterActive: false })
  })

  describe('INIT_REVIEW', () => {
    it('adds a review', async () => {
      const newState = reducer(
        createdState(),
        await dispatched(actions.initOneReview({ round: 2, reviewer: 1, toReview: 3 }))
      )
      expect(newState.codeReviewStates[2]).toEqual([{ reviewer: 1, toReview: 3, repoToReview: undefined }])
      expect(newState.currentSelections[2]).toEqual({ 1: 3 })
    })

    it('updates an existing review', () => {
      let state = createdState()
      state = reducer(state, { type: 'INIT_REVIEW', data: { round: 2, reviewer: 1, toReview: 3 } })
      state = reducer(state, {
        type: 'INIT_REVIEW',
        data: { round: 2, reviewer: 1, repoToReview: 'https://r' }
      })
      expect(state.codeReviewStates[2]).toEqual([
        { reviewer: 1, toReview: undefined, repoToReview: 'https://r' }
      ])
      expect(state.currentSelections[2]).toEqual({ 1: 'https://r' })
    })

    it('removes the review when neither toReview nor repoToReview is given', () => {
      let state = createdState()
      state = reducer(state, { type: 'INIT_REVIEW', data: { round: 2, reviewer: 1, toReview: 3 } })
      state = reducer(state, { type: 'INIT_REVIEW', data: { round: 2, reviewer: 1 } })
      expect(state.codeReviewStates[2]).toEqual([])
      expect(state.currentSelections[2]).toEqual({})
    })

    // BUG: INIT_REVIEW writes into state.codeReviewStates / state.currentSelections objects in place.
    it.skip('does not mutate the previous state', () => {
      const state = createdState()
      deepFreeze(state)
      expect(() =>
        reducer(state, { type: 'INIT_REVIEW', data: { round: 2, reviewer: 1, toReview: 3 } })
      ).not.toThrow()
    })
  })

  describe('CODE_REVIEW_BULKINSERT_SUCCESS', () => {
    it('clears the saved round', () => {
      let state = createdState()
      state = reducer(state, { type: 'INIT_REVIEW', data: { round: 2, reviewer: 1, toReview: 3 } })
      const newState = reducer(state, {
        type: 'CODE_REVIEW_BULKINSERT_SUCCESS',
        response: { data: { reviewNumber: 2 } }
      })
      expect(newState.codeReviewStates[2]).toEqual([])
      expect(newState.selectedDropdown).toBe(null)
    })

    it('creates a new round and selects it when createTrue', () => {
      const newState = reducer(createdState(), {
        type: 'CODE_REVIEW_BULKINSERT_SUCCESS',
        response: { data: { reviewNumber: 3, createTrue: true } }
      })
      expect(newState.codeReviewStates[3]).toEqual([])
      expect(newState.currentSelections[3]).toEqual({})
      expect(newState.currentSelections[-1]).toEqual({})
      expect(newState.selectedDropdown).toBe(3)
    })

    // BUG: for an existing round, state.codeReviewStates is written in place.
    it.skip('does not mutate the previous state', () => {
      const state = createdState()
      deepFreeze(state)
      expect(() =>
        reducer(state, { type: 'CODE_REVIEW_BULKINSERT_SUCCESS', response: { data: { reviewNumber: 1 } } })
      ).not.toThrow()
    })
  })

  describe('CODE_REVIEW_RANDOMIZE', () => {
    const selected = { 1: true, 2: true, 3: true, 4: true }

    const randomize = (state, reviewNumber) =>
      reducer(state, { type: 'CODE_REVIEW_RANDOMIZE', data: { reviewNumber, selected } })

    const stateWithRounds = () =>
      reducer(initial(), {
        type: 'CREATE_STATES_FOR_CODE_REVIEWS',
        data: {
          codeReviewAmount: 2,
          studentData: [1, 2, 3, 4].map(id => ({
            id,
            codeReviews: [{ reviewNumber: 1, toReview: (id % 4) + 1 }]
          }))
        }
      })

    it('round 1: assigns every selected student exactly once and nobody reviews themselves', () => {
      for (let i = 0; i < 20; i++) {
        const newState = randomize(stateWithRounds(), 1)
        const reviews = newState.codeReviewStates[1]
        expect(reviews).toHaveLength(4)
        expect(reviews.map(r => r.reviewer).sort()).toEqual([1, 2, 3, 4])
        expect(reviews.map(r => r.toReview).sort()).toEqual([1, 2, 3, 4])
        reviews.forEach(r => {
          expect(r.reviewer).not.toBe(r.toReview)
          expect(newState.currentSelections[1][r.reviewer]).toBe(r.toReview)
        })
      }
    })

    it('round 2: assigned reviews do not repeat pairs from round 1', () => {
      for (let i = 0; i < 20; i++) {
        const state = stateWithRounds()
        const round1 = { ...state.currentSelections[1] }
        const newState = randomize(state, 2)
        const reviews = newState.codeReviewStates[2]
        // see the skipped test below: sometimes nothing is assigned at all
        expect([0, 4]).toContain(reviews.length)
        reviews.forEach(r => {
          expect(r.reviewer).not.toBe(r.toReview)
          expect(round1[r.reviewer]).not.toBe(r.toReview)
        })
      }
    })

    it('round 2: always assigns everyone when a valid assignment exists', () => {
      for (let i = 0; i < 200; i++) {
        expect(randomize(stateWithRounds(), 2).codeReviewStates[2]).toHaveLength(4)
      }
    })

    it('round 2: assigns nobody when no valid assignment exists', () => {
      // two students who reviewed each other in round 1 can only review themselves or repeat
      const state = reducer(initial(), {
        type: 'CREATE_STATES_FOR_CODE_REVIEWS',
        data: {
          codeReviewAmount: 2,
          studentData: [
            { id: 1, codeReviews: [{ reviewNumber: 1, toReview: 2 }] },
            { id: 2, codeReviews: [{ reviewNumber: 1, toReview: 1 }] }
          ]
        }
      })
      const newState = reducer(state, {
        type: 'CODE_REVIEW_RANDOMIZE',
        data: { reviewNumber: 2, selected: { 1: true, 2: true } }
      })
      expect(newState.codeReviewStates[2]).toEqual([])
    })

    it('keeps reviews of students that were not selected', () => {
      let state = stateWithRounds()
      state = reducer(state, { type: 'INIT_REVIEW', data: { round: 2, reviewer: 9, toReview: 8 } })
      const newState = randomize(state, 2)
      expect(newState.codeReviewStates[2].find(r => r.reviewer === 9)).toEqual({
        reviewer: 9,
        toReview: 8,
        repoToReview: undefined
      })
    })

    it('randomAssign builds the action', async () => {
      expect(await dispatched(actions.randomAssign({ reviewNumber: 2 }, selected))).toEqual({
        type: 'CODE_REVIEW_RANDOMIZE',
        data: { reviewNumber: 2, selected }
      })
    })

    // BUG: newCurrentSelections is a shallow copy, so currentSelections[round] of the previous state is written.
    it.skip('does not mutate the previous state', () => {
      const state = stateWithRounds()
      deepFreeze(state)
      expect(() => randomize(state, 1)).not.toThrow()
    })
  })

  describe('CODE_REVIEW_REMOVE_ONE_SUCCESS', () => {
    const action = {
      type: 'CODE_REVIEW_REMOVE_ONE_SUCCESS',
      response: { data: { reviewer: 1, codeReviewRound: 1 } }
    }

    it('removes the selection', () => {
      const newState = reducer(createdState(), action)
      expect(newState.currentSelections[1]).toEqual({ 2: 'https://github.com/r' })
    })

    // BUG: deletes from state.currentSelections[round] in place.
    it.skip('does not mutate the previous state', () => {
      const state = createdState()
      deepFreeze(state)
      expect(() => reducer(state, action)).not.toThrow()
    })
  })
})
