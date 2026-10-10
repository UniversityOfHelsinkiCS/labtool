import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import reducer, * as actions from '../reducers/checklistReducer'

const initial = () => reducer(undefined, { type: '@@INIT' })

const dispatched = async thunk => {
  const dispatch = vi.fn()
  await thunk(dispatch)
  return dispatch.mock.calls[0][0]
}

const row = (id, name, extra = {}) => ({
  id,
  name,
  checkedPoints: 1,
  uncheckedPoints: 0,
  textWhenOn: '',
  textWhenOff: '',
  prerequisite: null,
  ...extra
})

const loaded = () => ({
  data: {
    Week1: [row(1, 'a'), row(2, 'b'), row(3, 'c')],
    Week2: [row(4, 'd')],
    Week3: []
  },
  maxPoints: 5
})

describe('checklistReducer', () => {
  it('has the expected initial state', () => {
    expect(initial()).toEqual({ data: {}, maxPoints: '' })
  })

  it('LOGOUT_SUCCESS empties the state', () => {
    expect(reducer(loaded(), { type: 'LOGOUT_SUCCESS' })).toEqual({})
  })

  it('resetChecklist resets', async () => {
    expect(reducer(loaded(), await dispatched(actions.resetChecklist()))).toEqual(initial())
  })

  describe('CHECKLIST_GET_ONE_SUCCESS', () => {
    it('stores the list and max points', () => {
      const state = initial()
      deepFreeze(state)
      const list = loaded().data
      expect(reducer(state, { type: 'CHECKLIST_GET_ONE_SUCCESS', response: { list, maxPoints: 7 } })).toEqual(
        {
          data: list,
          maxPoints: 7
        }
      )
    })

    it('defaults missing max points to an empty string', () => {
      expect(
        reducer(initial(), { type: 'CHECKLIST_GET_ONE_SUCCESS', response: { list: {}, maxPoints: null } })
      ).toEqual({
        data: {},
        maxPoints: ''
      })
    })

    it('restoreChecklist dispatches the same action', async () => {
      expect(await dispatched(actions.restoreChecklist({ a: [] }, 3))).toEqual({
        type: 'CHECKLIST_GET_ONE_SUCCESS',
        response: { list: { a: [] }, maxPoints: 3 }
      })
    })
  })

  it('CHECKLIST_GET_ONE_FAILURE empties the checklist', () => {
    const state = loaded()
    deepFreeze(state)
    expect(reducer(state, { type: 'CHECKLIST_GET_ONE_FAILURE', response: new Error('x') })).toEqual({
      data: {},
      maxPoints: ''
    })
  })

  it('changeField sets a field of a row', async () => {
    const newState = reducer(
      loaded(),
      await dispatched(actions.changeField({ key: 'Week1', name: 'b', field: 'checkedPoints', value: '3' }))
    )
    expect(newState.data.Week1[1].checkedPoints).toBe('3')
  })

  it('applyCategoryPrerequisite sets the prerequisite of every other row in the category', async () => {
    const newState = reducer(loaded(), await dispatched(actions.applyCategoryPrerequisite('Week1', 2)))
    expect(newState.data.Week1.map(r => r.prerequisite)).toEqual([2, null, 2])
    expect(newState.data.Week2[0].prerequisite).toBe(null)
  })

  it('addTopic adds an empty topic', async () => {
    const newState = reducer(loaded(), await dispatched(actions.addTopic({ key: 'Final' })))
    expect(newState.data.Final).toEqual([])
  })

  it('addRow appends a row with the next free temporary id', async () => {
    const newState = reducer(
      loaded(),
      await dispatched(actions.addRow({ key: 'Week3', name: 'new', prerequisite: 1 }))
    )
    expect(newState.data.Week3).toEqual([
      {
        name: 'new',
        tempId: 5,
        checkedPoints: 0,
        uncheckedPoints: 0,
        textWhenOn: '',
        textWhenOff: '',
        prerequisite: 1
      }
    ])
    const again = reducer(newState, {
      type: 'CHECKLIST_ADD_ROW',
      data: { key: 'Week3', name: 'newer', prerequisite: null }
    })
    expect(again.data.Week3[1].tempId).toBe(6)
  })

  it('addRow gives distinct finite ids when the checklist has no rows yet', () => {
    let state = { data: { Week1: [] }, maxPoints: '' }
    state = reducer(state, {
      type: 'CHECKLIST_ADD_ROW',
      data: { key: 'Week1', name: 'a', prerequisite: null }
    })
    state = reducer(state, {
      type: 'CHECKLIST_ADD_ROW',
      data: { key: 'Week1', name: 'b', prerequisite: null }
    })
    const [a, b] = state.data.Week1.map(r => r.tempId)
    expect(Number.isFinite(a)).toBe(true)
    expect(Number.isFinite(b)).toBe(true)
    expect(a).not.toBe(b)
  })

  it('removeTopic removes the topic', async () => {
    const newState = reducer(loaded(), await dispatched(actions.removeTopic({ key: 'Week2' })))
    expect(Object.keys(newState.data)).toEqual(['Week1', 'Week3'])
  })

  it('removeRow removes the row by name', async () => {
    const newState = reducer(loaded(), await dispatched(actions.removeRow({ key: 'Week1', name: 'b' })))
    expect(newState.data.Week1.map(r => r.name)).toEqual(['a', 'c'])
  })

  describe('moving topics', () => {
    it('moveTopicUp / moveTopicDown reorder the topics', async () => {
      const state = loaded()
      deepFreeze(state)
      const up = reducer(state, await dispatched(actions.moveTopicUp({ key: 'Week2' })))
      expect(Object.keys(up.data)).toEqual(['Week2', 'Week1', 'Week3'])
      const down = reducer(state, await dispatched(actions.moveTopicDown({ key: 'Week2' })))
      expect(Object.keys(down.data)).toEqual(['Week1', 'Week3', 'Week2'])
    })

    it('does not move past the ends', () => {
      const state = loaded()
      deepFreeze(state)
      expect(
        Object.keys(reducer(state, { type: 'CHECKLIST_MOVE_TOPIC_UP', data: { key: 'Week1' } }).data)
      ).toEqual(['Week1', 'Week2', 'Week3'])
      expect(
        Object.keys(reducer(state, { type: 'CHECKLIST_MOVE_TOPIC_DOWN', data: { key: 'Week3' } }).data)
      ).toEqual(['Week1', 'Week2', 'Week3'])
    })
  })

  describe('moving rows', () => {
    it('moveRowUp / moveRowDown reorder the rows', async () => {
      const up = reducer(loaded(), await dispatched(actions.moveRowUp({ key: 'Week1', name: 'b' })))
      expect(up.data.Week1.map(r => r.name)).toEqual(['b', 'a', 'c'])
      const down = reducer(loaded(), await dispatched(actions.moveRowDown({ key: 'Week1', name: 'b' })))
      expect(down.data.Week1.map(r => r.name)).toEqual(['a', 'c', 'b'])
    })

    it('does not move past the ends', () => {
      expect(
        reducer(loaded(), {
          type: 'CHECKLIST_MOVE_ROW_UP',
          data: { key: 'Week1', name: 'a' }
        }).data.Week1.map(r => r.name)
      ).toEqual(['a', 'b', 'c'])
      expect(
        reducer(loaded(), {
          type: 'CHECKLIST_MOVE_ROW_DOWN',
          data: { key: 'Week1', name: 'c' }
        }).data.Week1.map(r => r.name)
      ).toEqual(['a', 'b', 'c'])
    })
  })

  it('castPointsToNumber converts the points of a row to numbers', async () => {
    const state = loaded()
    state.data.Week1[0].checkedPoints = '2.5'
    state.data.Week1[0].uncheckedPoints = '-1'
    const newState = reducer(state, await dispatched(actions.castPointsToNumber({ key: 'Week1', name: 'a' })))
    expect(newState.data.Week1[0].checkedPoints).toBe(2.5)
    expect(newState.data.Week1[0].uncheckedPoints).toBe(-1)
  })

  it.each([
    ['CHECKLIST_CHANGE_FIELD', { data: { key: 'Week1', name: 'a', field: 'name', value: 'x' } }],
    ['CHECKLIST_APPLY_PREREQUISITE_TO_CHECKS_IN_CATEGORY', { category: 'Week1', prerequisite: 1 }],
    ['CHECKLIST_ADD_TOPIC', { data: { key: 'New' } }],
    ['CHECKLIST_ADD_ROW', { data: { key: 'Week1', name: 'x', prerequisite: null } }],
    ['CHECKLIST_REMOVE_TOPIC', { data: { key: 'Week1' } }],
    ['CHECKLIST_REMOVE_ROW', { data: { key: 'Week1', name: 'a' } }],
    ['CHECKLIST_MOVE_ROW_UP', { data: { key: 'Week1', name: 'b' } }],
    ['CHECKLIST_MOVE_ROW_DOWN', { data: { key: 'Week1', name: 'b' } }],
    ['CHECKLIST_CAST_POINTS', { data: { key: 'Week1', name: 'a' } }]
  ])('%s does not mutate the previous state', (type, rest) => {
    const state = loaded()
    deepFreeze(state)
    const newState = reducer(state, { type, ...rest })
    expect(newState.data).not.toBe(state.data)
  })
})
