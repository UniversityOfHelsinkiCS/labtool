import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { createRecordingServer, http, HttpResponse, DEV_API_BASE } from './testUtils/httpMock'

// Pages rendered with the real store (src/store.js) and the HTTP layer mocked with msw.
const { server, requests, setResponse, reset } = createRecordingServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() })
  )
})
afterEach(() => {
  reset()
  vi.unstubAllGlobals()
})
afterAll(() => server.close())

const loggedInUser = {
  user: {
    id: 10011,
    email: 'maarit.opiskelija@helsinki.invalid',
    firsts: 'Maarit Mirja',
    lastname: 'Opiskelija',
    studentNumber: '014578343',
    username: 'tiraopiskelija1'
  },
  token: 'page-token',
  created: false
}

const course = (id, name, ohid, extra = {}) => ({
  id,
  name,
  ohid,
  start: '2018-03-11T21:00:00.000Z',
  end: '2018-04-29T21:00:00.000Z',
  active: true,
  ...extra
})

const renderWithStore = async (importPage, path = '/') => {
  vi.resetModules()
  const store = (await import('../store')).default
  store.dispatch({ type: 'LOGIN_BYTOKEN', user: loggedInUser })
  const Page = (await importPage()).default
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Page history={{ push: vi.fn() }} />
      </MemoryRouter>
    </Provider>
  )
  return store
}

describe('MyPage with store', () => {
  it('fetches and shows the student and teacher courses of the user', async () => {
    const auth = []
    server.use(
      http.post(`${DEV_API_BASE}/course/student`, ({ request }) => {
        auth.push(request.headers.get('authorization'))
        return HttpResponse.json([course(1, 'Tietorakenteiden harjoitustyö', 'TKT20010.2018.K.A.1')])
      }),
      http.post(`${DEV_API_BASE}/course/teacher`, ({ request }) => {
        auth.push(request.headers.get('authorization'))
        return HttpResponse.json([course(2, 'Ohjelmistotuotantoprojekti', 'TKT20007.2018.K.A.1')])
      }),
      http.get(`${DEV_API_BASE}/courseimport/allowed`, () => HttpResponse.json({ allowed: false }))
    )
    await renderWithStore(() => import('../components/pages/MyPage'))

    expect(screen.getByText('Opiskelija, Maarit Mirja')).toBeInTheDocument()
    expect(await screen.findByText('My Courses (Student)')).toBeInTheDocument()
    expect(await screen.findByText('My Courses (Teacher)')).toBeInTheDocument()
    expect(screen.getByText(/Tietorakenteiden harjoitustyö/)).toBeInTheDocument()
    expect(screen.getByText(/Ohjelmistotuotantoprojekti/)).toBeInTheDocument()
    expect(screen.getByText(/Tietorakenteiden harjoitustyö/).closest('a')).toHaveAttribute(
      'href',
      '/labtool/courses/TKT20010.2018.K.A.1'
    )
    expect(auth).toEqual(['bearer page-token', 'bearer page-token'])
  })

  it('shows no course lists when the user has no courses', async () => {
    setResponse(() => HttpResponse.json([]))
    const store = await renderWithStore(() => import('../components/pages/MyPage'))
    await vi.waitFor(() => expect(requests).toHaveLength(3))
    expect(requests.map(r => `${r.method} ${r.pathname}`).sort()).toEqual([
      'GET /api/courseimport/allowed',
      'POST /api/course/student',
      'POST /api/course/teacher'
    ])
    await vi.waitFor(() => expect(store.getState().loading.loadingHooks).toEqual([]))
    expect(screen.queryByText('My Courses (Student)')).toBeNull()
  })
})

describe('Courses with store', () => {
  it('fetches and shows the courses', async () => {
    server.use(
      http.get(`${DEV_API_BASE}/courseInstances`, () =>
        HttpResponse.json([
          course(1, 'Tietokantasovellus', 'TKT20011.2018.K.A.1', { active: false }),
          course(2, 'Ohjelmistotuotanto', 'TKT20006.2019.K.A.1', { start: '2019-03-11T21:00:00.000Z' })
        ])
      ),
      http.get(`${DEV_API_BASE}/courseimport/allowed`, () => HttpResponse.json({ allowed: true }))
    )
    const store = await renderWithStore(() => import('../components/pages/Courses'))

    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(await screen.findByText(/Tietokantasovellus/)).toBeInTheDocument()
    expect(screen.getByText(/Ohjelmistotuotanto/)).toBeInTheDocument()
    expect(screen.getByText('Active registration')).toBeInTheDocument()
    const ohtuRow = screen.getByText(/Ohjelmistotuotanto/).closest('tr')
    expect(within(ohtuRow).getByText('11.03.2019')).toBeInTheDocument()
    expect(within(ohtuRow).getByText('TKT20006')).toBeInTheDocument()
    // active courses are listed first
    const names = screen.getAllByRole('row').map(row => row.textContent)
    expect(names.findIndex(t => t.includes('Ohjelmistotuotanto'))).toBeLessThan(
      names.findIndex(t => t.includes('Tietokantasovellus'))
    )
    expect(store.getState().courseImport.canImport).toBe(true)
  })

  it('shows the error from the backend on 500', async () => {
    server.use(
      http.get(`${DEV_API_BASE}/courseInstances`, () =>
        HttpResponse.text('Database exploded', { status: 500, statusText: 'Internal Server Error' })
      ),
      http.get(`${DEV_API_BASE}/courseimport/allowed`, () => HttpResponse.json({ allowed: false }))
    )
    await renderWithStore(() => import('../components/pages/Courses'))
    expect(await screen.findByText(/Database exploded \(500 Internal Server Error\)/)).toBeInTheDocument()
  })
})
