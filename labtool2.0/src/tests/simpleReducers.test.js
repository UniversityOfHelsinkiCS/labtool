import deepFreeze from 'deep-freeze'
import { vi } from 'vitest'
import studentInstanceReducer from '../reducers/studentInstanceReducer'
import teacherInstanceReducer from '../reducers/teacherInstanceReducer'
import userReducer from '../reducers/userReducer'
import redirectReducer, { forceRedirect, forceNoRedirect } from '../reducers/redirectReducer'
import courseImportReducer from '../reducers/courseImportReducer'

const frozen = value => {
  deepFreeze(value)
  return value
}

const dispatched = async thunk => {
  const dispatch = vi.fn()
  await thunk(dispatch)
  return dispatch.mock.calls[0][0]
}

// active courses first, then newest first
const courses = () => [
  { id: 1, active: false, start: '2019-01-01T00:00:00.000Z' },
  { id: 2, active: true, start: '2018-01-01T00:00:00.000Z' },
  { id: 3, active: true, start: '2020-01-01T00:00:00.000Z' },
  { id: 4, active: false, start: '2021-01-01T00:00:00.000Z' }
]

describe.each([
  ['studentInstanceReducer', studentInstanceReducer, 'STUDENT_COURSE_GET_ALL_SUCCESS'],
  ['teacherInstanceReducer', teacherInstanceReducer, 'TEACHER_COURSE_GET_ALL_SUCCESS']
])('%s', (name, reducer, getAllType) => {
  it('starts empty', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual([])
  })

  it(`${getAllType} stores the courses sorted (active first, newest first)`, () => {
    const newState = reducer(frozen([]), { type: getAllType, response: courses() })
    expect(newState.map(c => c.id)).toEqual([3, 2, 4, 1])
  })

  it('LOGOUT_SUCCESS resets', () => {
    expect(reducer(frozen(courses()), { type: 'LOGOUT_SUCCESS' })).toEqual([])
  })
})

describe('studentInstanceReducer other actions', () => {
  it('STUDENT_COURSES_GET_ALL_BY_USERID_SUCCESS stores the response as is', () => {
    const response = courses()
    expect(
      studentInstanceReducer(frozen([]), { type: 'STUDENT_COURSES_GET_ALL_BY_USERID_SUCCESS', response })
    ).toBe(response)
  })

  it.each(['STUDENT_COURSE_CREATE_ONE_SUCCESS', 'STUDENT_PROJECT_INFO_UPDATE_SUCCESS'])(
    '%s keeps the state',
    type => {
      const state = frozen(courses())
      expect(studentInstanceReducer(state, { type, response: {} })).toBe(state)
    }
  )
})

describe('userReducer', () => {
  it('starts empty', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual([])
  })

  it('USERS_GET_ALL_SUCCESS stores users and fills missing first names', () => {
    const newState = userReducer(frozen([]), {
      type: 'USERS_GET_ALL_SUCCESS',
      response: [
        { id: 1, username: 'a', firsts: 'Anna' },
        { id: 2, username: 'bob', firsts: null }
      ]
    })
    expect(newState.map(u => u.firsts)).toEqual(['Anna', 'username bob'])
  })

  it('USER_UPDATE_ADMIN_SUCCESS replaces the user', () => {
    const state = frozen([
      { id: 1, admin: false },
      { id: 2, admin: false }
    ])
    const newState = userReducer(state, {
      type: 'USER_UPDATE_ADMIN_SUCCESS',
      response: { id: 2, admin: true }
    })
    expect(newState).toEqual([
      { id: 1, admin: false },
      { id: 2, admin: true }
    ])
  })

  it('LOGOUT_SUCCESS resets', () => {
    expect(userReducer(frozen([{ id: 1 }]), { type: 'LOGOUT_SUCCESS' })).toEqual([])
  })
})

describe('redirectReducer', () => {
  it('starts without redirect', () => {
    expect(redirectReducer(undefined, { type: '@@INIT' })).toEqual({ redirect: false })
  })

  it('forceRedirect / forceNoRedirect', async () => {
    const on = redirectReducer(frozen({ redirect: false }), await dispatched(forceRedirect()))
    expect(on).toEqual({ redirect: true })
    expect(redirectReducer(frozen(on), await dispatched(forceNoRedirect()))).toEqual({ redirect: false })
  })

  it('CI_GET_ONE_ATTEMPT disables redirect', () => {
    expect(redirectReducer(frozen({ redirect: true }), { type: 'CI_GET_ONE_ATTEMPT', payload: {} })).toEqual({
      redirect: false
    })
  })

  it('CI_MODIFY_ONE_SUCCESS keeps the redirect flag', () => {
    expect(redirectReducer(frozen({ redirect: false }), { type: 'CI_MODIFY_ONE_SUCCESS' })).toEqual({
      redirect: false
    })
  })
})

describe('courseImportReducer', () => {
  it('starts with no importable courses', () => {
    expect(courseImportReducer(undefined, { type: '@@INIT' })).toEqual({ canImport: false, importable: null })
  })

  it('COURSE_IMPORT_GET_ALLOWED_SUCCESS', () => {
    const state = frozen({ canImport: false, importable: null })
    expect(
      courseImportReducer(state, { type: 'COURSE_IMPORT_GET_ALLOWED_SUCCESS', response: { allowed: true } })
    ).toEqual({ canImport: true, importable: null })
  })

  it('COURSE_IMPORT_GET_COURSES_SUCCESS adds formatted dates and short ids', () => {
    const state = frozen({ canImport: true, importable: null })
    const newState = courseImportReducer(state, {
      type: 'COURSE_IMPORT_GET_COURSES_SUCCESS',
      response: [
        { hid: 'TKT20011.2018.K.A.1', starts: '2018-03-11T21:00:00.000Z', ends: '2018-05-01T21:00:00.000Z' }
      ]
    })
    expect(newState.importable).toEqual([
      {
        hid: 'TKT20011.2018.K.A.1',
        starts: '2018-03-11T21:00:00.000Z',
        ends: '2018-05-01T21:00:00.000Z',
        europeanStart: '11.03.2018',
        europeanEnd: '01.05.2018',
        shorterId: 'TKT20011'
      }
    ])
  })

  it('LOGOUT_SUCCESS resets', () => {
    expect(
      courseImportReducer(frozen({ canImport: true, importable: [] }), { type: 'LOGOUT_SUCCESS' })
    ).toEqual({
      canImport: false,
      importable: null
    })
  })
})
