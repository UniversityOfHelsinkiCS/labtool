import { vi } from 'vitest'
import { createRecordingServer, http, HttpResponse, DEV_API_BASE } from './testUtils/httpMock'

// End-to-end through the real store (src/store.js): service -> middleware -> HTTP -> reducers.
const { server, reset } = createRecordingServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  reset()
  window.localStorage.clear()
})
afterAll(() => server.close())

const loadAll = async () => {
  vi.resetModules()
  const store = (await import('../store')).default
  const login = await import('../services/login')
  const courseInstance = await import('../services/courseInstance')
  const studentinstances = await import('../services/studentinstances')
  return { store, login, courseInstance, studentinstances }
}

const waitForState = (store, predicate) =>
  vi.waitFor(
    () => {
      if (!predicate(store.getState())) {
        throw new Error('state not reached')
      }
    },
    { timeout: 2000 }
  )

const loginResponse = {
  user: { id: 5, username: 'tester', firsts: 'Testi', lastname: 'Testaaja', email: 't@example.com' },
  token: 'jwt-from-backend',
  created: false
}

describe('store data flow', () => {
  it('login stores the user and token, and later calls send the token', async () => {
    server.use(
      http.post(`${DEV_API_BASE}/login`, () => HttpResponse.json(loginResponse)),
      http.post(`${DEV_API_BASE}/course/student`, ({ request }) =>
        HttpResponse.json(
          request.headers.get('authorization') === 'bearer jwt-from-backend'
            ? [{ id: 1, name: 'Course', active: true, start: '2020-01-01T00:00:00.000Z' }]
            : []
        )
      )
    )
    const { store, login, studentinstances } = await loadAll()

    store.dispatch(login.login({}))
    await waitForState(store, s => s.user.token)
    expect(store.getState().user).toEqual(loginResponse)

    store.dispatch(studentinstances.getAllStudentCourses())
    await waitForState(store, s => s.studentInstance.length === 1)
    expect(store.getState().loading.loading).toBe(false)
  })

  it('a failed login resets the user', async () => {
    server.use(http.post(`${DEV_API_BASE}/login`, () => HttpResponse.json({ error: 'no' }, { status: 401 })))
    const { store, login } = await loadAll()
    store.dispatch({ type: 'LOGIN_BYTOKEN', user: loginResponse })
    store.dispatch(login.login({}))
    await waitForState(store, s => !s.user.token)
    expect(store.getState().user).toEqual({})
  })

  it('course page information reaches coursePage, coursePageLogic and weekReview', async () => {
    const response = {
      role: 'student',
      data: {
        id: 3,
        weeks: [{ id: 1, weekNumber: 1, createdAt: '2020-01-01T00:00:00.000Z', comments: [] }],
        codeReviews: [{ reviewNumber: 1, points: null }]
      }
    }
    let sentBody
    server.use(
      http.post(`${DEV_API_BASE}/courseinstances/coursepage`, async ({ request }) => {
        sentBody = await request.json()
        return HttpResponse.json(response)
      })
    )
    const { store, courseInstance } = await loadAll()
    store.dispatch(courseInstance.coursePageInformation('TKT1'))
    await waitForState(store, s => s.coursePage.role === 'student')
    const state = store.getState()
    expect(state.coursePage).toEqual(response)
    expect(state.weekReview.data).toEqual(response.data)
    expect(state.coursePageLogic.showCodeReviews).toEqual([1])
    expect(state.coursePageLogic.lastReviewedWeek).toBe(1)
    expect(sentBody).toEqual({ course: 'TKT1' })
  })

  it('a backend error message is shown as a notification', async () => {
    server.use(
      http.put(`${DEV_API_BASE}/users/update`, () =>
        HttpResponse.json({ error: 'Invalid email address' }, { status: 400 })
      )
    )
    const { store, login } = await loadAll()
    store.dispatch(login.updateSelf({ email: 'bad' }))
    await waitForState(store, s => s.notification.error)
    expect(store.getState().notification).toEqual({ message: 'Invalid email address', error: true })
  })

  it('404 responses are recorded as loading errors', async () => {
    server.use(
      http.get(`${DEV_API_BASE}/courseInstances`, () => HttpResponse.text('Not here', { status: 404 }))
    )
    const { store, courseInstance } = await loadAll()
    store.dispatch(courseInstance.getAllCI())
    await waitForState(store, s => Object.keys(s.loading.errors).length > 0)
    const error = store.getState().loading.errors.CI_GET_ALL_
    expect(error.response.status).toBe(404)
    expect(error.response.data).toBe('Not here')
    expect(store.getState().loading.loading).toBe(false)
  })

  it('getAllCI fills courseInstance with formatted courses', async () => {
    server.use(
      http.get(`${DEV_API_BASE}/courseInstances`, () =>
        HttpResponse.json([
          {
            id: 1,
            name: 'Tietokantasovellus',
            start: '2018-03-11T21:00:00.000Z',
            end: '2018-05-01T21:00:00.000Z',
            active: true,
            ohid: 'TKT20011.2018.K.A.1'
          }
        ])
      )
    )
    const { store, courseInstance } = await loadAll()
    store.dispatch(courseInstance.getAllCI())
    await waitForState(store, s => s.courseInstance.length === 1)
    expect(store.getState().courseInstance[0]).toMatchObject({
      europeanStart: '11.03.2018',
      shorterId: 'TKT20011'
    })
  })
})
