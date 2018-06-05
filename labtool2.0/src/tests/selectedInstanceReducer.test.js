import selectedInstanceReducer from '../reducers/selectedInstanceReducer'
import deepFreeze from 'deep-freeze'

describe('selectedInstanceRedurer', () => {
  let state
  let action

  beforeEach(() => {
    state = {
      teacherInstances: [
        {
          id: 1004,
          admin: 'true',
          createdAt: '2018-01-16T21:00:00.000Z',
          updatedAt: '2018-01-16T21:00:00.000Z',
          userId: 10011,
          courseInstanceId: 10013
        }
      ]
    }
    action = {
      type: 'TEACHER_CREATE_SUCCESS',
      response: {
        id: 1003,
        admin: 'true',
        createdAt: '2018-01-16T21:00:00.000Z',
        updatedAt: '2018-01-16T21:00:00.000Z',
        userId: 10010,
        courseInstanceId: 10013
      }
    }
  })

  it('new teacherinstance is added to teacherInstances when TEACHER_CREATE_SUCCESS is called', () => {
    deepFreeze(state)
    const newState = selectedInstanceReducer(state, action)
    expect(newState.teacherInstances.length).toBe(2)
  })

  it('correct teacher is added to teacherInstances  when TEACHER_CREATE_SUCCESS is called', () => {
    deepFreeze(state)
    const newState = selectedInstanceReducer(state, action)
    expect(newState.teacherInstances[1].id).toEqual(1003)
  })
})
