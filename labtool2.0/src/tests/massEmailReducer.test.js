import deepFreeze from 'deep-freeze'
import reducer from '../reducers/massEmailReducer'

describe('massEmailReducer', () => {
  const notDelivered = [
    {
      name: 'Pekka Palautuva',
      email: 'p@rejected.test',
      studentInstanceId: 3,
      reason: 'rejected by the mail server'
    }
  ]
  const initial = { done: false, notDelivered: [] }

  it('starts empty', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('stores who did not get a sent email', () => {
    const state = { ...initial }
    deepFreeze(state)
    expect(
      reducer(state, { type: 'MASS_EMAIL_SEND_SUCCESS', response: { message: 'x', notDelivered } })
    ).toEqual({
      done: true,
      notDelivered
    })
  })

  it('treats a success without a list as delivered to everybody', () => {
    expect(reducer(initial, { type: 'MASS_EMAIL_SEND_SUCCESS', response: { message: 'x' } })).toEqual({
      done: true,
      notDelivered: []
    })
  })

  it('stores who did not get it when nothing was sent', () => {
    const action = { type: 'MASS_EMAIL_SEND_FAILURE', response: { response: { data: { notDelivered } } } }
    expect(reducer(initial, action)).toEqual({ done: false, notDelivered })
  })

  it('handles a failure without a response (no students selected)', () => {
    expect(reducer(initial, { type: 'MASS_EMAIL_SEND_FAILURE' })).toEqual(initial)
  })

  it.each(['MASS_EMAIL_SEND_ATTEMPT', 'MASS_EMAIL_RESET', 'LOGOUT_SUCCESS'])('%s clears the result', type => {
    const state = { done: true, notDelivered }
    deepFreeze(state)
    expect(reducer(state, { type })).toEqual(initial)
  })
})
