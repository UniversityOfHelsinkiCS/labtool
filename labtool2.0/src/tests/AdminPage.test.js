import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import { vi } from 'vitest'
import { AdminPage } from '../components/pages/AdminPage'

const user = {
  id: 10012,
  username: 'tiraopiskelija2',
  email: 'johan.studerande@helsinki.invalid',
  firsts: 'Johan Wilhelm',
  lastname: 'Studerande',
  studentNumber: '014553242',
  teacher: false,
  sysop: true,
  createdAt: '2018-03-26T00:00:00.000Z',
  updatedAt: '2018-03-26T00:00:00.000Z'
}

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const renderAdminPage = (props = {}) => {
  const defaultProps = {
    user: { user },
    courseInstance: [],
    users: [],
    loading,
    resetLoading: vi.fn(),
    getAllCI: vi.fn(),
    getAllUsers: vi.fn(),
    updateOtherUser: vi.fn(),
    clearNotifications: vi.fn()
  }

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Switch>
        <Route path="/admin">
          <AdminPage {...defaultProps} {...props} />
        </Route>
        <Route path="/labtool">
          <h1>Labtool</h1>
        </Route>
      </Switch>
    </MemoryRouter>
  )
}

describe('<AdminPage />', () => {
  it('matches the rendered snapshot', () => {
    const { asFragment } = renderAdminPage()

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders the admin controls for an administrator', () => {
    renderAdminPage()

    expect(screen.getByRole('heading', { name: /welcome to the admin interface/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /manage courses/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument()
  })

  it('redirects a non-admin user to Labtool frontpage', () => {
    const nonSysop = { ...user, sysop: false }

    renderAdminPage({ user: { user: nonSysop } })

    expect(screen.getByRole('heading', { name: 'Labtool' })).toBeInTheDocument()
  })
})
