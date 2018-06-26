import courseInstanceReducer from '../reducers/courseInstanceReducer'
import deepFreeze from 'deep-freeze'

// Here we test that the mapping that I do in the reducer is pure (deepfreeze for that)
// and that the fields that I added are in the new state, and that they contain the correct information
// with the right format

describe('courseInstanceReducer', () => {
  let state
  let action

  beforeEach(() => {
    state = []
    action = {
      type: 'CI_GET_ALL_SUCCESS',
      response: [
        {
          id: 1,
          name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
          start: '2018-03-11T21:00:00.000Z',
          end: '2018-03-11T21:00:00.000Z',
          active: false,
          weekAmount: 7,
          weekMaxPoints: 2,
          currentWeek: 1,
          ohid: 'TKT20011.2018.K.A.1'
        }
      ]
    }
  })

  it('returns the object with european start date', () => {
    deepFreeze(state)
    const newState = courseInstanceReducer(state, action)
    expect(newState[0]['europeanStart']).toMatch('11.03.2018')
  })

  it('return the object with european end date', () => {
    deepFreeze(state)
    const newState = courseInstanceReducer(state, action)
    expect(newState[0]['europeanEnd']).toMatch('11.03.2018')
  })

  it('returns the object with shorter course id', () => {
    deepFreeze(state)
    const newState = courseInstanceReducer(state, action)
    expect(newState[0]['shorterId']).toMatch('TKT20011')
  })
})
