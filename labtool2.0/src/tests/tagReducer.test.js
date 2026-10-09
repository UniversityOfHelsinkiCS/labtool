import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import reducer, { willCreateNewTag, willModifyExistingTag } from '../reducers/tagReducer'

const initial = () => reducer(undefined, { type: '@@INIT' })

const dispatched = async thunk => {
  const dispatch = vi.fn()
  await thunk(dispatch)
  return dispatch.mock.calls[0][0]
}

const withTags = (extra = {}) => {
  const state = {
    modifyTag: null,
    tags: [
      { id: 1, name: 'alpha', color: 'red' },
      { id: 2, name: 'beta', color: 'blue' }
    ],
    ...extra
  }
  deepFreeze(state)
  return state
}

describe('tagReducer', () => {
  it('has the expected initial state', () => {
    expect(initial()).toEqual({ modifyTag: null })
  })

  it('LOGOUT_SUCCESS resets', () => {
    expect(reducer(withTags({ modifyTag: 1 }), { type: 'LOGOUT_SUCCESS' })).toEqual(initial())
  })

  it('TAGS_GET_ALL_SUCCESS stores the tags sorted by name, case insensitively', () => {
    const state = initial()
    deepFreeze(state)
    const newState = reducer(state, {
      type: 'TAGS_GET_ALL_SUCCESS',
      response: [
        { id: 1, name: 'beta' },
        { id: 2, name: 'Alpha' },
        { id: 3, name: 'gamma' }
      ]
    })
    expect(newState.tags.map(t => t.name)).toEqual(['Alpha', 'beta', 'gamma'])
  })

  describe('TAG_CREATE_SUCCESS', () => {
    it('appends a new tag', () => {
      const newState = reducer(withTags(), { type: 'TAG_CREATE_SUCCESS', response: { id: 3, name: 'gamma' } })
      expect(newState.tags.map(t => t.id)).toEqual([1, 2, 3])
      expect(newState.modifyTag).toBe(null)
    })

    it('replaces a modified tag', () => {
      const newState = reducer(withTags(), {
        type: 'TAG_CREATE_SUCCESS',
        response: { id: 2, name: 'beta', color: 'green' }
      })
      expect(newState.tags).toEqual([
        { id: 1, name: 'alpha', color: 'red' },
        { id: 2, name: 'beta', color: 'green' }
      ])
    })

    it('removes the tag given as deleteId (rename) and keeps the edited tag selected', () => {
      const newState = reducer(withTags({ modifyTag: 2 }), {
        type: 'TAG_CREATE_SUCCESS',
        response: { id: 3, name: 'beta2', deleteId: 2 }
      })
      expect(newState.tags).toEqual([
        { id: 1, name: 'alpha', color: 'red' },
        { id: 3, name: 'beta2' }
      ])
      expect(newState.modifyTag).toBe(3)
    })

    it('does not change modifyTag when another tag was being edited', () => {
      const newState = reducer(withTags({ modifyTag: 1 }), {
        type: 'TAG_CREATE_SUCCESS',
        response: { id: 3, name: 'beta2', deleteId: 2 }
      })
      expect(newState.modifyTag).toBe(1)
    })
  })

  it('TAG_REMOVE_SUCCESS removes the tag with the returned id', () => {
    const newState = reducer(withTags(), { type: 'TAG_REMOVE_SUCCESS', response: 1 })
    expect(newState.tags.map(t => t.id)).toEqual([2])
  })

  it('willCreateNewTag clears modifyTag', async () => {
    expect(reducer(withTags({ modifyTag: 1 }), await dispatched(willCreateNewTag())).modifyTag).toBe(null)
  })

  it('willModifyExistingTag sets modifyTag', async () => {
    expect(reducer(withTags(), await dispatched(willModifyExistingTag(2))).modifyTag).toBe(2)
  })

  it.each(['TAG_STUDENT_SUCCESS', 'UNTAG_STUDENT_SUCCESS'])('%s keeps the state', type => {
    const state = withTags()
    expect(reducer(state, { type, response: {} })).toBe(state)
  })
})
