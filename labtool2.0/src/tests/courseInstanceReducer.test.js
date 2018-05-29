import courseInstanceReducer from '../reducers/courseInstanceReducer'
import deepFreeze  from 'deep-freeze'

// Here we test that the mapping that I do in the reducer is pure (deepfreeze for that)
// and that the fields that I added are in the new state, and that they contain the correct information
// with the right format

describe('courseInstanceReducer', () => {
  it('returns the object with added european dates and shorter courseid', () => {
    const state = []
    const action = {
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

    deepFreeze(state)
    const newState = courseInstanceReducer(state, action)

    expect(newState.length).toBe(1)
    expect(newState[0]).toHaveProperty('europeanStart')
    expect(newState[0]).toHaveProperty('europeanEnd')
    expect(newState[0]).toHaveProperty('shorterId')

    expect(newState[0]['europeanStart']).toMatch('11.03.2018')
    expect(newState[0]['europeanEnd']).toMatch('11.03.2018')
    expect(newState[0]['shorterId']).toMatch('TKT20011')
  })
})
